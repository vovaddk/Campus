class SliderManager {
  constructor(container) {
    this.container = container;
    if (!this.container) return;

    this.slides = this.container.querySelectorAll('.slide');
    this.prevBtn = this.container
      .closest('.main-container')
      ?.querySelector('.nav-button.prev');
    this.nextBtn = this.container
      .closest('.main-container')
      ?.querySelector('.nav-button.next');

    if (!this.slides.length) return;

    this.generateDots();
    this.dots = this.container
      .closest('.main-container')
      .querySelectorAll('.dot');

    this.currentSlideIndex = 0;
    this.totalSlides = this.slides.length;
    this.autoPlayInterval = null;

    this.init();
  }

  generateDots() {
    let mainContainer = this.container.closest('.main-container');
    let dotsContainer = mainContainer.querySelector('.dots-container');

    if (!dotsContainer) {
      dotsContainer = document.createElement('div');
      dotsContainer.className = 'dots-container';
      mainContainer.appendChild(dotsContainer);
    }

    dotsContainer.innerHTML = '';

    this.slides.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.className = 'dot';
      if (index === 0) dot.classList.add('active');
      dotsContainer.appendChild(dot);
    });
  }

  init() {
    if (this.prevBtn)
      this.prevBtn.addEventListener('click', () => this.changeSlide(-1));
    if (this.nextBtn)
      this.nextBtn.addEventListener('click', () => this.changeSlide(1));

    if (this.dots.length) {
      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => this.goToSlide(index));
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

    this.slides.forEach((slide) => slide.classList.remove('active'));
    this.dots.forEach((dot) => dot.classList.remove('active'));

    this.slides[this.currentSlideIndex]?.classList.add('active');
    this.dots[this.currentSlideIndex]?.classList.add('active');
  }

  changeSlide(direction) {
    this.showSlide(this.currentSlideIndex + direction);
    this.resetAutoPlay();
  }

  goToSlide(index) {
    this.showSlide(index);
    this.resetAutoPlay();
  }

  startAutoPlay() {
    if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
    this.autoPlayInterval = setInterval(() => {
      this.changeSlide(1);
    }, 5000);
  }

  resetAutoPlay() {
    this.startAutoPlay();
  }

  addTouchSupport() {
    const sliderWrapper = this.container.querySelector('.slider-wrapper');
    if (!sliderWrapper) return;

    let startX = 0;
    let endX = 0;

    sliderWrapper.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });

    sliderWrapper.addEventListener('touchmove', (e) => {
      endX = e.touches[0].clientX;
    });

    sliderWrapper.addEventListener('touchend', () => {
      if (startX - endX > 50) {
        this.changeSlide(1);
      } else if (endX - startX > 50) {
        this.changeSlide(-1);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelectorAll('.main-container .slider-container')
    .forEach((container) => {
      new SliderManager(container);
    });
});
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.video-block').forEach(function (block) {
    const videoId = block.dataset.videoId;
    if (!videoId) return;

    // Доступність
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

      block.innerHTML = ''; // прибираємо прев’ю і кнопку
      block.appendChild(iframe); // вставляємо плеєр
    };

    block.addEventListener('click', play, { once: true });
    block.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        play();
      }
    });
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.news-nav');
  const controls = document.querySelector('.news-controls');
  if (!nav || !controls) return;

  const links = Array.from(nav.querySelectorAll('.news-nav__item'));
  const active =
    links.find((a) => a.classList.contains('news-nav__item--active')) ||
    links[0];

  // створюємо "коробку" в .news-controls (тут і кнопка, і меню)
  const box = document.createElement('div');
  box.className = 'news-nav-box';
  controls.appendChild(box);

  // кнопка-псевдо select
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'news-nav__select';
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');
  btn.textContent = active ? active.textContent.trim() : 'All news';

  // меню з пунктами
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
      e.preventDefault(); // зніми, якщо потрібен перехід за посиланням
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

  // відкриття/закриття
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
});
document.addEventListener('DOMContentLoaded', function () {
  const slider = document.getElementById('topicsSlider');
  if (!slider) return;

  const items = Array.from(slider.querySelectorAll('.topics-images__item'));
  const prev = slider.querySelector('.topics-prev');
  const next = slider.querySelector('.topics-next');

  let index = 0;

  function show(i) {
    if (!items.length) return;
    items[index]?.classList.remove('is-active');
    index = (i + items.length) % items.length; // цикл по колу
    items[index].classList.add('is-active');
    // якщо треба блокувати кнопки при 1 елементі:
    const single = items.length <= 1;
    prev.disabled = single;
    next.disabled = single;
  }

  // початковий стан
  items.forEach((el, i) => el.classList.toggle('is-active', i === 0));
  show(0);

  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));

  // опційно: клавіатура
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  // опційно: свайп на мобільних
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
});
