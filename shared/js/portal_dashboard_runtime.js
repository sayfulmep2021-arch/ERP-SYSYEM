/**
 * MEP FAN ERP - Portal Dashboard Runtime Engine
 * Handles Hub navigation, live clocks, drawer controls, profile dropdown, and session lifecycle.
 * Extracted from index.html during Phase 1 Modularization.
 */

        /**
         * Select a Report Module from the Hub Grid
         * Dynamically loads only the clicked module's sub-pages into the frozen left sidebar!
         */
        function selectDepartmentModule(moduleId, cardElement) {
            resetInactivityTimer();

            var modKey = moduleId;
            if (modKey.indexOf('01') !== -1) modKey = 'mod-01';
            else if (modKey.indexOf('02') !== -1) modKey = 'mod-02';
            else if (modKey.indexOf('03') !== -1) modKey = 'mod-03';
            else if (modKey.indexOf('04') !== -1) modKey = 'mod-04';
            else if (modKey.indexOf('05') !== -1) modKey = 'mod-05';
            else if (modKey.indexOf('06') !== -1) modKey = 'mod-06';
            else if (modKey.indexOf('07') !== -1) modKey = 'mod-07';
            else if (modKey.indexOf('08') !== -1) modKey = 'mod-08';
            else if (modKey.indexOf('pending') !== -1) modKey = 'mod-pending';
            else if (modKey.indexOf('09') !== -1) modKey = 'mod-09';
            else if (modKey.indexOf('10') !== -1) modKey = 'mod-10';
            else if (modKey.indexOf('11') !== -1 || modKey.indexOf('individual') !== -1) modKey = 'mod-11';
            else if (modKey.indexOf('master') !== -1) modKey = 'mod-master';

            var data = REPORT_MODULES_DATA[modKey];
            if (!data) return;

            sessionStorage.setItem('portal_current_view', 'hub');
            sessionStorage.setItem('portal_hub_module', modKey);

            // 1. Highlight active department card on the right
            document.querySelectorAll('.dept-card-btn').forEach(function(card) {
                card.classList.remove('active-dept');
            });
            if (cardElement) {
                cardElement.classList.add('active-dept');
            } else {
                var numSuffix = modKey.replace('mod-', '');
                var targetCard = document.getElementById('deptCard-' + numSuffix);
                if (targetCard) targetCard.classList.add('active-dept');
            }

            // 2. Hide 3D promotional banner and show active module sub-reports in left sidebar
            var emptyState = document.getElementById('hubEmptyState');
            var container = document.getElementById('hubActiveModuleContainer');
            if (emptyState) {
                emptyState.classList.add('is-hidden');
                emptyState.style.setProperty('display', 'none', 'important');
            }
            if (!container) return;

            container.classList.remove('is-hidden');
            container.style.setProperty('display', 'flex', 'important');

            // Check live date for Closing ERP
            var today = new Date();
            var todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

            var itemsHtml = '';
            data.reports.forEach(function(rep) {
                var isLive = true;
                var tagText = '';
                var isClosing = data.isClosing;

                if (isClosing && rep.id) {
                    var keyMap = {
                        "fan-assemble": ["mep_fan_assemble_date_interval", "mep_erp_date_interval", "closingDate_fan_assemble"],
                        "armature-winding": ["mep_armature_winding_date_interval", "mep_erp_date_interval", "closingDate_armature_winding"],
                        "closing-fg": ["mep_closing_fg_date_interval", "mep_erp_date_interval", "closingDate_closing_fg"],
                        "closing-all-sfg": ["mep_closing_all_sfg_date_interval", "mep_erp_date_interval", "closingDate_closing_all_sfg"],
                        "store-position": ["mep_store_position_date", "mep_store_position_date_interval", "mep_erp_date_interval", "closingDate_store_position"]
                    };
                    var foundVal = null;
                    var keys = keyMap[rep.id] || [];
                    for (var ki = 0; ki < keys.length; ki++) {
                        var v = localStorage.getItem(keys[ki]);
                        if (v && v.trim()) { foundVal = v.trim(); break; }
                    }
                    var repDate = rep.defaultDate;
                    if (foundVal) {
                        var match = foundVal.match(/(\d{4}-\d{2}-\d{2})\s*$/);
                        if (match) repDate = match[1];
                        else {
                            var single = foundVal.match(/(\d{4}-\d{2}-\d{2})/);
                            if (single) repDate = single[1];
                        }
                    }
                    isLive = (repDate >= todayStr);
                    tagText = repDate.length >= 10 ? repDate.slice(5) : repDate;
                }

                itemsHtml += `
                    <a href="${rep.url}" class="sub-report-item ${rep.highlight ? 'item-highlight-entry' : ''}" style="margin-bottom: 5px;" onclick="navigateToReportPage('${rep.url}', event)">
                        <div class="sub-item-left">
                            <span class="sub-item-dot ${isClosing ? (isLive ? 'status-updated' : 'status-outdated') : ''}" id="hub-dot-${rep.id || ''}"></span>
                            <span class="sub-item-title">${rep.title}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:6px;">
                            ${isClosing ? `<span class="sub-item-status-tag ${isLive ? 'tag-updated' : 'tag-outdated'}" id="hub-tag-${rep.id || ''}">${tagText}</span>` : ''}
                            ${rep.pill ? `<span class="sub-item-pill">${rep.pill}</span>` : ''}
                            <svg class="sub-item-arrow" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                    </a>
                `;
            });

            container.innerHTML = `
                <div class="hub-active-banner hub-banner-${modKey}">
                    <div class="hub-active-banner-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            ${data.iconSvg}
                        </svg>
                    </div>
                    <div class="hub-active-banner-info">
                        <div class="hub-active-banner-title">${data.name}</div>
                    </div>
                </div>
                <div class="sub-report-list" style="padding: 0 4px; display:flex; flex-direction:column; gap:5px;">
                    ${itemsHtml}
                </div>
            `;
        }

        function toggleReportsDrawer() {
            resetInactivityTimer();
            const drawer = document.getElementById('reportsDrawer');
            if (drawer && drawer.classList.contains('open')) {
                closeReportsDrawer();
            } else {
                openReportsDrawer();
            }
        }

        /**
         * Open Slide-In Reports Drawer
         */
        function openReportsDrawer() {
            resetInactivityTimer();
            updateClosingERPStatus();
            const drawer = document.getElementById('reportsDrawer');
            const backdrop = document.getElementById('drawerBackdrop');
            if (drawer) drawer.classList.add('open');
            if (backdrop) backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        /**
         * Close Slide-In Reports Drawer
         */
        function closeReportsDrawer() {
            resetInactivityTimer();
            const drawer = document.getElementById('reportsDrawer');
            const backdrop = document.getElementById('drawerBackdrop');
            if (drawer) drawer.classList.remove('open');
            if (backdrop) backdrop.classList.remove('active');
            document.body.style.overflow = '';
        }

        /**
         * Calculate and update precise service duration from Join Date (Years, Months, Days)
         */
        function updateServiceDuration(customDate) {
            const joinDateStr = (customDate !== undefined && customDate !== null) ? customDate : (document.getElementById('editProfJoinDate') ? document.getElementById('editProfJoinDate').value : (typeof getUserProfile === 'function' ? getUserProfile().joinDate : '01-Feb-2021'));
            const duration = typeof calculateServiceDuration === 'function' ? calculateServiceDuration(joinDateStr) : '5 Years, 7 Months, 9 Days';
            
            const el = document.getElementById('editProfTotalService');
            if (el) el.value = duration;
            document.querySelectorAll('.dynamic-profile-service, .profileServiceDuration, #profileServiceDuration, #moduleProfileDropdownService, #misProfileDropdownService, #userProfileServiceVal').forEach(s => {
                s.textContent = duration;
            });
            return duration;
        }

        /**
         * Real-time Day & Time Live Clock (Updates Every Second)
         */
        function updateLiveClock() {
            const now = new Date();
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const dayName = days[now.getDay()];
            const dateNum = now.getDate();
            const monthName = months[now.getMonth()];
            const yearNum = now.getFullYear();

            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // 12-hour format
            const formattedHours = String(hours).padStart(2, '0');

            const dateStr = `${dayName}, ${dateNum} ${monthName} ${yearNum}`;
            const slottedTime = `<span class="t-digit">${formattedHours[0]}</span><span class="t-digit">${formattedHours[1]}</span><span class="t-colon">:</span><span class="t-digit">${minutes[0]}</span><span class="t-digit">${minutes[1]}</span><span class="t-colon">:</span><span class="t-digit">${seconds[0]}</span><span class="t-digit">${seconds[1]}</span> <span class="t-ampm">${ampm}</span>`;

            document.querySelectorAll('.live-day-text').forEach(function(el) {
                el.innerText = dateStr;
            });
            document.querySelectorAll('.live-time-text').forEach(function(el) {
                el.innerHTML = slottedTime;
            });
        }

        /**
         * Toggle Profile Dropdown Menu (Open / Close)
         */
        function toggleProfileDropdown(event) {
            if (event) event.stopPropagation();
            resetInactivityTimer();
            updateServiceDuration();

            const isMain = (sessionStorage.getItem('portal_current_view') === 'main' || !sessionStorage.getItem('portal_current_view'));
            const menu = isMain ? document.getElementById('mainProfileDropdownMenu') : (document.getElementById('profileDropdownMenu') || document.getElementById('mainProfileDropdownMenu'));
            const btn = isMain ? document.getElementById('mainUserProfileBtn') : (document.getElementById('userProfileBtn') || document.getElementById('hubUserProfileBtn'));

            if (!menu) return;
            const isShown = menu.classList.contains('show');
            closeProfileDropdown();

            if (!isShown) {
                menu.classList.add('show');
                if (btn) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-expanded', 'true');
                }
            }
        }

        /**
         * Close Profile Dropdown Menu
         */
        function closeProfileDropdown(event) {
            if (event) event.stopPropagation();
            resetInactivityTimer();

            document.querySelectorAll('.profile-dropdown-menu').forEach(function(m) {
                m.classList.remove('show');
            });
            document.querySelectorAll('.user-brand-card').forEach(function(b) {
                b.classList.remove('active');
                b.setAttribute('aria-expanded', 'false');
            });
        }

        // Close dropdown when clicking outside
        window.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-dropdown-wrapper')) {
                closeProfileDropdown();
            }
        });

        // Close dropdown and drawer on Escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeProfileDropdown();
                closeReportsDrawer();
            }
        });

        /**
         * Real-time Check for Closing (ERP) Sub-Reports Date Status
         * If any report closing date is older than today's live date -> RED indicator.
         * If updated to today's live date -> GREEN indicator.
         */
        function updateClosingERPStatus() {
            const today = new Date();
            const y = today.getFullYear();
            const m = String(today.getMonth() + 1).padStart(2, '0');
            const d = String(today.getDate()).padStart(2, '0');
            const todayStr = `${y}-${m}-${d}`; // e.g. "2026-08-26"

            // Helper to parse end date from interval like "2026-08-01 to 2026-08-25" or single date
            function extractEndDate(rawStr, fallback) {
                if (!rawStr) return fallback;
                const match = rawStr.match(/(\d{4}-\d{2}-\d{2})\s*$/);
                if (match) return match[1];
                const singleMatch = rawStr.match(/(\d{4}-\d{2}-\d{2})/);
                return singleMatch ? singleMatch[1] : fallback;
            }

            function resolveDate(keysList, fallback) {
                for (let k of keysList) {
                    const val = localStorage.getItem(k);
                    if (val && val.trim()) {
                        const parsed = extractEndDate(val.trim(), '');
                        if (parsed) return parsed;
                    }
                }
                return fallback;
            }

            const reports = [
                {
                    id: 'fan-assemble',
                    name: 'Fan Assemble',
                    date: resolveDate(['mep_fan_assemble_date_interval', 'mep_erp_date_interval', 'closingDate_fan_assemble'], '2026-08-25')
                },
                {
                    id: 'armature-winding',
                    name: 'Armature & Winding',
                    date: resolveDate(['mep_armature_winding_date_interval', 'mep_erp_date_interval', 'closingDate_armature_winding'], '2026-08-26')
                },
                {
                    id: 'closing-fg',
                    name: 'Finish Good (FG)',
                    date: resolveDate(['mep_closing_fg_date_interval', 'mep_erp_date_interval', 'closingDate_closing_fg'], '2026-08-26')
                },
                {
                    id: 'closing-all-sfg',
                    name: 'Closing All SFG',
                    date: resolveDate(['mep_closing_all_sfg_date_interval', 'mep_erp_date_interval', 'closingDate_closing_all_sfg'], '2026-08-20')
                },
                {
                    id: 'store-position',
                    name: 'Store Position Report',
                    date: resolveDate(['mep_store_position_date', 'mep_store_position_date_interval', 'mep_erp_date_interval', 'closingDate_store_position'], '2026-08-26')
                }
            ];

            let allUpdated = true;
            let pendingCount = 0;

            reports.forEach(rep => {
                const dot = document.getElementById(`dot-${rep.id}`);
                const tag = document.getElementById(`tag-${rep.id}`);
                const isLive = rep.date >= todayStr;
                const shortDate = rep.date.length >= 10 ? rep.date.slice(5) : rep.date;

                if (!isLive) {
                    allUpdated = false;
                    pendingCount++;
                }

                // Drawer Elements
                if (dot) {
                    dot.className = `sub-item-dot ${isLive ? 'status-updated' : 'status-outdated'}`;
                    dot.title = isLive ? `Live & Updated (${rep.date})` : `Pending Update! Latest ERP date: ${rep.date} (Today is ${todayStr})`;
                }

                if (tag) {
                    tag.className = `sub-item-status-tag ${isLive ? 'tag-updated' : 'tag-outdated'}`;
                    tag.innerText = shortDate; // e.g. "09-13" or "09-05" matching Screenshot 2
                    tag.title = isLive ? `Live & Updated to ${rep.date}` : `Outdated: ${rep.date} (Today is ${todayStr})`;
                }

                // Left Dashboard Sidebar Elements
                const sbDot = document.getElementById(`sidebar-dot-${rep.id}`);
                const sbTag = document.getElementById(`sidebar-tag-${rep.id}`);
                if (sbDot) {
                    sbDot.className = `sub-item-dot ${isLive ? 'status-updated' : 'status-outdated'}`;
                    sbDot.title = isLive ? `Live & Updated (${rep.date})` : `Pending Update! Latest ERP date: ${rep.date} (Today is ${todayStr})`;
                }
                if (sbTag) {
                    sbTag.className = `sub-item-status-tag ${isLive ? 'tag-updated' : 'tag-outdated'}`;
                    sbTag.innerText = shortDate;
                    sbTag.title = isLive ? `Live & Updated to ${rep.date}` : `Outdated: ${rep.date} (Today is ${todayStr})`;
                }

                // Department Hub Elements
                const hubDot = document.getElementById(`hub-dot-${rep.id}`);
                const hubTag = document.getElementById(`hub-tag-${rep.id}`);
                if (hubDot) {
                    hubDot.className = `sub-item-dot ${isLive ? 'status-updated' : 'status-outdated'}`;
                    hubDot.title = isLive ? `Live & Updated (${rep.date})` : `Pending Update! Latest ERP date: ${rep.date} (Today is ${todayStr})`;
                }
                if (hubTag) {
                    hubTag.className = `sub-item-status-tag ${isLive ? 'tag-updated' : 'tag-outdated'}`;
                    hubTag.innerText = shortDate;
                    hubTag.title = isLive ? `Live & Updated to ${rep.date}` : `Outdated: ${rep.date} (Today is ${todayStr})`;
                }
            });

            // Master Status Indicator next to "Closing (ERP)" title
            const masterDot = document.getElementById('closingMasterStatusDot');
            const hubMasterDot = document.getElementById('hubClosingMasterDot');
            if (masterDot) {
                if (allUpdated) {
                    masterDot.className = 'erp-status-indicator updated';
                    masterDot.title = `All 5 Closing Reports are Live & Updated to ${todayStr}`;
                } else {
                    masterDot.className = 'erp-status-indicator outdated';
                    masterDot.title = `Closing (ERP) Pending Update: ${pendingCount} report(s) outdated! (Live Date: ${todayStr})`;
                }
            }
            if (hubMasterDot) {
                hubMasterDot.className = `erp-status-indicator ${allUpdated ? 'updated' : 'outdated'}`;
                hubMasterDot.title = allUpdated ? `All 5 Closing Reports are Live & Updated` : `Closing ERP Pending Update`;
            }
            const hubPulseDot = document.getElementById('hubClosingPulseDot');
            if (hubPulseDot) {
                if (allUpdated) {
                    hubPulseDot.className = 'closing-pulse-dot updated';
                    if (hubPulseDot.parentElement) hubPulseDot.parentElement.title = `All 5 Closing Reports are Live & Updated to ${todayStr}`;
                } else {
                    hubPulseDot.className = 'closing-pulse-dot outdated';
                    if (hubPulseDot.parentElement) hubPulseDot.parentElement.title = `Closing (ERP) Pending Update: ${pendingCount} report(s) outdated! (Live Date: ${todayStr})`;
                }
            }
        }

        /**
         * Handle URL parameters to restore drawer and open accordion when navigating back
         * e.g., index.html?drawer=open&accordion=accordion-04
         */
        function handleUrlNavigationState() {
            const isAuth = (sessionStorage.getItem(STORAGE_KEYS.isAuthenticated) === "true") ||
                           (localStorage.getItem(STORAGE_KEYS.isAuthenticated) === "true");
            if (!isAuth) return;

            const urlParams = new URLSearchParams(window.location.search);
            const viewParam = urlParams.get('view');
            const modParam = urlParams.get('mod');
            const drawerParam = urlParams.get('drawer');
            const accordionParam = urlParams.get('accordion');

            if (isPageReload()) {
                return;
            }

            if (viewParam === 'main' || viewParam === 'production') {
                sessionStorage.setItem('portal_current_view', 'main');
                switchToMainInterfaceView();
                return;
            }

            if (viewParam === 'modules') {
                sessionStorage.setItem('portal_current_view', 'modules');
                switchToModuleSelectionView();
                return;
            }

            if (viewParam === 'dashboard') {
                sessionStorage.setItem('portal_current_view', 'main');
                switchToMainInterfaceView();
                return;
            }

            if (viewParam === 'hub') {
                switchToDepartmentHub(modParam);
                return;
            }

            if (drawerParam === 'open') {
                openReportsDrawer();
                if (accordionParam) {
                    setTimeout(() => {
                        const targetCard = document.getElementById(accordionParam);
                        if (targetCard) {
                            // Collapse others
                            document.querySelectorAll('.accordion-card.expanded').forEach(card => {
                                if (card !== targetCard) {
                                    card.classList.remove('expanded');
                                    const header = card.querySelector('.accordion-header');
                                    if (header) header.setAttribute('aria-expanded', 'false');
                                }
                            });
                            targetCard.classList.add('expanded');
                            const header = targetCard.querySelector('.accordion-header');
                            if (header) header.setAttribute('aria-expanded', 'true');
                        }
                    }, 120);
                }
            }
        }

        // =========================================================================
        // PWA (Progressive Web App) Desktop Engine & Installation Handler
        // =========================================================================
        let deferredPrompt = null;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            const btn = document.getElementById('btnPwaInstall');
            if (btn) {
                btn.style.display = 'inline-flex';
            }
        });

        window.addEventListener('appinstalled', () => {
            console.log('[PWA] MEP Portal was successfully installed on PC!');
            deferredPrompt = null;
            const btn = document.getElementById('btnPwaInstall');
            if (btn) {
                btn.innerHTML = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Installed</span>`;
                btn.style.background = '#16a34a';
                btn.style.borderColor = '#86efac';
                btn.onclick = null;
            }
        });

        async function triggerPwaInstall() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('[PWA] User accepted the install prompt');
                }
                deferredPrompt = null;
            } else {
                // If running locally, guide user on browser install & desktop app
                alert("ðŸ’» Install MEP Portal on PC:\n\n1. Look at your browser's address bar (top-right next to the URL/star)\n2. Click the 'Install App' icon (ðŸ–¥ï¸ or âŠ•)\n3. Click 'Install'\n\nâœ¨ A dedicated Desktop Shortcut 'MEP Portal' has also been created directly on your Windows Desktop!");
            }
        }

        // Ensure legacy service workers are unregistered and cache purged
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                for (let r of registrations) {
                    r.unregister();
                }
            }).catch(() => {});
        }

        window.handleSubItemClick = function(clickedEl) {
            if (!clickedEl) return;
            document.querySelectorAll('.sub-report-item').forEach(el => {
                el.classList.remove('active-page');
                el.classList.remove('item-highlight-entry');
            });
            clickedEl.classList.add('active-page');
            clickedEl.classList.add('item-highlight-entry');
        };

        // Universal Accordion Collapse Handler - Guarantees only main headings are visible
        window.collapseAllSidebarModules = function() {
            try {
                document.querySelectorAll('.mep-module-accordion').forEach(grp => {
                    grp.classList.remove('is-open');
                    const h = grp.querySelector('.mep-module-heading');
                    if (h) h.classList.remove('is-active-module');
                });
                document.querySelectorAll('.sub-report-item').forEach(el => {
                    el.classList.remove('active-page');
                    el.classList.remove('item-highlight-entry');
                });
                document.querySelectorAll('#reportsContainer .accordion-card').forEach(c => {
                    c.classList.remove('expanded');
                    const h = c.querySelector('.accordion-header');
                    if (h) h.setAttribute('aria-expanded', 'false');
                });
            } catch(e) {
                console.warn('Error collapsing sidebar modules:', e);
            }
        };

        // Sidebar Accordion Single-Open Handler matching Screenshot 3
        window.toggleSidebarModule = function(modId) {
            const targetGroup = document.getElementById(`mep-acc-group-${modId}`);
            if (!targetGroup) return;

            const wasOpen = targetGroup.classList.contains('is-open');

            // Collapse all modules so only one is open at a time (or all closed if toggling off)
            window.collapseAllSidebarModules();

            // Open clicked module if it was previously closed
            if (!wasOpen) {
                targetGroup.classList.add('is-open');
                const h = targetGroup.querySelector('.mep-module-heading');
                if (h) h.classList.add('is-active-module');
                setTimeout(() => {
                    targetGroup.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 50);
            }
        };

        // Slide-In Reports Drawer Accordion Toggle
        window.toggleAccordion = function(id) {
            const card = document.getElementById(id);
            if (!card) return;
            const isExpanded = card.classList.contains('expanded');
            
            document.querySelectorAll('#reportsContainer .accordion-card').forEach(function(c) {
                if (c !== card) {
                    c.classList.remove('expanded');
                    const h = c.querySelector('.accordion-header');
                    if (h) h.setAttribute('aria-expanded', 'false');
                }
            });

            if (!isExpanded) {
                card.classList.add('expanded');
                const h = card.querySelector('.accordion-header');
                if (h) h.setAttribute('aria-expanded', 'true');
            } else {
                card.classList.remove('expanded');
                const h = card.querySelector('.accordion-header');
                if (h) h.setAttribute('aria-expanded', 'false');
            }
        };

        // Live Account Card Countdown Timer matching Screenshot 1
        function updateDashboardAccountCountdown() {
            const dEl = document.getElementById('cdBoxDays');
            const hEl = document.getElementById('cdBoxHours');
            const mEl = document.getElementById('cdBoxMins');
            const sEl = document.getElementById('cdBoxSecs');
            if (!dEl || !hEl || !mEl || !sEl) return;
            
            const now = new Date();
            const days = 240;
            const hours = String(23 - now.getHours()).padStart(2, '0');
            const mins = String(59 - now.getMinutes()).padStart(2, '0');
            const secs = String(59 - now.getSeconds()).padStart(2, '0');
            
            dEl.innerText = days;
            hEl.innerText = hours;
            mEl.innerText = mins;
            sEl.innerText = secs;
        }

        // Quick Actions & Date Filter Handlers
        window.openNewSaleAction = function() {
            alert("New Sale Entry: Ready for real-time transaction records.");
        };

        window.openNewPurchaseAction = function() {
            alert("New Purchase Entry: Ready for vendor order records.");
        };

        window.toggleFiscalYearDropdown = function(event) {
            if (event) event.stopPropagation();
            const menu = document.getElementById('dashFiscalYearMenu');
            if (menu) menu.classList.toggle('show');
        };

        window.selectFiscalYear = function(fy) {
            if (typeof window.handleFiscalYearSelection === 'function') {
                window.handleFiscalYearSelection(fy);
            }
        };

        window.handleDashboardDateFilter = function(e) {
            window.toggleFiscalYearDropdown(e);
        };

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const pill = document.getElementById('dashDateFilterBtn');
            const menu = document.getElementById('dashFiscalYearMenu');
            if (menu && menu.classList.contains('show') && (!pill || !pill.contains(e.target))) {
                menu.classList.remove('show');
            }
        });

        window.updateClosingERPStatus = updateClosingERPStatus;

        // Run session check, service calculation, live clock, dashboard render, and URL state on initial load
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof window.renderDashboardSidebarMenu === 'function') {
                window.renderDashboardSidebarMenu();
            }
            if (typeof window.renderReportsDrawerMenu === 'function') {
                window.renderReportsDrawerMenu();
            }
            if (typeof window.collapseAllSidebarModules === 'function') {
                window.collapseAllSidebarModules();
            }
            initTheme();
            initSession();
            updateServiceDuration();
            updateLiveClock();
            updateClosingERPStatus();
            updateDashboardAccountCountdown();
            renderProductionPerformanceDashboard();
            handleUrlNavigationState();
            setInterval(updateLiveClock, 1000);
            setInterval(updateDashboardAccountCountdown, 1000);
            setInterval(updateClosingERPStatus, 60000);
        });

