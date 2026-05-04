/**
 * Canvas Manager - Facade Pattern
 * Simplifies canvas operations and provides high-level interface
 */

import { EventEmitter } from './EventEmitter.js';

export class CanvasManager extends EventEmitter {
    constructor(canvasElement) {
        super();
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
    }

    setupCanvas() {
        // Set canvas properties for crisp rendering
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Set initial canvas state
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        this.emit('canvasSetup', {
            width: this.canvas.width,
            height: this.canvas.height,
            dpr
        });
    }

    /**
     * Clear the entire canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.emit('canvasCleared');
    }

    /**
     * Get canvas as image data URL
     */
    toDataURL(format = 'image/png', quality = 0.92) {
        return this.canvas.toDataURL(format, quality);
    }

    /**
     * Get current canvas state as ImageData
     */
    getImageData() {
        return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Restore canvas from ImageData
     */
    putImageData(imageData) {
        this.ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Save current state for later restoration
     */
    saveState() {
        return this.getImageData();
    }

    /**
     * Restore a previously saved state
     */
    restoreState(imageData) {
        this.putImageData(imageData);
    }

    /**
     * Resize canvas (preserves content)
     */
    resize(width, height) {
        const imageData = this.getImageData();
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.setupCanvas();
        
        // Try to restore content (may be clipped if smaller)
        try {
            this.putImageData(imageData);
        } catch (error) {
            console.warn('Could not restore canvas content after resize:', error);
        }
        
        this.emit('canvasResized', { width, height });
    }

    /**
     * Get canvas dimensions
     */
    getDimensions() {
        return {
            width: this.canvas.width,
            height: this.canvas.height,
            displayWidth: this.canvas.clientWidth,
            displayHeight: this.canvas.clientHeight
        };
    }

    /**
     * Convert display coordinates to canvas coordinates
     */
    displayToCanvasCoordinates(displayX, displayY) {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        return {
            x: (displayX - rect.left) * dpr,
            y: (displayY - rect.top) * dpr
        };
    }

    /**
     * Export a section of the canvas for testing/analysis
     */
    exportSection(x, y, width, height) {
        const sectionData = this.ctx.getImageData(x, y, width, height);
        
        // Create temporary canvas for export
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(sectionData, 0, 0);
        
        return {
            dataURL: tempCanvas.toDataURL('image/png'),
            imageData: sectionData,
            bounds: { x, y, width, height }
        };
    }
}