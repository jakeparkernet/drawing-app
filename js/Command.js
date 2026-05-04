/**
 * Command Pattern Implementation
 * Encapsulates drawing actions for undo/redo functionality
 */

export class DrawingCommand {
    constructor(strategy, canvas, startPoint, endPoint, options) {
        this.strategy = strategy;
        this.canvas = canvas;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.options = options;
        this.imageDataBefore = null;
        this.imageDataAfter = null;
    }

    /**
     * Execute the drawing command
     */
    execute() {
        const ctx = this.canvas.getContext('2d');
        
        // Save state before drawing
        this.imageDataBefore = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply drawing strategy
        this.strategy.draw(ctx, this.startPoint, this.endPoint, this.options);
        
        // Save state after drawing
        this.imageDataAfter = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Undo the drawing command
     */
    undo() {
        if (this.imageDataBefore) {
            const ctx = this.canvas.getContext('2d');
            ctx.putImageData(this.imageDataBefore, 0, 0);
        }
    }

    /**
     * Redo the drawing command
     */
    redo() {
        if (this.imageDataAfter) {
            const ctx = this.canvas.getContext('2d');
            ctx.putImageData(this.imageDataAfter, 0, 0);
        }
    }

    /**
     * Get memory usage of this command (for optimization)
     */
    getMemoryUsage() {
        const bytesPerPixel = 4; // RGBA
        const pixelCount = this.canvas.width * this.canvas.height;
        const bytesPerState = pixelCount * bytesPerPixel;
        
        return {
            before: this.imageDataBefore ? bytesPerState : 0,
            after: this.imageDataAfter ? bytesPerState : 0,
            total: (this.imageDataBefore ? bytesPerState : 0) + (this.imageDataAfter ? bytesPerState : 0)
        };
    }
}

/**
 * Null Object Pattern - for empty commands
 */
export class NullCommand {
    execute() {}
    undo() {}
    redo() {}
    getMemoryUsage() { return { before: 0, after: 0, total: 0 }; }
}