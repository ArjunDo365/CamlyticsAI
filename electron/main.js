const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

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
    autoHideMenuBar: true, // ✅ hides the menu bar but Alt key shows it temporarily
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Completely remove menu (optional, no Alt key)
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

// ---------------------------
// Database and API handlers
// ---------------------------
const Database = require('./database');
const AuthService = require('./services/auth');
const BlockService = require('./services/block');
const FloorsService = require('./services/floors');
const NvrService = require('./services/nvr');
const CameraService = require('./services/camera');

const db = new Database();
const authService = new AuthService(db);
const blockService = new BlockService(db);
const floorsService = new FloorsService(db);
const nvrService = new NvrService(db);
const cameraService = new CameraService(db)


// ---------------------------
// Auth handlers
// ---------------------------
ipcMain.handle('auth:login', (event, { email, password }) =>
  authService.login(email, password)
);

ipcMain.handle('auth:register', (event, userData) =>
  authService.register(userData)
);

ipcMain.handle('auth:verify-token', (event, token) =>
  authService.verifyToken(token)
);

// ---------------------------
// User handlers
// ---------------------------
ipcMain.handle('users:getAll', () => authService.getAllUsers());
ipcMain.handle('users:create', (event, userData) =>
  authService.createUser(userData)
);
ipcMain.handle('users:update', (event, { id, userData }) =>
  authService.updateUser(id, userData)
);
ipcMain.handle('users:delete', (event, id) => authService.deleteUser(id));

// ---------------------------
// Role handlers
// ---------------------------
ipcMain.handle('roles:getAll', () => authService.getAllRoles());
ipcMain.handle('roles:create', (event, roleData) =>
  authService.createRole(roleData)
);
ipcMain.handle('roles:update', (event, { id, roleData }) =>
  authService.updateRole(id, roleData)
);
ipcMain.handle('roles:delete', (event, id) => authService.deleteRole(id));

// ---------------------------
// Dialog handler
// ---------------------------
ipcMain.handle('dialog:showOpenDialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });
  return result;
});


//block
ipcMain.handle('block:create',async(event,data)=>{
  return await blockService.createBlock(data);
}) 

ipcMain.handle('block:readAll', async () => {
  return await blockService.getAllBlocks();
});

ipcMain.handle('block:readById', async (event,id) => {
  return await blockService.getAllBlocks(id);
});

ipcMain.handle('block:update', async (event,{id,data}) => {
  return await blockService.updateBlock({id,...data});
});

ipcMain.handle('block:delete', async (event, id) => {
  return await blockService.deleteBlock(id);
});


//floors
ipcMain.handle('floors:create',async(event,data)=>{
  return await floorsService.createfloors(data);
}) 

ipcMain.handle('floors:readAll', async () => {
  return await floorsService.getAllFloors();
});

ipcMain.handle('floors:readById', async (event,id) => {
  return await floorsService.getByIdFloors(id);
});

ipcMain.handle('floors:update', async (event,{id,data}) => {
  return await floorsService.updateFloors({id,...data});
});

ipcMain.handle('floors:delete', async (event, id) => {
  return await floorsService.deleteFloors(id);
});


//location
ipcMain.handle('location:create', async (event, data) => {
  return await locationService.createLocation(data);
});

ipcMain.handle('location:readAll', async () => {
  return await locationService.getAllLocation();
});

ipcMain.handle('location:readById', async (event, id) => {
  return await locationService.getByIdLocation(id);
});

ipcMain.handle('location:update', async (event,{id,data}) => {
  return await locationService.updateLocation({id,...data});
});

ipcMain.handle('location:delete', async (event, id) => {
  return await locationService.deleteLocation(id);
});


//nvrs
ipcMain.handle('nvrs:create', async (event, data) => {
  return await nvrService.createNvr(data);
});

ipcMain.handle('nvrs:readAll', async () => {
  return await nvrService.getAllNvrs();
});

ipcMain.handle('nvrs:readById', async (event, id) => {
  return await nvrService.getNvrById(id);
});

ipcMain.handle('nvrs:update', async (event,{id,data}) => {
  return await nvrService.updateNvr({id,...data});
});

ipcMain.handle('nvrs:delete', async (event, id) => {
  return await nvrService.deleteNvr(id);
});


//cameras
ipcMain.handle('camera:create', async (event, data) => {
  return await cameraService.createCamera(data);
});

ipcMain.handle('camera:readAll', async () => {
  return await cameraService.getAllCameras();
});

ipcMain.handle('camera:readById', async (event, id) => {
  return await cameraService.getCameraById(id);
});

ipcMain.handle('camera:update', async (event,{id,data}) => {
  return await cameraService.updateCamera({id,...data});
});

ipcMain.handle('camera:delete', async (event, id) => {
  return await cameraService.deleteCamera(id);
});

