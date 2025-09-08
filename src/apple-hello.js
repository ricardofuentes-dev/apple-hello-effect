/**
 * AppleHello.js v1.0.0
 * Animated handwriting effect inspired by Apple
 * (c) 2025 Ricardo Fuentes | MIT License
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.AppleHello = factory());
}(this, (function () { 'use strict';

    const VERSION = '1.0.0';
    const PREFIX = '[AppleHello]';
    
    const DEFAULTS = {
        color: '#ffffff',
        stroke_width: 8,
        height: 80,
        auto_start: true,
        duration: 3500,
        ease: 'ease-in-out'
    };

    const SVG_DATA = {
        viewBox: '0 0 638 200',
        paths: {
            h: 'M8.69214 166.553C36.2393 151.239 61.3409 131.548 89.8191 98.0295C109.203 75.1488 119.625 49.0228 120.122 31.0026C120.37 17.6036 113.836 7.43883 101.759 7.43883C88.3598 7.43883 79.9231 17.6036 74.7122 40.9363C69.005 66.5793 64.7866 96.0036 54.1166 190.356',
            ello: 'M55.1624 181.135C60.6251 133.114 81.4118 98.0479 107.963 98.0479C123.844 98.0479 133.937 110.703 131.071 128.817C129.457 139.487 127.587 150.405 125.408 163.06C122.869 178.941 130.128 191.348 152.122 191.348C184.197 191.348 219.189 173.523 237.097 145.915C243.198 136.509 245.68 128.073 245.928 119.884C246.176 104.996 237.739 93.8296 222.851 93.8296C203.992 93.8296 189.6 115.17 189.6 142.465C189.6 171.745 205.481 192.341 239.208 192.341C285.066 192.341 335.86 137.292 359.199 75.8585C365.788 58.513 368.26 42.4065 368.26 31.1512C368.26 17.8057 364.042 7.55823 352.131 7.55823C340.469 7.55823 332.777 16.6141 325.829 30.9129C317.688 47.4967 311.667 71.4162 309.203 98.4549C303 166.301 316.896 191.348 349.936 191.348C390 191.348 434.542 135.534 457.286 75.6686C463.803 58.513 466.275 42.4065 466.275 31.1512C466.275 17.8057 462.057 7.55823 450.146 7.55823C438.484 7.55823 430.792 16.6141 423.844 30.9129C415.703 47.4967 409.682 71.4162 407.218 98.4549C401.015 166.301 414.911 191.348 444.416 191.348C473.874 191.348 489.877 165.67 499.471 138.402C508.955 111.447 520.618 94.8221 544.935 94.8221C565.035 94.8221 580.916 109.71 580.916 137.75C580.916 168.768 560.792 192.093 535.362 192.341C512.984 192.589 498.285 174.475 499.774 147.179C501.511 116.907 519.873 94.8221 543.943 94.8221C557.839 94.8221 569.51 100.999 578.682 107.725C603.549 125.866 622.709 114.656 630.047 96.7186'
        }
    };

    const CSS = `
        .apple-hello{display:inline-block}
        .apple-hello svg{fill:none;stroke-linecap:round;stroke-linejoin:round}
        .apple-hello path{fill:none;opacity:0;transition:none}
    `;

    let style_injected = false;

    function inject_styles() {
        if (style_injected) return;
        const style = document.createElement('style');
        style.textContent = CSS;
        document.head.appendChild(style);
        style_injected = true;
    }

    function log(message, type = 'info') {
        if (typeof console !== 'undefined') {
            const method = type === 'error' ? 'error' : type === 'warn' ? 'warn' : 'log';
            console[method](`${PREFIX} ${message}`);
        }
    }

    function resolve_element(target) {
        if (!target) return null;
        if (typeof target === 'string') return document.querySelector(target);
        if (target instanceof HTMLElement) return target;
        return null;
    }

    function create_svg(config) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', SVG_DATA.viewBox);
        svg.style.height = `${config.height}px`;
        svg.style.stroke = config.color;
        svg.style.strokeWidth = config.stroke_width;

        Object.entries(SVG_DATA.paths).forEach(([key, path_data]) => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', path_data);
            path.className = `letter-${key}`;
            svg.appendChild(path);
        });

        return svg;
    }

    class AppleHello {
        constructor(target, options = {}) {
            this.config = { ...DEFAULTS, ...options };
            this.element = resolve_element(target);
            this.svg = null;
            this.timeouts = [];
            this.is_animating = false;

            if (!this.element) {
                log('Invalid target element', 'error');
                return;
            }

            inject_styles();
            this._init();
        }

        _init() {
            this.element.className = `${this.element.className} apple-hello`.trim();
            this.svg = create_svg(this.config);
            this.element.appendChild(this.svg);
            this._setup_paths();

            if (this.config.auto_start) {
                requestAnimationFrame(() => this.start());
            }
        }

        _setup_paths() {
            this.svg.querySelectorAll('path').forEach(path => {
                const length = path.getTotalLength();
                path.style.strokeDasharray = length;
                path.style.strokeDashoffset = length;
                path.style.opacity = '0';
            });
        }

        _animate_path(selector, delay, duration) {
            const path = this.svg.querySelector(selector);
            if (!path) return;

            const length = path.getTotalLength();

            this.timeouts.push(setTimeout(() => {
                path.style.transition = `opacity ${duration * 0.3}ms ease`;
                path.style.opacity = '1';
            }, delay));

            this.timeouts.push(setTimeout(() => {
                path.style.transition = `stroke-dashoffset ${duration}ms ${this.config.ease}`;
                path.style.strokeDashoffset = '0';
            }, delay));
        }

        start() {
            if (this.is_animating) return this;
            
            this.is_animating = true;
            this.stop();
            this._setup_paths();

            const h_duration = this.config.duration * 0.23;
            const ello_duration = this.config.duration * 0.77;
            const ello_delay = this.config.duration * 0.2;

            this._animate_path('.letter-h', 0, h_duration);
            this._animate_path('.letter-ello', ello_delay, ello_duration);

            this.timeouts.push(setTimeout(() => {
                this.is_animating = false;
            }, this.config.duration));

            return this;
        }

        stop() {
            this.timeouts.forEach(clearTimeout);
            this.timeouts = [];
            this.is_animating = false;
            return this;
        }

        restart() {
            this.stop();
            requestAnimationFrame(() => this.start());
            return this;
        }

        update(options) {
            Object.assign(this.config, options);
            if (this.svg) {
                this.svg.style.height = `${this.config.height}px`;
                this.svg.style.stroke = this.config.color;
                this.svg.style.strokeWidth = this.config.stroke_width;
            }
            return this;
        }

        destroy() {
            this.stop();
            if (this.svg?.parentNode) {
                this.svg.parentNode.removeChild(this.svg);
            }
            this.element.className = this.element.className.replace(/\s*apple-hello/g, '').trim();
        }
    }

    // Static methods
    AppleHello.create = function(target, options) {
        return new AppleHello(target, options);
    };

    AppleHello.auto = function(selector = '.apple-hello-auto', options = {}) {
        const elements = document.querySelectorAll(selector);
        const instances = [];
        
        elements.forEach(el => {
            const config = { ...options };
            
            // Read data attributes
            if (el.dataset.color) config.color = el.dataset.color;
            if (el.dataset.height) config.height = parseInt(el.dataset.height);
            if (el.dataset.strokeWidth) config.stroke_width = parseInt(el.dataset.strokeWidth);
            if (el.dataset.duration) config.duration = parseInt(el.dataset.duration);
            if (el.dataset.autoStart === 'false') config.auto_start = false;

            instances.push(new AppleHello(el, config));
        });

        return instances;
    };

    AppleHello.version = VERSION;

    // Auto-initialize on DOM ready
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => AppleHello.auto());
        } else {
            AppleHello.auto();
        }
    }

    return AppleHello;

})));