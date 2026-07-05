// KatyaFit - Checkout Script (Audited & Fixed)
// Optimized for direct tariff checkout without a cart.

// ─── НАСТРОЙКА: замените на ваши реальные данные ──────────────────────────────
// Чтобы получить BOT_TOKEN: создайте бота через @BotFather в Telegram
// Чтобы получить CHAT_ID: напишите боту что-нибудь, затем зайдите на
//   https://api.telegram.org/bot<BOT_TOKEN>/getUpdates и найдите "chat":{"id":...}
const TELEGRAM_CONFIG = {
    BOT_TOKEN: 'ВАШ_BOT_TOKEN_ЗДЕСЬ',   // Вставьте ваш токен бота
    CHAT_ID:   'ВАШ_CHAT_ID_ЗДЕСЬ',     // Вставьте ваш chat id
};
// ─────────────────────────────────────────────────────────────────────────────

// База данных тарифов для отображения на странице оформления
const PLANS_DB = {
    self: {
        id: 'self',
        name: 'Питание на 4 недели',
        price: 1500,
        oldPrice: 2790,
        period: 'за 4 недели',
        features: [
            '4 недели (28 дней) доступа к закрытому личному кабинету.',
            'Гибкий Конструктор питания с точными порциями — ешьте то, что любите, и худейте.',
            'Готовые меню на каждый из 28 дней — не нужно думать, что приготовить.',
            'Рецепты с подсчитанными калориями и понятными граммовками.',
            'Трекер прогресса и привычек, чтобы не сойти с дистанции.',
            'Тренировки в тариф не входят — их можно добавить в кабинете отдельно.'
        ]
    },
    curator: {
        id: 'curator',
        name: 'Домашние тренировки с планом питания',
        price: 3500,
        oldPrice: 5990,
        period: 'за 4 недели',
        features: [
            'Полный доступ в кабинет на 4 недели: 12 домашних тренировок + питание.',
            'Гибкий Конструктор питания и готовые меню на каждый из 28 дней.',
            'Рецепты с подсчитанными калориями и понятными граммовками.',
            'Трекер прогресса и привычек, чтобы держать ритм.'
        ]
    },
    vip: {
        id: 'vip',
        name: 'Максимум домашних тренировок с Питанием',
        price: 8500,
        oldPrice: 13990,
        period: 'за 4 недели',
        features: [
            'Полная программа: 12 домашних тренировок + питание на 4 недели в кабинете.',
            'Моё личное ежедневное кураторство — отвечаю на любые вопросы по тренировкам и питанию.',
            'Личный закрытый чат со мной в Telegram / Max (общение тет-а-тет).',
            'Индивидуальный разбор техники упражнений по вашим видео.',
            'Персонально составляю и адаптирую меню и программу под ваши цели, вкусы и образ жизни.',
            'Еженедельные разборы прогресса для корректировки плана.'
        ]
    },
    free: {
        id: 'free',
        name: 'Бесплатный тест-драйв системы',
        price: 0,
        period: 'на 3 дня',
        features: [
            '3 дня полного доступа в личный кабинет (дни 1–3 программы).',
            '2 полноценные домашние видеотренировки в записи — для любого уровня подготовки.',
            'Питание на все 3 дня: готовое меню с граммовками и калориями.',
            'Знакомство с личным кабинетом и системой трекинга прогресса.'
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {

    // ─── Утилита: безопасное экранирование HTML ──────────────────────────
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }

    // ─── Получение выбранного тарифа из URL ──────────────────────────────
    function getSelectedPlan() {
        const urlParams = new URLSearchParams(window.location.search);
        const planId = urlParams.get('plan') || urlParams.get('tariff');
        return PLANS_DB[planId] || null;
    }

    const selectedPlan = getSelectedPlan();

    // Если тариф не выбран или невалиден, перенаправляем на блок тарифов
    // (сразу на index.html#rates — без промежуточного редиректа через product.html)
    if (!selectedPlan) {
        window.location.replace('index.html#rates');
        return;
    }

    // Тест-драйв (free) — бесплатный, без оплаты; остальные тарифы платные.
    const isTrial = selectedPlan.price === 0;

    // ─── DOM элементы ─────────────────────────────────────────────────────
    const selectedPlanContainer = document.getElementById('selectedPlanContainer');
    const summaryTotal          = document.getElementById('summary-total');
    const checkoutForm          = document.getElementById('checkoutForm');
    const successOverlay        = document.getElementById('successOverlay');
    const successEmail          = document.getElementById('success-client-email');
    const successText           = document.getElementById('success-text');
    const successCloseBtn       = document.getElementById('success-close-btn');
    const submitBtn             = document.getElementById('submitOrderBtn');
    const emailLabel            = document.querySelector('label[for="order-email"]');
    const emailHint             = document.getElementById('email-hint');

    // Текст кнопки и подписи зависят от типа тарифа
    const submitLabel = isTrial ? 'Получить доступ' : 'Купить';

    // ─── Подстройка подписей под тип тарифа ───────────────────────────────
    function applyPlanLabels() {
        if (submitBtn) submitBtn.textContent = submitLabel;
        if (isTrial) {
            if (emailLabel) emailLabel.textContent = 'Email для доступа';
            if (emailHint)  emailHint.textContent = 'На него вышлем доступ в личный кабинет.';
        }
        // Для платных подписи уже верные в HTML (чек + доступ).
    }

    // ─── Рендер выбранного тарифа ──────────────────────────────────────────
    function renderSelectedPlan() {
        if (!selectedPlanContainer) return;

        // Clear container safely
        selectedPlanContainer.innerHTML = '';

        const card = document.createElement('div');
        card.className = 'selected-plan-card';

        const tag = document.createElement('span');
        tag.className = 'pricing-tag';
        tag.style.position = 'static';
        tag.style.display = 'inline-block';
        tag.style.marginBottom = '1.5rem';
        tag.textContent = 'Выбранная программа';
        card.appendChild(tag);

        const title = document.createElement('h3');
        title.className = 'pricing-title';
        title.style.marginTop = '0';
        title.style.marginBottom = '1rem';
        title.style.fontSize = '1.8rem';
        title.style.fontFamily = 'var(--font-display)';
        title.style.fontWeight = '800';
        title.style.color = 'var(--accent-forest)';
        title.textContent = selectedPlan.name;
        card.appendChild(title);

        const priceDiv = document.createElement('div');
        priceDiv.className = 'pricing-price';
        priceDiv.style.marginBottom = '2.5rem';
        priceDiv.style.display = 'flex';
        priceDiv.style.alignItems = 'baseline';
        priceDiv.style.gap = '0.25rem';
        priceDiv.style.flexWrap = 'wrap';

        const priceVal = document.createElement('span');
        priceVal.className = 'price-val';
        priceVal.style.fontSize = '2.5rem';
        priceVal.style.fontWeight = '800';
        priceVal.style.color = 'var(--text-main)';
        priceVal.style.fontFamily = 'var(--font-display)';
        priceVal.textContent = selectedPlan.price.toLocaleString('ru-RU');
        priceDiv.appendChild(priceVal);

        const currency = document.createElement('span');
        currency.className = 'price-currency';
        currency.style.fontSize = '1.5rem';
        currency.style.fontWeight = '700';
        currency.style.color = 'var(--text-main)';
        currency.textContent = '₽';
        priceDiv.appendChild(currency);

        if (selectedPlan.oldPrice) {
            const oldPriceVal = document.createElement('span');
            oldPriceVal.className = 'price-old-val';
            oldPriceVal.textContent = ` ${selectedPlan.oldPrice.toLocaleString('ru-RU')} ₽`;
            priceDiv.appendChild(oldPriceVal);
        }

        const period = document.createElement('span');
        period.className = 'price-period';
        period.style.fontSize = '0.9rem';
        period.style.color = 'var(--text-muted)';
        period.style.marginLeft = '0.5rem';
        period.textContent = ` ${selectedPlan.period}`;
        priceDiv.appendChild(period);

        card.appendChild(priceDiv);

        const featuresList = document.createElement('ul');
        featuresList.className = 'pricing-features';
        featuresList.style.listStyle = 'none';
        featuresList.style.padding = '0';
        featuresList.style.margin = '0 0 3rem 0';
        featuresList.style.display = 'flex';
        featuresList.style.flexDirection = 'column';
        featuresList.style.gap = '1rem';

        selectedPlan.features.forEach(feat => {
            const li = document.createElement('li');
            li.textContent = feat;
            featuresList.appendChild(li);
        });
        card.appendChild(featuresList);

        const footerDiv = document.createElement('div');
        footerDiv.style.borderTop = '1px solid var(--border-color)';
        footerDiv.style.paddingTop = '1.5rem';
        footerDiv.style.textAlign = 'left';

        const changeLink = document.createElement('a');
        changeLink.href = 'index.html#rates';
        changeLink.className = 'change-plan-link';
        changeLink.style.display = 'inline-flex';
        changeLink.style.alignItems = 'center';
        changeLink.style.gap = '0.5rem';
        changeLink.style.color = 'var(--accent-coral)';
        changeLink.style.fontWeight = '600';
        changeLink.style.textDecoration = 'none';
        changeLink.style.transition = 'var(--transition-smooth)';

        const arrowIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        arrowIcon.setAttribute('viewBox', '0 0 24 24');
        arrowIcon.setAttribute('fill', 'none');
        arrowIcon.setAttribute('stroke', 'currentColor');
        arrowIcon.setAttribute('stroke-width', '2');
        arrowIcon.setAttribute('stroke-linecap', 'round');
        arrowIcon.setAttribute('stroke-linejoin', 'round');
        arrowIcon.setAttribute('class', 'lucide lucide-arrow-left');
        arrowIcon.style.width = '16px';
        arrowIcon.style.height = '16px';
        arrowIcon.innerHTML = '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>';
        changeLink.appendChild(arrowIcon);

        const linkText = document.createTextNode(' Изменить тариф');
        changeLink.appendChild(linkText);

        footerDiv.appendChild(changeLink);
        card.appendChild(footerDiv);

        selectedPlanContainer.appendChild(card);



        // Обновляем итоговую стоимость
        const summaryLabel = document.getElementById('summary-label');
        if (isTrial) {
            if (summaryLabel) summaryLabel.textContent = 'Стоимость:';
            if (summaryTotal) summaryTotal.textContent = 'Бесплатно';
        } else if (summaryTotal) {
            summaryTotal.textContent = `${selectedPlan.price.toLocaleString('ru-RU')} ₽`;
        }
    }

    // ─── Валидация формы ──────────────────────────────────────────────────
    function validateForm() {
        let isValid = true;
        const errors = { email: '', consent: '' };

        const email   = document.getElementById('order-email');
        const consent = document.getElementById('order-consent');

        // Email (простая, но надёжная проверка: есть @ и домен с точкой)
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value.trim())) {
            errors.email = 'Введите корректный email';
            isValid = false;
        }

        // Согласие
        if (!consent.checked) {
            errors.consent = 'Необходимо согласие на обработку персональных данных';
            isValid = false;
        }

        // Отображаем ошибки
        Object.entries(errors).forEach(([field, msg]) => {
            const errorEl = document.getElementById(`error-${field}`);
            if (errorEl) {
                errorEl.textContent = msg;
                errorEl.style.display = msg ? 'block' : 'none';
            }
            const input = document.getElementById(`order-${field}`);
            if (input) {
                input.classList.toggle('form-input--error', !!msg);
            }
        });

        return isValid;
    }

    // ─── Отправка в Telegram ──────────────────────────────────────────────
    // Экранирование спецсимволов Markdown в пользовательском вводе,
    // чтобы заявка не ломала разметку сообщения и не подделывала её
    function escapeMarkdown(str) {
        return String(str).replace(/([*_`\[\]])/g, '\\$1');
    }

    async function sendToTelegram(email) {
        const total = selectedPlan.price;

        const text = isTrial ? [
            '🎁 *Заявка на Тест-драйв KatyaFit*',
            '',
            `📧 *Email:* ${escapeMarkdown(email)}`,
            `*Тариф:* ${selectedPlan.name} (бесплатно)`,
            '',
            '➡️ Выдай доступ к Тест-драйву (дни 1–3) на этот email.',
        ].join('\n') : [
            '🛒 *Заявка на покупку KatyaFit*',
            '',
            `📧 *Email (для чека/доступа):* ${escapeMarkdown(email)}`,
            `*Тариф:* ${selectedPlan.name}`,
            `*Стоимость:* ${total.toLocaleString('ru-RU')} ₽ ${selectedPlan.period}`,
            '',
            '➡️ Свяжись для оплаты и выдай доступ после оплаты.',
        ].join('\n');

        // Если токен не настроен — имитируем успех (для демо/локалки)
        if (TELEGRAM_CONFIG.BOT_TOKEN === 'ВАШ_BOT_TOKEN_ЗДЕСЬ') {
            console.warn('[KatyaFit] Telegram не настроен. Заявка только на стороне клиента.');
            return { ok: true, demo: true };
        }

        const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.CHAT_ID,
                text: text,
                parse_mode: 'Markdown',
            }),
        });

        const result = await response.json();
        // Telegram возвращает ok:false при ошибке (даже с HTTP 200 у прокси) —
        // считаем это ошибкой отправки, чтобы клиент увидел сообщение об ошибке
        if (!result.ok) {
            throw new Error(result.description || `Telegram API error (HTTP ${response.status})`);
        }
        return result;
    }

    // ─── 💳 ТОЧКА ПОДКЛЮЧЕНИЯ ОПЛАТЫ (ЮMoney) ──────────────────────────────
    // Сейчас оплата НЕ подключена: и покупка, и тест-драйв уходят заявкой в
    // Telegram (Кате), доступ выдаётся вручную.
    //
    // 👉 Когда подключишь ЮMoney — замени тело этой функции для платных тарифов
    //    на переход к форме быстрых платежей ЮMoney (quickpay), напр.:
    //      const form = document.createElement('form');
    //      form.method = 'POST';
    //      form.action = 'https://yoomoney.ru/quickpay/confirm.xml';
    //      // поля: receiver (номер кошелька), sum (selectedPlan.price),
    //      //       label (тариф+email для сверки), targets, paymentType, и т.д.
    //      // СБП/картой пользователь выбирает уже на стороне ЮMoney.
    //      document.body.appendChild(form); form.submit();
    //    Подтверждение оплаты и авто-выдачу доступа повесишь на webhook ЮMoney.
    //    Тест-драйв (isTrial) платежа не требует — оставь заявку в Telegram.
    async function startCheckout(email) {
        return sendToTelegram(email);
    }

    // ─── Отправка формы ──────────────────────────────────────────────────
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Honeypot — если заполнен, скорее всего бот
            const honeypot = document.getElementById('hp-website');
            if (honeypot && honeypot.value.trim() !== '') {
                console.warn('[KatyaFit] Honeypot triggered, ignoring submission.');
                return;
            }

            // Валидация
            if (!validateForm()) return;

            // Блокировка кнопки для предотвращения двойной отправки
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Отправка...';
            }

            const email = document.getElementById('order-email').value.trim();

            try {
                // Покупка/тест-драйв → заявка в Telegram (см. startCheckout)
                await startCheckout(email);

                // Показываем успех
                if (successEmail) successEmail.textContent = email;
                if (successText) {
                    successText.innerHTML = isTrial
                        ? 'Спасибо! Заявка отправлена на <strong id="success-client-email"></strong>. Скоро откроем доступ к Тест-драйву в личном кабинете — следите за почтой.'
                        : 'Спасибо! Заявка отправлена на <strong id="success-client-email"></strong>. Екатерина свяжется с вами в ближайшее время, чтобы помочь с оплатой и выдать доступ в личный кабинет.';
                    const emailEl = document.getElementById('success-client-email');
                    if (emailEl) emailEl.textContent = email;
                }
                if (successOverlay) {
                    successOverlay.style.display = 'flex';
                    successOverlay.focus();
                }
                document.body.style.overflow = 'hidden';

            } catch (err) {
                console.error('[KatyaFit] Ошибка отправки:', err);
                // Разблокируем кнопку при ошибке
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = submitLabel;
                }
                if (typeof showToast === 'function') {
                    showToast('Ошибка отправки. Пожалуйста, попробуйте снова или напишите напрямую.');
                }
            }
        });
    }

    // ─── Закрытие модального окна успеха ──────────────────────────────────
    if (successCloseBtn) {
        successCloseBtn.addEventListener('click', () => {
            if (successOverlay) successOverlay.style.display = 'none';
            document.body.style.overflow = '';
            window.location.href = 'index.html';
        });
    }

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && successOverlay && successOverlay.style.display !== 'none') {
            successOverlay.style.display = 'none';
            document.body.style.overflow = '';
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = submitLabel;
            }
        }
    });

    // Инициализация: тариф + подписи под его тип
    renderSelectedPlan();
    applyPlanLabels();
});
