/**
 * Main Application Entry Point
 * Initializes the drawing app and sets up UI interactions
 */

import { DrawingApp } from './DrawingApp.js';

// Application instance
let drawingApp;

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeApp();
    } catch (error) {
        console.error('Failed to initialize drawing app:', error);
        showError('Failed to load drawing app. Please refresh the page.');
    }
});

/**
 * Initialize the drawing application
 */
function initializeApp() {
    const canvas = document.getElementById('drawing-canvas');
    if (!canvas) {
        throw new Error('Canvas element not found');
    }

    // Create application instance
    drawingApp = new DrawingApp(canvas);
    drawingApp.initialize();

    // Setup UI event listeners
    setupToolbarListeners();
    setupKeyboardShortcuts();
    setupApplicationEventListeners();

    // Initial UI state
    updateUI();
    
    console.log('Drawing app initialized successfully');
    updateStatus('Ready to draw - select a tool and start creating!');
}

/**
 * Setup toolbar event listeners
 */
function setupToolbarListeners() {
    // Tool selection
    document.getElementById('pencil-tool')?.addEventListener('click', () => {
        setActiveTool('pencil');
    });

    document.getElementById('eraser-tool')?.addEventListener('click', () => {
        setActiveTool('eraser');
    });

    // Color picker
    document.getElementById('color-picker')?.addEventListener('change', (e) => {
        drawingApp.setColor(e.target.value);
    });

    // Color presets
    document.querySelectorAll('.color-preset').forEach(preset => {
        preset.addEventListener('click', () => {
            const color = preset.dataset.color;
            drawingApp.setColor(color);
            document.getElementById('color-picker').value = color;
        });
    });

    // Brush size
    const brushSizeSlider = document.getElementById('brush-size');
    const sizeDisplay = document.getElementById('size-display');
    
    brushSizeSlider?.addEventListener('input', (e) => {
        const size = parseInt(e.target.value);
        drawingApp.setBrushSize(size);
        sizeDisplay.textContent = `${size}px`;
    });

    // Action buttons
    document.getElementById('undo-btn')?.addEventListener('click', () => {
        if (drawingApp.undo()) {
            updateStatus('Undid last action');
        }
    });

    document.getElementById('redo-btn')?.addEventListener('click', () => {
        if (drawingApp.redo()) {
            updateStatus('Redid action');
        }
    });

    document.getElementById('clear-btn')?.addEventListener('click', () => {
        if (confirm('Clear the entire canvas? This cannot be undone.')) {
            drawingApp.clearCanvas();
            updateStatus('Canvas cleared');
        }
    });

    document.getElementById('save-btn')?.addEventListener('click', () => {
        drawingApp.saveAsImage();
        updateStatus('Drawing saved!');
    });
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't interfere with text inputs
        if (e.target.tagName === 'INPUT') return;

        switch (e.key.toLowerCase()) {
            case 'z':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    if (e.shiftKey) {
                        drawingApp.redo();
                    } else {
                        drawingApp.undo();
                    }
                }
                break;
            
            case 'p':
                e.preventDefault();
                setActiveTool('pencil');
                break;
            
            case 'e':
                e.preventDefault();
                setActiveTool('eraser');
                break;
            
            case 'c':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    if (confirm('Clear canvas?')) {
                        drawingApp.clearCanvas();
                    }
                }
                break;
                
            case 's':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    drawingApp.saveAsImage();
                }
                break;
        }
    });
}

/**
 * Setup application-level event listeners
 */
function setupApplicationEventListeners() {
    drawingApp.on('toolChanged', (data) => {
        updateActiveTool(data.currentTool);
        updateStatus(`Switched to ${data.currentTool} tool`);
    });

    drawingApp.on('colorChanged', (data) => {
        updateStatus(`Color changed to ${data.currentColor}`);
    });

    drawingApp.on('undoRedoStateChanged', (data) => {
        updateUndoRedoButtons(data.canUndo, data.canRedo);
    });

    drawingApp.on('coordinatesUpdate', (coords) => {
        updateCoordinatesDisplay(coords.x, coords.y);
    });

    drawingApp.on('strokeCompleted', (data) => {
        updateStatus(`Drew ${data.path.length} point stroke with ${data.tool}`);
    });

    drawingApp.on('canvasCleared', () => {
        updateUndoRedoButtons(false, false);
        updateStatus('Canvas cleared');
    });
}

/**
 * Set active drawing tool
 */
function setActiveTool(toolName) {
    drawingApp.setTool(toolName);
}

/**
 * Update UI to reflect active tool
 */
function updateActiveTool(toolName) {
    // Remove active class from all tools
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to current tool
    const toolButton = document.getElementById(`${toolName}-tool`);
    if (toolButton) {
        toolButton.classList.add('active');
    }

    // Update canvas cursor style
    const canvas = document.getElementById('drawing-canvas');
    if (canvas) {
        canvas.className = ''; // Clear classes
        if (toolName === 'eraser') {
            canvas.classList.add('erasing');
        }
    }
}

/**
 * Update undo/redo button states
 */
function updateUndoRedoButtons(canUndo, canRedo) {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    
    if (undoBtn) {
        undoBtn.disabled = !canUndo;
    }
    
    if (redoBtn) {
        redoBtn.disabled = !canRedo;
    }
}

/**
 * Update coordinates display
 */
function updateCoordinatesDisplay(x, y) {
    const coordsDisplay = document.getElementById('coordinates');
    if (coordsDisplay) {
        coordsDisplay.textContent = `(${x}, ${y})`;
    }
}

/**
 * Update status text
 */
function updateStatus(message) {
    const statusText = document.getElementById('status-text');
    if (statusText) {
        statusText.textContent = message;
    }
}

/**
 * Show error message
 */
function showError(message) {
    updateStatus(`Error: ${message}`);
    console.error(message);
}

/**
 * Update UI state
 */
function updateUI() {
    if (!drawingApp) return;

    const state = drawingApp.getState();
    
    // Update tool selection
    updateActiveTool(state.tool.currentTool);
    
    // Update color picker
    const colorPicker = document.getElementById('color-picker');
    if (colorPicker) {
        colorPicker.value = state.color.currentColor;
    }
    
    // Update brush size
    const brushSizeSlider = document.getElementById('brush-size');
    const sizeDisplay = document.getElementById('size-display');
    if (brushSizeSlider && sizeDisplay) {
        brushSizeSlider.value = state.tool.toolOptions.size;
        sizeDisplay.textContent = `${state.tool.toolOptions.size}px`;
    }
    
    // Update undo/redo buttons
    updateUndoRedoButtons(state.history.canUndo, state.history.canRedo);
}

/**
 * Export drawing app for external access (debugging/testing)
 */
window.drawingApp = drawingApp;

/**
 * Export test utilities
 */
window.testUtils = {
    exportCanvasSection: (x, y, w, h) => drawingApp?.exportCanvasSection(x, y, w, h),
    getAppState: () => drawingApp?.getState(),
    simulateDrawing: (points, tool = 'pencil', color = '#000000') => {
        if (!drawingApp || !points.length) return;
        
        drawingApp.setTool(tool);
        drawingApp.setColor(color);
        
        // Simulate drawing path
        for (let i = 1; i < points.length; i++) {
            drawingApp.handleDrawingContinue({
                startPoint: points[i-1],
                endPoint: points[i]
            });
        }
        
        drawingApp.handleDrawingEnd({ path: points });
    }
};