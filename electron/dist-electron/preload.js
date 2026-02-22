"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the electron ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electron', {
    invoke: (channel, data) => {
        // Only allow specific channels
        const validChannels = [
            'get-students',
            'add-student',
            'update-student',
            'delete-student',
            'get-fees',
            'add-fee',
            'update-fee',
            'delete-fee',
            'get-transactions',
            'add-transaction',
            'get-tasks',
            'add-task',
            'update-task',
            'delete-task',
            'get-reminders',
            'add-reminder',
            'delete-reminder',
            'get-revenue-stats',
            'get-settings',
            'save-settings',
            'window-minimize',
            'window-maximize',
            'window-close'
        ];
        if (validChannels.includes(channel)) {
            return electron_1.ipcRenderer.invoke(channel, data);
        }
        return Promise.reject(new Error(`Invalid IPC channel: ${channel}`));
    }
});
//# sourceMappingURL=preload.js.map