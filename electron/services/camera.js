const { successResponse, errorResponse } = require("../utils/responseHandler");

class CameraService {
  constructor(database) {
    this.db = database;
  }

  async createCamera(data) {
  try {
    const {
      location_id,
      nvr_id,
      asset_no,
      serial_number,
      model_name,
      ip_address,
      port,
      manufacturer,
      vendor,
      install_date,
      status,
    } = data;

    // ---------------------------
    // Validate IP Address
    // ---------------------------
    const ipv4Regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    if (!ip_address || !ipv4Regex.test(ip_address)) {
      return errorResponse(
        null,
        "Invalid IP Address. Example: 192.168.1.10"
      );
    }

    // ---------------------------
    // Insert Camera
    // ---------------------------
    const [result] = await this.db.pool.query(
      `INSERT INTO cameras 
      (location_id, nvr_id, asset_no, serial_number, model_name, ip_address, port, manufacturer, vendor, install_date,status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        location_id,
        nvr_id,
        asset_no,
        serial_number,
        model_name,
        ip_address,
        port,
        manufacturer,
        vendor,
        install_date,
        status,
      ]
    );

    return successResponse(
      { cameraId: result.insertId },
      "Camera created successfully"
    );

  } catch (error) {
    return errorResponse(error, "Failed to create camera");
  }
}



  async getAllCameras() {
  try {
    const [rows] = await this.db.pool.query(`
      SELECT 
        c.id,
        c.status,
        c.asset_no,
        c.serial_number,
        c.model_name,
        c.ip_address,
        c.port,
        c.manufacturer,
        c.vendor,
        c.install_date,
        c.last_working_on,
        c.is_working,
        c.created_at,
        c.updated_at,
        n.id AS nvr_id,
        n.asset_no AS nvr_asset_no,
        n.model_name AS nvr_model_name,
        n.ip_address AS nvr_ip,
        l.id AS location_id,
        l.name AS location_name,
        f.id AS floor_id,
        f.name AS floor_name,
        b.id AS block_id,
        b.name AS block_name
      FROM cameras c
      JOIN nvrs n ON c.nvr_id = n.id
      JOIN locations l ON c.location_id = l.id
      JOIN floors f ON l.floor_id = f.id
      JOIN blocks b ON f.block_id = b.id
    `);

    return successResponse(rows, "Cameras fetched successfully");
  } catch (error) {
    return errorResponse(error, "Failed to fetch cameras");
  }
}

async getCameraById(id) {
  try {
    const [rows] = await this.db.pool.query(`
      SELECT 
        c.id,
        c.status,
        c.asset_no,
        c.serial_number,
        c.model_name,
        c.ip_address,
        c.port,
        c.manufacturer,
        c.vendor,
        c.install_date,
        c.last_working_on,
        c.is_working,
        c.created_at,
        c.updated_at,
        n.id AS nvr_id,
        n.asset_no AS nvr_asset_no,
        n.model_name AS nvr_model_name,
        n.ip_address AS nvr_ip,
        l.id AS location_id,
        l.name AS location_name,
        f.id AS floor_id,
        f.name AS floor_name,
        b.id AS block_id,
        b.name AS block_name
      FROM cameras c
      JOIN nvrs n ON c.nvr_id = n.id
      JOIN locations l ON c.location_id = l.id
      JOIN floors f ON l.floor_id = f.id
      JOIN blocks b ON f.block_id = b.id
      WHERE c.id = ?
    `, [id]);

    if (rows.length === 0)
      return errorResponse("Camera not found", "No record found");

    return successResponse(rows[0], "Camera fetched successfully");
  } catch (error) {
    return errorResponse(error, "Failed to fetch camera");
  }
}

  async updateCamera(data) {
    try {
      const {
        id,
        location_id,
        nvr_id,
        asset_no,
        serial_number,
        model_name,
        ip_address,
        port,
        manufacturer,
        vendor,
        install_date,
        status,
      } = data;

      const ipv4Regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    if (!ip_address || !ipv4Regex.test(ip_address)) {
      return errorResponse(
        null,
        "Invalid IP Address. Example: 192.168.1.10"
      );
    }

      const [result] = await this.db.pool.query(
        `UPDATE cameras 
         SET location_id=?, nvr_id=?, asset_no=?, serial_number=?, model_name=?, ip_address=?, port=?, manufacturer=?, vendor=?, 
             install_date=?, updated_at=CURRENT_TIMESTAMP ,status ?
         WHERE id=?`,
        [
          location_id,
          nvr_id,
          asset_no,
          serial_number,
          model_name,
          ip_address,
          port,
          manufacturer,
          vendor,
          install_date,
          status,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return errorResponse("Camera not found", "Update failed");
      }

      return successResponse({ id }, "Camera updated successfully");
    } catch (error) {
      return errorResponse(error, "Failed to update camera");
    }
  }


  async deleteCamera(id) {
    try {
      const [result] = await this.db.pool.query("DELETE FROM cameras WHERE id = ?", [id]);

      if (result.affectedRows === 0) {
        return errorResponse("Camera not found", "Delete failed");
      }

      return successResponse({ id }, "Camera deleted successfully");
    } catch (error) {
      return errorResponse(error, "Failed to delete camera");
    }
  }
}

module.exports = CameraService;
