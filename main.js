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
    
    // Auto-play on load
    function startAutoPlay() {
        if (isAutoPlaying) return;
        isAutoPlaying = true;
        let progress = swipeMinProgress;
        const step = 1.2;
        
        function autoAdvance() {
            if (!isAutoPlaying || isDraggingMin) {
                isAutoPlaying = false;
                return;
            }
            progress += step;
            if (progress >= 100) {
                progress = 100;
                updateSwipe(progress);
                isAutoPlaying = false;
                // Reset after delay
                setTimeout(() => {
                    if (!isDraggingMin) {
                        progress = 0;
                        updateSwipe(0);
                        setTimeout(startAutoPlay, 1500);
                    }
                }, 2500);
                return;
            }
            updateSwipe(progress);
            requestAnimationFrame(autoAdvance);
        }
        
        requestAnimationFrame(autoAdvance);
    }
    
    setTimeout(startAutoPlay, 600);
    
    // Double click to reset
    container.addEventListener('dblclick', function() {
        isAutoPlaying = false;
        updateSwipe(0);
        setTimeout(startAutoPlay, 1000);
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