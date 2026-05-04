/**
 * State Pattern Implementation
 * Manages different states of the drawing application
 */

import { EventEmitter } from './EventEmitter.js';

/**
 * Base state class
 */
export class DrawingState {
    constructor(context) {
        this.context = context;
    }

    onMouseDown(event) {}
    onMouseMove(event) {}
    onMouseUp(event) {}
    onMouseLeave(event) {}
    
    enter() {}
    exit() {}
}

/**
 * Idle state - not currently drawing
 */
export class IdleState extends DrawingState {
    enter() {
        this.context.canvas.style.cursor = 'crosshair';
        this.context.emit('stateChange', { state: 'idle' });
    }

    onMouseDown(event) {
        const rect = this.context.canvas.getBoundingClientRect();
        const point = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        
        this.context.startDrawing(point);
        this.context.setState(new DrawingState.Drawing(this.context));
    }
}

/**
 * Drawing state - actively drawing
 */
export class DrawingStateActive extends DrawingState {
    enter() {
        this.context.canvas.classList.add('drawing');
        this.context.emit('stateChange', { state: 'drawing' });
    }

    exit() {
        this.context.canvas.classList.remove('drawing');
    }

    onMouseMove(event) {
        const rect = this.context.canvas.getBoundingClientRect();
        const point = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        
        this.context.continuDrawing(point);
    }

    onMouseUp(event) {
        this.context.finishDrawing();
        this.context.setState(new IdleState(this.context));
    }

    onMouseLeave(event) {
        this.context.finishDrawing();
        this.context.setState(new IdleState(this.context));
    }
}

/**
 * State Context - manages state transitions
 */
export class DrawingStateContext extends EventEmitter {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.currentState = new IdleState(this);
        this.isDrawing = false;
        this.lastPoint = null;
        this.currentPath = [];
        
        this.setupEventListeners();
        this.currentState.enter();
    }

    setState(newState) {
        if (this.currentState) {
            this.currentState.exit();
        }
        this.currentState = newState;
        this.currentState.enter();
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            this.currentState.onMouseDown(e);
            this.updateCoordinates(e);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.currentState.onMouseMove(e);
            this.updateCoordinates(e);
        });

        this.canvas.addEventListener('mouseup', (e) => {
            this.currentState.onMouseUp(e);
        });

        this.canvas.addEventListener('mouseleave', (e) => {
            this.currentState.onMouseLeave(e);
        });

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
    }

    updateCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.round(event.clientX - rect.left);
        const y = Math.round(event.clientY - rect.top);
        this.emit('coordinatesUpdate', { x, y });
    }

    startDrawing(point) {
        this.isDrawing = true;
        this.lastPoint = point;
        this.currentPath = [point];
        this.emit('drawingStart', { point });
    }

    continuDrawing(point) {
        if (!this.isDrawing || !this.lastPoint) return;
        
        this.currentPath.push(point);
        this.emit('drawingContinue', { 
            startPoint: this.lastPoint, 
            endPoint: point,
            path: this.currentPath 
        });
        this.lastPoint = point;
    }

    finishDrawing() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        this.emit('drawingEnd', { path: this.currentPath });
        this.lastPoint = null;
        this.currentPath = [];
    }
}

// Static reference for convenience
DrawingState.Drawing = DrawingStateActive;