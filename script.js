// FuzzyText component (embedded for standalone use)
class FuzzyText {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            fontSize: options.fontSize || 'clamp(2rem, 10vw, 10rem)',
            fontWeight: options.fontWeight || 900,
            fontFamily: options.fontFamily || 'inherit',
            color: options.color || '#fff',
            enableHover: options.enableHover !== undefined ? options.enableHover : true,
            baseIntensity: options.baseIntensity || 0.18,
            hoverIntensity: options.hoverIntensity || 0.5,
            text: options.text || element.textContent || ''
        };
        
        this.canvas = null;
        this.animationFrameId = null;
        this.isHovering = false;
        this.isCancelled = false;
        
        this.init();
    }
    
    async init() {
        if (document.fonts?.ready) {
            await document.fonts.ready;
        }
        if (this.isCancelled) return;
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.display = 'block';
        this.element.innerHTML = '';
        this.element.appendChild(this.canvas);
        
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        
        const computedFontFamily = this.options.fontFamily === 'inherit' 
            ? window.getComputedStyle(this.canvas).fontFamily || 'sans-serif' 
            : this.options.fontFamily;
        
        const fontSizeStr = typeof this.options.fontSize === 'number' 
            ? `${this.options.fontSize}px` 
            : this.options.fontSize;
            
        let numericFontSize;
        if (typeof this.options.fontSize === 'number') {
            numericFontSize = this.options.fontSize;
        } else {
            const temp = document.createElement('span');
            temp.style.fontSize = this.options.fontSize;
            document.body.appendChild(temp);
            const computedSize = window.getComputedStyle(temp).fontSize;
            numericFontSize = parseFloat(computedSize);
            document.body.removeChild(temp);
        }
        
        const text = this.options.text;
        
        // Create offscreen canvas for text measurement
        const offscreen = document.createElement('canvas');
        const offCtx = offscreen.getContext('2d');
        if (!offCtx) return;
        
        offCtx.font = `${this.options.fontWeight} ${fontSizeStr} ${computedFontFamily}`;
        offCtx.textBaseline = 'alphabetic';
        const metrics = offCtx.measureText(text);
        
        const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
        const actualRight = metrics.actualBoundingBoxRight ?? metrics.width;
        const actualAscent = metrics.actualBoundingBoxAscent ?? numericFontSize;
        const actualDescent = metrics.actualBoundingBoxDescent ?? numericFontSize * 0.2;
        
        const textBoundingWidth = Math.ceil(actualLeft + actualRight);
        const tightHeight = Math.ceil(actualAscent + actualDescent);
        
        const extraWidthBuffer = 10;
        const offscreenWidth = textBoundingWidth + extraWidthBuffer;
        
        offscreen.width = offscreenWidth;
        offscreen.height = tightHeight;
        
        const xOffset = extraWidthBuffer / 2;
        offCtx.font = `${this.options.fontWeight} ${fontSizeStr} ${computedFontFamily}`;
        offCtx.textBaseline = 'alphabetic';
        offCtx.fillStyle = this.options.color;
        offCtx.fillText(text, xOffset - actualLeft, actualAscent);
        
        const horizontalMargin = 50;
        const verticalMargin = 0;
        this.canvas.width = offscreenWidth + horizontalMargin * 2;
        this.canvas.height = tightHeight + verticalMargin * 2;
        ctx.translate(horizontalMargin, verticalMargin);
        
        const interactiveLeft = horizontalMargin + xOffset;
        const interactiveTop = verticalMargin;
        const interactiveRight = interactiveLeft + textBoundingWidth;
        const interactiveBottom = interactiveTop + tightHeight;
        
        const fuzzRange = 30;
        
        const run = () => {
            if (this.isCancelled) return;
            ctx.clearRect(-fuzzRange, -fuzzRange, offscreenWidth + 2 * fuzzRange, tightHeight + 2 * fuzzRange);
            const intensity = this.isHovering ? this.options.hoverIntensity : this.options.baseIntensity;
            for (let j = 0; j < tightHeight; j++) {
                const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
                ctx.drawImage(offscreen, 0, j, offscreenWidth, 1, dx, j, offscreenWidth, 1);
            }
            this.animationFrameId = window.requestAnimationFrame(run);
        };
        
        run();
        
        const isInsideTextArea = (x, y) => {
            return x >= interactiveLeft && x <= interactiveRight && y >= interactiveTop && y <= interactiveBottom;
        };
        
        const handleMouseMove = (e) => {
            if (!this.options.enableHover) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.isHovering = isInsideTextArea(x, y);
        };
        
        const handleMouseLeave = () => {
            this.isHovering = false;
        };
        
        const handleTouchMove = (e) => {
            if (!this.options.enableHover) return;
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.isHovering = isInsideTextArea(x, y);
        };
        
        const handleTouchEnd = () => {
            this.isHovering = false;
        };
        
        if (this.options.enableHover) {
            this.canvas.addEventListener('mousemove', handleMouseMove);
            this.canvas.addEventListener('mouseleave', handleMouseLeave);
            this.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            this.canvas.addEventListener('touchend', handleTouchEnd);
        }
        
        // Store cleanup function
        this.cleanup = () => {
            window.cancelAnimationFrame(this.animationFrameId);
            if (this.options.enableHover && this.canvas) {
                this.canvas.removeEventListener('mousemove', handleMouseMove);
                this.canvas.removeEventListener('mouseleave', handleMouseLeave);
                this.canvas.removeEventListener('touchmove', handleTouchMove);
                this.canvas.removeEventListener('touchend', handleTouchEnd);
            }
        };
    }
    
    destroy() {
        this.isCancelled = true;
        if (this.animationFrameId) {
            window.cancelAnimationFrame(this.animationFrameId);
        }
        if (this.cleanup) {
            this.cleanup();
        }
    }
}

// Initialize fuzzy text elements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize main title
    const mainTitle = document.getElementById('main-title');
    if (mainTitle) {
        new FuzzyText(mainTitle, {
            fontSize: 'clamp(3rem, 8vw, 8rem)',
            fontWeight: 700,
            color: '#ffffff',
            baseIntensity: 0.2,
            hoverIntensity: 0.8,
            text: 'obtanium'
        });
    }
    
    // Initialize section titles
    const sectionTitles = document.querySelectorAll('.section-fuzzy');
    sectionTitles.forEach(title => {
        const text = title.textContent;
        new FuzzyText(title, {
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            fontWeight: 700,
            color: '#ffffff',
            baseIntensity: 0.15,
            hoverIntensity: 0.4,
            text: text
        });
    });
    
    // Initialize 404 fuzzy text
    const emptyFuzzy = document.querySelector('.empty-fuzzy');
    if (emptyFuzzy) {
        new FuzzyText(emptyFuzzy, {
            fontSize: '3rem',
            fontWeight: 700,
            color: '#8b0000',
            baseIntensity: 0.3,
            hoverIntensity: 0.7,
            text: '404'
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add intersection observer for section animations
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';