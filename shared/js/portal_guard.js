/**
 * MEP PORTAL - GLOBAL PERMANENT AUTHENTICATION & ACCESS GUARD
 * 
 * Strict Security Policy:
 * 1. ZERO ACCESS without prior valid authentication in sessionStorage.
 * 2. Instant Anti-FOUC Head Cloak (Page remains 100% invisible until verified).
 * 3. Immediate DOM Destruction and redirection on invalid or missing session.
 * 4. Role-Based Access Control (VIEW role restricted according to Admin permissions).
 * 5. Universal Multi-Tab Logout Synchronization.
 */

(function() {
    'use strict';

    // 0. Determine if this is the portal root (index.html)
    var rawFile = (window.location.pathname || '').replace(/\\/g, '/').split('/').pop() || '';
    var currentFile = decodeURIComponent(rawFile).split('?')[0].split('#')[0].toLowerCase();
    var isPortalRoot = (!currentFile || currentFile === 'index.html' || !!window.isPortalRootOverride);

    // 1. Anti-FOUC & Anti-Bypass: Immediately cloak page content before rendering begins
    // In index.html, only cloak if we need to enforce clean view state; for internal pages, cloak entirely
    if (!isPortalRoot) {
        var cloak = document.createElement('style');
        cloak.id = 'portal-guard-cloak';
        cloak.textContent = 'html, body { display: none !important; visibility: hidden !important; }';
        if (document.head) {
            document.head.appendChild(cloak);
        } else {
            document.documentElement.appendChild(cloak);
        }
    }

    // 2. Strict Session Authenticity Validation Function
    function validateCurrentSession() {
        try {
            var isAuth = (sessionStorage.getItem('portal_auth_status') === 'true');
            var role = (sessionStorage.getItem('portal_auth_role') || '').toUpperCase();
            var sig = sessionStorage.getItem('portal_auth_sig') || '';

            if (!isAuth || !role || !sig) {
                return { valid: false, reason: 'missing_session' };
            }

            var expectedSig = (role === 'VIEW')
                ? btoa('VIEW:::MEP_SECURE_PORTAL_2026')
                : btoa('ADMIN:::MEP_SECURE_PORTAL_2026');

            if (sig !== expectedSig) {
                return { valid: false, reason: 'signature_mismatch' };
            }

            // Inactivity Check (8-hour maximum session lifetime)
            var lastActive = parseInt(sessionStorage.getItem('portal_last_active_time') || '0', 10);
            var now = Date.now();
            var MAX_IDLE_MS = 8 * 60 * 60 * 1000; // 8 hours
            if (lastActive > 0 && (now - lastActive > MAX_IDLE_MS)) {
                return { valid: false, reason: 'session_expired' };
            }

            // Update activity timestamp
            sessionStorage.setItem('portal_last_active_time', now.toString());

            return { valid: true, role: role };
        } catch(e) {
            return { valid: false, reason: 'exception' };
        }
    }

    // 3. Execution for Internal Pages
    if (!isPortalRoot) {
        var check = validateCurrentSession();

        if (!check.valid) {
            // UNAUTHORIZED: Instantly destroy DOM tree to eliminate DevTools inspection
            try {
                if (document.body) document.body.innerHTML = '';
                document.documentElement.innerHTML = '';
            } catch(e) {}
            // Redirect to Login Page
            window.location.replace('index.html');
            return;
        }

        // Check Role-Based Access Control for VIEW role
        if (check.role === 'VIEW' && currentFile) {
            var permsRaw = localStorage.getItem('portal_view_page_permissions');
            if (permsRaw) {
                try {
                    var perms = JSON.parse(permsRaw);
                    if (perms) {
                        var isDenied = false;
                        for (var key in perms) {
                            if (key.toLowerCase() === currentFile && perms[key] === false) {
                                isDenied = true;
                                break;
                            }
                        }
                        if (isDenied) {
                            try {
                                if (document.body) document.body.innerHTML = '';
                                document.documentElement.innerHTML = '';
                            } catch(e) {}
                            alert("Access Denied: You do not have permission to view this report.");
                            window.location.replace('index.html');
                            return;
                        }
                    }
                } catch(e) {}
            }
        }

        // Authorized: Uncloak after DOM elements are ready
        function uncloakAuthorizedPage() {
            var el = document.getElementById('portal-guard-cloak');
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            if (check.role === 'VIEW') {
                document.documentElement.classList.add('portal-view-only');
                document.body.classList.add('portal-view-only');
                // Enforce read-only state on all inputs
                document.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(function(input) {
                    input.disabled = true;
                    input.readOnly = true;
                });
                document.querySelectorAll('.btn-save, .btn-primary:not(.btn-nav-tab):not(.rail-icon-btn), .btn-action-edit, .btn-danger').forEach(function(btn) {
                    btn.style.display = 'none';
                });
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', uncloakAuthorizedPage);
        } else {
            uncloakAuthorizedPage();
        }
    }

    // 4. Universal Multi-Tab Logout & Session Guard Listener
    window.addEventListener('storage', function(e) {
        if (e.key === 'portal_logout_broadcast' || e.key === 'portal_auth_status_cleared') {
            sessionStorage.clear();
            if (!isPortalRoot) {
                try {
                    if (document.body) document.body.innerHTML = '';
                    document.documentElement.innerHTML = '';
                } catch(err) {}
                window.location.replace('index.html');
            } else {
                if (typeof window.showLoginView === 'function') {
                    window.showLoginView();
                }
            }
        }
    });

    // 5. Expose validation helper to window
    window.validateCurrentSession = validateCurrentSession;
    window.isPortalAuthed = function() {
        return validateCurrentSession().valid;
    };
})();