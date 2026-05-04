/**
 * Drawing App - Facade Pattern
 * Main application facade that coordinates all subsystems
 */

import { EventEmitter } from './EventEmitter.js';
import { CanvasManager } from './CanvasManager.js';
import { ToolManager } from './ToolManager.js';
import { ColorManager } from './ColorManager.js';
import { CommandHistory } from './CommandHistory.js';
import { DrawingStateContext } from './DrawingState.js';
import { DrawingCommand } from './Command.js';

export class DrawingApp extends EventEmitter {
    constructor(canvasElement) {
        super();
        
        // Initialize subsystems
        this.canvasManager = new CanvasManager(canvasElement);
        this.toolManager = new ToolManager();
        this.colorManager = new ColorManager();
        this.commandHistory = new CommandHistory();
        this.stateContext = new DrawingStateContext(canvasElement);
        
        // Setup inter-component communication
        this.setupEventHandlers();
        
        // Application state
        this.isInitialized = false;
        this.settings = {
            autoSave: false,
            autoSaveInterval: 30000, // 30 seconds
            maxUndoSteps: 50
        };

        this.emit('appCreated');
    }

    /**
     * Initialize the application
     */
    initialize() {
        if (this.isInitialized) return;

        // Setup drawing event handlers
        this.stateContext.on('drawingContinue', (data) => {
            this.handleDrawingContinue(data);
        });

        this.stateContext.on('drawingEnd', (data) => {
            this.handleDrawingEnd(data);
        });

        // Setup status updates
        this.stateContext.on('coordinatesUpdate', (coords) => {
            this.emit('coordinatesUpdate', coords);
        });

        this.commandHistory.on('commandExecuted', (data) => {
            this.emit('undoRedoStateChanged', {
                canUndo: data.canUndo,
                canRedo: data.canRedo
            });
        });

        this.commandHistory.on('commandUndone', (data) => {
            this.emit('undoRedoStateChanged', {
                canUndo: data.canUndo,
                canRedo: data.canRedo
            });
        });

        this.commandHistory.on('commandRedone', (data) => {
            this.emit('undoRedoStateChanged', {
                canUndo: data.canUndo,
                canRedo: data.canRedo
            });
        });

        this.isInitialized = true;
        this.emit('appInitialized');
    }

    /**
     * Handle continuous drawing
     */
    handleDrawingContinue(data) {
        const strategy = this.toolManager.getCurrentStrategy();
        const options = {
            color: this.colorManager.getCurrentColor(),
            size: this.toolManager.getSize(),
            ...this.toolManager.getOptions()
        };

        // Draw immediately for smooth experience
        const ctx = this.canvasManager.canvas.getContext('2d');
        strategy.draw(ctx, data.startPoint, data.endPoint, options);

        this.emit('drawing', { 
            tool: this.toolManager.getCurrentTool(),
            point: data.endPoint,
            options 
        });
    }

    /**
     * Handle drawing completion - create command for history
     */
    handleDrawingEnd(data) {
        if (data.path.length > 1) {
            // Create command for the entire stroke
            const strategy = this.toolManager.getCurrentStrategy();
            const options = {
                color: this.colorManager.getCurrentColor(),
                size: this.toolManager.getSize(),
                ...this.toolManager.getOptions()
            };

            // Create a compound command for the entire path
            const command = new PathCommand(strategy, this.canvasManager.canvas, data.path, options);
            this.commandHistory.executeCommand(command);
        }

        this.emit('strokeCompleted', { 
            path: data.path,
            tool: this.toolManager.getCurrentTool() 
        });
    }

    /**
     * Set up event handlers between components
     */
    setupEventHandlers() {
        // Tool changes
        this.toolManager.on('toolChanged', (data) => {
            this.emit('toolChanged', data);
        });

        // Color changes
        this.colorManager.on('colorChanged', (data) => {
            this.emit('colorChanged', data);
        });

        // Canvas changes
        this.canvasManager.on('canvasCleared', () => {
            this.commandHistory.clear();
            this.emit('canvasCleared');
        });
    }

    // Public API methods using Facade pattern

    /**
     * Change drawing tool
     */
    setTool(toolName) {
        this.toolManager.setTool(toolName);
    }

    /**
     * Change color
     */
    setColor(color) {
        this.colorManager.setColor(color);
    }

    /**
     * Change brush size
     */
    setBrushSize(size) {
        this.toolManager.setSize(size);
    }

    /**
     * Undo last action
     */
    undo() {
        return this.commandHistory.undo();
    }

    /**
     * Redo last undone action
     */
    redo() {
        return this.commandHistory.redo();
    }

    /**
     * Clear canvas
     */
    clearCanvas() {
        this.canvasManager.clear();
    }

    /**
     * Save drawing as image
     */
    saveAsImage(format = 'image/png', quality = 0.92) {
        const dataURL = this.canvasManager.toDataURL(format, quality);
        
        // Create download link
        const link = document.createElement('a');
        link.download = `drawing-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
        
        this.emit('imageSaved', { dataURL, format, quality });
        
        return dataURL;
    }

    /**
     * Export section of canvas for testing
     */
    exportCanvasSection(x, y, width, height) {
        return this.canvasManager.exportSection(x, y, width, height);
    }

    /**
     * Get application state
     */
    getState() {
        return {
            tool: this.toolManager.serialize(),
            color: this.colorManager.serialize(),
            history: this.commandHistory.getStats(),
            canvas: this.canvasManager.getDimensions()
        };
    }

    /**
     * Get current drawing data as base64
     */
    getDrawingData() {
        return this.canvasManager.toDataURL();
    }
}

/**
 * Path Command - represents a complete drawing path
 * Uses Strategy pattern for tool behavior
 */
class PathCommand {
    constructor(strategy, canvas, path, options) {
        this.strategy = strategy;
        this.canvas = canvas;
        this.path = path;
        this.options = options;
        this.imageDataBefore = null;
        this.imageDataAfter = null;
    }

    execute() {
        const ctx = this.canvas.getContext('2d');
        this.imageDataBefore = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        // Redraw the entire path
        for (let i = 1; i < this.path.length; i++) {
            this.strategy.draw(ctx, this.path[i-1], this.path[i], this.options);
        }
        
        this.imageDataAfter = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    undo() {
        if (this.imageDataBefore) {
            const ctx = this.canvas.getContext('2d');
            ctx.putImageData(this.imageDataBefore, 0, 0);
        }
    }

    redo() {
        if (this.imageDataAfter) {
            const ctx = this.canvas.getContext('2d');
            ctx.putImageData(this.imageDataAfter, 0, 0);
        }
    }

    getMemoryUsage() {
        const bytesPerPixel = 4;
        const pixelCount = this.canvas.width * this.canvas.height;
        const bytesPerState = pixelCount * bytesPerPixel;
        
        return {
            before: this.imageDataBefore ? bytesPerState : 0,
            after: this.imageDataAfter ? bytesPerState : 0,
            total: (this.imageDataBefore ? bytesPerState : 0) + (this.imageDataAfter ? bytesPerState : 0)
        };
    }
}