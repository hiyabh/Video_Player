/**
 * Modern Video Transform Controller 2025
 * Handles video zoom, rotation, and position transformations
 */

class VideoTransform {
    constructor() {
        // Video element
        this.video = document.getElementById('videoPlayer');
        this.videoContainer = document.getElementById('videoContainer');

        // Transform controls
        this.zoomInBtn = document.getElementById('zoomIn');
        this.zoomOutBtn = document.getElementById('zoomOut');
        this.moveUpBtn = document.getElementById('moveUp');
        this.moveDownBtn = document.getElementById('moveDown');
        this.moveLeftBtn = document.getElementById('moveLeft');
        this.moveRightBtn = document.getElementById('moveRight');
        this.rotateLeftBtn = document.getElementById('rotateLeft');
        this.rotateRightBtn = document.getElementById('rotateRight');
        this.resetPositionBtn = document.getElementById('resetPosition');
        this.resetAllBtn = document.getElementById('resetAll');

        // Info displays
        this.zoomValue = document.getElementById('zoomValue');
        this.rotationValue = document.getElementById('rotationValue');
        this.posX = document.getElementById('posX');
        this.posY = document.getElementById('posY');
        this.coordX = document.getElementById('coordX');
        this.coordY = document.getElementById('coordY');

        // Transform state
        this.zoom = 1;
        this.rotation = 0;
        this.translateX = 0;
        this.translateY = 0;

        // Interaction state
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragStartTranslateX = 0;
        this.dragStartTranslateY = 0;
        this.continuousInterval = null;

        // Constants
        this.ZOOM_STEP = 0.5;
        this.ROTATION_STEP = 5;
        this.MOVE_STEP = 50;
        this.CONTINUOUS_INTERVAL = 100; // ms

        this.init();
    }

    init() {
        if (!this.video) {
            console.warn('Video element not found');
            return;
        }

        this.setupEventListeners();
        this.applyTransform();
        this.updateDisplays();
    }

    setupEventListeners() {
        // Zoom controls
        this.setupContinuousButton(this.zoomInBtn, () => this.zoomIn());
        this.setupContinuousButton(this.zoomOutBtn, () => this.zoomOut());

        // Position controls
        this.setupContinuousButton(this.moveUpBtn, () => this.moveUp());
        this.setupContinuousButton(this.moveDownBtn, () => this.moveDown());
        this.setupContinuousButton(this.moveLeftBtn, () => this.moveLeft());
        this.setupContinuousButton(this.moveRightBtn, () => this.moveRight());

        // Rotation controls
        this.setupContinuousButton(this.rotateLeftBtn, () => this.rotateLeft());
        this.setupContinuousButton(this.rotateRightBtn, () => this.rotateRight());

        // Reset controls
        this.resetPositionBtn?.addEventListener('click', () => this.resetPosition());
        this.resetAllBtn?.addEventListener('click', () => this.resetAll());

        // Mouse/touch drag to move
        this.video?.addEventListener('mousedown', (e) => this.startDrag(e));
        this.video?.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('touchmove', (e) => this.drag(e.touches[0]));
        document.addEventListener('mouseup', () => this.endDrag());
        document.addEventListener('touchend', () => this.endDrag());

        // Mouse wheel zoom
        this.video?.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });

        // Show coordinates on hover
        this.video?.addEventListener('mousemove', (e) => this.updateCoordinates(e));
    }

    // Button setup for continuous action (hold to repeat)
    setupContinuousButton(button, action) {
        if (!button) return;

        button.addEventListener('mousedown', () => {
            action();
            this.continuousInterval = setInterval(action, this.CONTINUOUS_INTERVAL);
        });

        button.addEventListener('mouseup', () => this.stopContinuous());
        button.addEventListener('mouseleave', () => this.stopContinuous());

        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            action();
            this.continuousInterval = setInterval(action, this.CONTINUOUS_INTERVAL);
        });

        button.addEventListener('touchend', () => this.stopContinuous());
    }

    stopContinuous() {
        if (this.continuousInterval) {
            clearInterval(this.continuousInterval);
            this.continuousInterval = null;
        }
    }

    // Zoom Controls
    zoomIn() {
        this.zoom = Math.min(this.zoom + this.ZOOM_STEP, 10);
        this.applyTransform();
        this.updateDisplays();
    }

    zoomOut() {
        this.zoom = Math.max(this.zoom - this.ZOOM_STEP, 0.1);
        this.applyTransform();
        this.updateDisplays();
    }

    // Position Controls
    moveUp() {
        this.translateY -= this.MOVE_STEP;
        this.applyTransform();
        this.updateDisplays();
    }

    moveDown() {
        this.translateY += this.MOVE_STEP;
        this.applyTransform();
        this.updateDisplays();
    }

    moveLeft() {
        this.translateX -= this.MOVE_STEP;
        this.applyTransform();
        this.updateDisplays();
    }

    moveRight() {
        this.translateX += this.MOVE_STEP;
        this.applyTransform();
        this.updateDisplays();
    }

    // Rotation Controls
    rotateLeft() {
        this.rotation = (this.rotation + this.ROTATION_STEP) % 360;
        this.applyTransform();
        this.updateDisplays();
    }

    rotateRight() {
        this.rotation = (this.rotation - this.ROTATION_STEP + 360) % 360;
        this.applyTransform();
        this.updateDisplays();
    }

    // Reset Controls
    resetPosition() {
        this.translateX = 0;
        this.translateY = 0;
        this.applyTransform();
        this.updateDisplays();
    }

    resetAll() {
        this.zoom = 1;
        this.rotation = 0;
        this.translateX = 0;
        this.translateY = 0;
        this.applyTransform();
        this.updateDisplays();
    }

    // Drag to Move
    startDrag(e) {
        e.preventDefault();
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.dragStartTranslateX = this.translateX;
        this.dragStartTranslateY = this.translateY;

        if (this.video) {
            this.video.style.cursor = 'grabbing';
        }
    }

    drag(e) {
        if (!this.isDragging) return;

        e.preventDefault();

        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;

        this.translateX = this.dragStartTranslateX + deltaX;
        this.translateY = this.dragStartTranslateY + deltaY;

        this.applyTransform();
        this.updateDisplays();
    }

    endDrag() {
        this.isDragging = false;
        if (this.video) {
            this.video.style.cursor = 'grab';
        }
    }

    // Mouse Wheel Zoom
    handleWheel(e) {
        e.preventDefault();

        if (!this.video || !this.videoContainer) return;

        // Get mouse position relative to video
        const rect = this.video.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate center offset
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const oldZoom = this.zoom;

        // Zoom in or out
        const delta = Math.sign(e.deltaY) * -1;
        if (delta > 0) {
            this.zoom = Math.min(this.zoom + this.ZOOM_STEP, 10);
        } else {
            this.zoom = Math.max(this.zoom - this.ZOOM_STEP, 0.1);
        }

        // Adjust position to zoom towards mouse cursor
        const zoomFactor = this.zoom / oldZoom;
        const offsetX = mouseX - centerX;
        const offsetY = mouseY - centerY;

        this.translateX += offsetX * (1 - zoomFactor);
        this.translateY += offsetY * (1 - zoomFactor);

        this.applyTransform();
        this.updateDisplays();
    }

    // Apply Transform
    applyTransform() {
        if (!this.video) return;

        const transform = `
            translate(${this.translateX}px, ${this.translateY}px)
            scale(${this.zoom})
            rotate(${this.rotation}deg)
        `;

        this.video.style.transform = transform;
    }

    // Update Displays
    updateDisplays() {
        if (this.zoomValue) {
            this.zoomValue.textContent = `${this.zoom.toFixed(1)}x`;
        }

        if (this.rotationValue) {
            this.rotationValue.textContent = `${this.rotation}°`;
        }

        if (this.posX) {
            this.posX.textContent = `${Math.round(this.translateX)}px`;
        }

        if (this.posY) {
            this.posY.textContent = `${Math.round(this.translateY)}px`;
        }
    }

    updateCoordinates(e) {
        if (!this.video || !this.coordX || !this.coordY) return;

        const rect = this.video.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);

        // Calculate coordinates relative to original video size
        const scaleX = this.video.videoWidth / rect.width;
        const scaleY = this.video.videoHeight / rect.height;

        const videoX = Math.round(x * scaleX);
        const videoY = Math.round(y * scaleY);

        this.coordX.textContent = `X: ${videoX}`;
        this.coordY.textContent = `Y: ${videoY}`;
    }
}

// Initialize the video transform controller when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.videoTransform = new VideoTransform();
    });
} else {
    window.videoTransform = new VideoTransform();
}

// Export for use in other modules
export default VideoTransform;
