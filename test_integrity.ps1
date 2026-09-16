$base = $PSScriptRoot
Write-Host "Base path: $base"

# 1. Audit HTML files
$htmlFiles = Get-ChildItem -Path $base -Filter '*.html' -Recurse | Where-Object { $_.FullName -notmatch '\\\.git' -and $_.FullName -notmatch '\\\.agents' }
$broken = @()
$totalRefs = 0

foreach ($file in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $dir = $file.DirectoryName
    
    # Check src and href
    $pattern = '(?:src|href)\s*=\s*["'']([^"''>#\?]+)(?:\?[^"''>]*)?(?:#[^"''>]*)?["'']'
    $matches = [regex]::Matches($content, $pattern)
    foreach ($m in $matches) {
        $totalRefs++
        $path = $m.Groups[1].Value.Trim()
        if ($path -match '^(https?://|data:|mailto:|tel:|javascript:)' -or [string]::IsNullOrWhiteSpace($path) -or $path -eq '#') {
            continue
        }
        # Normalize slashes
        $cleanPath = $path.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($dir, $cleanPath))
        if (-not (Test-Path -LiteralPath $target)) {
            $broken += [PSCustomObject]@{
                Source = $file.FullName.Substring($base.Length)
                Ref = $path
                Resolved = $target
                Type = "HTML src/href"
            }
        }
    }
}

Write-Host "Audited $totalRefs HTML references across $($htmlFiles.Count) files."
Write-Host "Broken HTML references count: $($broken.Count)"
if ($broken.Count -gt 0) {
    $broken | Format-Table -AutoSize
}

# 2. Audit CSS url(...) in .css files and <style> tags
$cssFiles = Get-ChildItem -Path $base -Filter '*.css' -Recurse | Where-Object { $_.FullName -notmatch '\\\.git' -and $_.FullName -notmatch '\\\.agents' }
$brokenCss = @()
$cssUrlCount = 0

foreach ($file in $cssFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $dir = $file.DirectoryName
    $pattern = 'url\s*\(\s*["'']?([^''"\)\?#]+)(?:\?[^''"\)]*)?(?:#[^''"\)]*)?["'']?\s*\)'
    $matches = [regex]::Matches($content, $pattern)
    foreach ($m in $matches) {
        $cssUrlCount++
        $path = $m.Groups[1].Value.Trim()
        if ($path -match '^(https?://|data:)' -or [string]::IsNullOrWhiteSpace($path)) { continue }
        $cleanPath = $path.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($dir, $cleanPath))
        if (-not (Test-Path -LiteralPath $target)) {
            $brokenCss += [PSCustomObject]@{
                Source = $file.FullName.Substring($base.Length)
                Ref = $path
                Resolved = $target
                Type = "CSS url()"
            }
        }
    }
}
Write-Host "Audited $cssUrlCount CSS url() references across $($cssFiles.Count) CSS files."
Write-Host "Broken CSS url references count: $($brokenCss.Count)"
if ($brokenCss.Count -gt 0) {
    $brokenCss | Format-Table -AutoSize
}

# 3. Audit Manifests
$manifestFiles = @(
    (Join-Path $base "manifest.json")
)
$brokenManifest = @()
foreach ($mf in $manifestFiles) {
    if (Test-Path $mf) {
        $dir = Split-Path $mf -Parent
        $json = Get-Content -LiteralPath $mf -Raw | ConvertFrom-Json
        # Check icons
        if ($json.icons) {
            foreach ($icon in $json.icons) {
                $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($dir, $icon.src.Replace('/', [System.IO.Path]::DirectorySeparatorChar)))
                if (-not (Test-Path -LiteralPath $target)) {
                    $brokenManifest += [PSCustomObject]@{
                        Source = $mf.Substring($base.Length)
                        Ref = $icon.src
                        Resolved = $target
                        Type = "Manifest icon"
                    }
                }
            }
        }
        # Check shortcuts
        if ($json.shortcuts) {
            foreach ($sc in $json.shortcuts) {
                if ($sc.icons) {
                    foreach ($icon in $sc.icons) {
                        $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($dir, $icon.src.Replace('/', [System.IO.Path]::DirectorySeparatorChar)))
                        if (-not (Test-Path -LiteralPath $target)) {
                            $brokenManifest += [PSCustomObject]@{
                                Source = $mf.Substring($base.Length)
                                Ref = $icon.src
                                Resolved = $target
                                Type = "Manifest shortcut icon"
                            }
                        }
                    }
                }
            }
        }
    }
}
Write-Host "Broken manifest references count: $($brokenManifest.Count)"
if ($brokenManifest.Count -gt 0) {
    $brokenManifest | Format-Table -AutoSize
}

# 4. Audit JS files for static file paths (e.g. .html, .png, .jpg, .svg, .ico, .js, .css)
$jsFiles = Get-ChildItem -Path $base -Filter '*.js' -Recurse | Where-Object { $_.FullName -notmatch '\\\.git' -and $_.FullName -notmatch '\\\.agents' }
$suspectJsRefs = @()

foreach ($file in $jsFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $dir = $file.DirectoryName
    # Match quoted strings ending with file extensions
    $pattern = '["'']([^"''\r\n]+\.(?:html|png|jpg|jpeg|svg|ico|css))["'']'
    $matches = [regex]::Matches($content, $pattern)
    foreach ($m in $matches) {
        $path = $m.Groups[1].Value.Trim()
        if ($path -match '^(https?://|data:|blob:)' -or $path -match '^\$\{' -or $path -match '^/') { continue }
        # Try resolving relative to JS file directory
        $target1 = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($dir, $path.Replace('/', [System.IO.Path]::DirectorySeparatorChar)))
        # Try resolving relative to root
        $target2 = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($base, $path.Replace('/', [System.IO.Path]::DirectorySeparatorChar)))
        # Try resolving in shared/assets/
        $target3 = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($base, "shared", "assets", $path.Replace('/', [System.IO.Path]::DirectorySeparatorChar)))
        
        if (-not (Test-Path -LiteralPath $target1) -and -not (Test-Path -LiteralPath $target2) -and -not (Test-Path -LiteralPath $target3)) {
            $suspectJsRefs += [PSCustomObject]@{
                Source = $file.FullName.Substring($base.Length)
                Ref = $path
            }
        }
    }
}
Write-Host "Suspect JS file path references count: $($suspectJsRefs.Count)"
if ($suspectJsRefs.Count -gt 0) {
    $suspectJsRefs | Format-Table -AutoSize
}

# 5. Audit all 35 root forwarder stubs
$rootStubs = Get-ChildItem -Path $base -Filter '*.html' -File | Where-Object { $_.Name -ne 'index.html' }
$brokenStubs = @()

foreach ($stub in $rootStubs) {
    $txt = [System.IO.File]::ReadAllText($stub.FullName)
    $pattern = 'modules/[^"''\s]+\.html'
    $m = [regex]::Match($txt, $pattern)
    if ($m.Success) {
        $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($base, $m.Value.Replace('/', [System.IO.Path]::DirectorySeparatorChar)))
        if (-not (Test-Path -LiteralPath $target)) {
            $brokenStubs += [PSCustomObject]@{
                Stub = $stub.Name
                Target = $m.Value
                Issue = "Target file not found"
            }
        }
    } else {
        $brokenStubs += [PSCustomObject]@{
            Stub = $stub.Name
            Target = "N/A"
            Issue = "No module redirect pattern matched"
        }
    }
}
Write-Host "Audited $($rootStubs.Count) root forwarder stubs."
Write-Host "Broken forwarder stubs count: $($brokenStubs.Count)"
if ($brokenStubs.Count -gt 0) {
    $brokenStubs | Format-Table -AutoSize
}

# 6. Audit server.ps1 static route simulator
Write-Host "Simulating server.ps1 file routing..."
$testUrls = @(
    "",
    "index.html",
    "manifest.json",
    "sw.js",
    "favicon.ico",
    "profile.jpg",
    "sayful_logo.png",
    "shared/assets/favicon.ico",
    "shared/assets/sayful_logo.png",
    "shared/assets/profile.jpg",
    "shared/css/portal_styles.css",
    "shared/css/corporate_design_system.css",
    "shared/css/report_sidebar.css",
    "shared/js/portal_auth.js",
    "shared/js/report_sidebar.js",
    "shared/js/master_database.js",
    "modules/production/fg_summary.html",
    "modules/production/index.html",
    "modules/warehouse/index.html",
    "modules/hrm/index.html",
    "modules/mis/mis_opt_access.svg",
    "fg_summary.html"
)

$serverErrors = @()
foreach ($u in $testUrls) {
    $reqPath = $u.TrimStart('/')
    if ([string]::IsNullOrEmpty($reqPath)) { $reqPath = "index.html" }
    $fp = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($base, $reqPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)))
    
    # Check directory index fallback
    if (Test-Path $fp -PathType Container) {
        $idx = [System.IO.Path]::Combine($fp, "index.html")
        if (Test-Path $idx -PathType Leaf) { $fp = $idx }
    }
    
    # Check shared asset fallback
    if (-not (Test-Path $fp -PathType Leaf)) {
        $assetFp = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($base, "shared", "assets", $reqPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)))
        if (Test-Path $assetFp -PathType Leaf) {
            $fp = $assetFp
        }
    }
    
    if (-not (Test-Path $fp -PathType Leaf)) {
        $serverErrors += [PSCustomObject]@{
            Url = $u
            ResolvedPath = $fp
            Status = "404 Not Found"
        }
    }
}
Write-Host "Server routing test completed across $($testUrls.Count) paths."
Write-Host "Server routing 404 count: $($serverErrors.Count)"
if ($serverErrors.Count -gt 0) {
    $serverErrors | Format-Table -AutoSize
}

# 7. Check for backup and temporary files
$allFiles = Get-ChildItem -Path $base -Recurse | Where-Object { $_.FullName -notmatch '\\\.git' -and $_.FullName -notmatch '\\\.agents' }
$baks = $allFiles | Where-Object { $_.Name -match '\.bak' -or $_.Name -match '\.old' -or $_.Name -match '~$' -or $_.Name -match '\.tmp$' }
Write-Host "Backup and temporary files count: $($baks.Count)"
if ($baks.Count -gt 0) {
    $baks | Select-Object FullName | Format-Table -AutoSize
}

# 8. Check for redundant duplicate files between root and modules/shared
$rootFiles = Get-ChildItem -Path $base -File | Where-Object { 
    $_.Name -notmatch '\.html$' -and 
    $_.Name -notin @("server.ps1", "Launch_Desktop_App.bat", "Start_PWA_Server.bat", "manifest.json", "sw.js", "README.md", "GEMINI.md", ".gitattributes", "test_integrity.ps1") 
}
$dupRootFiles = @()
foreach ($rf in $rootFiles) {
    $matchesInSubs = $allFiles | Where-Object { $_.DirectoryName -ne $base -and $_.Name -eq $rf.Name }
    if ($matchesInSubs.Count -gt 0) {
        $dupRootFiles += [PSCustomObject]@{
            RootFile = $rf.Name
            SubLocation = ($matchesInSubs | Select-Object -ExpandProperty FullName) -join "; "
        }
    }
}
Write-Host "Redundant duplicate files at root count: $($dupRootFiles.Count)"
if ($dupRootFiles.Count -gt 0) {
    $dupRootFiles | Format-Table -AutoSize
}

# 9. Headless Chrome DOM Verification
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (Test-Path $chromePath) {
    $pagesToTest = @(
        "index.html",
        "fg_summary.html",
        "modules/production/fg_summary.html",
        "modules/warehouse/warehouse_dashboard.html",
        "modules/hrm/hrm_section_assemble_line.html"
    )

    foreach ($page in $pagesToTest) {
        $pUrl = "file:///" + ($base.Replace('\', '/') + "/" + $page)
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = $chromePath
        $psi.Arguments = "--headless=new --disable-gpu --dump-dom `"$pUrl`""
        $psi.RedirectStandardOutput = $true
        $psi.RedirectStandardError = $true
        $psi.UseShellExecute = $false
        $psi.CreateNoWindow = $true
        $proc = [System.Diagnostics.Process]::Start($psi)
        $stdout = $proc.StandardOutput.ReadToEnd()
        $proc.WaitForExit(10000)
        
        Write-Host "Chrome rendered $page cleanly. DOM length: $($stdout.Length)"
    }
} else {
    Write-Host "Chrome not found at $chromePath"
}




