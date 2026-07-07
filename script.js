document.addEventListener('DOMContentLoaded', () => {
    if (typeof populateContent === 'function') populateContent();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const html = document.documentElement;
    const toggle = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') html.classList.add('dark');
    else if (!SiteSecurity.isValidTheme(storedTheme) && storedTheme !== null) localStorage.removeItem('theme');
    if (toggle) toggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        const theme = html.classList.contains('dark') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    });

    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    function setMobileMenuOpen(open) {
        if (!mobileMenu || !mobileBtn) return;
        mobileMenu.classList.toggle('hidden', !open);
        mobileBtn.setAttribute('aria-expanded', String(open));
        mobileBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    if (mobileBtn) mobileBtn.addEventListener('click', () => {
        setMobileMenuOpen(mobileMenu.classList.contains('hidden'));
    });

    document.querySelectorAll('#mobile-menu a').forEach(a => a.addEventListener('click', () => {
        setMobileMenuOpen(false);
    }));

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('hidden')) {
            setMobileMenuOpen(false);
            mobileBtn?.focus();
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            if (!href || href === '#' || !SiteSecurity.isSafeFragment(href)) return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    });

    const phrases = ['MCA Aspirant', 'Son of Kericho', 'Kedowa/Kimugul Leader', 'Ward Representative', 'Servant of Kenya'];
    let pi = 0, ci = 0, deleting = false;
    const typedEl = document.getElementById('typed-text');
    function typeLoop() {
        if (!typedEl || prefersReducedMotion) {
            if (typedEl && prefersReducedMotion) typedEl.textContent = phrases[0];
            return;
        }
        const word = phrases[pi];
        typedEl.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
        if (!deleting && ci > word.length) { setTimeout(() => { deleting = true; typeLoop(); }, 1500); return; }
        if (deleting && ci < 0) { deleting = false; pi = (pi + 1) % phrases.length; }
        setTimeout(typeLoop, deleting ? 40 : 80);
    }
    typeLoop();

    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    const skillObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.querySelectorAll('.progress-fill').forEach(bar => {
                    const width = SiteSecurity.clampPercent(bar.dataset.width);
                    bar.style.width = prefersReducedMotion ? width + '%' : width + '%';
                });
                skillObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.3 });
    const skillsGrid = document.getElementById('skills-grid');
    if (skillsGrid) skillObs.observe(skillsGrid);

    const counterObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.querySelectorAll('.count').forEach(el => {
                    const target = Math.max(0, Math.min(999999, Number(el.dataset.target) || 0));
                    const suffix = SiteSecurity.sanitizeText(el.dataset.suffix || '', 8);
                    if (prefersReducedMotion) {
                        el.textContent = target.toLocaleString() + suffix;
                        return;
                    }
                    const step = Math.max(1, Math.ceil(target / 60));
                    let current = 0;
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) { current = target; clearInterval(timer); }
                        el.textContent = current.toLocaleString() + suffix;
                    }, 30);
                });
                counterObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.3 });
    const impactEl = document.getElementById('impact');
    if (impactEl) counterObs.observe(impactEl);

    let tIdx = 0;
    let testimonialTimer = null;
    const track = document.getElementById('testimonial-track');
    const dots = document.querySelectorAll('.testimonial-dot');
    const slideCount = dots.length || 1;
    function goToSlide(i) {
        const index = ((Number(i) % slideCount) + slideCount) % slideCount;
        tIdx = index;
        if (track) track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((d, j) => {
            d.classList.toggle('active', j === index);
            d.setAttribute('aria-current', j === index ? 'true' : 'false');
        });
    }
    dots.forEach(d => d.addEventListener('click', () => goToSlide(d.dataset.index)));
    if (slideCount > 1 && !prefersReducedMotion) {
        testimonialTimer = setInterval(() => goToSlide(tIdx + 1), 5000);
        document.getElementById('testimonials')?.addEventListener('mouseenter', () => {
            if (testimonialTimer) clearInterval(testimonialTimer);
        });
        document.getElementById('testimonials')?.addEventListener('mouseleave', () => {
            if (!prefersReducedMotion) testimonialTimer = setInterval(() => goToSlide(tIdx + 1), 5000);
        });
    }

    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = [...navLinks]
        .map(a => {
            const href = a.getAttribute('href');
            return SiteSecurity.isSafeFragment(href) ? document.querySelector(href) : null;
        })
        .filter(Boolean);
    const btt = document.getElementById('back-to-top');

    function onScroll() {
        if (navbar) navbar.classList.toggle('nav-scrolled', window.scrollY > 20);

        const scrollPos = window.scrollY + 120;
        let currentId = null;
        sections.forEach(s => { if (s.offsetTop <= scrollPos) currentId = s.id; });
        navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + currentId);
        });

        if (!btt) return;
        if (window.scrollY > 500) { btt.style.opacity = '1'; btt.classList.remove('pointer-events-none'); }
        else { btt.style.opacity = '0'; btt.classList.add('pointer-events-none'); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    document.querySelectorAll('.accordion-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const open = item.classList.contains('open');
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('open');
                i.querySelector('.accordion-trigger')?.setAttribute('aria-expanded', 'false');
            });
            if (!open) {
                item.classList.add('open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    const contactForm = document.getElementById('contact-form');
    const contactError = document.getElementById('contact-error');
    const contactSubmitBtn = contactForm?.querySelector('[type="submit"]');
    const RATE_LIMIT_MS = 60000;

    function showContactError(message) {
        if (!contactError) return;
        contactError.textContent = message;
        contactError.classList.remove('hidden');
    }

    function hideContactError() {
        if (contactError) contactError.classList.add('hidden');
    }

    function showContactSuccess() {
        contactForm?.classList.add('hidden');
        const success = document.getElementById('contact-success');
        if (success) success.classList.remove('hidden');
    }

    if (contactForm) contactForm.addEventListener('submit', async e => {
        e.preventDefault();
        hideContactError();

        const honeypot = document.getElementById('contact-website');
        if (honeypot && honeypot.value.trim()) return;

        const lastSubmit = Number(sessionStorage.getItem('contactLastSubmit') || 0);
        if (Date.now() - lastSubmit < RATE_LIMIT_MS) {
            showContactError('Please wait a moment before sending another message.');
            return;
        }

        const name = SiteSecurity.sanitizeText(contactForm.elements['contact-name']?.value || '', 100);
        const email = SiteSecurity.sanitizeText(contactForm.elements['contact-email']?.value || '', 254);
        const message = SiteSecurity.sanitizeText(contactForm.elements['contact-message']?.value || '', 2000);

        if (name.length < 2) {
            showContactError('Please enter your name (at least 2 characters).');
            return;
        }
        if (!SiteSecurity.isValidEmail(email)) {
            showContactError('Please enter a valid email address.');
            return;
        }
        if (message.length < 10) {
            showContactError('Please enter a message (at least 10 characters).');
            return;
        }

        const endpoint = typeof getFormSubmitEndpoint === 'function' ? getFormSubmitEndpoint() : null;
        if (!endpoint || !SiteSecurity.isSafeFormEndpoint(endpoint)) {
            showContactError(SITE_CONTENT['contact-error-generic'] || 'Unable to send message. Please email us directly.');
            return;
        }

        const originalBtnText = contactSubmitBtn?.textContent;
        if (contactSubmitBtn) {
            contactSubmitBtn.disabled = true;
            contactSubmitBtn.textContent = SITE_CONTENT['contact-sending'] || 'Sending…';
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    message,
                    _subject: 'Campaign contact from ' + name,
                    _template: 'table',
                    _captcha: 'false',
                }),
            });

            if (!response.ok) throw new Error('Form submit failed');

            sessionStorage.setItem('contactLastSubmit', String(Date.now()));
            showContactSuccess();
        } catch {
            showContactError(SITE_CONTENT['contact-error-generic'] || 'Something went wrong. Please try again or email us directly.');
        } finally {
            if (contactSubmitBtn) {
                contactSubmitBtn.disabled = false;
                if (originalBtnText) contactSubmitBtn.textContent = originalBtnText;
            }
        }
    });

    if (btt) btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));

    if (window.lucide && lucide.createIcons) lucide.createIcons();
});
