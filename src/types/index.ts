export interface User {
  id: number;
  name: string;
  email: string;
  role_name: string;
  role_id: number;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: number;
  name: string;
  created_at: string;
}

export interface FileRecord {
  id: number;
  user_id: number;
  original_name: string;
  file_path: string;
  output_path?: string;
  extracted_text?: string;
  processing_status: "pending" | "processing" | "completed" | "error";
  upload_time: string;
  processed_at?: string;
  user_name: string;
  user_email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Section {
  id: number;
  name: string;
  floor_id: number;
  description: string;
  display_order: number;
}

export interface Floor {
  id: number;
  name: string;
  block_id: number;
  description: string;
  display_order?: number;
}

export interface Block {
  id: number;
  name: string;
  description: string;
  display_order: number;
}

export interface Nvr {
  id: number;
  location_id: number;
  asset_no: string;
  serial_number: string;
  model_name: string;
  ip_address: string;
  manufacturer: string;
  vendor: string;
  install_date: string;
  // last_working_on?:string;
  // is_working?:string;
}

declare global {
  interface Window {
    electronAPI: {
      // Auth methods
      login: (credentials: { email: string; password: string }) => Promise<any>;
      register: (userData: any) => Promise<any>;
      verifyToken: (token: string) => Promise<any>;

      // User methods
      getAllUsers: () => Promise<any>;
      createUser: (userData: any) => Promise<any>;
      updateUser: (id: number, userData: any) => Promise<any>;
      deleteUser: (id: number) => Promise<any>;

      // Role methods
      getAllRoles: () => Promise<any>;
      createRole: (roleData: any) => Promise<any>;
      updateRole: (id: number, roleData: any) => Promise<any>;
      deleteRole: (id: number) => Promise<any>;

      // File methods
      uploadFile: (fileData: any) => Promise<any>;
      getAllFiles: () => Promise<any>;
      getUserFiles: (userId: number) => Promise<any>;

      // Dialog methods
      showOpenDialog: () => Promise<any>;

      //block methods
      getAllBlocks: () => Promise<any>;
      createBlock: (data: any) => Promise<any>;
      getByIdBlocks: (id: number) => Promise<any>;
      updateBlock: (id: number, data: any) => Promise<any>;
      deleteBlock: (id: number) => Promise<any>;

      //floor methods
      getAllFloors: () => Promise<any>;
      createFloors: (data: any) => Promise<any>;
      getByIdFloors: (id: number) => Promise<any>;
      updateFloors: (id: number, data: any) => Promise<any>;
      deleteFloors: (id: number) => Promise<any>;

      //section methods
      getAllLocation: () => Promise<any>;
      createLocation: (data: any) => Promise<any>;
      getByIdLocation: (id: number) => Promise<any>;
      updateLocation: (id: number, data: any) => Promise<any>;
      deleteLocation: (id: number) => Promise<any>;

      //Nvr methods
      getAllNvrs: () => Promise<any>;
      createNvr: (data: any) => Promise<any>;
      getNvrById: (id: number) => Promise<any>;
      updateNvr: (id: number, data: any) => Promise<any>;
      deleteNvr: (id: number) => Promise<any>;

      //camera methods
      getAllCameras: () => Promise<any>;
      createCamera: (data: any) => Promise<any>;
      getCameraById: (id: number) => Promise<any>;
      updateCamera: (id: number, data: any) => Promise<any>;
      deleteCamera: (id: number) => Promise<any>;
    };
  }
}
