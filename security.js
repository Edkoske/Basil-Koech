/**
 * Client-side security helpers for the static site.
 * Server deployments should also apply the headers in _headers / vercel.json.
 */
const SiteSecurity = (() => {
    const ALLOWED_LINK_HOSTS = new Set([
        'www.tiktok.com',
        'tiktok.com',
        'influxermerch.com',
        'www.influxermerch.com',
    ]);

    const SAFE_FRAGMENT = /^#[a-z][\w-]*$/i;
    const SAFE_IMAGE = /^(?:\.\/)?assets\/[\w./-]+\.(?:jpe?g|png|webp|gif|svg)$/i;
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function stripControlChars(value) {
        return String(value).replace(/[\u0000-\u001F\u007F]/g, '');
    }

    function isSafeFragment(href) {
        return typeof href === 'string' && SAFE_FRAGMENT.test(href);
    }

    function isSafeExternalUrl(url) {
        if (typeof url !== 'string' || !url.startsWith('https://')) return false;
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'https:' && ALLOWED_LINK_HOSTS.has(parsed.hostname);
        } catch {
            return false;
        }
    }

    function isSafeImageSrc(src) {
        if (typeof src !== 'string') return false;
        if (src.includes('..') || src.includes('\\')) return false;
        return SAFE_IMAGE.test(src);
    }

    function sanitizeText(value, maxLength) {
        const clean = stripControlChars(value).trim();
        return clean.length > maxLength ? clean.slice(0, maxLength) : clean;
    }

    function isValidEmail(email) {
        return EMAIL_PATTERN.test(email) && email.length <= 254;
    }

    function isValidTheme(theme) {
        return theme === 'dark' || theme === 'light';
    }

    function clampPercent(value) {
        const num = Number(value);
        if (!Number.isFinite(num)) return 0;
        return Math.min(100, Math.max(0, Math.round(num)));
    }

    function applyExternalLink(el, url) {
        if (!isSafeExternalUrl(url)) return false;
        el.href = url;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
        return true;
    }

    return {
        isSafeFragment,
        isSafeExternalUrl,
        isSafeImageSrc,
        sanitizeText,
        isValidEmail,
        isValidTheme,
        clampPercent,
        applyExternalLink,
        stripControlChars,
    };
})();
