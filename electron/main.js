const path = require('path');
const fs = require("fs");

/* ------------------------------------------
   ENV HANDLING (DEV + PROD)
------------------------------------------- */
function getEnvPath() {
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
  const devEnv = path.join(process.cwd(), ".env");
  console.log("🔍 Loaded DEV .env from:", devEnv);
  return devEnv;
}

require("dotenv").config({ path: getEnvPath() });

/* ------------------------------------------
   ELECTRON IMPORTS
------------------------------------------- */
const { app, BrowserWindow, ipcMain, dialog, session } = require('electron');

/* ------------------------------------------
   DEV MODE CHECK
------------------------------------------- */
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

/* ------------------------------------------
   CREATE WINDOW
------------------------------------------- */
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

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.setMenu(null);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/* ------------------------------------------
   CLEAR CACHE COMPLETELY BEFORE LAUNCH
------------------------------------------- */
app.whenReady().then(async () => {
  const ses = session.defaultSession;

  console.log("🧹 Clearing Electron cache and storage...");

  try {
    await ses.clearCache();
    await ses.clearStorageData({
      storages: [
        "appcache",
        "cookies",
        "filesystem",
        "indexdb",
        "localstorage",
        "shadercache",
        "websql",
        "serviceworkers"
      ],
      quotas: ["temporary", "persistent", "syncable"]
    });

    console.log("🔥 Cache cleared successfully!");
  } catch (err) {
    console.error("Cache clear error:", err);
  }

  createWindow();
});

/* ------------------------------------------
   APP EVENTS
------------------------------------------- */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/* ------------------------------------------
   DATABASE + SERVICES
------------------------------------------- */
const Database = require('./database');
const AuthService = require('./services/auth');
const BlockService = require('./services/block');
const NvrService = require('./services/nvr');
const CameraService = require('./services/camera');
const LocationService = require('./services/location');
const FloorsService = require('./services/floors');
const PingService = require('./services/ping');
const AppsettingService = require('./services/appsettings');
const LicenseService = require('./services/license');

const db = new Database();

const authService = new AuthService(db);
const blockService = new BlockService(db);
const floorsService = new FloorsService(db);
const locationService = new LocationService(db);
const nvrService = new NvrService(db);
const cameraService = new CameraService(db);
const appsettingService = new AppsettingService(db);
const licenseService = new LicenseService(db)

const pingService = new PingService(db, appsettingService);

// Start Ping Scheduler
pingService.startPingScheduler();

/* ------------------------------------------
   IPC HANDLERS
------------------------------------------- */

// AUTH
ipcMain.handle('auth:login', (event, { email, password }) =>
  authService.login(email, password)
);
ipcMain.handle('auth:register', (event, userData) =>
  authService.registerLicense(userData)
);
ipcMain.handle('auth:verify-token', (event, token) =>
  authService.verifyToken(token)
);

ipcMain.handle('auth:isRegistered', async () => {
  try {
    const result = await authService.isRegistered();
    return result;
  } catch (err) {
    console.error('Error in auth:isRegistered:', err);
    return { registered: false, total: 0, success: false, error: err.message };
  }
});

ipcMain.handle('auth:isLicensed', async () => {
  try {
    const result = await authService.isLicensed();
    return result;
  } catch (err) {
    console.error('Error in auth:isLicensed:', err);
    return { registered: false, total: 0, success: false, error: err.message };
  }
});

// USERS
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

// ROLES
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

// BLOCKS
ipcMain.handle('block:create', (event, data) =>
  blockService.createBlock({ ...data })
);
ipcMain.handle('block:readAll', () => blockService.getAllBlocks());
ipcMain.handle('block:readById', (event, id) =>
  blockService.getAllBlocks(id)
);
ipcMain.handle('block:update', (event, { id, data }) =>
  blockService.updateBlock({ id, ...data })
);
ipcMain.handle('block:delete', (event, id) =>
  blockService.deleteBlock(id)
);

// FLOORS
ipcMain.handle('floors:create', (event, data) =>
  floorsService.createFloors(data)
);
ipcMain.handle('floors:readAll', () => floorsService.getAllFloors());
ipcMain.handle('floors:readById', (event, id) =>
  floorsService.getByIdFloors(id)
);
ipcMain.handle('floors:update', (event, { id, data }) =>
  floorsService.updateFloors({ id, ...data })
);
ipcMain.handle('floors:delete', (event, id) =>
  floorsService.deleteFloors(id)
);

// LOCATION
ipcMain.handle('location:create', (event, data) =>
  locationService.createLocation(data)
);
ipcMain.handle('location:readAll', () =>
  locationService.getAllLocation()
);
ipcMain.handle('location:readById', (event, id) =>
  locationService.getByIdLocation(id)
);
ipcMain.handle('location:update', (event, { id, data }) =>
  locationService.updateLocation({ id, ...data })
);
ipcMain.handle('location:delete', (event, id) =>
  locationService.deleteLocation(id)
);

// NVRS
ipcMain.handle('nvrs:create', (event, data) =>
  nvrService.createNvr(data)
);
ipcMain.handle('nvrs:readAll', () =>
  nvrService.getAllNvrs()
);
ipcMain.handle('nvrs:readById', (event, id) =>
  nvrService.getNvrById(id)
);
ipcMain.handle('nvrs:update', (event, { id, data }) =>
  nvrService.updateNvr({ id, ...data })
);
ipcMain.handle('nvrs:delete', (event, id) =>
  nvrService.deleteNvr(id)
);

// CAMERAS
ipcMain.handle('cameras:create', (event, data) =>
  cameraService.createCamera(data)
);
ipcMain.handle('cameras:readAll', () =>
  cameraService.getAllCameras()
);
ipcMain.handle('cameras:readById', (event, id) =>
  cameraService.getCameraById(id)
);
ipcMain.handle('cameras:update', (event, { id, data }) =>
  cameraService.updateCamera({ id, ...data })
);
ipcMain.handle('cameras:delete', (event, id) =>
  cameraService.deleteCamera(id)
);

// APP SETTINGS
ipcMain.handle('appsetting:listAppSettingsdata', () =>
  appsettingService.listAppSettings()
);
ipcMain.handle('appsetting:getPingIntervaldata', () =>
  appsettingService.getPingInterval()
);

// PING
ipcMain.handle('ping:manual', () =>
  pingService.manualPingTrigger()
);
ipcMain.handle('ping:updateInterval', (event, data) =>
  pingService.updatePingInterval(data)
);
ipcMain.handle('ping:nvrcameracount', () =>
  pingService.nvrcamerasummary()
);
ipcMain.handle('ping:notworkingdata', () =>
  pingService.notworkinglist()
);
ipcMain.handle('ping:updatePingIntervaldata', (event, data) =>
  pingService.updatePingInterval(data)
);
ipcMain.handle('ping:getCamerasAndNVRsdata', () =>
  pingService.getCamerasAndNVRs()
);
ipcMain.handle("ping:downloadNotWorkingCSVdata", (event, type) =>
  pingService.downloadNotWorkingCSV(type)
);

ipcMain.on("open-file-location", (event, filePath) => {
  shell.showItemInFolder(filePath); 
});

// ---------------------------
// LICENSE HANDLERS
// ---------------------------
ipcMain.handle('get-hdd-serial', async () => {
  return await licenseService.getHddSerial();
});

ipcMain.handle('insertlicense', (event, userData) =>
  licenseService.InsertLicense(userData)
);

ipcMain.handle('generate-hmc', async (event, { registered_id, hddSerial }) =>
  licenseService.generateHmcKey(registered_id, hddSerial)
);
