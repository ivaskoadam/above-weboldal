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

    function applyLanguage(lang) {
        restoreHungarianTexts();
        if (lang === 'en') translateNode(document.body, translations);

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
    var currentLang = localStorage.getItem('lang') || 'hu';
    snapshotHungarianTexts();
    if (currentLang === 'en') applyLanguage('en');

    var toggle = document.getElementById('lang-toggle');
    if (toggle) {
        toggle.addEventListener('click', function () {
            currentLang = currentLang === 'hu' ? 'en' : 'hu';
            localStorage.setItem('lang', currentLang);
            applyLanguage(currentLang);
        });
        // Keyboard accessibility (Enter / Space)
        toggle.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); }
        });
    }
})();
