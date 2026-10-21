/* ============================================================
   KatyaFit · Лендинг — Sentry (детальная диагностика ошибок)

   Зачем: ловить JS-ошибки публичного сайта и доводить их до владельца в
   Telegram (через тот же n8n-воркфлоу `KatyaFit Sentry Notify`, что и у
   кабинета). Лендинг и кабинет — РАЗНЫЕ проекты Sentry в ОДНОЙ организации
   `katyafitru`, поэтому новый issue лендинга автоматически летит в тот же
   вебхук интеграции; воркфлоu помечает источник по project-slug
   (🌐 Лендинг / 🏠 Кабинет).

   Грузится синхронно в <head>, ДО components.js / main.js / cart.js — чтобы
   ловить ошибки во всех скриптах сайта с самого начала.

   Принципы (как в кабинете):
     • никогда не мешает сайту — всё в try/catch, при любой осечке тихо выходит;
     • на localhost НЕ шлём (не шумим дев-ошибками);
     • тег site=landing + страница (page) — для группировки и метки источника;
     • DSN публичный (как и в кабинете) — ему место в коде; он лишь открывает
       приём событий в проект, доступа к данным Sentry не даёт.
   ============================================================ */

(function () {
    'use strict';

    // DSN проекта `landing` (org katyafitru, регион EU `de`). Публичный.
    var SENTRY_DSN = 'https://ddc948d370cc49e74dddde998d3abfed@o4511613490102272.ingest.de.sentry.io/4511619198746704';

    try {
        if (!SENTRY_DSN) return;                                    // DSN не вставлен
        if (typeof Sentry === 'undefined' || !Sentry.init) return; // CDN-бандл не загрузился

        var host = location.hostname;
        if (host === 'localhost' || host === '127.0.0.1' || host === '') return; // дев — мимо

        // Релиз = версия кеша ?v= ЭТОГО ЖЕ скрипта (тянем из его src, чтобы не
        // держать версию в двух местах — bump-version.ps1 правит только ?v= в HTML).
        var release = 'unknown';
        try {
            var src = (document.currentScript && document.currentScript.src) || '';
            var m = src.match(/[?&]v=([^&]+)/);
            if (m) release = m[1];
        } catch (e) {}

        // Имя страницы — для группировки (index/trainer/faq/cart/oferta/privacy).
        function pageName() {
            var p = (location.pathname.split('/').pop() || 'index').replace(/\.html?$/i, '');
            return p || 'index';
        }

        Sentry.init({
            dsn: SENTRY_DSN,
            release: 'katyafit-landing@' + release,
            environment: 'production',
            // Только ошибки: ни трейсинга производительности, ни записи экрана (Replay).
            tracesSampleRate: 0,
            // Отсекаем известный безвредный шум браузеров.
            ignoreErrors: [
                'ResizeObserver loop limit exceeded',
                'ResizeObserver loop completed with undelivered notifications.',
                'Non-Error promise rejection captured',
            ],
            beforeSend: function (event) {
                try {
                    event.tags = event.tags || {};
                    event.tags.site = 'landing';
                    event.tags.page = pageName();
                } catch (e) {}
                return event;
            },
        });
    } catch (e) { /* инициализатор не должен ронять страницу */ }
})();
