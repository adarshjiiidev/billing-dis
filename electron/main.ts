import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import * as url from 'url';
import connectDB from './database/db';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
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
    icon: path.join(app.getAppPath(), 'public/desktop.jpg')
  });

  // Remove the default File/Edit/View menu
  Menu.setApplicationMenu(null);

  if (isDev) {
    // Load the Next.js dev server
    mainWindow.loadURL('http://localhost:3000');
    // mainWindow.webContents.openDevTools();
  } else {
    // Load the static export in production
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../out/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Window Controls IPCs
  ipcMain.handle('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });
  ipcMain.handle('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });
  ipcMain.handle('window-close', () => {
    if (mainWindow) mainWindow.close();
  });
}

app.whenReady().then(async () => {
  try {
    // Connect to MongoDB using the URI from environment or a default local instance
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/daddys';
    await connectDB(dbUri);
    console.log(`MongoDB connection initialized in Main Process (Current URI: ${dbUri}).`);

    // Register IPC handlers here after DB connects (or load from another file)
    require('./database/handlers');

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    dialog.showErrorBox('Database Connection Error', 'Could not connect to the database. Ensure MongoDB is running or the URI is correct.');
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
