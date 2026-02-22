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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const url = __importStar(require("url"));
const db_1 = __importDefault(require("./database/db"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
const isDev = process.env.NODE_ENV === 'development';
let mainWindow = null;
async function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        // Make it look modern and frameless if desired
        frame: false,
        // titleBarStyle: 'hiddenInset',
        backgroundColor: '#ffffff',
        icon: path.join(electron_1.app.getAppPath(), 'public/desktop.jpg')
    });
    // Remove the default File/Edit/View menu
    electron_1.Menu.setApplicationMenu(null);
    if (isDev) {
        // Load the Next.js dev server
        mainWindow.loadURL('http://localhost:3000');
        // mainWindow.webContents.openDevTools();
    }
    else {
        // Load the static export in production
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, '../out/index.html'),
            protocol: 'file:',
            slashes: true,
        }));
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    // Window Controls IPCs
    electron_1.ipcMain.handle('window-minimize', () => {
        if (mainWindow)
            mainWindow.minimize();
    });
    electron_1.ipcMain.handle('window-maximize', () => {
        if (mainWindow) {
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            }
            else {
                mainWindow.maximize();
            }
        }
    });
    electron_1.ipcMain.handle('window-close', () => {
        if (mainWindow)
            mainWindow.close();
    });
}
electron_1.app.whenReady().then(async () => {
    try {
        // Connect to MongoDB using the URI from environment or a default local instance
        const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/daddys';
        await (0, db_1.default)(dbUri);
        console.log(`MongoDB connection initialized in Main Process (Current URI: ${dbUri}).`);
        // Register IPC handlers here after DB connects (or load from another file)
        require('./database/handlers');
    }
    catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        electron_1.dialog.showErrorBox('Database Connection Error', 'Could not connect to the database. Ensure MongoDB is running or the URI is correct.');
    }
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
//# sourceMappingURL=main.js.map