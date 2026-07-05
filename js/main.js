// KatyaFit — Main JavaScript (Redesign 3.0)
// Общая логика всех страниц: шапка, мобильное меню, scroll-reveal,
// универсальные слайдеры, модальные окна (с focus trap), тосты.
// Все инициализации безопасны: при отсутствии элементов на странице
// функции тихо выходят, не оставляя ошибок в консоли.

document.addEventListener('DOMContentLoaded', () => {

    // ── Header shadow on scroll ─────────────────────────────────
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('header-scrolled', window.scrollY > 50);
        }, { passive: true });
    }

    // ── Mobile menu (a11y: aria-expanded + inert в закрытом виде) ─
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');

    if (menuToggle && mobileNav && mobileNavOverlay) {
        const toggleMenu = () => {
            const isOpen = mobileNav.classList.toggle('active');
            menuToggle.classList.toggle('active', isOpen);
            mobileNavOverlay.classList.toggle('active', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            // Закрытое меню уезжает за экран, но его ссылки остаются в
            // tab-порядке и видимы для скринридеров. inert убирает их
            // из дерева доступности полностью.
            mobileNav.toggleAttribute('inert', !isOpen);
        };

        menuToggle.addEventListener('click', toggleMenu);
        mobileNavOverlay.addEventListener('click', toggleMenu);

        mobileNav.querySelectorAll('.nav-link, .btn').forEach(link => {
            link.addEventListener('click', () => {
                if (mobileNav.classList.contains('active')) toggleMenu();
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
                toggleMenu();
            }
        });
    }

    // ── Scroll-Reveal animations ────────────────────────────────
    const revealSelectors = [
        '.target-item', '.benefit-card', '.step-card',
        '.card', '.hero-content', '.hero-image-wrapper',
        '.faq-item', '.philosophy-card', '.credential-item',
        '.contact-link-card', '.trainer-stats', '.trainer-photo-wrapper',
        '.reveal'
    ];

    const revealElements = document.querySelectorAll(revealSelectors.join(', '));

    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => {
            // Stagger-задержка по индексу среди одинаковых соседей
            const parent = el.parentElement;
            if (parent) {
                const tagName = el.tagName.toLowerCase();
                const classSelector = [...el.classList].join('.');
                if (classSelector) {
                    const siblings = parent.querySelectorAll(`:scope > ${tagName}.${classSelector}`);
                    const index = [...siblings].indexOf(el);
                    if (index > 0) {
                        el.style.setProperty('--reveal-delay', (index * 0.1) + 's');
                    }
                }
            }
            el.classList.add('reveal');
            revealObserver.observe(el);
        });
    }

    // ── Toggle details for program cards ────────────────────────
    document.querySelectorAll('.btn-toggle').forEach(btn => {
        const targetId = btn.getAttribute('data-target');
        btn.setAttribute('aria-expanded', 'false');
        if (targetId) btn.setAttribute('aria-controls', targetId);
        btn.addEventListener('click', () => {
            const targetEl = document.getElementById(targetId);
            if (!targetEl) return;
            const isOpen = targetEl.classList.toggle('open');
            btn.textContent = isOpen ? 'скрыть' : 'подробнее';
            btn.setAttribute('aria-expanded', String(isOpen));
        });
    });

    // ── Reviews accordion ───────────────────────────────────────
    const toggleReviewsBtn = document.getElementById('toggleReviewsBtn');
    const reviewsCollapse = document.getElementById('reviewsCollapse');
    if (toggleReviewsBtn && reviewsCollapse) {
        const arrowSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down icon-inline toggle-arrow"><polyline points="6 9 12 15 18 9"/></svg>';

        toggleReviewsBtn.setAttribute('aria-expanded', 'false');
        toggleReviewsBtn.setAttribute('aria-controls', 'reviewsCollapse');

        toggleReviewsBtn.addEventListener('click', () => {
            const isOpen = reviewsCollapse.classList.toggle('open');
            toggleReviewsBtn.classList.toggle('active', isOpen);
            toggleReviewsBtn.setAttribute('aria-expanded', String(isOpen));

            if (isOpen) {
                toggleReviewsBtn.innerHTML = 'Скрыть истории успеха ' + arrowSVG;
                // Пересчёт ширины слайдера после разворачивания блока
                window.dispatchEvent(new Event('resize'));
                setTimeout(() => {
                    const rect = reviewsCollapse.getBoundingClientRect();
                    window.scrollTo({
                        top: window.scrollY + rect.top - 120,
                        behavior: 'smooth'
                    });
                }, 150);
            } else {
                toggleReviewsBtn.innerHTML = 'Посмотреть истории успеха ' + arrowSVG;
                const reviewsSection = document.getElementById('reviews');
                if (reviewsSection) {
                    reviewsSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // ── Active nav links ────────────────────────────────────────
    markActiveNav();

    // ── Sliders: единый инициализатор для всех слайдеров сайта ──
    // Отзывы (главная страница)
    initSlider({
        track: '.reviews-track',
        slides: '.review-slide',
        prev: '.reviews-slider-container .slider-btn.prev',
        next: '.reviews-slider-container .slider-btn.next',
        dots: '#sliderDots',
        keyboard: true,
        itemLabel: 'отзыву'
    });

    // Дипломы и сертификаты (страница тренера)
    initSlider({
        track: '#cert-track',
        slides: '.certificates-slide',
        prev: '#cert-prev-btn',
        next: '#cert-next-btn',
        counter: '#cert-counter',
        dots: '#cert-dots',
        itemLabel: 'документу'
    });

    // ── Modals ──────────────────────────────────────────────────
    initModals();
    initCertificatesModal();
});


// ─── Active nav links ─────────────────────────────────────────────────────────
function markActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // На главной подсвечиваем якорные разделы при прокрутке
    if (currentPage === 'index.html' || currentPage === '') {
        const sections = ['rates', 'for-whom', 'program-content', 'reviews', 'faq'];
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('nav-link--active'));
                    const activeLink = document.querySelector(`[href*="#${id}"]`);
                    if (activeLink) activeLink.classList.add('nav-link--active');
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px' });

        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
    }
}


// ─── Универсальный слайдер (Scroll Snap) ─────────────────────────────────────
// Работает на любой странице: если трека или слайдов нет — тихо выходит.
// Поддерживает кнопки prev/next, счётчик «N / M», точки пагинации и клавиатуру.
function initSlider(options) {
    const config = options || {};
    const track = document.querySelector(config.track || '');
    if (!track) return;

    const slides = track.querySelectorAll(config.slides || ':scope > *');
    const total = slides.length;
    if (total === 0) return;

    const prevBtn = config.prev ? document.querySelector(config.prev) : null;
    const nextBtn = config.next ? document.querySelector(config.next) : null;
    const counter = config.counter ? document.querySelector(config.counter) : null;
    const dotsContainer = config.dots ? document.querySelector(config.dots) : null;

    let currentIndex = 0;

    // Шаг прокрутки = ширина слайда + gap трека (gap может отсутствовать)
    function getSlideStep() {
        const slideWidth = slides[0].getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        return slideWidth + gap;
    }

    function renderDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Перейти к ${config.itemLabel || 'слайду'} ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });
    }

    function updateUI() {
        if (counter) counter.textContent = `${currentIndex + 1} / ${total}`;
        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex === total - 1;
        if (dotsContainer) {
            dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }
    }

    function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(index, total - 1));
        track.scrollTo({
            left: currentIndex * getSlideStep(),
            behavior: 'smooth'
        });
        updateUI();
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

    // Синхронизация индекса после ручного скролла / свайпа
    let scrollTimer;
    track.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            const step = getSlideStep();
            if (step <= 0) return;
            const newIndex = Math.max(0, Math.min(Math.round(track.scrollLeft / step), total - 1));
            if (newIndex !== currentIndex) {
                currentIndex = newIndex;
                updateUI();
            }
        }, 80);
    }, { passive: true });

    // Клавиатурная навигация (для слайдера отзывов)
    if (config.keyboard) {
        track.setAttribute('tabindex', '0');
        track.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
            if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
        });
    }

    // Коррекция позиции при изменении размера окна
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            track.scrollTo({
                left: currentIndex * getSlideStep(),
                behavior: 'instant'
            });
        }, 120);
    }, { passive: true });

    renderDots();
    updateUI();
}


// ─── Toast (без двойного озвучивания скринридерами) ──────────────────────────
function showToast(message) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();

    // Единый aria-live регион создаётся один раз
    let liveRegion = document.getElementById('katyafit-live');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'katyafit-live';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
        document.body.appendChild(liveRegion);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    // Озвучивание берёт на себя live-region выше; role="alert" на самом
    // тосте приводил к двойному объявлению одного и того же текста.
    toast.setAttribute('aria-hidden', 'true');
    toast.textContent = message;
    document.body.appendChild(toast);

    liveRegion.textContent = '';
    requestAnimationFrame(() => { liveRegion.textContent = message; });
    requestAnimationFrame(() => { toast.classList.add('toast-notification--visible'); });

    setTimeout(() => {
        toast.classList.remove('toast-notification--visible');
        setTimeout(() => toast.remove(), 500);
    }, 2500);
}


// ─── Modal Window Management ──────────────────────────────────────────────────
window.openModal = function (id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.removeAttribute('inert');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Сброс состояния формы поддержки
    const formState = document.getElementById('support-form-state');
    const successState = document.getElementById('support-success-state');
    if (formState) formState.style.display = 'block';
    if (successState) successState.style.display = 'none';

    const opts = modal.querySelectorAll('.channel-opt');
    if (opts.length > 0) {
        opts.forEach(opt => {
            opt.classList.remove('selected');
            opt.setAttribute('aria-checked', 'false');
        });
        opts[0].classList.add('selected');
        opts[0].setAttribute('aria-checked', 'true');
    }
    const selectedInput = document.getElementById('selected-channel');
    if (selectedInput) selectedInput.value = 'Telegram';

    // Переводим фокус внутрь открытой модалки
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
};

window.closeModal = function (id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('active');
    // Закрытая модалка скрыта визуально (opacity 0), но без inert её
    // содержимое оставалось бы в tab-порядке и дереве доступности.
    modal.setAttribute('inert', '');
    document.body.style.overflow = '';
};

// Привязка обработчиков модальных окон без инлайновых onclick
// (инлайновые обработчики блокируются CSP script-src 'self')
function initModals() {
    // Кнопки открытия: <... data-modal-open="modal-id">
    document.querySelectorAll('[data-modal-open]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            window.openModal(trigger.getAttribute('data-modal-open'));
        });
    });

    // Кнопки закрытия: <... data-modal-close="modal-id"> и крестики .modal-close
    document.querySelectorAll('[data-modal-close]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            window.closeModal(trigger.getAttribute('data-modal-close'));
        });
    });

    document.querySelectorAll('.modal-overlay .modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const overlay = btn.closest('.modal-overlay');
            if (overlay) window.closeModal(overlay.id);
        });
    });

    // Закрытие по клику на подложку
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) window.closeModal(overlay.id);
        });
    });

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeOverlay = document.querySelector('.modal-overlay.active');
            if (activeOverlay) window.closeModal(activeOverlay.id);
        }
    });

    // Выбор канала связи в форме поддержки (мышь + клавиатура, role="radio")
    document.querySelectorAll('.channel-opt[data-channel]').forEach(opt => {
        const selectChannel = () => {
            const parent = opt.parentElement;
            if (parent) {
                parent.querySelectorAll('.channel-opt').forEach(o => {
                    o.classList.remove('selected');
                    o.setAttribute('aria-checked', 'false');
                });
            }
            opt.classList.add('selected');
            opt.setAttribute('aria-checked', 'true');
            const input = document.getElementById('selected-channel');
            if (input) input.value = opt.getAttribute('data-channel');
        };

        opt.addEventListener('click', selectChannel);
        opt.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectChannel();
            }
        });
    });

    // Отправка формы поддержки
    const supportForm = document.getElementById('supportForm');
    if (supportForm) {
        supportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const channelInput = document.getElementById('selected-channel');
            const display = document.getElementById('result-channel-display');
            if (display) display.textContent = channelInput ? channelInput.value : 'Telegram';
            const formState = document.getElementById('support-form-state');
            const successState = document.getElementById('support-success-state');
            if (formState) formState.style.display = 'none';
            if (successState) successState.style.display = 'block';
        });
    }
}


// ─── Certificates Modal (a11y: focus trap + возврат фокуса + inert) ──────────
function initCertificatesModal() {
    const slides = document.querySelectorAll('.certificates-slide[data-cert-src]');
    const modal = document.getElementById('modal-cert-viewer');
    const modalImg = document.getElementById('modal-cert-img');
    const modalTtl = document.getElementById('modal-cert-title');

    if (!modal || !modalImg) return;

    let lastActiveElement = null;

    const openCertModal = (imageSrc, docTitle) => {
        modalImg.src = imageSrc;
        if (modalTtl && docTitle) modalTtl.textContent = docTitle;
        lastActiveElement = document.activeElement;
        modal.removeAttribute('inert');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
    };

    const closeCertModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('inert', '');
        document.body.style.overflow = '';
        // Возврат фокуса на элемент, открывший модалку
        if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
            lastActiveElement.focus();
        }
    };

    slides.forEach(slide => {
        const src = slide.getAttribute('data-cert-src');
        const title = slide.getAttribute('data-cert-title');
        if (!src) return;

        const handleOpen = () => openCertModal(src, title || 'Просмотр документа');

        slide.addEventListener('click', handleOpen);
        slide.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpen();
            }
        });
    });

    modal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeCertModal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeCertModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeCertModal();
        }
    });

    // Focus trap: Tab/Shift+Tab не выходят за пределы открытой модалки
    modal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab' || !modal.classList.contains('active')) return;

        const focusable = modal.querySelectorAll('button, a[href], [tabindex="0"], input, select, textarea');
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === first) {
                last.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === last) {
                first.focus();
                e.preventDefault();
            }
        }
    });
}
