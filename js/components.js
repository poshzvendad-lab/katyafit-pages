// KatyaFit — Shared Components (Header & Footer)
// Инжектирует хедер и футер в DOM, устанавливает активную ссылку навигации.
// Подключается как первый defer-скрипт перед main.js на всех страницах.

(function () {
    'use strict';

    // ─── Шаблон хедера ───────────────────────────────────────────────────────
    const headerHTML = `
    <header class="header" id="header">
        <div class="container">
            <a href="index.html" class="logo" id="headerLogo">Katya<span>Fit</span></a>
            <nav class="nav" id="mainNav">
                <a href="index.html#rates" class="nav-link" id="link-pricing">Тарифы</a>
                <a href="index.html#for-whom" class="nav-link" id="link-for-whom">Для кого</a>
                <a href="index.html#program-content" class="nav-link" id="link-program">Программа</a>
                <a href="index.html#reviews" class="nav-link" id="link-reviews">Отзывы</a>
                <a href="trainer.html" class="nav-link" id="link-trainer">О тренере</a>
                <a href="https://www.instagram.com/kkatyafit" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-nav" id="link-instagram">Instagram</a>
            </nav>
            <button class="menu-toggle" id="menuToggle" aria-label="Открыть меню" aria-expanded="false">
                <span class="menu-toggle-icon"></span>
            </button>
        </div>
    </header>

    <div class="mobile-nav-overlay" id="mobileNavOverlay"></div>
    <!-- inert: закрытое меню скрыто от скринридеров и tab-навигации;
         main.js снимает атрибут при открытии -->
    <nav class="mobile-nav" id="mobileNav" inert>
        <a href="index.html#rates" class="nav-link" id="mlink-pricing">Тарифы</a>
        <a href="index.html#for-whom" class="nav-link" id="mlink-for-whom">Для кого</a>
        <a href="index.html#program-content" class="nav-link" id="mlink-program">Программа</a>
        <a href="index.html#reviews" class="nav-link" id="mlink-reviews">Отзывы</a>
        <a href="trainer.html" class="nav-link" id="mlink-trainer">О тренере</a>
        <a href="https://www.instagram.com/kkatyafit" target="_blank" rel="noopener noreferrer" class="btn btn-primary" id="mlink-instagram">Instagram @kkatyafit</a>
    </nav>`;

    // ─── Шаблон футера (с навигационными ссылками) ───────────────────────────
    const footerHTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer-top">
                <div class="footer-brand">
                    <div class="footer-logo" id="footerLogo">KATYA<span>FIT</span></div>
                    <p class="footer-tagline">Система похудения без голода и зала.<br>Результат за 4 недели — проверено на 200+ клиентах.</p>
                </div>
                <nav class="footer-nav" aria-label="Дополнительные ссылки">
                    <div class="footer-nav-col">
                        <span class="footer-nav-heading">Программы</span>
                        <a href="index.html#rates">Тарифы и цены</a>
                        <a href="index.html#program-content">Состав программы</a>
                        <a href="index.html#how-it-works">Как это работает</a>
                    </div>
                    <div class="footer-nav-col">
                        <span class="footer-nav-heading">О нас</span>
                        <a href="trainer.html" id="footer-link-trainer">О тренере</a>
                        <a href="index.html#reviews">Отзывы</a>
                        <a href="faq.html" id="footer-link-faq">Вопросы и ответы</a>
                        <a href="privacy.html" id="footer-link-privacy">Конфиденциальность</a>
                        <a href="oferta.html" id="footer-link-oferta">Договор оферты</a>
                    </div>
                </nav>
                <div class="footer-cta-block">
                    <p class="footer-cta-text">Готовы начать?</p>
                    <a href="index.html#rates" class="btn btn-primary footer-cta-btn">Выбрать тариф</a>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="footer-copy" id="footerCopy">&copy; 2026 Екатерина Пономарева (@kkatyafit). Все права защищены.</div>
                <div class="footer-copy">ИП Пономарева Екатерина · Сайт носит информационный характер</div>
            </div>
        </div>
    </footer>`;

    // ─── Вставка компонентов в DOM ───────────────────────────────────────────
    // defer гарантирует полный парсинг DOM до выполнения скрипта
    const main = document.body.querySelector('main');
    if (main) {
        main.insertAdjacentHTML('beforebegin', headerHTML);
        main.insertAdjacentHTML('afterend', footerHTML);
    }

    // ─── Установка активной ссылки навигации по текущей странице ─────────────
    // Для index.html активные якорные ссылки управляются через IntersectionObserver в main.js
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const activePageMap = {
        'privacy.html': ['footer-link-privacy'],
        'oferta.html':  ['footer-link-oferta'],
        'trainer.html': ['link-trainer', 'mlink-trainer', 'footer-link-trainer'],
        'faq.html': ['footer-link-faq']
    };

    const activeIds = activePageMap[currentPage];
    if (activeIds) {
        activeIds.forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.classList.add('nav-link--active');
        });
    }

})();


// ─── Cookie-согласие + Яндекс.Метрика (152-ФЗ) ───────────────────────────────
// Метрика (счётчик 110015591, с Вебвизором) грузится ТОЛЬКО после явного
// согласия. Решение хранится локально (kf_cookie_consent: granted | denied).
// Отказ так же лёгок, как согласие — отдельная кнопка «Только необходимые».
(function initCookieConsent() {
    'use strict';

    var STORAGE_KEY = 'kf_cookie_consent';
    var METRIKA_ID = 110015591;

    function loadMetrika() {
        if (window.ym && window.ym.l) return; // уже инициализирована
        (function (m, e, t, r, i, k, a) {
            m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
            m[i].l = 1 * new Date();
            for (var j = 0; j < e.scripts.length; j++) { if (e.scripts[j].src === r) { return; } }
            k = e.createElement(t); a = e.getElementsByTagName(t)[0];
            k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
        })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=' + METRIKA_ID, 'ym');

        window.ym(METRIKA_ID, 'init', {
            ssr: true, webvisor: true, clickmap: true,
            accurateTrackBounce: true, trackLinks: true
        });
    }

    var decision = null;
    try { decision = localStorage.getItem(STORAGE_KEY); } catch (e) {}

    if (decision === 'granted') { loadMetrika(); return; } // согласие есть — без баннера
    if (decision === 'denied') { return; }                  // отказ — не грузим и не надоедаем

    // Решение не принято — показываем баннер
    var banner = document.createElement('div');
    banner.className = 'cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Согласие на использование cookie');
    banner.innerHTML =
        '<p class="cookie-consent__text">Мы используем cookie и сервис Яндекс.Метрика, чтобы сайт работал лучше. ' +
        'Подробнее — в <a href="privacy.html">политике конфиденциальности</a>.</p>' +
        '<div class="cookie-consent__actions">' +
        '<button type="button" class="cookie-consent__btn cookie-consent__btn--decline" data-cookie="denied">Только необходимые</button>' +
        '<button type="button" class="cookie-consent__btn cookie-consent__btn--accept" data-cookie="granted">Принять</button>' +
        '</div>';
    document.body.appendChild(banner);

    requestAnimationFrame(function () {
        requestAnimationFrame(function () { banner.classList.add('is-visible'); });
    });

    function decide(value) {
        try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
        banner.classList.remove('is-visible');
        setTimeout(function () { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 450);
        if (value === 'granted') loadMetrika();
    }

    banner.addEventListener('click', function (ev) {
        var btn = ev.target.closest('[data-cookie]');
        if (!btn) return;
        decide(btn.getAttribute('data-cookie'));
    });
})();
