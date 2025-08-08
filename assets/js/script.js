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
