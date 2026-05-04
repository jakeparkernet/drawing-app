/**
 * Strategy Pattern Implementation
 * Different drawing tools with common interface
 */

/**
 * Base strategy interface
 */
export class DrawingStrategy {
    draw(ctx, startPoint, endPoint, options) {
        throw new Error('DrawingStrategy.draw must be implemented');
    }
}

/**
 * Pencil drawing strategy
 */
export class PencilStrategy extends DrawingStrategy {
    draw(ctx, startPoint, endPoint, options) {
        const { color, size } = options;
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
    }
}

/**
 * Brush drawing strategy (smooth curves)
 */
export class BrushStrategy extends DrawingStrategy {
    draw(ctx, startPoint, endPoint, options) {
        const { color, size } = options;
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        
        // Smooth curve using quadratic curve
        const midPoint = {
            x: (startPoint.x + endPoint.x) / 2,
            y: (startPoint.y + endPoint.y) / 2
        };
        
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.quadraticCurveTo(startPoint.x, startPoint.y, midPoint.x, midPoint.y);
        ctx.stroke();
    }
}

/**
 * Eraser strategy
 */
export class EraserStrategy extends DrawingStrategy {
    draw(ctx, startPoint, endPoint, options) {
        const { size } = options;
        
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = size;
        
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
    }
}

/**
 * Line drawing strategy
 */
export class LineStrategy extends DrawingStrategy {
    draw(ctx, startPoint, endPoint, options) {
        const { color, size } = options;
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
    }
}

/**
 * Factory Method for creating drawing strategies
 */
export class StrategyFactory {
    static create(strategyType) {
        switch (strategyType) {
            case 'pencil':
                return new PencilStrategy();
            case 'brush':
                return new BrushStrategy();
            case 'eraser':
                return new EraserStrategy();
            case 'line':
                return new LineStrategy();
            default:
                throw new Error(`Unknown drawing strategy: ${strategyType}`);
        }
    }

    static getAvailableStrategies() {
        return ['pencil', 'brush', 'eraser', 'line'];
    }
}