class SliderManager {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.currentSlideIndex = 0;
    this.slides = this.container.querySelectorAll('.slide');
    this.dots = this.container.querySelectorAll('.dot');
    this.totalSlides = this.slides.length;
    this.autoPlayInterval = null;

    this.init();
  }

  init() {
    // Додаємо event listeners для навігаційних кнопок
    const prevBtn =
      this.container.parentElement.querySelector('.nav-button.prev');
    const nextBtn =
      this.container.parentElement.querySelector('.nav-button.next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.changeSlide(-1));
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.changeSlide(1));
    }

    // Додаємо event listeners для dots
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.currentSlide(index + 1));
    });

    // Додаємо підтримку свайпів
    this.addTouchSupport();

    // Запускаємо автоплей
    this.startAutoPlay();

    // Показуємо перший слайд
    this.showSlide(0);
  }

  showSlide(index) {
    // Видаляємо active клас з усіх слайдів та dots
    this.slides.forEach((slide) => slide.classList.remove('active'));
    this.dots.forEach((dot) => dot.classList.remove('active'));

    // Додаємо active клас до поточного слайду та dot
    if (this.slides[index]) {
      this.slides[index].classList.add('active');
    }
    if (this.dots[index]) {
      this.dots[index].classList.add('active');
    }
  }

  changeSlide(direction) {
    this.currentSlideIndex += direction;

    if (this.currentSlideIndex >= this.totalSlides) {
      this.currentSlideIndex = 0;
    } else if (this.currentSlideIndex < 0) {
      this.currentSlideIndex = this.totalSlides - 1;
    }

    this.showSlide(this.currentSlideIndex);
    this.resetAutoPlay();
  }

  currentSlide(slideNumber) {
    this.currentSlideIndex = slideNumber - 1;
    this.showSlide(this.currentSlideIndex);
    this.resetAutoPlay();
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.changeSlide(1);
    }, 5000);
  }

  resetAutoPlay() {
    clearInterval(this.autoPlayInterval);
    this.startAutoPlay();
  }

  addTouchSupport() {
    let startX = 0;
    let endX = 0;

    const sliderWrapper = this.container.querySelector('.slider-wrapper');
    if (!sliderWrapper) return;

    sliderWrapper.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });

    sliderWrapper.addEventListener('touchmove', (e) => {
      endX = e.touches[0].clientX;
    });

    sliderWrapper.addEventListener('touchend', () => {
      if (startX - endX > 50) {
        this.changeSlide(1); // Swipe left - next slide
      } else if (endX - startX > 50) {
        this.changeSlide(-1); // Swipe right - previous slide
      }
    });
  }
}

// Ініціалізуємо слайдери після завантаження DOM
document.addEventListener('DOMContentLoaded', function () {
  // Знаходимо всі контейнери слайдерів
  const sliderContainers = document.querySelectorAll('.main-container');

  // Створюємо екземпляр SliderManager для кожного слайдера
  sliderContainers.forEach((container, index) => {
    // Додаємо унікальний ID для кожного контейнера
    if (!container.id) {
      container.id = `slider-container-${index}`;
    }

    // Ініціалізуємо слайдер
    new SliderManager(`#${container.id} .slider-container`);
  });
});
