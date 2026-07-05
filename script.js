document.addEventListener('DOMContentLoaded', () => {
    if (typeof populateContent === 'function') populateContent();

    const html = document.documentElement;
    const toggle = document.getElementById('theme-toggle');
    if (localStorage.getItem('theme') === 'dark') html.classList.add('dark');
    if (toggle) toggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
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
            if (!href || href === '#') return;
            e.preventDefault();
            const t = document.querySelector(href);
            if (t) t.scrollIntoView({ behavior: 'smooth' });
        });
    });

    const phrases = ['Leader', 'Changemaker', 'Visionary', 'Speaker', 'Community Builder'];
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
                e.target.querySelectorAll('.progress-fill').forEach(bar => { bar.style.width = bar.dataset.width + '%'; });
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
                    const target = +el.dataset.target;
                    const suffix = el.dataset.suffix || '';
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
    function goToSlide(i) {
        tIdx = i;
        if (track) track.style.transform = `translateX(-${i * 100}%)`;
        dots.forEach((d, j) => {
            d.classList.toggle('bg-accent', j === i);
            d.classList.toggle('bg-gray-300', j !== i);
            d.classList.toggle('dark:bg-gray-600', j !== i);
        });
    }
    dots.forEach(d => d.addEventListener('click', () => goToSlide(+d.dataset.index)));
    setInterval(() => goToSlide((tIdx + 1) % 3), 5000);

    document.querySelectorAll('.accordion-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const open = item.classList.contains('open');
            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
            if (!open) item.classList.add('open');
            btn.setAttribute('aria-expanded', !open);
        });
    });

    const contactForm = document.getElementById('contact-form');
    if (contactForm) contactForm.addEventListener('submit', e => {
        e.preventDefault();
        contactForm.classList.add('hidden');
        const success = document.getElementById('contact-success');
        if (success) success.classList.remove('hidden');
    });

    const navbar = document.getElementById('navbar');
    const btt = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (navbar) navbar.classList.toggle('shadow-md', window.scrollY > 50);
        if (!btt) return;
        if (window.scrollY > 500) { btt.style.opacity = '1'; btt.classList.remove('pointer-events-none'); }
        else { btt.style.opacity = '0'; btt.classList.add('pointer-events-none'); }
    });
    if (btt) btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    if (window.lucide && lucide.createIcons) lucide.createIcons();
});
