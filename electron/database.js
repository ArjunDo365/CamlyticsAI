const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

class Database {
  constructor() {
    this.init();
  }

  async init() {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      console.log("✅ Connected to MySQL database");
      await this.initTables();
    } catch (error) {
      console.error("❌ MySQL connection error:", error);
    }
  }

  async initTables() {
    // -------------------- USER TABLES --------------------
    const createUserRoles = `
      CREATE TABLE IF NOT EXISTS user_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,

  display_order INT DEFAULT NULL,
  status TINYINT DEFAULT 1,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
`;

    const createUsers = `
      CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_role_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,

  display_order INT DEFAULT NULL,
  status TINYINT DEFAULT 1,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_role_id) REFERENCES user_roles(id)
)
    `;

    // -------------------- BLOCK --------------------
    const createBlocks = `
      CREATE TABLE IF NOT EXISTS blocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,

  display_order INT DEFAULT NULL,
  status TINYINT(1) DEFAULT 1 COMMENT '1 = active, 0 = inactive',
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
    `;

    // -------------------- FLOORS --------------------
    const createFloors = `
      CREATE TABLE IF NOT EXISTS floors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  block_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,

  display_order INT DEFAULT NULL,
  status TINYINT(1) DEFAULT 1 COMMENT '1 = active, 0 = inactive',
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE RESTRICT
);

    `;

    // -------------------- LOCATIONS --------------------
    const createLocations = `
      CREATE TABLE IF NOT EXISTS locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  floor_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,

  display_order INT DEFAULT NULL,
  status TINYINT(1) DEFAULT 1 COMMENT '1 = active, 0 = inactive',
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE RESTRICT
)
    `;

    // -------------------- NVR TABLE --------------------
    const createNvrs = `
      CREATE TABLE IF NOT EXISTS nvrs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location_id INT NOT NULL,
  asset_no VARCHAR(100) NOT NULL UNIQUE,
  serial_number VARCHAR(100) UNIQUE,
  model_name VARCHAR(100),
  ip_address VARCHAR(45) NOT NULL,
  manufacturer VARCHAR(100),
  vendor VARCHAR(255),
  install_date DATE,
  last_working_on TIMESTAMP,
  is_working BOOLEAN DEFAULT 0,

  display_order INT DEFAULT NULL,
  status TINYINT(1) DEFAULT 1 COMMENT '1 = active, 0 = inactive',
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT
)
    `;

    // -------------------- CAMERA TABLE --------------------
    const createCameras = `
      CREATE TABLE IF NOT EXISTS cameras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location_id INT NOT NULL,
  nvr_id INT NOT NULL,
  asset_no VARCHAR(100) NOT NULL UNIQUE,
  serial_number VARCHAR(100) UNIQUE,
  model_name VARCHAR(100),
  ip_address VARCHAR(45) NOT NULL,
  port INT DEFAULT 80,
  manufacturer VARCHAR(100),
  vendor VARCHAR(255),
  install_date DATE,
  last_working_on TIMESTAMP,
  is_working BOOLEAN DEFAULT 0,

  display_order INT DEFAULT NULL,
  status TINYINT(1) DEFAULT 1 COMMENT '1 = active, 0 = inactive',
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
  FOREIGN KEY (nvr_id) REFERENCES nvrs(id) ON DELETE RESTRICT
)
    `;

    // ----------------pinginterval------------------------
    const createAppSettingTable = `
  CREATE TABLE IF NOT EXISTS appsetting (
    id INT AUTO_INCREMENT PRIMARY KEY,
    keyname VARCHAR(255) UNIQUE NOT NULL,
    keyvalue VARCHAR(255) NOT NULL,
    display_order INT DEFAULT NULL,
    status TINYINT(1) DEFAULT 0 COMMENT '1 = active, 0 = inactive',
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

    const createlicensetable = `
CREATE TABLE IF NOT EXISTS license (
  id INT AUTO_INCREMENT PRIMARY KEY,
  system_code VARCHAR(255) NOT NULL UNIQUE,
  license_key VARCHAR(255) NOT NULL,
  registered_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

    const createregistrationtable = `
CREATE TABLE IF NOT EXISTS registration (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  mobile VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;


    // ----------------------------------------------------

    const connection = await this.pool.getConnection();
    try {
      // Create all tables
      await connection.query(createUserRoles);
      await connection.query(createUsers);
      await connection.query(createBlocks);
      await connection.query(createFloors);
      await connection.query(createLocations);
      await connection.query(createNvrs);
      await connection.query(createCameras);
      await connection.query(createAppSettingTable);
      await connection.query(createlicensetable);
      await connection.query(createregistrationtable);

      // Default roles
     await connection.query(`
  INSERT IGNORE INTO user_roles (id, name)
  VALUES (1, 'S Admin'), (2, 'Admin')
`);

// // 2️⃣ Check if default admin user already exists
// const [adminExists] = await connection.query(
//   `SELECT * FROM users WHERE email = 'do365@camlytix.ai'`
// );

// // 3️⃣ Insert default admin user if not exists
// if (adminExists.length === 0) {
//   const hashedPassword = bcrypt.hashSync("Ex10sion!#$.",10);
//   const adminpass = bcrypt.hashSync("Login@123",10)

//   await connection.query(
//     `INSERT INTO users (user_role_id, name, email, password)
//      VALUES (?, ?, ?, ?)`,
//     [1, "S Admin", "do365@camlytix.ai", hashedPassword],
//     [2,'Admin','admin@camlytx.ai',adminpass]
//   );

//   console.log("✅ Default admin user created");
// }

// Check if default users exist
const [existingUsers] = await connection.query(
  `SELECT email FROM users WHERE email IN ('do365@camlytix.ai', 'admin@camlytix.ai')`
);

const existingEmails = existingUsers.map(u => u.email);

const usersToInsert = [];

// Insert S Admin user if missing
if (!existingEmails.includes('do365@camlytix.ai')) {
  const hashedPassword = bcrypt.hashSync("Ex10sion!#$.", 10);
  usersToInsert.push([1, "S Admin", "do365@camlytx.ai", hashedPassword]);
}

// Insert Admin user if missing
if (!existingEmails.includes('admin@camlytix.ai')) {
  const adminpass = bcrypt.hashSync("Login@123", 10);
  usersToInsert.push([2, "Admin", "admin@camlytx.ai", adminpass]);
}

// Insert missing users
if (usersToInsert.length > 0) {
  await connection.query(
    `INSERT INTO users (user_role_id, name, email, password)
     VALUES ?`,
    [usersToInsert]
  );

  console.log("✅ Default users created:", usersToInsert.length);
} else {
  console.log("ℹ️ Default users already exist");
}

      const keyName = "Health Check - Frequency in Milliseconds";

      const [rows] = await connection.query(
        "SELECT * FROM appsetting WHERE KeyName = ?",
        [keyName]
      );

      if (rows.length === 0) {
        const defaultValue = 30; // seconds
        await connection.query(
          "INSERT INTO appsetting (KeyName, KeyValue) VALUES (?, ?)",
          [keyName, defaultValue]
        );
        console.log(
          `✅ Default ping interval record created (${defaultValue}s)`
        );
      }
    } finally {
      connection.release();
    }
  }

  // Generic query runner
  async query(sql, params = []) {
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  // Insert/update helper
  async run(sql, params = []) {
    const [result] = await this.pool.query(sql, params);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
  }

  async close() {
    await this.pool.end();
    console.log("🛑 MySQL connection closed");
  }
}

module.exports = Database;
