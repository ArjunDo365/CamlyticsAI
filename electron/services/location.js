const { successResponse, errorResponse } = require("../utils/responseHandler");

class LocationService {
  constructor(database) {
    this.db = database;
  }


  async createLocation(data) {
    try {
      const { floors_id, name, description } = data;

      const [result] = await this.db.pool.query(
        "INSERT INTO location (floors_id, name, description) VALUES (?, ?, ?)",
        [floors_id, name, description]
      );

      return successResponse(
        { locationId: result.insertId },
        "Location created successfully"
      );
    } catch (error) {
      return errorResponse(error, "Failed to create location");
    }
  }

  async getAllLocation() {
    try {
      const [rows] = await this.db.pool.query(`
        SELECT
          l.id,
          l.name,
          l.discription,
          l.floor_id,
          f.name as floor_name,
          f.block_id,
          b.name as block_name
          from location l 
          join floors f on l.floor_id = id,
          join blocks b on f.block_id = id  
          ORDER BY l.id DESC
        `);
      return successResponse(rows, "Locations fetched successfully");
    } catch (error) {
      return errorResponse(error, "Failed to fetch locations");
    }
  }

  async getByIdLocation(id) {
    try {
      const [rows] = await this.db.pool.query(
        `SELECT
          l.id,
          l.name,
          l.discription,
          l.floor_id,
          f.name as floor_name,
          f.block_id,
          b.name as block_name
          from location l 
          join floors f on l.floor_id = id,
          join blocks b on f.block_id = id  
          ORDER BY l.id DESC
          where l.id = ?`,
        [id]
      );

      if (rows.length === 0)
        return errorResponse("Location not found", "No record found");

      return successResponse(rows[0], "Location fetched successfully");
    } catch (error) {
      return errorResponse(error, "Failed to fetch location");
    }
  }

  async updateLocation(data) {
    try {
      const { id, floors_id, name, description } = data;

      const [result] = await this.db.pool.query(
        "UPDATE location SET floors_id = ?, name = ?, description = ?, update_on = CURRENT_TIMESTAMP WHERE id = ?",
        [floors_id, name, description, id]
      );

      if (result.affectedRows === 0)
        return errorResponse("Location not found", "Update failed");

      return successResponse({ id }, "Location updated successfully");
    } catch (error) {
      return errorResponse(error, "Failed to update location");
    }
  }


  async deleteLocation(id) {
    try {
      const [result] = await this.db.pool.query(
        "DELETE FROM location WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0)
        return errorResponse("Location not found", "Delete failed");

      return successResponse({ id }, "Location deleted successfully");
    } catch (error) {
      return errorResponse(error, "Failed to delete location");
    }
  }
}

module.exports = LocationService;
