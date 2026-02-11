"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const TypingTracker_1 = require("./TypingTracker");
let tracker;
let statusBarItem;
let updateInterval = null;
function activate(context) {
    console.log('TouchFlow Pro Tracker is now active!');
    // Initialize configuration
    const config = vscode.workspace.getConfiguration('touchflow');
    const autoStart = config.get('autoStart') ?? true;
    const idleTimeout = config.get('idleTimeout') ?? 5;
    const updateIntervalMs = config.get('updateInterval') ?? 1000;
    tracker = new TypingTracker_1.TypingTracker(idleTimeout);
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'touchflow.showSummary';
    context.subscriptions.push(statusBarItem);
    if (autoStart) {
        tracker.start();
        statusBarItem.show();
        startUpdateLoop(updateIntervalMs);
    }
    // Register Commands
    context.subscriptions.push(vscode.commands.registerCommand('touchflow.startSession', () => {
        tracker.start();
        statusBarItem.show();
        startUpdateLoop(updateIntervalMs);
        vscode.window.showInformationMessage('TouchFlow: Session Started');
    }), vscode.commands.registerCommand('touchflow.stopSession', () => {
        stopUpdateLoop();
        statusBarItem.hide(); // Or keep showing summary?
        vscode.window.showInformationMessage('TouchFlow: Session Stopped');
    }), vscode.commands.registerCommand('touchflow.resetSession', () => {
        tracker.reset();
        updateStatusBar();
        vscode.window.showInformationMessage('TouchFlow: Session Reset');
    }), vscode.commands.registerCommand('touchflow.toggleSession', () => {
        // Simple toggle via status bar visibility for now, as tracker auto-pauses
        if (updateInterval) {
            vscode.commands.executeCommand('touchflow.stopSession');
        }
        else {
            vscode.commands.executeCommand('touchflow.startSession');
        }
    }), vscode.commands.registerCommand('touchflow.showSummary', () => {
        const metrics = tracker.getMetrics();
        vscode.window.showInformationMessage(`TouchFlow Session: ${metrics.wpm} WPM | ${metrics.accuracy}% Acc | ${formatTime(metrics.sessionDurationSeconds)} active`, 'Reset Session', 'Visit TouchFlow Pro').then(selection => {
            if (selection === 'Reset Session') {
                tracker.reset();
            }
            else if (selection === 'Visit TouchFlow Pro') {
                vscode.env.openExternal(vscode.Uri.parse('https://touchflowpro.com')); // Update with real URL
            }
        });
    }));
    // Listen to text changes
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        // Need to determine if it was a backspace or regular typing
        // contentChanges is an array of changes.
        // If text is empty and rangeLength > 0, it's a deletion.
        if (event.contentChanges.length === 0)
            return;
        const change = event.contentChanges[0];
        const isBackspace = change.text === '' && change.rangeLength > 0;
        // Filter out large pastes or auto-formatting?
        // If text length > 1, assume paste/autocomplete, count as 1 keystroke or ignore?
        // Let's count as 1 action.
        if (change.text.length > 5) {
            // Ignore large pastes
            return;
        }
        tracker.handleActivity(isBackspace);
    }));
    // Configuration change listener
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('touchflow')) {
            const newConfig = vscode.workspace.getConfiguration('touchflow');
            tracker.updateConfiguration(newConfig.get('idleTimeout') ?? 5);
            // Restart loop if interval changed
            const newInterval = newConfig.get('updateInterval') ?? 1000;
            if (updateInterval) {
                stopUpdateLoop();
                startUpdateLoop(newInterval);
            }
        }
    }));
}
function startUpdateLoop(interval) {
    if (updateInterval)
        clearInterval(updateInterval);
    updateStatusBar();
    updateInterval = setInterval(() => {
        updateStatusBar();
    }, interval);
}
function stopUpdateLoop() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}
function updateStatusBar() {
    const metrics = tracker.getMetrics();
    const config = vscode.workspace.getConfiguration('touchflow');
    const showAccuracy = config.get('showAccuracy') ?? true;
    const showTime = config.get('showSessionTime') ?? true;
    const parts = [`⚡ ${metrics.wpm} WPM`];
    if (showAccuracy)
        parts.push(`🎯 ${metrics.accuracy}%`);
    if (showTime)
        parts.push(`⏱ ${formatTime(metrics.sessionDurationSeconds)}`);
    // Add paused indicator if idle
    if (metrics.isPaused && metrics.sessionDurationSeconds > 0) {
        parts.push('(Idle)');
    }
    statusBarItem.text = parts.join('  ');
    statusBarItem.tooltip = `TouchFlow Pro Tracker\nTotal Keystrokes: ${metrics.totalKeystrokes}\nBackspaces: ${metrics.backspaces}`;
}
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}
function deactivate() {
    stopUpdateLoop();
}
//# sourceMappingURL=extension.js.map