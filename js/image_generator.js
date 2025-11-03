class ImageGenerator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
    }

    generate() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);

        // Set a random background color
        this.ctx.fillStyle = this.getRandomColor();
        this.ctx.fillRect(0, 0, width, height);

        // Draw random shapes
        const numShapes = Math.floor(Math.random() * 20) + 10;
        for (let i = 0; i < numShapes; i++) {
            this.drawRandomShape(width, height);
        }
    }

    drawRandomShape(width, height) {
        const shapeType = Math.floor(Math.random() * 3);
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 100 + 20;

        this.ctx.fillStyle = this.getRandomColor(0.7);
        this.ctx.strokeStyle = this.getRandomColor();
        this.ctx.lineWidth = Math.random() * 5 + 1;

        switch (shapeType) {
            case 0: // Rectangle
                this.ctx.fillRect(x, y, size, size);
                this.ctx.strokeRect(x, y, size, size);
                break;
            case 1: // Circle
                this.ctx.beginPath();
                this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
                break;
            case 2: // Line
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(Math.random() * width, Math.random() * height);
                this.ctx.stroke();
                break;
        }
    }

    getRandomColor(alpha = 1) {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}
