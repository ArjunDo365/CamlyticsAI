const path = require('path');
const fs = require("fs");

function getEnvPath() {
  // Running inside packaged build (AppImage, EXE, DMG)
  if (process.resourcesPath) {
    const prodEnv = path.join(process.resourcesPath, ".env");

    console.log("🔍 Searching for production .env at:", prodEnv);

    if (fs.existsSync(prodEnv)) {
      console.log("✅ Loaded .env from:", prodEnv);
      return prodEnv;
    } else {
      console.log("❌ .env NOT found in production resources.");
    }
  }

  // Dev mode fallback
  const devEnv = path.join(process.cwd(), ".env");
  console.log("🔍 Loaded DEV .env from:", devEnv);
  return devEnv;
}

require("dotenv").config({ path: getEnvPath() });

const { app, BrowserWindow, ipcMain, dialog } = require('electron');


const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    show: false,
    autoHideMenuBar: true,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.setMenu(null);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


// -----------------------------------------------------
//  SERVICES & DATABASE (NO MORE CIRCULAR DEPENDENCIES)
// -----------------------------------------------------
const Database = require('./database');
const AuthService = require('./services/auth');
const BlockService = require('./services/block');
const NvrService = require('./services/nvr');
const CameraService = require('./services/camera');
const LocationService = require('./services/location');
const FloorsService = require('./services/floors');
const PingService = require('./services/ping');
const AppsettingService = require('./services/appsettings');

const db = new Database();

const authService = new AuthService(db);
const blockService = new BlockService(db);
const floorsService = new FloorsService(db);
const locationService = new LocationService(db);
const nvrService = new NvrService(db);
const cameraService = new CameraService(db);

// Create both services WITHOUT linking yet
const appsettingService = new AppsettingService(db);
const pingService = new PingService(db,appsettingService);

// Start Ping Scheduler
pingService.startPingScheduler();


// -----------------------------------------------------
//  AUTH
// -----------------------------------------------------
ipcMain.handle('auth:login', (event, { email, password }) =>
  authService.login(email, password)
);

ipcMain.handle('auth:register', (event, userData) =>
  authService.register(userData)
);

ipcMain.handle('auth:verify-token', (event, token) =>
  authService.verifyToken(token)
);


// -----------------------------------------------------
//  USERS
// -----------------------------------------------------
ipcMain.handle('users:getAll', () => authService.getAllUsers());
ipcMain.handle('users:create', (event, userData) =>
  authService.createUser(userData)
);
ipcMain.handle('users:update', (event, { id, userData }) =>
  authService.updateUser(id, userData)
);
ipcMain.handle('users:delete', (event, id) =>
  authService.deleteUser(id)
);


// -----------------------------------------------------
//  ROLES
// -----------------------------------------------------
ipcMain.handle('roles:getAll', () => authService.getAllRoles());
ipcMain.handle('roles:create', (event, roleData) =>
  authService.createRole(roleData)
);
ipcMain.handle('roles:update', (event, { id, roleData }) =>
  authService.updateRole(id, roleData)
);
ipcMain.handle('roles:delete', (event, id) =>
  authService.deleteRole(id)
);


// -----------------------------------------------------
//  BLOCKS
// -----------------------------------------------------
ipcMain.handle('block:create', async (event, data) => {
  return await blockService.createBlock({ ...data });
});

ipcMain.handle('block:readAll', async () => {
  return await blockService.getAllBlocks();
});

ipcMain.handle('block:readById', async (event, id) => {
  return await blockService.getAllBlocks(id);
});

ipcMain.handle('block:update', async (event, { id, data }) => {
  return await blockService.updateBlock({ id, ...data });
});

ipcMain.handle('block:delete', async (event, id) => {
  return await blockService.deleteBlock(id);
});


// -----------------------------------------------------
//  FLOORS
// -----------------------------------------------------
ipcMain.handle('floors:create', async (event, data) => {
  return await floorsService.createFloors(data);
});

ipcMain.handle('floors:readAll', async () => {
  return await floorsService.getAllFloors();
});

ipcMain.handle('floors:readById', async (event, id) => {
  return await floorsService.getByIdFloors(id);
});

ipcMain.handle('floors:update', async (event, { id, data }) => {
  return await floorsService.updateFloors({ id, ...data });
});

ipcMain.handle('floors:delete', async (event, id) => {
  return await floorsService.deleteFloors(id);
});


// -----------------------------------------------------
//  LOCATION
// -----------------------------------------------------
ipcMain.handle('location:create', async (event, data) => {
  return await locationService.createLocation(data);
});

ipcMain.handle('location:readAll', async () => {
  return await locationService.getAllLocation();
});

ipcMain.handle('location:readById', async (event, id) => {
  return await locationService.getByIdLocation(id);
});

ipcMain.handle('location:update', async (event, { id, data }) => {
  return await locationService.updateLocation({ id, ...data });
});

ipcMain.handle('location:delete', async (event, id) => {
  return await locationService.deleteLocation(id);
});


// -----------------------------------------------------
//  NVRS
// -----------------------------------------------------
ipcMain.handle('nvrs:create', async (event, data) => {
  return await nvrService.createNvr(data);
});

ipcMain.handle('nvrs:readAll', async () => {
  return await nvrService.getAllNvrs();
});

ipcMain.handle('nvrs:readById', async (event, id) => {
  return await nvrService.getNvrById(id);
});

ipcMain.handle('nvrs:update', async (event, { id, data }) => {
  return await nvrService.updateNvr({ id, ...data });
});

ipcMain.handle('nvrs:delete', async (event, id) => {
  return await nvrService.deleteNvr(id);
});


// -----------------------------------------------------
//  CAMERAS
// -----------------------------------------------------
ipcMain.handle('cameras:create', async (event, data) => {
  return await cameraService.createCamera(data);
});

ipcMain.handle('cameras:readAll', async () => {
  return await cameraService.getAllCameras();
});

ipcMain.handle('cameras:readById', async (event, id) => {
  return await cameraService.getCameraById(id);
});

ipcMain.handle('cameras:update', async (event, { id, data }) => {
  return await cameraService.updateCamera({ id, ...data });
});

ipcMain.handle('cameras:delete', async (event, id) => {
  return await cameraService.deleteCamera(id);
});


// -----------------------------------------------------
//  APP SETTINGS
// -----------------------------------------------------
ipcMain.handle('appsetting:listAppSettingsdata', async () => {
  return await appsettingService.listAppSettings();
});

ipcMain.handle('appsetting:getPingIntervaldata', async () => {
  return await appsettingService.getPingInterval();
});




// -----------------------------------------------------
//  PING
// -----------------------------------------------------
ipcMain.handle('ping:manual', async () => {
  return await pingService.manualPingTrigger();
});

ipcMain.handle('ping:updateInterval', async (event, data) => {
  return await pingService.updatePingInterval(data);
});

ipcMain.handle('ping:nvrcameracount', async () => {
  return await pingService.nvrcamerasummary();
});

ipcMain.handle('ping:notworkingdata', async () => {
  return await pingService.notworkinglist();
});

ipcMain.handle('ping:updatePingIntervaldata', async (event, data) => {
  return await pingService.updatePingInterval(data);
});

ipcMain.handle('ping:getCamerasAndNVRsdata', async () => {
  return await pingService.getCamerasAndNVRs();
});

ipcMain.handle("ping:downloadNotWorkingExcel", async (event, type) => {
  return await pingService.downloadNotWorkingExcel(type);
});

