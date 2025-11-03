// Enhanced Animation controller with improved abstract effects
class AnimationController {
    constructor(canvas, ctx, image, options = {}) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.image = image;
        this.duration = options.duration || 10;
        this.speed = options.speed || 1;
        this.effects = options.effects || ['fade'];
        this.scaleMode = options.scaleMode || 'fit';
        this.zoomScale = options.zoomScale || 1;
        this.abstractEffect = options.abstractEffect || 'none';
        this.abstractIntensity = options.abstractIntensity || 50;

        this.isPlaying = false;
        this.startTime = null;
        this.currentTime = 0;
        this.animationId = null;
        this.processedImage = null;

        this.setupAnimation();
        this.processAbstractEffect();
    }

    setupAnimation() {
        this.updateImageScaling();
    }

    updateImageScaling() {
        const canvasRatio = this.canvas.width / this.canvas.height;
        const imageRatio = this.image.width / this.image.height;

        switch (this.scaleMode) {
            case 'fit':
                if (imageRatio > canvasRatio) {
                    this.drawWidth = this.canvas.width;
                    this.drawHeight = this.canvas.width / imageRatio;
                } else {
                    this.drawHeight = this.canvas.height;
                    this.drawWidth = this.canvas.height * imageRatio;
                }
                break;
            case 'fill':
                this.drawWidth = this.canvas.width;
                this.drawHeight = this.canvas.height;
                break;
            case 'zoom':
                const baseSize = Math.max(this.canvas.width, this.canvas.height) * this.zoomScale;
                this.drawWidth = baseSize;
                this.drawHeight = baseSize / imageRatio;
                break;
        }

        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.drawX = this.centerX - this.drawWidth / 2;
        this.drawY = this.centerY - this.drawHeight / 2;
    }

    processAbstractEffect() {
        if (this.abstractEffect === 'none') {
            this.processedImage = this.image;
            return;
        }

        // Create a temporary canvas for image processing
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.image.width;
        tempCanvas.height = this.image.height;

        tempCtx.drawImage(this.image, 0, 0);

        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        const intensity = this.abstractIntensity / 100;

        switch (this.abstractEffect) {
            case 'randomize':
                this.applyRandomizeEffect(data, intensity);
                break;
            case 'oil':
                this.applyOilPaintEffect(tempCtx, tempCanvas, intensity);
                break;
            case 'water':
                this.applyWaterEffect(data, intensity);
                break;
            case 'glitch':
                this.applyGlitchEffect(data, intensity);
                break;
        }

        tempCtx.putImageData(imageData, 0, 0);
        this.processedImage = tempCanvas;
    }

    play() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.startTime = performance.now() - (this.currentTime * 1000);
            this.animate();
        }
    }

    pause() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    reset() {
        this.pause();
        this.currentTime = 0;
        this.startTime = null;
        this.renderFrame(0);
    }

    updateDuration(newDuration) {
        this.duration = newDuration;
    }

    updateSpeed(newSpeed) {
        this.speed = newSpeed;
    }

    updateEffects(newEffects) {
        this.effects = newEffects;
    }

    updateScaleMode(newScaleMode, newZoomScale = this.zoomScale) {
        this.scaleMode = newScaleMode;
        this.zoomScale = newZoomScale;
        this.updateImageScaling();
    }

    updateZoomScale(newZoomScale) {
        this.zoomScale = newZoomScale;
        this.updateImageScaling();
    }

    updateAbstractEffect(newEffect, newIntensity = this.abstractIntensity) {
        this.abstractEffect = newEffect;
        this.abstractIntensity = newIntensity;
        this.processAbstractEffect();
    }

    updateAbstractIntensity(newIntensity) {
        this.abstractIntensity = newIntensity;
        this.processAbstractEffect();
    }

    animate() {
        if (!this.isPlaying) return;

        const now = performance.now();
        const elapsed = (now - this.startTime) / 1000;
        this.currentTime = (elapsed * this.speed) % this.duration;

        this.renderFrame(this.currentTime);

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    renderFrame(time) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate progress (0 to 1)
        const progress = time / this.duration;

        // Apply animation effects
        this.applyAnimationEffects(progress);
    }

    applyRandomizeEffect(data, intensity) {
        for (let i = 0; i < data.length; i += 4) {
            if (Math.random() < intensity) {
                const randR = Math.floor(Math.random() * 255);
                const randG = Math.floor(Math.random() * 255);
                const randB = Math.floor(Math.random() * 255);
                data[i] = randR;     // Red
                data[i + 1] = randG; // Green
                data[i + 2] = randB; // Blue
            }
        }
    }

    applyOilPaintEffect(ctx, canvas, intensity) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const output = new Uint8ClampedArray(data);

        const radius = Math.floor(intensity * 5) + 1;
        const levels = Math.floor(intensity * 10) + 2;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const pixelIndex = (y * canvas.width + x) * 4;

                let r = 0, g = 0, b = 0, count = 0;

                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;

                        if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                            const nIndex = (ny * canvas.width + nx) * 4;
                            r += data[nIndex];
                            g += data[nIndex + 1];
                            b += data[nIndex + 2];
                            count++;
                        }
                    }
                }

                if (count > 0) {
                    r = Math.floor(r / count);
                    g = Math.floor(g / count);
                    b = Math.floor(b / count);

                    // Quantize colors
                    r = Math.floor(r / (256 / levels)) * (256 / levels);
                    g = Math.floor(g / (256 / levels)) * (256 / levels);
                    b = Math.floor(b / (256 / levels)) * (256 / levels);

                    output[pixelIndex] = r;
                    output[pixelIndex + 1] = g;
                    output[pixelIndex + 2] = b;
                    output[pixelIndex + 3] = data[pixelIndex + 3];
                }
            }
        }

        const outputImageData = new ImageData(output, canvas.width, canvas.height);
        ctx.putImageData(outputImageData, 0, 0);
    }

    applyWaterEffect(data, intensity) {
        const width = Math.sqrt(data.length / 4);
        const height = width;

        for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % width;
            const y = Math.floor((i / 4) / width);

            // Create wave-like distortion
            const waveX = Math.sin(y * 0.1 * intensity) * 10 * intensity;
            const waveY = Math.cos(x * 0.1 * intensity) * 10 * intensity;

            const sourceX = Math.max(0, Math.min(width - 1, x + waveX));
            const sourceY = Math.max(0, Math.min(height - 1, y + waveY));

            const sourceIndex = (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4;

            if (sourceIndex < data.length - 3) {
                data[i] = data[sourceIndex];     // R
                data[i + 1] = data[sourceIndex + 1]; // G
                data[i + 2] = data[sourceIndex + 2]; // B
            }
        }
    }

    applyGlitchEffect(data, intensity) {
        const width = Math.sqrt(data.length / 4);
        const numGlitches = Math.floor(intensity * 20) + 5;

        for (let g = 0; g < numGlitches; g++) {
            const startY = Math.floor(Math.random() * width);
            const height = Math.floor(Math.random() * 20 * intensity) + 1;
            const offset = Math.floor((Math.random() - 0.5) * 50 * intensity);

            for (let y = startY; y < Math.min(startY + height, width); y++) {
                for (let x = 0; x < width; x++) {
                    const sourceX = Math.max(0, Math.min(width - 1, x + offset));
                    const sourceIndex = (y * width + Math.floor(sourceX)) * 4;
                    const targetIndex = (y * width + x) * 4;

                    data[targetIndex] = data[sourceIndex];
                    data[targetIndex + 1] = data[sourceIndex + 1];
                    data[targetIndex + 2] = data[sourceIndex + 2];
                }
            }
        }
    }

    applyAnimationEffects(progress) {
        this.ctx.save();

        // Apply each selected effect
        this.effects.forEach(effect => {
            switch (effect) {
                case 'fade':
                    this.applyFadeEffect(progress);
                    break;
                case 'zoom':
                    this.applyZoomEffect(progress);
                    break;
                case 'rotate':
                    this.applyRotateEffect(progress);
                    break;
                case 'translate':
                    this.applyTranslateEffect(progress);
                    break;
            }
        });

        // Draw the processed image
        this.ctx.drawImage(this.processedImage, this.drawX, this.drawY, this.drawWidth, this.drawHeight);

        this.ctx.restore();
    }

    applyFadeEffect(progress) {
        // Fade in for first half, fade out for second half
        let opacity;
        if (progress < 0.5) {
            opacity = progress * 2; // 0 to 1
        } else {
            opacity = (1 - progress) * 2; // 1 to 0
        }

        this.ctx.globalAlpha = opacity;
    }

    applyZoomEffect(progress) {
        // Zoom in and out
        const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.3; // Scale between 0.7 and 1.3

        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-this.centerX, -this.centerY);
    }

    applyRotateEffect(progress) {
        // Rotate 360 degrees over the duration
        const rotation = progress * Math.PI * 2;

        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(rotation);
        this.ctx.translate(-this.centerX, -this.centerY);
    }

    applyTranslateEffect(progress) {
        // Move image around the canvas
        const radius = 50;
        const angle = progress * Math.PI * 2;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;

        this.ctx.translate(offsetX, offsetY);
    }

    // Method to get current frame for video generation
    getCurrentFrame() {
        return this.canvas;
    }
}
