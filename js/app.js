class VideoAbstrakApp {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.animation = null;
        this.imageGenerator = null;

        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setupCanvas();
        this.imageGenerator = new ImageGenerator(this.canvas);
    }

    setupElements() {
        this.previewSection = document.getElementById('previewSection');
        this.canvas = document.getElementById('animationCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.generateBtn = document.getElementById('generateBtn');
        this.playBtn = document.getElementById('playBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
    }

    setupEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generate());
        this.playBtn.addEventListener('click', () => this.playAnimation());
        this.pauseBtn.addEventListener('click', () => this.pauseAnimation());
        this.resetBtn.addEventListener('click', () => this.resetAnimation());
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 600;
    }

    generate() {
        this.previewSection.style.display = 'block';

        // Generate a new abstract image
        this.imageGenerator.generate();

        // Randomize animation parameters
        const duration = Math.random() * 10 + 5; // 5 to 15 seconds
        const speed = Math.random() * 1.5 + 0.5; // 0.5x to 2x
        const effects = this.getRandomEffects();

        // Initialize animation
        this.animation = new AnimationController(this.canvas, this.ctx, this.canvas, {
            duration: duration,
            speed: speed,
            effects: effects,
            scaleMode: 'fill' // Use 'fill' to ensure the generated image covers the canvas
        });

        this.playAnimation();
    }

    getRandomEffects() {
        const allEffects = ['fade', 'zoom', 'rotate', 'translate'];
        const numEffects = Math.floor(Math.random() * allEffects.length) + 1;
        const effects = [];

        for (let i = 0; i < numEffects; i++) {
            const randomIndex = Math.floor(Math.random() * allEffects.length);
            const effect = allEffects[randomIndex];
            if (!effects.includes(effect)) {
                effects.push(effect);
            }
        }

        return effects;
    }

    playAnimation() {
        if (this.animation) {
            this.animation.play();
        }
    }

    pauseAnimation() {
        if (this.animation) {
            this.animation.pause();
        }
    }

    resetAnimation() {
        if (this.animation) {
            this.animation.reset();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VideoAbstrakApp();
});
