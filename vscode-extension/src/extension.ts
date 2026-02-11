import * as vscode from 'vscode';
import { TypingTracker } from './TypingTracker';

let tracker: TypingTracker;
let statusBarItem: vscode.StatusBarItem;
let updateInterval: NodeJS.Timeout | null = null;

export function activate(context: vscode.ExtensionContext) {
    console.log('TouchFlow Pro Tracker is now active!');

    // Initialize configuration
    const config = vscode.workspace.getConfiguration('touchflow');
    const autoStart = config.get<boolean>('autoStart') ?? true;
    const idleTimeout = config.get<number>('idleTimeout') ?? 5;
    const updateIntervalMs = config.get<number>('updateInterval') ?? 1000;

    tracker = new TypingTracker(idleTimeout);

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
    context.subscriptions.push(
        vscode.commands.registerCommand('touchflow.startSession', () => {
            tracker.start();
            statusBarItem.show();
            startUpdateLoop(updateIntervalMs);
            vscode.window.showInformationMessage('TouchFlow: Session Started');
        }),
        vscode.commands.registerCommand('touchflow.stopSession', () => {
            stopUpdateLoop();
            statusBarItem.hide(); // Or keep showing summary?
            vscode.window.showInformationMessage('TouchFlow: Session Stopped');
        }),
        vscode.commands.registerCommand('touchflow.resetSession', () => {
            tracker.reset();
            updateStatusBar();
            vscode.window.showInformationMessage('TouchFlow: Session Reset');
        }),
        vscode.commands.registerCommand('touchflow.toggleSession', () => {
            // Simple toggle via status bar visibility for now, as tracker auto-pauses
            if (updateInterval) {
                vscode.commands.executeCommand('touchflow.stopSession');
            } else {
                vscode.commands.executeCommand('touchflow.startSession');
            }
        }),
        vscode.commands.registerCommand('touchflow.showSummary', () => {
            const metrics = tracker.getMetrics();
            vscode.window.showInformationMessage(
                `TouchFlow Session: ${metrics.wpm} WPM | ${metrics.accuracy}% Acc | ${formatTime(metrics.sessionDurationSeconds)} active`,
                'Reset Session', 'Visit TouchFlow Pro'
            ).then(selection => {
                if (selection === 'Reset Session') {
                    tracker.reset();
                } else if (selection === 'Visit TouchFlow Pro') {
                    vscode.env.openExternal(vscode.Uri.parse('https://touchflowpro.com')); // Update with real URL
                }
            });
        })
    );

    // Listen to text changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            // Need to determine if it was a backspace or regular typing
            // contentChanges is an array of changes.
            // If text is empty and rangeLength > 0, it's a deletion.

            if (event.contentChanges.length === 0) return;

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
        })
    );

    // Configuration change listener
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('touchflow')) {
                const newConfig = vscode.workspace.getConfiguration('touchflow');
                tracker.updateConfiguration(newConfig.get<number>('idleTimeout') ?? 5);
                // Restart loop if interval changed
                const newInterval = newConfig.get<number>('updateInterval') ?? 1000;
                if (updateInterval) {
                    stopUpdateLoop();
                    startUpdateLoop(newInterval);
                }
            }
        })
    );
}

function startUpdateLoop(interval: number) {
    if (updateInterval) clearInterval(updateInterval);
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
    const showAccuracy = config.get<boolean>('showAccuracy') ?? true;
    const showTime = config.get<boolean>('showSessionTime') ?? true;

    const parts = [`⚡ ${metrics.wpm} WPM`];
    if (showAccuracy) parts.push(`🎯 ${metrics.accuracy}%`);
    if (showTime) parts.push(`⏱ ${formatTime(metrics.sessionDurationSeconds)}`);

    // Add paused indicator if idle
    if (metrics.isPaused && metrics.sessionDurationSeconds > 0) {
        parts.push('(Idle)');
    }

    statusBarItem.text = parts.join('  ');
    statusBarItem.tooltip = `TouchFlow Pro Tracker\nTotal Keystrokes: ${metrics.totalKeystrokes}\nBackspaces: ${metrics.backspaces}`;
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export function deactivate() {
    stopUpdateLoop();
}
