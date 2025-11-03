// Video generation using WebCodecs API and Canvas capture
class VideoGenerator {
    constructor(canvas, animation) {
        this.canvas = canvas;
        this.animation = animation;
        this.frames = [];
        this.fps = 30;
        this.duration = animation.duration;
        this.totalFrames = this.fps * this.duration;
    }

    async generateVideo(progressCallback) {
        try {
            // Check if WebCodecs is supported
            if (!('VideoEncoder' in window)) {
                throw new Error('WebCodecs API tidak didukung di browser ini. Gunakan Chrome atau Edge terbaru.');
            }

            // Capture frames
            await this.captureFrames(progressCallback);

            // Encode to MP4
            const videoBlob = await this.encodeToMP4();

            return videoBlob;

        } catch (error) {
            console.error('Error in video generation:', error);
            throw error;
        }
    }

    async captureFrames(progressCallback) {
        this.frames = [];

        for (let frameIndex = 0; frameIndex < this.totalFrames; frameIndex++) {
            const progress = (frameIndex / this.totalFrames) * 50; // First 50% for capturing
            progressCallback(progress);

            // Calculate time for this frame
            const time = (frameIndex / this.fps);

            // Render frame at specific time
            this.animation.currentTime = time;
            this.animation.renderFrame(time);

            // Capture canvas as image data
            const frameData = this.canvas.toDataURL('image/png');
            this.frames.push(frameData);

            // Allow UI to update
            await this.delay(1);
        }
    }

    async encodeToMP4() {
        const { VideoEncoder, EncodedVideoChunk, VideoFrame } = window;

        return new Promise(async (resolve, reject) => {
            try {
                const chunks = [];

                // Configure encoder
                const encoder = new VideoEncoder({
                    output: (chunk) => {
                        chunks.push(chunk);
                    },
                    error: (error) => {
                        console.error('Encoding error:', error);
                        reject(error);
                    }
                });

                // Initialize encoder
                await encoder.configure({
                    codec: 'avc1.42001E', // H.264
                    width: this.canvas.width,
                    height: this.canvas.height,
                    bitrate: 2_000_000, // 2 Mbps
                    framerate: this.fps,
                });

                // Encode frames
                for (let i = 0; i < this.frames.length; i++) {
                    const progress = 50 + (i / this.frames.length) * 50; // Next 50% for encoding
                    if (this.progressCallback) this.progressCallback(progress);

                    // Convert data URL to ImageBitmap
                    const response = await fetch(this.frames[i]);
                    const blob = await response.blob();
                    const bitmap = await createImageBitmap(blob);

                    // Create VideoFrame
                    const frame = new VideoFrame(bitmap, {
                        timestamp: (i / this.fps) * 1_000_000, // microseconds
                    });

                    encoder.encode(frame);
                    frame.close();
                    bitmap.close();

                    await this.delay(1);
                }

                // Flush encoder
                await encoder.flush();
                encoder.close();

                // Create MP4 blob
                const mp4Blob = new Blob(chunks.map(chunk => new Uint8Array(chunk.byteLength)), {
                    type: 'video/mp4'
                });

                resolve(mp4Blob);

            } catch (error) {
                reject(error);
            }
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Fallback video generation using MediaRecorder (if WebCodecs not available)
class FallbackVideoGenerator {
    constructor(canvas, animation) {
        this.canvas = canvas;
        this.animation = animation;
        this.stream = null;
        this.recorder = null;
        this.chunks = [];
    }

    async generateVideo(progressCallback) {
        return new Promise((resolve, reject) => {
            try {
                // Create canvas stream
                this.stream = this.canvas.captureStream(30); // 30 FPS

                // Configure MediaRecorder
                const options = {
                    mimeType: 'video/webm;codecs=vp9',
                    videoBitsPerSecond: 2_500_000
                };

                this.recorder = new MediaRecorder(this.stream, options);

                this.recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        this.chunks.push(event.data);
                    }
                };

                this.recorder.onstop = () => {
                    const blob = new Blob(this.chunks, { type: 'video/webm' });
                    resolve(blob);
                };

                // Start recording
                this.recorder.start();

                // Play animation and record
                this.animation.reset();
                this.animation.play();

                // Stop after duration
                setTimeout(() => {
                    this.animation.pause();
                    this.recorder.stop();
                    this.stream.getTracks().forEach(track => track.stop());
                }, this.animation.duration * 1000);

            } catch (error) {
                reject(error);
            }
        });
    }
}

// Export both generators
window.VideoGenerator = VideoGenerator;
window.FallbackVideoGenerator = FallbackVideoGenerator;
