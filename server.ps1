$port = 8080
$folder = $PSScriptRoot
if (-not $folder) { $folder = "F:\Software" }

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")

try {
    $listener.Start()
} catch {
    Write-Host "Port $port is busy or unavailable. Trying port 8081..." -ForegroundColor Yellow
    $port = 8081
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Prefixes.Add("http://127.0.0.1:$port/")
    $listener.Start()
}

$url = "http://localhost:$port/"
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " MEP PORTAL LOCAL PWA SERVER RUNNING" -ForegroundColor Green
Write-Host " URL: $url" -ForegroundColor White
Write-Host " Root Directory: $folder" -ForegroundColor DarkGray
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "Opening browser..." -ForegroundColor Yellow

# Launch Chrome or Edge
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if (Test-Path $chromePath) {
    Start-Process $chromePath -ArgumentList "$url"
} elseif (Test-Path $edgePath) {
    Start-Process $edgePath -ArgumentList "$url"
} else {
    Start-Process $url
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($path)) { $path = "index.html" }
        $filePath = Join-Path $folder $path

        # Resolve directory to its index.html if present
        if (Test-Path $filePath -PathType Container) {
            $candidateIndex = Join-Path $filePath "index.html"
            if (Test-Path $candidateIndex -PathType Leaf) {
                $filePath = $candidateIndex
            }
        }

        # Fallback to shared/assets/ for root-level asset requests (e.g. /favicon.ico, /profile.jpg)
        if (-not (Test-Path $filePath -PathType Leaf)) {
            $sharedAssetPath = Join-Path $folder (Join-Path "shared\assets" $path)
            if (Test-Path $sharedAssetPath -PathType Leaf) {
                $filePath = $sharedAssetPath
            } elseif ($path -eq "shared/assets/manifest.json" -or $path -eq "shared\assets\manifest.json") {
                $rootManifest = Join-Path $folder "manifest.json"
                if (Test-Path $rootManifest -PathType Leaf) {
                    $filePath = $rootManifest
                }
            }
        }

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".ico"  { "image/x-icon" }
                ".svg"  { "image/svg+xml" }
                default { "application/octet-stream" }
            }
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    } catch {
        # Listener stopped or client disconnected
    }
}
