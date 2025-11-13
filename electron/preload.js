const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Auth methods
  login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
  register: (userData) => ipcRenderer.invoke('auth:register', userData),
  verifyToken: (token) => ipcRenderer.invoke('auth:verify-token', token),
  
  // User methods
  getAllUsers: () => ipcRenderer.invoke('users:getAll'),
  createUser: (userData) => ipcRenderer.invoke('users:create', userData),
  updateUser: (id, userData) => ipcRenderer.invoke('users:update', { id, userData }),
  deleteUser: (id) => ipcRenderer.invoke('users:delete', id),
  
  // Role methods
  getAllRoles: () => ipcRenderer.invoke('roles:getAll'),
  createRole: (roleData) => ipcRenderer.invoke('roles:create', roleData),
  updateRole: (id, roleData) => ipcRenderer.invoke('roles:update', { id, roleData }),
  deleteRole: (id) => ipcRenderer.invoke('roles:delete', id),
  
  // Dialog methods
  showOpenDialog: () => ipcRenderer.invoke('dialog:showOpenDialog'),

  //block
  createBlock: (data) => ipcRenderer.invoke('block:create', data),
  getAllBlocks: () => ipcRenderer.invoke('block:readAll'),
  getByIdBlocks: (id) => ipcRenderer.invoke('block:readById',id),
  updateBlock: (data) => ipcRenderer.invoke('block:update', data),
  deleteBlock: (id) => ipcRenderer.invoke('block:delete', id),

  //floors
  createFloors: (data) => ipcRenderer.invoke('floors:create', data),
  getAllFloors: () => ipcRenderer.invoke('floors:readAll'),
  getByIdFloors: (id) => ipcRenderer.invoke('floors:readById',id),
  updateFloors: (data) => ipcRenderer.invoke('floors:update', data),
  deleteFloors: (id) => ipcRenderer.invoke('floors:delete', id),

  //location
  createLocation: (data) => ipcRenderer.invoke('location:create', data),
  getAllLocation: () => ipcRenderer.invoke('location:readAll'),
  getByIdLocation: (id) => ipcRenderer.invoke('location:readById', id),
  updateLocation: (data) => ipcRenderer.invoke('location:update', data),
  deleteLocation: (id) => ipcRenderer.invoke('location:delete', id),
});