/**
 * Language Toggle System — ABOVE Foundation
 * Shared HU ↔ EN translation engine.
 *
 * Each page may optionally define (before this script):
 *   window.pageTranslations  — extra page-specific HU→EN pairs
 *   window.pageTitleEn       — English <title> text
 *   window.pageTitleHu       — Hungarian <title> text
 *   window.refreshHeroCard   — called after language switch (index.html hook)
 */
(function () {
    'use strict';

    // ─── Common translations shared across all pages ──────────────────────────
    var commonTranslations = {
        // Navigation
        'Kezdőlap':                 'Home',
        'Tevékenységek':            'Activities',
        'Rólunk':                   'About Us',
        'Kapcsolat':                'Contact',
        'EuroSpeak Nyári Tábor 2026': 'EuroSpeak Summer Camp 2026',
        // Footer
        'Közösségi média':          'Socials',
        'Elérhetőségek':            'Contact Us',
        'Oldalak':                  'Pages',
        'Szakmai partnereink és támogatóink': 'Our Professional Partners and Supporters',
        '© 2025 ABOVE Foundation. Minden jog fenntartva.': '© 2025 ABOVE Foundation. All rights reserved.',
    };

    // Merge common + page-specific translations
    var rawTranslations = Object.assign({}, commonTranslations, window.pageTranslations || {});
    // Normalize every key (trim + collapse whitespace) so multi-line HTML indentation
    // never causes a lookup miss — the TreeWalker applies the same normalization.
    var translations = {};
    Object.keys(rawTranslations).forEach(function (key) {
        var normKey = key.trim().replace(/\s+/g, ' ');
        var normVal = rawTranslations[key].trim().replace(/\s+/g, ' ');
        translations[normKey] = normVal;
    });

    // ─── Original HU text-node store ─────────────────────────────────────────
    var originalTexts = new Map();
    var originalPlaceholders = new Map();

    // ─── TreeWalker base filter ───────────────────────────────────────────────
    function baseFilter(node) {
        var parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        var tag = parent.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT;
        if (parent.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
    }

    // ─── Core translation functions ───────────────────────────────────────────
    function translateNode(root, dict) {
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: baseFilter });
        var nodes = [];
        var n;
        while ((n = walker.nextNode())) nodes.push(n);
        nodes.forEach(function (tn) {
            var orig = tn.nodeValue;
            var norm = orig.trim().replace(/\s+/g, ' ');
            if (dict[norm] !== undefined) {
                var leading  = orig.match(/^\s*/)[0];
                var trailing = orig.match(/\s*$/)[0];
                tn.nodeValue = leading + dict[norm] + trailing;
            }
        });

        // Translate placeholders
        if (root.querySelectorAll) {
            root.querySelectorAll('[placeholder]').forEach(function(input) {
                if (input.closest('[data-no-translate]')) return;
                var orig = input.getAttribute('placeholder');
                var norm = orig.trim().replace(/\s+/g, ' ');
                if (dict[norm] !== undefined) {
                    var leading  = orig.match(/^\s*/)[0];
                    var trailing = orig.match(/\s*$/)[0];
                    input.setAttribute('placeholder', leading + dict[norm] + trailing);
                }
            });
        }
    }

    function snapshotHungarianTexts() {
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                var base = baseFilter(node);
                if (base !== NodeFilter.FILTER_ACCEPT) return base;
                var norm = node.nodeValue.trim().replace(/\s+/g, ' ');
                return (norm && translations[norm] !== undefined)
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_REJECT;
            }
        });
        var n;
        while ((n = walker.nextNode())) originalTexts.set(n, n.nodeValue);

        // Snapshot placeholders
        document.querySelectorAll('[placeholder]').forEach(function(input) {
            if (input.closest('[data-no-translate]')) return;
            var ph = input.getAttribute('placeholder');
            var norm = ph.trim().replace(/\s+/g, ' ');
            if (norm && translations[norm] !== undefined) {
                originalPlaceholders.set(input, ph);
            }
        });
    }

    function restoreHungarianTexts() {
        originalTexts.forEach(function (orig, node) { node.nodeValue = orig; });
        originalPlaceholders.forEach(function (orig, input) { input.setAttribute('placeholder', orig); });
    }

    function updateLinksLanguage(lang) {
        if (window.location.protocol === 'file:') return;
        document.querySelectorAll('a').forEach(function (link) {
            var href = link.getAttribute('href');
            if (!href) return;
            
            // Check if it's an internal link
            // We only translate links like "/", "projects", "about", "contact", etc.
            // and exclude external links (http), hashes (#), and mailto/tel.
            var isInternal = !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:');
            if (!isInternal) return;

            // Normalize path: e.g. "projects" -> "/projects"
            var path = href.startsWith('/') ? href : '/' + href;

            if (lang === 'en') {
                if (!path.startsWith('/en/') && path !== '/en') {
                    var newHref = '/en' + (path === '/' ? '' : path);
                    link.setAttribute('href', newHref);
                }
            } else {
                if (path.startsWith('/en/')) {
                    var newHref = path.substring(3);
                    link.setAttribute('href', newHref || '/');
                } else if (path === '/en') {
                    link.setAttribute('href', '/');
                }
            }
        });
    }

    function applyLanguage(lang) {
        restoreHungarianTexts();
        if (lang === 'en') translateNode(document.body, translations);

        // Update link targets to match active language prefix
        updateLinksLanguage(lang);

        // Update <title>
        if (window.pageTitleEn && window.pageTitleHu) {
            var titleEl = document.getElementById('page-title-tag');
            if (titleEl) titleEl.textContent = lang === 'en' ? window.pageTitleEn : window.pageTitleHu;
        }

        // Update <html lang>
        document.documentElement.lang = lang === 'en' ? 'en' : 'hu';

        // Update flag image
        var flag = document.getElementById('lang-toggle');
        if (flag && flag.tagName === 'IMG') {
            flag.src = lang === 'en'
                ? 'https://flagcdn.com/w40/hu.png'
                : 'https://flagcdn.com/w40/gb.png';
            flag.alt = lang === 'en' ? 'Magyar' : 'English';
        }

        // Optional hook for dynamic content (index.html hero card)
        if (typeof window.refreshHeroCard === 'function') window.refreshHeroCard();
        // Generic hook — called after every language switch (e.g. projects.html re-renders open modal)
        if (typeof window.onLangChange === 'function') window.onLangChange(lang);
    }

    // ─── Init ─────────────────────────────────────────────────────────────────
    var currentLang = 'hu';
    if (window.location.protocol !== 'file:') {
        var pathname = window.location.pathname;
        var searchParams = new URLSearchParams(window.location.search);
        
        // 1. Check query parameter first (used by 404.html redirect)
        if (searchParams.has('lang')) {
            currentLang = searchParams.get('lang') === 'en' ? 'en' : 'hu';
            localStorage.setItem('lang', currentLang);
        } 
        // 2. Check path-based language prefix
        else if (pathname.startsWith('/en/') || pathname === '/en') {
            currentLang = 'en';
            localStorage.setItem('lang', 'en');
        } 
        // 3. Fallback to localStorage
        else {
            currentLang = localStorage.getItem('lang') || 'hu';
        }
        
        // Rewrite URL pathname in browser address bar to clean URLs (removes .html and params)
        if (searchParams.has('lang') || searchParams.has('p') || pathname.endsWith('.html')) {
            var cleanPageName = pathname.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '');
            if (cleanPageName === 'index') cleanPageName = '';
            
            var route = '';
            if (cleanPageName === 'projects') {
                route = searchParams.get('p') || '';
            }
            
            // Build the clean pathname
            var cleanPath = '';
            if (currentLang === 'en') {
                cleanPath += '/en';
            }
            if (cleanPageName && cleanPageName !== 'index') {
                cleanPath += '/' + cleanPageName;
                if (route) {
                    cleanPath += '/' + route;
                }
            }
            if (!cleanPath) cleanPath = '/';
            
            // Reconstruct search (excluding p and lang)
            searchParams.delete('p');
            searchParams.delete('lang');
            
            var origQuery = '';
            if (searchParams.has('q')) {
                origQuery = '?' + decodeURIComponent(searchParams.get('q'));
            } else {
                var searchStr = searchParams.toString();
                origQuery = searchStr ? '?' + searchStr : '';
            }
            
            history.replaceState(null, '', cleanPath + origQuery + window.location.hash);
        }
    } else {
        currentLang = localStorage.getItem('lang') || 'hu';
    }

    snapshotHungarianTexts();
    if (currentLang === 'en') applyLanguage('en');

    // Handle browser back/forward history events for language prefixes
    if (window.location.protocol !== 'file:') {
        window.addEventListener('popstate', function () {
            var pathname = window.location.pathname;
            var newLang = (pathname.startsWith('/en/') || pathname === '/en') ? 'en' : 'hu';
            if (newLang !== currentLang) {
                currentLang = newLang;
                localStorage.setItem('lang', currentLang);
                applyLanguage(currentLang);
            }
        });
    }

    var toggle = document.getElementById('lang-toggle');
    if (toggle) {
        toggle.addEventListener('click', function () {
            currentLang = currentLang === 'hu' ? 'en' : 'hu';
            localStorage.setItem('lang', currentLang);
            
            // Update URL dynamically if on http/https
            if (window.location.protocol !== 'file:') {
                let pathname = window.location.pathname;
                let newPathname = pathname;
                if (currentLang === 'en') {
                    if (!pathname.startsWith('/en/') && pathname !== '/en') {
                        newPathname = '/en' + (pathname === '/' ? '' : pathname);
                    }
                } else {
                    if (pathname.startsWith('/en/')) {
                        newPathname = pathname.substring(3);
                    } else if (pathname === '/en') {
                        newPathname = '/';
                    }
                }
                if (newPathname !== pathname) {
                    history.pushState(null, '', newPathname + window.location.search + window.location.hash);
                }
            }
            applyLanguage(currentLang);
        });
        // Keyboard accessibility (Enter / Space)
        toggle.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); }
        });
    }
})();
