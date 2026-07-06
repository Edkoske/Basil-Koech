document.addEventListener('DOMContentLoaded', () => {
    if (typeof populateContent === 'function') populateContent();

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
    if (mobileBtn) mobileBtn.addEventListener('click', () => {
        const mm = document.getElementById('mobile-menu');
        if (mm) mm.classList.toggle('hidden');
    });
    document.querySelectorAll('#mobile-menu a').forEach(a => a.addEventListener('click', () => {
        const mm = document.getElementById('mobile-menu');
        if (mm) mm.classList.add('hidden');
    }));

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            if (!href || href === '#' || !SiteSecurity.isSafeFragment(href)) return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    const phrases = ['MCA Aspirant', 'Son of Kericho', 'Kedowa/Kimugul Leader', 'Ward Representative', 'Servant of Kenya'];
    let pi = 0, ci = 0, deleting = false;
    const typedEl = document.getElementById('typed-text');
    function typeLoop() {
        if (!typedEl) return;
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
                    bar.style.width = SiteSecurity.clampPercent(bar.dataset.width) + '%';
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
    const track = document.getElementById('testimonial-track');
    const dots = document.querySelectorAll('.testimonial-dot');
    const slideCount = dots.length || 1;
    function goToSlide(i) {
        const index = ((Number(i) % slideCount) + slideCount) % slideCount;
        tIdx = index;
        if (track) track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((d, j) => d.classList.toggle('active', j === index));
    }
    dots.forEach(d => d.addEventListener('click', () => goToSlide(d.dataset.index)));
    if (slideCount > 1) setInterval(() => goToSlide(tIdx + 1), 5000);

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
            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
            if (!open) item.classList.add('open');
            btn.setAttribute('aria-expanded', String(!open));
        });
    });

    const contactForm = document.getElementById('contact-form');
    const contactError = document.getElementById('contact-error');
    const RATE_LIMIT_MS = 60000;

    function showContactError(message) {
        if (!contactError) return;
        contactError.textContent = message;
        contactError.classList.remove('hidden');
    }

    function hideContactError() {
        if (contactError) contactError.classList.add('hidden');
    }

    if (contactForm) contactForm.addEventListener('submit', e => {
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

        sessionStorage.setItem('contactLastSubmit', String(Date.now()));
        contactForm.classList.add('hidden');
        const success = document.getElementById('contact-success');
        if (success) success.classList.remove('hidden');
    });

    if (btt) btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    if (window.lucide && lucide.createIcons) lucide.createIcons();
});
