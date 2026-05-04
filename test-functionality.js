/**
 * Node.js test for drawing app functionality
 * Tests patterns without requiring browser environment
 */

import { EventEmitter } from './js/EventEmitter.js';
import { StrategyFactory } from './js/DrawingStrategies.js';
import { CommandHistory } from './js/CommandHistory.js';

console.log('🧪 Testing Drawing App Patterns...\n');

// Test 1: Observer Pattern (EventEmitter)
console.log('1. Testing Observer Pattern (EventEmitter)');
try {
    const emitter = new EventEmitter();
    let eventReceived = false;
    let eventData = null;

    const unsubscribe = emitter.on('test-event', (data) => {
        eventReceived = true;
        eventData = data;
    });

    emitter.emit('test-event', { message: 'Hello, Observer!' });
    
    console.log(`   ✅ Event emission: ${eventReceived ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Event data: ${eventData?.message === 'Hello, Observer!' ? 'PASS' : 'FAIL'}`);
    
    unsubscribe();
    eventReceived = false;
    emitter.emit('test-event', { message: 'Should not receive' });
    
    console.log(`   ✅ Unsubscribe: ${!eventReceived ? 'PASS' : 'FAIL'}`);
    
} catch (error) {
    console.log(`   ❌ Observer Pattern failed: ${error.message}`);
}

// Test 2: Strategy Pattern (Drawing Tools)
console.log('\n2. Testing Strategy Pattern (Drawing Tools)');
try {
    const availableStrategies = StrategyFactory.getAvailableStrategies();
    console.log(`   📋 Available strategies: ${availableStrategies.join(', ')}`);
    
    let allStrategiesWork = true;
    availableStrategies.forEach(strategyName => {
        try {
            const strategy = StrategyFactory.create(strategyName);
            console.log(`   ✅ ${strategyName} strategy: CREATED`);
        } catch (error) {
            console.log(`   ❌ ${strategyName} strategy: FAILED - ${error.message}`);
            allStrategiesWork = false;
        }
    });
    
    console.log(`   🎯 All strategies: ${allStrategiesWork ? 'PASS' : 'FAIL'}`);
    
    // Test invalid strategy
    try {
        StrategyFactory.create('nonexistent');
        console.log('   ❌ Error handling: FAIL (should have thrown error)');
    } catch (error) {
        console.log('   ✅ Error handling: PASS (correctly rejected invalid strategy)');
    }
    
} catch (error) {
    console.log(`   ❌ Strategy Pattern failed: ${error.message}`);
}

// Test 3: Command Pattern (History Management)
console.log('\n3. Testing Command Pattern (History Management)');
try {
    const history = new CommandHistory(10); // Small limit for testing
    
    console.log(`   ✅ Initial state - Can undo: ${!history.canUndo() ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Initial state - Can redo: ${!history.canRedo() ? 'PASS' : 'FAIL'}`);
    
    // Mock command for testing
    class MockCommand {
        constructor(id) {
            this.id = id;
            this.executed = false;
        }
        execute() { this.executed = true; }
        undo() { this.executed = false; }
        redo() { this.executed = true; }
        getMemoryUsage() { return { before: 100, after: 100, total: 200 }; }
    }
    
    const cmd1 = new MockCommand('test1');
    history.executeCommand(cmd1);
    
    console.log(`   ✅ Command execution: ${cmd1.executed ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Can undo after command: ${history.canUndo() ? 'PASS' : 'FAIL'}`);
    
    history.undo();
    console.log(`   ✅ Undo functionality: ${!cmd1.executed ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Can redo after undo: ${history.canRedo() ? 'PASS' : 'FAIL'}`);
    
    history.redo();
    console.log(`   ✅ Redo functionality: ${cmd1.executed ? 'PASS' : 'FAIL'}`);
    
    const stats = history.getStats();
    console.log(`   📊 History stats: ${stats.totalCommands} commands, ${stats.memoryUsageMB}MB used`);
    
} catch (error) {
    console.log(`   ❌ Command Pattern failed: ${error.message}`);
}

console.log('\n🎉 Pattern testing complete!');
console.log('\n📂 Project Structure:');
console.log('   index.html     - Main drawing app');
console.log('   test.html      - Interactive test suite');
console.log('   styles.css     - Complete styling');
console.log('   js/            - Modular JavaScript with GoF patterns');
console.log('   README.md      - Complete documentation');

console.log('\n🌐 Server running at: http://localhost:8080/');
console.log('   Main app: http://localhost:8080/index.html');
console.log('   Tests: http://localhost:8080/test.html');