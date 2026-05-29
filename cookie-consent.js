(function () {
    'use strict';

    // Helper to get cookie value
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Helper to set cookie
    function setCookie(name, value, days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + "; " + expires + "; path=/; SameSite=Lax";
    }

    // If already responded, do not show the banner
    if (getCookie('cookie_consent') !== null) {
        return;
    }

    // Translations
    var contentHU = 
        '<div class="cookie-consent-icon" style="font-size: 1.5rem; color: #00BCD4; margin-right: 0.75rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">' +
            '<i class="fas fa-cookie-bite"></i>' +
        '</div>' +
        '<div class="cookie-consent-text" style="flex-grow: 1;">' +
            '<p style="margin: 0; font-family: \'Inter\', sans-serif; font-size: 0.875rem; line-height: 1.5; color: inherit;">' +
                'Az <strong>ABOVE Foundation</strong> sütiket (cookie) és a helyi tárhelyet (localStorage) használ a nyelvi és a vizuális téma-beállítások mentéséhez a zökkenőmentes működés érdekében.' +
            '</p>' +
        '</div>';

    var contentEN = 
        '<div class="cookie-consent-icon" style="font-size: 1.5rem; color: #00BCD4; margin-right: 0.75rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">' +
            '<i class="fas fa-cookie-bite"></i>' +
        '</div>' +
        '<div class="cookie-consent-text" style="flex-grow: 1;">' +
            '<p style="margin: 0; font-family: \'Inter\', sans-serif; font-size: 0.875rem; line-height: 1.5; color: inherit;">' +
                '<strong>ABOVE Foundation</strong> uses cookies and local storage (localStorage) to save your language and theme preferences for a seamless browsing experience.' +
            '</p>' +
        '</div>';

    var acceptHU = "Elfogadom";
    var acceptEN = "Accept";
    var declineHU = "Elutasítom";
    var declineEN = "Decline";

    // Create Banner Container
    var banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'glass-strong';
    
    // Apply styles
    var styleEl = document.createElement('style');
    styleEl.textContent = 
        '#cookie-consent-banner {' +
            'position: fixed;' +
            'bottom: 1.5rem;' +
            'right: 1.5rem;' +
            'max-width: 420px;' +
            'width: calc(100% - 3rem);' +
            'z-index: 99999;' +
            'padding: 1.5rem;' +
            'border-radius: 1.5rem;' +
            'box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);' +
            'display: flex;' +
            'flex-direction: column;' +
            'gap: 1rem;' +
            'box-sizing: border-box;' +
            'transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);' +
            'transform: translateY(30px);' +
            'opacity: 0;' +
            'color: #ffffff;' +
        '}' +
        'body.light-mode #cookie-consent-banner {' +
            'color: #0d1b2a;' +
            'box-shadow: 0 10px 40px rgba(0, 150, 180, 0.15);' +
        '}' +
        '#cookie-consent-banner.show {' +
            'transform: translateY(0);' +
            'opacity: 1;' +
        '}' +
        '.cookie-consent-body {' +
            'display: flex;' +
            'align-items: flex-start;' +
            'gap: 0.25rem;' +
        '}' +
        '.cookie-consent-buttons {' +
            'display: flex;' +
            'justify-content: flex-end;' +
            'gap: 0.75rem;' +
        '}' +
        '.cookie-btn {' +
            'font-family: \'Montserrat\', sans-serif;' +
            'font-weight: 700;' +
            'font-size: 0.8125rem;' +
            'padding: 0.5rem 1.25rem;' +
            'border-radius: 9999px;' +
            'cursor: pointer;' +
            'transition: all 0.3s ease;' +
            'border: 1px solid transparent;' +
        '}' +
        '.cookie-btn-accept {' +
            'background: linear-gradient(135deg, #00BCD4 0%, #00FFF0 100%);' +
            'color: #0f1d21 !important;' +
        '}' +
        '.cookie-btn-accept:hover {' +
            'box-shadow: 0 0 15px rgba(0, 188, 212, 0.4);' +
            'transform: scale(1.03);' +
        '}' +
        'body.light-mode .cookie-btn-accept {' +
            'background: linear-gradient(135deg, #007a9a 0%, #00b8d4 100%) !important;' +
            'color: #ffffff !important;' +
        '}' +
        '.cookie-btn-decline {' +
            'background: transparent;' +
            'border-color: rgba(0, 188, 212, 0.3);' +
            'color: #00BCD4;' +
        '}' +
        '.cookie-btn-decline:hover {' +
            'background: rgba(0, 188, 212, 0.05);' +
            'transform: scale(1.03);' +
        '}' +
        'body.light-mode .cookie-btn-decline {' +
            'border-color: rgba(0, 122, 154, 0.3);' +
            'color: #007a9a;' +
        '}' +
        'body.light-mode .cookie-btn-decline:hover {' +
            'background: rgba(0, 122, 154, 0.05);' +
        '}' +
        '@media (max-width: 576px) {' +
            '#cookie-consent-banner {' +
                'bottom: 1rem;' +
                'right: 1rem;' +
                'left: 1rem;' +
                'width: calc(100% - 2rem);' +
                'padding: 1.25rem;' +
            '}' +
        '}';
    document.head.appendChild(styleEl);

    // Create internal HTML
    banner.innerHTML = 
        '<div class="cookie-consent-body"></div>' +
        '<div class="cookie-consent-buttons">' +
            '<button class="cookie-btn cookie-btn-decline" id="cookie-decline-btn"></button>' +
            '<button class="cookie-btn cookie-btn-accept" id="cookie-accept-btn"></button>' +
        '</div>';

    document.body.appendChild(banner);

    var bodyEl = banner.querySelector('.cookie-consent-body');
    var acceptBtn = banner.querySelector('#cookie-accept-btn');
    var declineBtn = banner.querySelector('#cookie-decline-btn');

    // Function to render text based on current language
    function updateContent() {
        var currentLang = document.documentElement.lang || localStorage.getItem('lang') || 'hu';
        if (currentLang === 'en') {
            bodyEl.innerHTML = contentEN;
            acceptBtn.textContent = acceptEN;
            declineBtn.textContent = declineEN;
        } else {
            bodyEl.innerHTML = contentHU;
            acceptBtn.textContent = acceptHU;
            declineBtn.textContent = declineHU;
        }
    }

    // Initial render
    updateContent();

    // Trigger animation slide up
    setTimeout(function () {
        banner.classList.add('show');
    }, 300);

    // Action handlers
    acceptBtn.addEventListener('click', function () {
        setCookie('cookie_consent', 'accepted', 365);
        dismissBanner();
    });

    declineBtn.addEventListener('click', function () {
        setCookie('cookie_consent', 'declined', 365);
        dismissBanner();
    });

    function dismissBanner() {
        banner.classList.remove('show');
        setTimeout(function () {
            banner.remove();
        }, 500);
    }

    // Observe language changes on <html> tag to update banner language dynamically!
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
                updateContent();
            }
        });
    });
    observer.observe(document.documentElement, { attributes: true });

})();
