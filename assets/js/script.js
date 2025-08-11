(() => {
  /* =========================
     1) ЄДИНИЙ СЛАЙДЕР
     ========================= */
  class SliderManager {
    constructor(container) {
      this.container =
        typeof container === 'string'
          ? document.querySelector(container)
          : container;
      if (!this.container) return;

      this.slides = this.container.querySelectorAll('.slide');
      if (!this.slides.length) return;

      const main = this.container.closest('.main-container');
      this.prevBtn = main?.querySelector('.nav-button.prev') || null;
      this.nextBtn = main?.querySelector('.nav-button.next') || null;

      this.generateDots();
      this.dots =
        main?.querySelectorAll('.dot') ||
        this.container.querySelectorAll('.dot');

      this.currentSlideIndex = 0;
      this.totalSlides = this.slides.length;
      this.autoPlayInterval = null;

      this.init();
    }

    generateDots() {
      const main = this.container.closest('.main-container');
      if (!main) return;

      let dotsContainer = main.querySelector('.dots-container');
      if (!dotsContainer) {
        dotsContainer = document.createElement('div');
        dotsContainer.className = 'dots-container';
        main.appendChild(dotsContainer);
      }
      dotsContainer.innerHTML = '';

      this.slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dotsContainer.appendChild(dot);
      });
    }

    init() {
      if (this.prevBtn)
        this.prevBtn.addEventListener('click', () => this.changeSlide(-1));
      if (this.nextBtn)
        this.nextBtn.addEventListener('click', () => this.changeSlide(1));

      if (this.dots?.length) {
        this.dots.forEach((dot, i) => {
          dot.addEventListener('click', () => this.goToSlide(i));
        });
      }

      this.addTouchSupport();
      this.startAutoPlay();
      this.showSlide(0);
    }

    showSlide(index) {
      if (index >= this.totalSlides) index = 0;
      if (index < 0) index = this.totalSlides - 1;
      this.currentSlideIndex = index;

      this.slides.forEach((s) => s.classList.remove('active'));
      this.dots?.forEach((d) => d.classList.remove('active'));

      this.slides[this.currentSlideIndex]?.classList.add('active');
      this.dots?.[this.currentSlideIndex]?.classList.add('active');
    }

    changeSlide(step) {
      this.showSlide(this.currentSlideIndex + step);
      this.resetAutoPlay();
    }

    goToSlide(index) {
      this.showSlide(index);
      this.resetAutoPlay();
    }

    startAutoPlay() {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = setInterval(() => this.changeSlide(1), 5000);
    }

    resetAutoPlay() {
      this.startAutoPlay();
    }

    addTouchSupport() {
      const area =
        this.container.querySelector('.slider-wrapper') || this.container;
      let startX = 0,
        endX = 0;

      area.addEventListener(
        'touchstart',
        (e) => {
          startX = e.touches[0].clientX;
        },
        { passive: true }
      );

      area.addEventListener(
        'touchmove',
        (e) => {
          endX = e.touches[0].clientX;
        },
        { passive: true }
      );

      area.addEventListener('touchend', () => {
        if (startX - endX > 50) this.changeSlide(1);
        else if (endX - startX > 50) this.changeSlide(-1);
      });
    }
  }

  /* =========================
     2) ТАЙМЛАЙН: динамічна лінія до дат
     ========================= */
  const MOBILE_QUERY = '(max-width: 600px)';
  const DEFAULT_LINE_WIDTH = 2; // товщина лівої вертикалі, якщо не задана в CSS

  function getLeftLineX(tl) {
    const rect = tl.getBoundingClientRect();
    const cssW =
      parseFloat(
        getComputedStyle(tl).getPropertyValue('--timeline-line-width')
      ) || DEFAULT_LINE_WIDTH;
    return rect.left + cssW; // X правого краю жовтої вертикалі
  }

  function updateTimelineLines() {
    const tl = document.querySelector('.history__timeline');
    if (!tl) return;

    const isMobile = matchMedia(MOBILE_QUERY).matches;

    if (isMobile) {
      // Мобільний: тягнемо від лівої вертикалі до ПОЧАТКУ тексту дати (враховано padding-left)
      const leftLineX = getLeftLineX(tl);

      document.querySelectorAll('.history__item-date').forEach((el) => {
        const cs = getComputedStyle(el);
        const padL = parseFloat(cs.paddingLeft) || 0; // ваша дата має padding-left
        const gap = parseFloat(cs.getPropertyValue('--gap')) || 0;

        const elLeft = el.getBoundingClientRect().left; // край блоку дати
        const fromElLeftToLine = Math.max(0, elLeft - leftLineX);
        const length = Math.max(0, fromElLeftToLine + padL - gap); // до початку тексту

        // CSS: left = -var(--line-start), width = var(--line-length)
        el.style.setProperty('--line-start', fromElLeftToLine + 'px');
        el.style.setProperty('--line-length', length + 'px');
      });
    } else {
      // Десктоп: від центральної осі (як було)
      const { left, width } = tl.getBoundingClientRect();
      const centerX = left + width / 2;
      const R = 6,
        GAP = 8;

      document
        .querySelectorAll(
          '.history__item:not(.history__item--reverse) .history__item-date'
        )
        .forEach((el) => {
          const raw = centerX - el.getBoundingClientRect().left;
          const len = Math.max(0, Math.abs(raw) - R - GAP);
          el.style.setProperty('--line-start', raw + 'px');
          el.style.setProperty('--line-length', len + 'px');
        });

      document
        .querySelectorAll('.history__item--reverse .history__item-date')
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          const raw = centerX - r.left;
          const len = Math.max(0, Math.abs(raw) - r.width - R - GAP);
          el.style.setProperty('--line-start', raw + 'px');
          el.style.setProperty('--line-length', len + 'px');
        });
    }
  }

  function bindTimelineObservers() {
    const tl = document.querySelector('.history__timeline');
    if (!tl) return;

    const rerender = () => requestAnimationFrame(updateTimelineLines);

    // Resize / orientation / load / fonts
    window.addEventListener('resize', rerender);
    window.addEventListener('orientationchange', updateTimelineLines);
    window.addEventListener('load', updateTimelineLines);
    if (document.fonts?.ready) document.fonts.ready.then(updateTimelineLines);

    // ResizeObserver для зміни розмірів контенту
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(rerender);
      ro.observe(tl);
      tl.querySelectorAll(
        '.history__item, .history__item-date, .history__item-image img'
      ).forEach((n) => ro.observe(n));
    }

    // MutationObserver на випадок динамічних змін DOM/атрибутів
    const mo = new MutationObserver(rerender);
    mo.observe(tl, { childList: true, subtree: true, attributes: true });
  }

  /* =========================
     3) ВІДЕО-ПРЕВ’Ю → YouTube
     ========================= */
  function initVideoBlocks() {
    document.querySelectorAll('.video-block').forEach((block) => {
      const videoId = block.dataset.videoId;
      if (!videoId) return;

      block.setAttribute('role', 'button');
      block.setAttribute('tabindex', '0');
      block.setAttribute('aria-label', 'Play video');

      const play = () => {
        const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
        const iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.title = 'YouTube video player';
        iframe.allow =
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;

        block.innerHTML = '';
        block.appendChild(iframe);
      };

      block.addEventListener('click', play, { once: true });
      block.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          play();
        }
      });
    });
  }

  /* =========================
     4) МОБ. ПСЕВДО-SELECT ДЛЯ .news-nav
     ========================= */
  function initNewsNavSelect() {
    const nav = document.querySelector('.news-nav');
    const controls = document.querySelector('.news-controls');
    if (!nav || !controls) return;

    const links = Array.from(nav.querySelectorAll('.news-nav__item'));
    const active =
      links.find((a) => a.classList.contains('news-nav__item--active')) ||
      links[0];

    const box = document.createElement('div');
    box.className = 'news-nav-box';
    controls.appendChild(box);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'news-nav__select';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = active ? active.textContent.trim() : 'All news';

    const menu = document.createElement('div');
    menu.className = 'news-nav__menu';
    menu.setAttribute('role', 'listbox');

    links.forEach((a) => {
      const opt = document.createElement('a');
      opt.href = a.getAttribute('href') || '#';
      opt.className =
        'news-nav__item' +
        (a.classList.contains('news-nav__item--active')
          ? ' news-nav__item--active'
          : '');
      opt.textContent = a.textContent.trim();
      opt.setAttribute('role', 'option');
      if (a.classList.contains('news-nav__item--active'))
        opt.setAttribute('aria-selected', 'true');

      opt.addEventListener('click', (e) => {
        e.preventDefault(); // прибери, якщо потрібен реальний перехід
        links.forEach((l) => l.classList.remove('news-nav__item--active'));
        a.classList.add('news-nav__item--active');

        menu.querySelectorAll('a').forEach((x) => {
          x.classList.remove('news-nav__item--active');
          x.removeAttribute('aria-selected');
        });
        opt.classList.add('news-nav__item--active');
        opt.setAttribute('aria-selected', 'true');

        btn.textContent = opt.textContent.trim();
        box.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });

      menu.appendChild(opt);
    });

    box.append(btn, menu);

    btn.addEventListener('click', () => {
      const open = box.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => {
      if (!box.contains(e.target)) {
        box.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        box.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }

  /* =========================
     5) СЛАЙДЕР ТЕМ (#topicsSlider)
     ========================= */
  function initTopicsSlider() {
    const slider = document.getElementById('topicsSlider');
    if (!slider) return;

    const items = Array.from(slider.querySelectorAll('.topics-images__item'));
    const prev = slider.querySelector('.topics-prev');
    const next = slider.querySelector('.topics-next');
    if (!items.length || !prev || !next) return;

    let index = items.findIndex((el) => el.classList.contains('is-active'));
    if (index < 0) index = 0;

    function show(i) {
      items[index]?.classList.remove('is-active');
      index = (i + items.length) % items.length;
      items[index].classList.add('is-active');
      const single = items.length <= 1;
      prev.disabled = single;
      next.disabled = single;
    }

    items.forEach((el, i) => el.classList.toggle('is-active', i === index));
    show(index);

    prev.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));

    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });

    let startX = null;
    slider.addEventListener(
      'touchstart',
      (e) => (startX = e.touches[0].clientX),
      { passive: true }
    );
    slider.addEventListener('touchend', (e) => {
      if (startX == null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) dx > 0 ? show(index - 1) : show(index + 1);
      startX = null;
    });
  }

  /* =========================
     6) ІНІЦІАЛІЗАЦІЯ
     ========================= */
  document.addEventListener('DOMContentLoaded', () => {
    // Слайдери у всіх .main-container
    document
      .querySelectorAll('.main-container .slider-container')
      .forEach((el) => new SliderManager(el));

    // Таймлайн
    updateTimelineLines();
    bindTimelineObservers();

    // Відео, навігація новин, слайдер тем
    initVideoBlocks();
    initNewsNavSelect();
    initTopicsSlider();
  });
})();
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('pvgGrid');
  if (!grid) return;

  const items = Array.from(
    grid.querySelectorAll('.plans-visual-gallerytext__item')
  );
  const prev = grid.querySelector('.pvg-grid-prev');
  const next = grid.querySelector('.pvg-grid-next');
  if (!items.length) return;

  let index = 0;

  function show(i) {
    items[index]?.classList.remove('is-active');
    index = (i + items.length) % items.length;
    items[index].classList.add('is-active');

    const single = items.length <= 1;
    if (prev) prev.disabled = single;
    if (next) next.disabled = single;
  }

  // старт
  items.forEach((img, i) => img.classList.toggle('is-active', i === 0));
  show(0);

  // кліки
  prev?.addEventListener('click', () => show(index - 1));
  next?.addEventListener('click', () => show(index + 1));

  // свайп
  let startX = null;
  grid.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX), {
    passive: true,
  });
  grid.addEventListener('touchend', (e) => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) dx > 0 ? show(index - 1) : show(index + 1);
    startX = null;
  });

  // клавіатура (опційно)
  grid.setAttribute('tabindex', '0');
  grid.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
});
