/**
 * Color Manager - Observer Pattern
 * Manages color selection and palette with event notifications
 */

import { EventEmitter } from './EventEmitter.js';

export class ColorManager extends EventEmitter {
    constructor() {
        super();
        this.currentColor = '#000000';
        this.colorHistory = [];
        this.maxHistory = 20;
        this.defaultPalette = [
            '#000000', '#ffffff', '#ff0000', '#00ff00', 
            '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
            '#800000', '#008000', '#000080', '#808080'
        ];
    }

    /**
     * Set the active color
     * @param {string} color - Hex color string
     */
    setColor(color) {
        if (!this.isValidColor(color)) {
            throw new Error(`Invalid color format: ${color}`);
        }

        if (this.currentColor !== color) {
            const previousColor = this.currentColor;
            this.currentColor = color;
            this.addToHistory(color);
            
            this.emit('colorChanged', {
                previousColor,
                currentColor: color,
                rgb: this.hexToRgb(color),
                hsl: this.hexToHsl(color)
            });
        }
    }

    /**
     * Get current active color
     */
    getCurrentColor() {
        return this.currentColor;
    }

    /**
     * Add color to recent history
     */
    addToHistory(color) {
        // Remove if already in history
        this.colorHistory = this.colorHistory.filter(c => c !== color);
        
        // Add to beginning
        this.colorHistory.unshift(color);
        
        // Trim to max length
        if (this.colorHistory.length > this.maxHistory) {
            this.colorHistory = this.colorHistory.slice(0, this.maxHistory);
        }
        
        this.emit('historyUpdated', {
            history: this.getColorHistory()
        });
    }

    /**
     * Get color history
     */
    getColorHistory() {
        return [...this.colorHistory];
    }

    /**
     * Get default color palette
     */
    getDefaultPalette() {
        return [...this.defaultPalette];
    }

    /**
     * Validate hex color format
     */
    isValidColor(color) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    }

    /**
     * Convert hex to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convert RGB to hex
     */
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * Convert hex to HSL
     */
    hexToHsl(hex) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return null;

        let { r, g, b } = rgb;
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    /**
     * Generate complementary color
     */
    getComplementaryColor(hex = this.currentColor) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;
        
        return this.rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
    }

    /**
     * Generate color variations
     */
    getColorVariations(hex = this.currentColor, count = 5) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return [hex];
        
        const variations = [];
        for (let i = 0; i < count; i++) {
            const factor = 0.2 + (i / count) * 0.6; // 0.2 to 0.8
            const newR = Math.round(rgb.r * factor);
            const newG = Math.round(rgb.g * factor);
            const newB = Math.round(rgb.b * factor);
            variations.push(this.rgbToHex(newR, newG, newB));
        }
        
        return variations;
    }

    /**
     * Serialize color manager state
     */
    serialize() {
        return {
            currentColor: this.currentColor,
            colorHistory: this.colorHistory,
            defaultPalette: this.defaultPalette
        };
    }

    /**
     * Restore state from serialized data
     */
    deserialize(data) {
        if (data.currentColor) {
            this.setColor(data.currentColor);
        }
        if (Array.isArray(data.colorHistory)) {
            this.colorHistory = [...data.colorHistory];
        }
        if (Array.isArray(data.defaultPalette)) {
            this.defaultPalette = [...data.defaultPalette];
        }
    }
}