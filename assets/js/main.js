/*===== MENU SHOW =====*/ 
const showMenu = (toggleId, navId) =>{
    const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId)

    if(toggle && nav){
        toggle.addEventListener('click', ()=>{
            nav.classList.toggle('show')
        })
    }
}
showMenu('nav-toggle','nav-menu')

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll('.nav__link')

function linkAction(){
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]')

const scrollActive = () =>{
    const scrollDown = window.scrollY

  sections.forEach(current =>{
        const sectionHeight = current.offsetHeight,
              sectionTop = current.offsetTop - 58,
              sectionId = current.getAttribute('id'),
              sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']')
        
        if(sectionsClass && scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight){
            sectionsClass.classList.add('active-link')
        }else if(sectionsClass){
            sectionsClass.classList.remove('active-link')
        }                                                    
    })
}
window.addEventListener('scroll', scrollActive)

/*===== WORK SLIDER SYSTEM - FIXED CONSISTENT SIZING =====*/
class WorkSliderSystem {
    constructor() {
        this.monthButtons = document.querySelectorAll('.months__btn');
        this.workMonths = document.querySelectorAll('.work__month');
        this.workSliders = new Map(); // Gunakan Map untuk better management
        this.currentActiveMonth = 'september';
        
        this.init();
    }
    
    init() {
        // Initialize semua slider sekaligus, tidak hanya yang active
        this.initAllSliders();
        
        // Set initial state
        this.workMonths.forEach(month => {
            const monthData = month.getAttribute('data-month');
            if (monthData !== 'september') {
                month.style.display = 'none';
                month.classList.remove('active');
            } else {
                month.style.display = 'block';
                month.classList.add('active');
            }
        });
        
        this.initMonthNavigation();
        
        // Force resize untuk konsistensi layout
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }
    
    initAllSliders() {
        this.workMonths.forEach((month, index) => {
            const monthData = month.getAttribute('data-month');
            this.workSliders.set(monthData, new WorkSlider(month, index));
        });
    }
    
    initMonthNavigation() {
        this.monthButtons.forEach(button => {
            button.addEventListener('click', () => {
                const month = button.getAttribute('data-month');
                this.activateMonth(month);
            });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                const month = button.getAttribute('data-month');
                this.activateMonth(month);
            });
        });
    }
    
    activateMonth(monthName) {
        if (this.currentActiveMonth === monthName) return;
        
        console.log('Switching from', this.currentActiveMonth, 'to', monthName);
        
        // Update active state month buttons
        this.monthButtons.forEach(button => {
            const buttonMonth = button.getAttribute('data-month');
            button.classList.toggle('active', buttonMonth === monthName);
        });
        
        // Hide current active month
        const currentActiveElement = document.querySelector(`.work__month[data-month="${this.currentActiveMonth}"]`);
        if (currentActiveElement) {
            currentActiveElement.classList.remove('active');
            setTimeout(() => {
                currentActiveElement.style.display = 'none';
                
                // Show new month setelah yang lama benar-benar hidden
                this.showNewMonth(monthName);
            }, 400);
        } else {
            this.showNewMonth(monthName);
        }
        
        this.currentActiveMonth = monthName;
    }
    
    showNewMonth(monthName) {
        const newActiveElement = document.querySelector(`.work__month[data-month="${monthName}"]`);
        if (newActiveElement) {
            newActiveElement.style.display = 'block';
            
            // Force reflow untuk trigger transition
            void newActiveElement.offsetWidth;
            
            newActiveElement.classList.add('active');
            
            // Update slider untuk bulan yang baru
            const slider = this.workSliders.get(monthName);
            if (slider) {
                setTimeout(() => {
                    slider.currentSlide = 0;
                    slider.updateSlider();
                    
                    // Force resize untuk konsistensi layout
                    setTimeout(() => {
                        window.dispatchEvent(new Event('resize'));
                    }, 50);
                }, 100);
            }
        }
    }
}

class WorkSlider {
    constructor(monthContainer, monthIndex) {
        this.container = monthContainer;
        this.track = monthContainer.querySelector('.work__slider-track');
        this.slides = monthContainer.querySelectorAll('.work__slide');
        this.prevBtn = monthContainer.querySelector('.work__slider-prev');
        this.nextBtn = monthContainer.querySelector('.work__slider-next');
        this.dotsContainer = monthContainer.querySelector('.work__slider-dots');
        
        this.currentSlide = 0;
        this.slidesPerView = this.getSlidesPerView();
        this.totalSlides = this.slides.length;
        this.monthIndex = monthIndex;
        
        this.isAnimating = false;
        this.startX = 0;
        this.currentX = 0;
        this.isDragging = false;
        
        // Initialize SEMUA slider, tidak peduli active atau tidak
        this.init();
    }
    
    getSlidesPerView() {
        const width = window.innerWidth;
        if (width < 576) return 1;
        if (width < 768) return 2;
        return 3;
    }
    
    init() {
        this.calculateSlideSizes();
        this.createDots();
        this.updateSlider();
        this.addEventListeners();
        this.addTouchSupport();
        this.addResizeListener();
        
        // Initial positioning
        this.updateSliderPosition();
    }
    
    calculateSlideSizes() {
        // Pastikan semua slide memiliki ukuran yang konsisten
        const slideWidth = 100 / this.slidesPerView;
        this.slides.forEach(slide => {
            slide.style.minWidth = `calc(${slideWidth}% - 1.33rem)`;
            slide.style.width = `calc(${slideWidth}% - 1.33rem)`;
        });
    }
    
    createDots() {
        const dotsCount = Math.ceil(this.totalSlides / this.slidesPerView);
        this.dotsContainer.innerHTML = '';
        
        for (let i = 0; i < dotsCount; i++) {
            const dot = document.createElement('button');
            dot.className = 'work__slider-dot';
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to slide group ${i + 1}`);
            dot.addEventListener('click', () => this.goToSlide(i * this.slidesPerView));
            this.dotsContainer.appendChild(dot);
        }
    }
    
    addEventListeners() {
        if (this.prevBtn && this.nextBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
            this.nextBtn.addEventListener('click', () => this.next());
        }
    }
    
    addTouchSupport() {
        this.track.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        this.track.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
        this.track.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    
    handleTouchStart(e) {
        this.startX = e.touches[0].clientX;
        this.isDragging = true;
        this.track.style.transition = 'none';
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        this.currentX = e.touches[0].clientX;
        const diff = this.startX - this.currentX;
        
        if (Math.abs(diff) > 10) {
            const slideWidth = 100 / this.slidesPerView;
            const extraMove = (diff / window.innerWidth) * 100;
            const translateX = -this.currentSlide * slideWidth - extraMove;
            this.track.style.transform = `translateX(${translateX}%)`;
        }
    }
    
    handleTouchEnd() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        const diff = this.startX - this.currentX;
        const threshold = 50;
        
        if (diff > threshold) {
            this.next();
        } else if (diff < -threshold) {
            this.prev();
        } else {
            this.updateSlider();
        }
    }
    
    addResizeListener() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newSlidesPerView = this.getSlidesPerView();
                if (newSlidesPerView !== this.slidesPerView) {
                    this.slidesPerView = newSlidesPerView;
                    this.calculateSlideSizes();
                    this.createDots();
                    this.updateSlider();
                }
            }, 250);
        });
    }
    
    updateSliderPosition() {
        const slideWidth = 100 / this.slidesPerView;
        const translateX = -this.currentSlide * slideWidth;
        this.track.style.transform = `translateX(${translateX}%)`;
    }
    
    updateSlider() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        this.updateSliderPosition();
        
        // Update buttons state
        if (this.prevBtn && this.nextBtn) {
            this.prevBtn.disabled = this.currentSlide === 0;
            this.nextBtn.disabled = this.currentSlide >= this.totalSlides - this.slidesPerView;
        }
        
        // Update dots
        const activeDotIndex = Math.floor(this.currentSlide / this.slidesPerView);
        const dots = this.dotsContainer.querySelectorAll('.work__slider-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeDotIndex);
        });
        
        // Update slide active state
        this.slides.forEach((slide, index) => {
            const isActive = index >= this.currentSlide && index < this.currentSlide + this.slidesPerView;
            slide.classList.toggle('active', isActive);
        });
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 600);
    }
    
    next() {
        if (this.isAnimating) return;
        if (this.currentSlide < this.totalSlides - this.slidesPerView) {
            this.currentSlide++;
            this.updateSlider();
        }
    }
    
    prev() {
        if (this.isAnimating) return;
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updateSlider();
        }
    }
    
    goToSlide(slideIndex) {
        if (this.isAnimating) return;
        this.currentSlide = Math.max(0, Math.min(slideIndex, this.totalSlides - this.slidesPerView));
        this.updateSlider();
    }
}

/*===== SCROLL REVEAL ANIMATION =====*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 1000,
    delay: 200,
    reset: true
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize work slider system
    const workSliderSystem = new WorkSliderSystem();
    
    // Scroll reveal animations - hanya untuk element yang visible
    sr.reveal('.home__data, .home__social, .home__img, .skills__subtitle, .skills__text, .skills__data, .skills__img, .schedule__container, .months__navigation', {
        interval: 100
    });
    
    // Untuk work months, kita reveal saat mereka menjadi active
    const workMonthObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('work__month') && target.classList.contains('active')) {
                    sr.reveal(target, { origin: 'top', distance: '30px', duration: 800 });
                }
            }
        });
    });
    
    // Observe semua work months
    document.querySelectorAll('.work__month').forEach(month => {
        workMonthObserver.observe(month, { attributes: true });
    });
    
    console.log('Portfolio website initialized successfully');
});

// Error handling untuk images
window.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        console.warn('Image failed to load:', e.target.src);
        // Jangan sembunyikan image, tapi beri fallback
        e.target.style.opacity = '0.7';
    }
}, true);