// amiré v2 shared behaviour: mobile menu, accessible tabs, scroll reveal.
(function () {
    // Mobile menu
    const btn = document.querySelector('.menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
        const setOpen = open => {
            btn.setAttribute('aria-expanded', open);
            menu.hidden = !open;
            document.documentElement.classList.toggle('menu-open', open);
        };
        btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
        menu.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setOpen(false); btn.focus(); } });
        matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) setOpen(false); });
    }
})();
(function () {
    // Tabs (WAI-ARIA tabs pattern)
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
        tabs.forEach(t => {
            const on = t === tab;
            t.setAttribute('aria-selected', on);
            t.tabIndex = on ? 0 : -1;
            const panel = document.getElementById(t.getAttribute('aria-controls'));
            if (panel) panel.hidden = !on;
        });
        if (focus) tab.focus();
    }
    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => select(tab));
        tab.addEventListener('keydown', e => {
            let n = null;
            if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
            if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
            if (e.key === 'Home') n = tabs[0];
            if (e.key === 'End') n = tabs[tabs.length - 1];
            if (n) { e.preventDefault(); select(n, true); }
        });
    });

    // Scroll reveal
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
})();
