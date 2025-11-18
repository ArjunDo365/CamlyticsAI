const { successResponse, errorResponse } = require("../utils/responseHandler");

class LocationService {
  constructor(database) {
    this.db = database;
  }

  async createLocation(data) {
    try {
      const { floor_id, name, description, display_order } = data;

      const [result] = await this.db.pool.query(
        "INSERT INTO locations (floor_id, name, description,display_order) VALUES (?, ?, ?, ?)",
        [floor_id, name, description, display_order]
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
        l.description,
        l.floor_id,
        l.display_order,
        f.name AS floor_name,
        f.block_id,
        b.name AS block_name
      FROM locations l
      JOIN floors f ON l.floor_id = f.id
      JOIN blocks b ON f.block_id = b.id
      ORDER BY l.display_order DESC
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
          l.description,
          l.display_order,
          l.floor_id,
          f.name as floor_name,
          f.block_id,
          b.name as block_name
          from locations l 
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
      const { id, floor_id, name, description, display_order } = data;

      const [result] = await this.db.pool.query(
        "UPDATE locations SET floor_id = ?, name = ?, description = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [floor_id, name, description, display_order, id]
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
        "DELETE FROM locations WHERE id = ?",
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
