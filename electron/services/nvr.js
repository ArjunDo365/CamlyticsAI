const { convertToMySQLDate, formatFromMySQLDate } = require("../utils/helper");
const { successResponse, errorResponse } = require("../utils/responseHandler");

class NvrService {
  constructor(database) {
    this.db = database;
  }

  async createNvr(data) {
    try {
      const {
        location_id,
        asset_no,
        serial_number,
        model_name,
        ip_address,
        manufacturer,
        vendor,
        install_date,
        status,
      } = data;

      const ipv4Regex =
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

      if (!ip_address || !ipv4Regex.test(ip_address)) {
        return errorResponse(null, "Invalid IP Address. Example: 192.168.1.10");
      }

      const mysqlDate = convertToMySQLDate(install_date);

      const [result] = await this.db.pool.query(
        `INSERT INTO nvrs 
        (location_id, asset_no, serial_number, model_name, ip_address, manufacturer, vendor, install_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          location_id,
          asset_no,
          serial_number,
          model_name,
          ip_address,
          manufacturer,
          vendor,
          mysqlDate,
          status,
        ]
      );

      return successResponse(
        { Id: result.insertId },
        "NVR created successfully"
      );
    } catch (error) {
      return errorResponse(error, "Failed to create NVR");
    }
  }

  async getAllNvrs() {
    try {
      const [rows] = await this.db.pool.query(`
      SELECT 
        n.id,
        n.status,
        n.location_id,
        l.name AS location_name,
        f.id AS floor_id,
        f.name AS floor_name,
        b.id AS block_id,
        b.name AS block_name,
        n.asset_no,
        n.serial_number,
        n.model_name,
        n.ip_address,
        n.manufacturer,
        n.vendor,
        DATE_FORMAT(n.install_date, '%Y-%m-%d') AS install_date,
        n.last_working_on,
        n.is_working,
        n.created_at,
        n.updated_at
      FROM nvrs n
      JOIN locations l ON n.location_id = l.id
      JOIN floors f ON l.floor_id = f.id
      JOIN blocks b ON f.block_id = b.id
    `);

    const nvr = rows.map((row) => ({
      ...row,
      install_date: formatFromMySQLDate(row.install_date),
    }));

      return successResponse(nvr, "NVRs fetched successfully");
    } catch (error) {
      return errorResponse(error, "Failed to fetch NVRs");
    }
  }

async getNvrById(id) {
  try {
    const [rows] = await this.db.pool.query(
      `
      SELECT 
        n.id,
        n.status,
        n.location_id,
        l.name AS location_name,
        f.id AS floor_id,
        f.name AS floor_name,
        b.id AS block_id,
        b.name AS block_name,
        n.asset_no,
        n.serial_number,
        n.model_name,
        n.ip_address,
        n.manufacturer,
        n.vendor,
        DATE_FORMAT(n.install_date, '%Y-%m-%d') AS install_date,
        n.last_working_on,
        n.is_working,
        n.created_at,
        n.updated_at
      FROM nvrs n
      JOIN locations l ON n.location_id = l.id
      JOIN floors f ON l.floor_id = f.id
      JOIN blocks b ON f.block_id = b.id
      WHERE n.id = ?
    `,
      [id]
    );

    if (rows.length === 0)
      return errorResponse("NVR not found", "No record found");

    const nvr = rows.map((row) => ({
      ...row,
      install_date: formatFromMySQLDate(row.install_date),
    }));

    return successResponse(nvr, "NVR fetched successfully");
  } catch (error) {
    return errorResponse(error, "Failed to fetch NVR");
  }
}


  async updateNvr(data) {
    try {
      const {
        id,
        location_id,
        asset_no,
        serial_number,
        model_name,
        ip_address,
        manufacturer,
        vendor,
        install_date,
        status,
      } = data;

      const ipv4Regex =
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

      if (!ip_address || !ipv4Regex.test(ip_address)) {
        return errorResponse(null, "Invalid IP Address. Example: 192.168.1.10");
      }


      const mysqlDate = convertToMySQLDate(install_date);

      const [result] = await this.db.pool.query(
        `UPDATE nvrs 
         SET location_id=?, asset_no=?, serial_number=?, model_name=?, ip_address=?, manufacturer=?, vendor=?, 
             install_date=?, updated_at=CURRENT_TIMESTAMP ,status=?
         WHERE id=?`,
        [
          location_id,
          asset_no,
          serial_number,
          model_name,
          ip_address,
          manufacturer,
          vendor,
          mysqlDate,
          status,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return errorResponse("NVR not found", "Update failed");
      }

      return successResponse({ id }, "NVR updated successfully");
    } catch (error) {
      return errorResponse(error, "Failed to update NVR");
    }
  }

  async deleteNvr(id) {
    try {
      const [result] = await this.db.pool.query(
        "DELETE FROM nvrs WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return errorResponse("NVR not found", "Delete failed");
      }

      return successResponse({ id }, "NVR deleted successfully");
    } catch (error) {
      return errorResponse(error, "Failed to delete NVR");
    }
  }
}

module.exports = NvrService;
