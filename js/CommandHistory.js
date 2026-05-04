/**
 * Command Pattern - History Management
 * Manages undo/redo functionality with memory optimization
 */

import { EventEmitter } from './EventEmitter.js';
import { NullCommand } from './Command.js';

export class CommandHistory extends EventEmitter {
    constructor(maxCommands = 50) {
        super();
        this.commands = [];
        this.currentIndex = -1;
        this.maxCommands = maxCommands;
        this.totalMemoryUsage = 0;
        this.maxMemoryUsage = 50 * 1024 * 1024; // 50MB limit
    }

    /**
     * Execute and store a command
     * @param {DrawingCommand} command - Command to execute
     */
    executeCommand(command) {
        try {
            // Execute the command
            command.execute();
            
            // Remove any commands after current position (new branch)
            this.commands = this.commands.slice(0, this.currentIndex + 1);
            
            // Add new command
            this.commands.push(command);
            this.currentIndex++;
            
            // Optimize memory usage
            this.optimizeMemory();
            
            // Notify listeners
            this.emit('commandExecuted', {
                command,
                canUndo: this.canUndo(),
                canRedo: this.canRedo(),
                historySize: this.commands.length
            });
            
        } catch (error) {
            console.error('Error executing command:', error);
            this.emit('commandError', { error, command });
        }
    }

    /**
     * Undo last command
     */
    undo() {
        if (!this.canUndo()) return false;
        
        const command = this.commands[this.currentIndex];
        try {
            command.undo();
            this.currentIndex--;
            
            this.emit('commandUndone', {
                command,
                canUndo: this.canUndo(),
                canRedo: this.canRedo()
            });
            
            return true;
        } catch (error) {
            console.error('Error undoing command:', error);
            this.emit('commandError', { error, command });
            return false;
        }
    }

    /**
     * Redo next command
     */
    redo() {
        if (!this.canRedo()) return false;
        
        this.currentIndex++;
        const command = this.commands[this.currentIndex];
        
        try {
            command.redo();
            
            this.emit('commandRedone', {
                command,
                canUndo: this.canUndo(),
                canRedo: this.canRedo()
            });
            
            return true;
        } catch (error) {
            console.error('Error redoing command:', error);
            this.currentIndex--; // Revert index on error
            this.emit('commandError', { error, command });
            return false;
        }
    }

    /**
     * Check if undo is possible
     */
    canUndo() {
        return this.currentIndex >= 0;
    }

    /**
     * Check if redo is possible
     */
    canRedo() {
        return this.currentIndex < this.commands.length - 1;
    }

    /**
     * Clear all history
     */
    clear() {
        this.commands = [];
        this.currentIndex = -1;
        this.totalMemoryUsage = 0;
        
        this.emit('historyCleared', {
            canUndo: false,
            canRedo: false
        });
    }

    /**
     * Optimize memory usage by removing old commands
     */
    optimizeMemory() {
        // Calculate total memory usage
        this.totalMemoryUsage = this.commands.reduce((total, cmd) => {
            return total + cmd.getMemoryUsage().total;
        }, 0);

        // Remove oldest commands if we exceed limits
        while ((this.commands.length > this.maxCommands || 
                this.totalMemoryUsage > this.maxMemoryUsage) && 
               this.commands.length > 0) {
            
            const removedCommand = this.commands.shift();
            this.currentIndex--;
            this.totalMemoryUsage -= removedCommand.getMemoryUsage().total;
        }

        // Ensure currentIndex doesn't go negative
        this.currentIndex = Math.max(-1, this.currentIndex);

        this.emit('memoryOptimized', {
            commandCount: this.commands.length,
            memoryUsage: this.totalMemoryUsage,
            memoryUsageMB: (this.totalMemoryUsage / (1024 * 1024)).toFixed(2)
        });
    }

    /**
     * Get history statistics
     */
    getStats() {
        return {
            totalCommands: this.commands.length,
            currentIndex: this.currentIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            memoryUsage: this.totalMemoryUsage,
            memoryUsageMB: (this.totalMemoryUsage / (1024 * 1024)).toFixed(2),
            maxCommands: this.maxCommands
        };
    }
}