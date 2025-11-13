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
        last_working_on,
        is_working,
      } = data;

      const [result] = await this.db.pool.query(
        `INSERT INTO cameras 
        (location_id, nvr_id, asset_no, serial_number, model_name, ip_address, port, manufacturer, vendor, install_date, last_working_on, is_working)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          location_id,
          nvr_id,
          asset_no,
          serial_number,
          model_name,
          ip_address,
          port || 80,
          manufacturer,
          vendor,
          install_date,
          last_working_on,
          is_working || "active",
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
      const [rows] = await this.db.pool.query("SELECT * FROM cameras");
      return successResponse(rows, "Cameras fetched successfully");
    } catch (error) {
      return errorResponse(error, "Failed to fetch cameras");
    }
  }


  async getCameraById(id) {
    try {
      const [rows] = await this.db.pool.query("SELECT * FROM cameras WHERE id = ?", [id]);
      if (rows.length === 0) {
        return errorResponse("Camera not found", "No record found");
      }
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
        last_working_on,
        is_working,
      } = data;

      const [result] = await this.db.pool.query(
        `UPDATE cameras 
         SET location_id=?, nvr_id=?, asset_no=?, serial_number=?, model_name=?, ip_address=?, port=?, manufacturer=?, vendor=?, 
             install_date=?, last_working_on=?, is_working=?, updated_at=CURRENT_TIMESTAMP 
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
          last_working_on,
          is_working,
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
