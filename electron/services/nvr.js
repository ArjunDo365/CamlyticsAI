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
        last_working_on,
        is_working,
      } = data;

      const [result] = await this.db.pool.query(
        `INSERT INTO nvrs 
        (location_id, asset_no, serial_number, model_name, ip_address, manufacturer, vendor, install_date, last_working_on, is_working)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          location_id,
          asset_no,
          serial_number,
          model_name,
          ip_address,
          manufacturer,
          vendor,
          install_date,
          last_working_on,
          is_working || "active",
        ]
      );

      return successResponse(
        { nvrId: result.insertId },
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
        n.install_date,
        n.last_working_on,
        n.is_working,
        n.created_at,
        n.updated_at
      FROM nvrs n
      JOIN locations l ON n.location_id = l.id
      JOIN floors f ON l.floor_id = f.id
      JOIN blocks b ON f.block_id = b.id
    `);

    return successResponse(rows, "NVRs fetched successfully");
  } catch (error) {
    return errorResponse(error, "Failed to fetch NVRs");
  }
}

async getNvrById(id) {
  try {
    const [rows] = await this.db.pool.query(`
      SELECT 
        n.id,
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
        n.install_date,
        n.last_working_on,
        n.is_working,
        n.created_at,
        n.updated_at
      FROM nvrs n
      JOIN locations l ON n.location_id = l.id
      JOIN floors f ON l.floor_id = f.id
      JOIN blocks b ON f.block_id = b.id
      WHERE n.id = ?
    `, [id]);

    if (rows.length === 0)
      return errorResponse("NVR not found", "No record found");

    return successResponse(rows[0], "NVR fetched successfully");
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
        last_working_on,
        is_working,
      } = data;

      const [result] = await this.db.pool.query(
        `UPDATE nvrs 
         SET location_id=?, asset_no=?, serial_number=?, model_name=?, ip_address=?, manufacturer=?, vendor=?, 
             install_date=?, last_working_on=?, is_working=?, updated_at=CURRENT_TIMESTAMP 
         WHERE id=?`,
        [
          location_id,
          asset_no,
          serial_number,
          model_name,
          ip_address,
          manufacturer,
          vendor,
          install_date,
          last_working_on,
          is_working,
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
      const [result] = await this.db.pool.query("DELETE FROM nvrs WHERE id = ?", [id]);

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
