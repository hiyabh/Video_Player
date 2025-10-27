/**
 * Modern Video Player 2025
 * ES6+ Video Player Controller
 */

class VideoPlayer {
    constructor() {
        // Video elements
        this.video = document.getElementById('videoPlayer');
        this.playPauseBtn = document.getElementById('playPause');
        this.playOverlay = document.getElementById('playOverlay');
        this.rewindBtn = document.getElementById('rewind');
        this.rewindFastBtn = document.getElementById('rewindFast');
        this.forwardBtn = document.getElementById('forward');
        this.forwardFastBtn = document.getElementById('forwardFast');

        // Progress elements
        this.progressBar = document.getElementById('progressBar');
        this.progressFilled = document.getElementById('progressFilled');
        this.progressHandle = document.getElementById('progressHandle');
        this.currentTimeDisplay = document.getElementById('currentTime');
        this.totalTimeDisplay = document.getElementById('totalTime');

        // Frame controls
        this.frameInput = document.getElementById('frameInput');
        this.frameGoBtn = document.getElementById('frameGo');

        // Upload elements
        this.videoUpload = document.getElementById('videoUpload');
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');

        // Theme toggle
        this.themeToggle = document.getElementById('themeToggle');

        // State
        this.frameRate = 30; // Default frame rate
        this.rewindInterval = null;
        this.forwardInterval = null;
        this.isDraggingProgress = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTheme();
        this.updateTimeDisplays();
    }

    setupEventListeners() {
        // Play/Pause controls
        this.playPauseBtn?.addEventListener('click', () => this.togglePlay());
        this.playOverlay?.addEventListener('click', () => this.togglePlay());

        // Video click to toggle play - but not when dragging or using transform buttons
        this.videoIsDragging = false;
        this.videoMouseDown = false;

        this.video?.addEventListener('mousedown', (e) => {
            // Only track if it's a direct click on the video, not from transform controls
            if (e.target === this.video) {
                this.videoMouseDown = true;
                this.videoIsDragging = false;
            }
        });

        this.video?.addEventListener('mousemove', (e) => {
            // Only mark as dragging if mouse is down
            if (this.videoMouseDown) {
                this.videoIsDragging = true;
            }
        });

        this.video?.addEventListener('mouseup', () => {
            this.videoMouseDown = false;
        });

        this.video?.addEventListener('click', (e) => {
            // Only toggle play if we're not dragging and it's a direct click
            if (!this.videoIsDragging && e.target === this.video) {
                this.togglePlay();
            }
            this.videoIsDragging = false;
        });

        // Rewind/Forward controls
        this.rewindBtn?.addEventListener('mousedown', () => this.startRewind(1.0));
        this.rewindBtn?.addEventListener('mouseup', () => this.stopRewind());
        this.rewindBtn?.addEventListener('mouseleave', () => this.stopRewind());

        this.rewindFastBtn?.addEventListener('mousedown', () => this.startRewind(3.0));
        this.rewindFastBtn?.addEventListener('mouseup', () => this.stopRewind());
        this.rewindFastBtn?.addEventListener('mouseleave', () => this.stopRewind());

        this.forwardBtn?.addEventListener('click', () => this.setPlaySpeed(5));
        this.forwardFastBtn?.addEventListener('click', () => this.setPlaySpeed(10));

        // Progress bar
        this.progressBar?.addEventListener('click', (e) => this.seekToPosition(e));
        this.progressHandle?.addEventListener('mousedown', (e) => this.startDragging(e));
        document.addEventListener('mousemove', (e) => this.handleDragging(e));
        document.addEventListener('mouseup', () => this.stopDragging());

        // Video events
        this.video?.addEventListener('timeupdate', () => this.updateProgress());
        this.video?.addEventListener('loadedmetadata', () => this.updateTimeDisplays());
        this.video?.addEventListener('ended', () => this.onVideoEnded());

        // Frame controls
        this.frameGoBtn?.addEventListener('click', () => this.goToFrame());
        this.frameInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.goToFrame();
        });

        // File upload
        this.videoUpload?.addEventListener('change', (e) => this.handleFileUpload(e));
        this.setupDragAndDrop();

        // Theme toggle
        this.themeToggle?.addEventListener('click', () => this.toggleTheme());

        // Shortcuts modal
        this.setupShortcutsModal();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // Shortcuts Modal
    setupShortcutsModal() {
        const helpBtn = document.getElementById('helpBtn');
        const modal = document.getElementById('shortcutsModal');
        const closeBtn = document.getElementById('closeModal');

        if (!helpBtn || !modal || !closeBtn) return;

        // Open modal
        helpBtn.addEventListener('click', () => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Close modal
        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeBtn.addEventListener('click', closeModal);

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Also add ? key to open help
        document.addEventListener('keydown', (e) => {
            if (e.key === '?' && !modal.classList.contains('active') && e.target.tagName !== 'INPUT') {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // Playback Controls
    togglePlay() {
        if (!this.video) return;

        if (this.video.paused) {
            this.video.play();
            this.updatePlayButton(true);
        } else {
            this.video.pause();
            this.updatePlayButton(false);
        }
    }

    updatePlayButton(isPlaying) {
        const playIcon = this.playPauseBtn?.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn?.querySelector('.pause-icon');

        if (playIcon && pauseIcon) {
            playIcon.style.display = isPlaying ? 'none' : 'block';
            pauseIcon.style.display = isPlaying ? 'block' : 'none';
        }
    }

    setPlaySpeed(speed) {
        if (!this.video) return;

        this.stopRewind();

        const wasPlaying = !this.video.paused;
        this.video.playbackRate = speed;

        if (wasPlaying) {
            // Keep playing at the new speed
            this.video.play().catch(err => console.log('Play error:', err));
            this.updatePlayButton(true);
        } else {
            // Start playing at the new speed
            this.video.play().catch(err => console.log('Play error:', err));
            this.updatePlayButton(true);
        }

        // Reset to normal speed after playing for a bit
        setTimeout(() => {
            if (this.video && this.video.playbackRate === speed) {
                this.video.playbackRate = 1;
            }
        }, 1000);  // Give it 1 second at the fast speed
    }

    startRewind(speed) {
        if (!this.video) return;

        this.stopRewind();
        const startTime = this.video.currentTime;
        const startSystemTime = Date.now();

        this.rewindInterval = setInterval(() => {
            if (this.video.currentTime <= 0) {
                this.stopRewind();
                this.video.pause();
                this.updatePlayButton(false);
            } else {
                const elapsed = (Date.now() - startSystemTime) / 1000;
                this.video.currentTime = Math.max(0, startTime - elapsed * speed);
            }
        }, 33); // ~30fps
    }

    stopRewind() {
        if (this.rewindInterval) {
            clearInterval(this.rewindInterval);
            this.rewindInterval = null;
        }
    }

    onVideoEnded() {
        this.updatePlayButton(false);
        if (this.video) {
            this.video.currentTime = 0;
        }
    }

    // Progress Bar Controls
    updateProgress() {
        if (!this.video || this.isDraggingProgress) return;

        const percent = (this.video.currentTime / this.video.duration) * 100 || 0;

        if (this.progressFilled) {
            this.progressFilled.style.width = `${percent}%`;
        }

        if (this.progressHandle) {
            this.progressHandle.style.left = `${percent}%`;
        }

        // Update time displays
        const currentFrame = Math.floor(this.video.currentTime * this.frameRate);
        if (this.currentTimeDisplay) {
            this.currentTimeDisplay.textContent = currentFrame;
        }
    }

    seekToPosition(e) {
        if (!this.video || !this.progressBar) return;

        const rect = this.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.video.currentTime = percent * this.video.duration;
        this.updateProgress();
    }

    startDragging(e) {
        e.preventDefault();
        this.isDraggingProgress = true;
    }

    handleDragging(e) {
        if (!this.isDraggingProgress || !this.progressBar) return;

        const rect = this.progressBar.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));

        if (this.video) {
            this.video.currentTime = percent * this.video.duration;
        }

        if (this.progressFilled) {
            this.progressFilled.style.width = `${percent * 100}%`;
        }

        if (this.progressHandle) {
            this.progressHandle.style.left = `${percent * 100}%`;
        }
    }

    stopDragging() {
        this.isDraggingProgress = false;
    }

    updateTimeDisplays() {
        if (!this.video) return;

        const totalFrames = Math.floor(this.video.duration * this.frameRate);
        if (this.totalTimeDisplay && !isNaN(totalFrames)) {
            this.totalTimeDisplay.textContent = totalFrames;
        }
    }

    // Frame Controls
    goToFrame() {
        if (!this.video || !this.frameInput) return;

        const frameNumber = parseInt(this.frameInput.value);
        if (isNaN(frameNumber) || frameNumber < 0) return;

        const timeInSeconds = frameNumber / this.frameRate;
        this.video.currentTime = Math.min(timeInSeconds, this.video.duration);
        this.updateProgress();
    }

    // File Upload
    handleFileUpload(e) {
        const files = e.target.files;
        if (files.length === 0) return;

        const file = files[0];
        if (!this.isValidVideoFile(file)) {
            alert('נא להעלות קובץ וידאו תקין (MP4, WebM, OGG)');
            return;
        }

        this.loadVideoFile(file);
    }

    isValidVideoFile(file) {
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        return validTypes.includes(file.type);
    }

    loadVideoFile(file) {
        if (!this.video) return;

        const url = URL.createObjectURL(file);
        this.video.src = url;
        this.video.load();

        // Show file info
        if (this.fileName) {
            this.fileName.textContent = file.name;
        }

        if (this.fileSize) {
            this.fileSize.textContent = this.formatFileSize(file.size);
        }

        if (this.fileInfo) {
            this.fileInfo.style.display = 'block';
        }

        // Clean up old URL when video changes
        this.video.addEventListener('loadstart', () => {
            URL.revokeObjectURL(url);
        }, { once: true });
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    setupDragAndDrop() {
        if (!this.uploadArea) return;

        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, preventDefaults);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.classList.remove('drag-over');
            });
        });

        this.uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0 && this.isValidVideoFile(files[0])) {
                this.loadVideoFile(files[0]);
            }
        });
    }

    // Theme Controls
    setupTheme() {
        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Add smooth transition effect
        document.body.style.transition = 'background 0.3s ease-in-out';
    }

    // Keyboard Shortcuts
    handleKeyboard(e) {
        // Don't trigger shortcuts when typing in input fields
        if (e.target.tagName === 'INPUT') return;

        switch(e.key) {
            case ' ':
            case 'k':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (this.video) this.video.currentTime -= 5;
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (this.video) this.video.currentTime += 5;
                break;
            case 'j':
                e.preventDefault();
                if (this.video) this.video.currentTime -= 10;
                break;
            case 'l':
                e.preventDefault();
                if (this.video) this.video.currentTime += 10;
                break;
            case 'm':
                e.preventDefault();
                if (this.video) this.video.muted = !this.video.muted;
                break;
            case 'f':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case '0':
                e.preventDefault();
                if (this.video) this.video.currentTime = 0;
                break;
        }
    }

    toggleFullscreen() {
        if (!this.video) return;

        if (!document.fullscreenElement) {
            this.video.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// Initialize the video player when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.videoPlayer = new VideoPlayer();
    });
} else {
    window.videoPlayer = new VideoPlayer();
}

// Export for use in other modules
export default VideoPlayer;
