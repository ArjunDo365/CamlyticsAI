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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createUsers = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_role_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_role_id) REFERENCES user_roles(id)
      )
    `;

    // -------------------- BLOCK --------------------
    const createBlocks = `
      CREATE TABLE IF NOT EXISTS blocks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        display_order INT UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    // -------------------- FLOORS --------------------
    const createFloors = `
      CREATE TABLE IF NOT EXISTS floors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        display_order INT UNIQUE,
        block_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE
      )
    `;

    // -------------------- LOCATIONS --------------------
    const createLocations = `
      CREATE TABLE IF NOT EXISTS locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        display_order INT UNIQUE,
        floor_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
      )
    `;

    // -------------------- NVR TABLE --------------------
    const createNvrs = `
      CREATE TABLE IF NOT EXISTS nvrs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        location_id INT NOT NULL,
        asset_no VARCHAR(100) NOT NULL,
        serial_number VARCHAR(100),
        model_name VARCHAR(100),
        ip_address VARCHAR(45) NOT NULL,
        manufacturer VARCHAR(100),
        vendor VARCHAR(255),
        install_date DATE,
        last_working_on DATE,
        is_working ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
      )
    `;

    // -------------------- CAMERA TABLE --------------------
    const createCameras = `
      CREATE TABLE IF NOT EXISTS cameras (
        id INT AUTO_INCREMENT PRIMARY KEY,
        location_id INT NOT NULL,
        nvr_id INT NOT NULL,
        asset_no VARCHAR(100) NOT NULL,
        serial_number VARCHAR(100),
        model_name VARCHAR(100),
        ip_address VARCHAR(45) NOT NULL,
        port INT DEFAULT 80,
        manufacturer VARCHAR(100),
        vendor VARCHAR(255),
        install_date DATE,
        last_working_on DATE,
        is_working ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
        FOREIGN KEY (nvr_id) REFERENCES nvrs(id) ON DELETE CASCADE
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

      // Default roles
      await connection.query(`
        INSERT IGNORE INTO user_roles (id, name)
        VALUES (1, 'Admin'), (2, 'User')
      `);

      // Default admin user
      const [adminExists] = await connection.query(
        `SELECT * FROM users WHERE email = 'admin@app.com'`
      );

      if (adminExists.length === 0) {
        const hashedPassword = bcrypt.hashSync("admin123", 10);
        await connection.query(
          `INSERT INTO users (user_role_id, name, email, password)
           VALUES (?, ?, ?, ?)`,
          [1, "Admin User", "admin@app.com", hashedPassword]
        );
        console.log("✅ Default admin user created");
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
