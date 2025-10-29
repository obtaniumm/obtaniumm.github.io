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
        this.cleanup = null;

        this.init();
    }

    async init() {
        if (document.fonts?.ready) {
            try {
                await document.fonts.ready;
            } catch (e) {
                console.warn('Font loading issue:', e);
            }
        }

        if (this.isCancelled) return;

        this.canvas = document.createElement('canvas');
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';
        this.element.innerHTML = '';
        this.element.appendChild(this.canvas);

        const ctx = this.canvas.getContext('2d', { alpha: true });
        if (!ctx) {
            console.error('Could not get canvas context');
            return;
        }

        const computedFontFamily = this.options.fontFamily === 'inherit'
            ? window.getComputedStyle(this.element).fontFamily || 'sans-serif'
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
            temp.style.visibility = 'hidden';
            document.body.appendChild(temp);
            const computedSize = window.getComputedStyle(temp).fontSize;
            numericFontSize = parseFloat(computedSize);
            document.body.removeChild(temp);
        }

        const text = this.options.text;

        const offscreen = document.createElement('canvas');
        const offCtx = offscreen.getContext('2d', { alpha: true });
        if (!offCtx) {
            console.error('Could not get offscreen context');
            return;
        }

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

        this.cleanup = () => {
            if (this.animationFrameId) {
                window.cancelAnimationFrame(this.animationFrameId);
            }
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
        if (this.cleanup) {
            this.cleanup();
        }
    }
}

function initializeFuzzyText() {
    const mainTitle = document.getElementById('main-title');
    if (mainTitle) {
        new FuzzyText(mainTitle, {
            fontSize: 'clamp(4rem, 12vw, 10rem)',
            fontWeight: 900,
            color: '#ffff00',
            baseIntensity: 0.3,
            hoverIntensity: 0.9,
            text: 'obtanium'
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFuzzyText);
} else {
    initializeFuzzyText();
}

document.addEventListener('DOMContentLoaded', function() {
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

    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    sections.forEach(section => {
        observer.observe(section);
    });

    const japaneseQuotes = [
        { jp: '影は真実を語る', en: 'shadows speak the truth' },
        { jp: '静寂の中に答えがある', en: 'in silence lies the answer' },
        { jp: '夜は全てを包む', en: 'night embraces all' },
        { jp: '記憶は消えない', en: 'memories never fade' },
        { jp: '時間は幻想である', en: 'time is an illusion' }
    ];

    function showRandomQuote() {
        const quote = japaneseQuotes[Math.floor(Math.random() * japaneseQuotes.length)];
        const quoteElement = document.createElement('div');

        quoteElement.innerHTML = `
            <div style="font-family: 'Noto Sans JP', sans-serif; font-size: 1rem; color: #00ffff; margin-bottom: 0.5rem; font-weight: 900; text-shadow: 0 0 10px #00ffff;">${quote.jp}</div>
            <div style="font-size: 0.85rem; color: #888; font-style: italic;">${quote.en}</div>
        `;

        quoteElement.style.cssText = `
            position: fixed;
            top: 120px;
            right: 30px;
            background: #000;
            border: 3px solid #00ffff;
            padding: 1.5rem;
            z-index: 1001;
            opacity: 0;
            transform: translateX(150px);
            transition: all 0.5s ease;
            pointer-events: none;
            box-shadow: 0 0 30px #00ffff;
        `;

        document.body.appendChild(quoteElement);

        setTimeout(() => {
            quoteElement.style.opacity = '1';
            quoteElement.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            quoteElement.style.opacity = '0';
            quoteElement.style.transform = 'translateX(150px)';

            setTimeout(() => {
                if (quoteElement.parentNode) {
                    quoteElement.parentNode.removeChild(quoteElement);
                }
            }, 500);
        }, 5000);
    }

    setInterval(showRandomQuote, 35000);
    setTimeout(showRandomQuote, 5000);

    console.log('%c闇の中へようこそ', 'color: #ffff00; font-size: 20px; font-family: "Noto Sans JP", sans-serif; font-weight: 900; text-shadow: 0 0 10px #ffff00;');
    console.log('%cWelcome to the darkness', 'color: #00ffff; font-size: 14px; font-weight: 900;');
    console.log('%c>initialized', 'color: #00ff00; font-family: monospace; text-shadow: 0 0 10px #00ff00;');
});
