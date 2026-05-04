/**
 * Tool Manager - Strategy + Observer Pattern
 * Manages drawing tools and notifies observers of changes
 */

import { EventEmitter } from './EventEmitter.js';
import { StrategyFactory } from './DrawingStrategies.js';

export class ToolManager extends EventEmitter {
    constructor() {
        super();
        this.currentTool = 'pencil';
        this.currentStrategy = StrategyFactory.create('pencil');
        this.toolOptions = {
            size: 5,
            opacity: 1.0
        };
        this.availableTools = StrategyFactory.getAvailableStrategies();
    }

    /**
     * Set active drawing tool
     * @param {string} toolName - Name of the tool
     */
    setTool(toolName) {
        if (!this.availableTools.includes(toolName)) {
            throw new Error(`Unknown tool: ${toolName}`);
        }

        if (this.currentTool !== toolName) {
            const previousTool = this.currentTool;
            this.currentTool = toolName;
            this.currentStrategy = StrategyFactory.create(toolName);
            
            this.emit('toolChanged', {
                previousTool,
                currentTool: toolName,
                strategy: this.currentStrategy
            });
        }
    }

    /**
     * Get current active tool
     */
    getCurrentTool() {
        return this.currentTool;
    }

    /**
     * Get current drawing strategy
     */
    getCurrentStrategy() {
        return this.currentStrategy;
    }

    /**
     * Set tool options (size, opacity, etc.)
     * @param {Object} options - Tool options
     */
    setOptions(options) {
        const previousOptions = { ...this.toolOptions };
        this.toolOptions = { ...this.toolOptions, ...options };
        
        this.emit('toolOptionsChanged', {
            previousOptions,
            currentOptions: this.toolOptions
        });
    }

    /**
     * Get current tool options
     */
    getOptions() {
        return { ...this.toolOptions };
    }

    /**
     * Set brush/tool size
     * @param {number} size - Size in pixels
     */
    setSize(size) {
        if (size > 0 && size <= 100) {
            this.setOptions({ size });
        }
    }

    /**
     * Get current tool size
     */
    getSize() {
        return this.toolOptions.size;
    }

    /**
     * Set tool opacity
     * @param {number} opacity - Opacity (0.0 to 1.0)
     */
    setOpacity(opacity) {
        if (opacity >= 0 && opacity <= 1) {
            this.setOptions({ opacity });
        }
    }

    /**
     * Get available tools
     */
    getAvailableTools() {
        return [...this.availableTools];
    }

    /**
     * Get tool configuration for serialization
     */
    serialize() {
        return {
            currentTool: this.currentTool,
            toolOptions: this.toolOptions,
            availableTools: this.availableTools
        };
    }

    /**
     * Restore tool configuration from serialized data
     */
    deserialize(data) {
        if (data.currentTool) {
            this.setTool(data.currentTool);
        }
        if (data.toolOptions) {
            this.setOptions(data.toolOptions);
        }
    }
}