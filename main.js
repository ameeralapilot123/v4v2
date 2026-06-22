// Discount Timer
let totalSeconds = 15*60; // 6 minutes and 33 seconds

function updateTimer() {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    
    if (totalSeconds > 0) {
        totalSeconds--;
    } else {
        clearInterval(timerInterval);
        document.querySelector('.timer-block span:first-child').style.color = '#ff6b6b';
        document.querySelector('.timer-sub').textContent = '⏰ Time expired!';
        document.querySelector('.timer-sub').style.color = '#ff6b6b';
    }
}

const timerInterval = setInterval(updateTimer, 1000);
updateTimer();

// ============================ SWIPE-TO-INSTALL (OPTIMIZED - NO LAG) ============================
let swipeMinProgress = 0;
let isDraggingMin = false;
let swipeStartXMin = 0;
let swipeCurrentXMin = 0;
let swipeRAFMin = null;
let swipeContainerWidth = 0;

function initSwipeMinimal() {
    const divider = document.getElementById('swipeDividerMinimal');
    const handle = document.getElementById('swipeHandleMinimal');
    const container = document.querySelector('.swipe-track');
    const progressBar = document.getElementById('swipeBarMinimal');
    const popup = document.getElementById('swipePopupMinimal');
    const popupText = document.getElementById('popupTextMinimal');
    const step1 = document.getElementById('step1Minimal');
    const step2 = document.getElementById('step2Minimal');
    
    if (!divider || !container) return;
    
    swipeContainerWidth = container.offsetWidth;
    let currentStep = -1;
    let popupTimeout = null;
    let isAutoPlaying = false;
    
    const steps = [
        { text: '✨ Just unbox & plug in', progress: 50 },
        { text: '❄️ Enjoy cool air instantly', progress: 100 }
    ];
    
    function updateSwipe(percent) {
        // Clamp percent
        percent = Math.max(0, Math.min(100, percent));
        swipeMinProgress = percent;
        
        // Update divider position
        const leftPos = (percent / 100) * swipeContainerWidth;
        divider.style.left = leftPos + 'px';
        progressBar.style.width = percent + '%';
        
        // Update steps - only 2 steps
        const stepIndex = percent > 50 ? 1 : 0;
        
        if (stepIndex !== currentStep) {
            currentStep = stepIndex;
            
            // Update step visibility
            if (step1) step1.classList.toggle('active', stepIndex >= 0);
            if (step2) step2.classList.toggle('active', stepIndex >= 1);
            
            // Show popup
            if (stepIndex < steps.length) {
                popupText.textContent = steps[stepIndex].text;
                popup.classList.add('show');
                
                clearTimeout(popupTimeout);
                popupTimeout = setTimeout(() => {
                    popup.classList.remove('show');
                }, 1800);
            }
        }
    }
    
    // Optimized render using requestAnimationFrame
    function renderSwipe(percent) {
        if (swipeRAFMin) {
            cancelAnimationFrame(swipeRAFMin);
        }
        swipeRAFMin = requestAnimationFrame(() => {
            updateSwipe(percent);
            swipeRAFMin = null;
        });
    }
    
    // Mouse events
    function onMouseDown(e) {
        isDraggingMin = true;
        isAutoPlaying = false;
        clearTimeout(restartTimeout);
        swipeStartXMin = e.clientX;
        swipeCurrentXMin = swipeMinProgress;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
    }
    
    function onMouseMove(e) {
        if (!isDraggingMin) return;
        const deltaX = (e.clientX - swipeStartXMin) / swipeContainerWidth * 100;
        renderSwipe(swipeCurrentXMin + deltaX);
    }
    
    function onMouseUp() {
        isDraggingMin = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
    
    // Touch events
    function onTouchStart(e) {
        const touch = e.touches[0];
        isDraggingMin = true;
        isAutoPlaying = false;
        clearTimeout(restartTimeout);
        swipeStartXMin = touch.clientX;
        swipeCurrentXMin = swipeMinProgress;
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
        e.preventDefault();
    }
    
    function onTouchMove(e) {
        if (!isDraggingMin) return;
        const touch = e.touches[0];
        const deltaX = (touch.clientX - swipeStartXMin) / swipeContainerWidth * 100;
        renderSwipe(swipeCurrentXMin + deltaX);
        e.preventDefault();
    }
    
    function onTouchEnd() {
        isDraggingMin = false;
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
    }
    
    // Click on container to advance
    container.addEventListener('click', function(e) {
        if (isDraggingMin) return;
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 100;
        renderSwipe(x);
    });
    
    // Add event listeners
    handle.addEventListener('mousedown', onMouseDown);
    handle.addEventListener('touchstart', onTouchStart);
    
    // Auto-play when section scrolls into view, then loop every 3s
    let hasStartedFromView = false;
    let restartTimeout = null;

    function resetSwipeDemo() {
        currentStep = -1;
        swipeMinProgress = 0;

        divider.style.transition = 'none';
        progressBar.style.transition = 'none';
        divider.style.left = '0px';
        progressBar.style.width = '0%';

        if (step1) step1.classList.remove('active');
        if (step2) step2.classList.remove('active');
        if (popup) popup.classList.remove('show');
        clearTimeout(popupTimeout);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                divider.style.transition = '';
                progressBar.style.transition = '';
            });
        });
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function startAutoPlay() {
        if (isAutoPlaying || isDraggingMin) return;
        isAutoPlaying = true;
        resetSwipeDemo();

        const duration = 2200;
        let startTime = null;

        function autoAdvance(now) {
            if (!isAutoPlaying || isDraggingMin) {
                isAutoPlaying = false;
                return;
            }

            if (startTime === null) startTime = now;
            const t = Math.min((now - startTime) / duration, 1);
            const progress = easeInOutCubic(t) * 100;

            updateSwipe(progress);

            if (t >= 1) {
                isAutoPlaying = false;
                clearTimeout(restartTimeout);
                restartTimeout = setTimeout(() => {
                    if (!isDraggingMin) startAutoPlay();
                }, 3000);
                return;
            }

            requestAnimationFrame(autoAdvance);
        }

        requestAnimationFrame(() => {
            updateSwipe(0);
            requestAnimationFrame(autoAdvance);
        });
    }

    const demoSection = document.querySelector('.swipe-demo-minimal');
    if (demoSection) {
        const viewObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (
                        entry.isIntersecting &&
                        !hasStartedFromView &&
                        !isDraggingMin
                    ) {
                        hasStartedFromView = true;
                        startAutoPlay();
                    }
                });
            },
            { threshold: 0.35 }
        );
        viewObserver.observe(demoSection);
    }

    // Double click to reset
    container.addEventListener('dblclick', function () {
        isAutoPlaying = false;
        clearTimeout(restartTimeout);
        resetSwipeDemo();
        setTimeout(startAutoPlay, 3000);
    });
    // Handle resize
    let resizeTimeout = null;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            swipeContainerWidth = container.offsetWidth;
            const leftPos = (swipeMinProgress / 100) * swipeContainerWidth;
            divider.style.left = leftPos + 'px';
        }, 100);
    });
    
    // Initial state
    updateSwipe(0);
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSwipeMinimal);
} else {
    initSwipeMinimal();
}
