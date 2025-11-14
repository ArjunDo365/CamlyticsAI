const { successResponse, errorResponse } = require("../utils/responseHandler");

class FloorsService {
  constructor(database) {
    this.db = database;
  }


  async createFloors(data) {
    try {
      const { block_id, name, description,display_order } = data;
      const [result] = await this.db.pool.query(
        "INSERT INTO floors (block_id, name, description,display_order) VALUES (?, ?, ?, ?)",
        [block_id, name, description,display_order]
      );

      return successResponse(
        { floorId: result.insertId },
        "Floor created successfully"
      );
    } catch (error) {
      return errorResponse(error, "Failed to create floor");
    }
  }

  async getAllFloors() {
  try {
    const [rows] = await this.db.pool.query(`
      SELECT
        f.id,
        f.display_order,
        f.name,
        f.description,
        f.block_id,
        b.name AS block_name
      FROM floors f
      JOIN blocks b ON f.block_id = b.id
      ORDER BY f.display_order ASC
    `);
    return successResponse(rows, "Floors fetched successfully");
  } catch (error) {
    return errorResponse(error, "Failed to fetch floors");
  }
}

  async getByIdFloors(id) {
  try {
    const [rows] = await this.db.pool.query(
      `
      SELECT
        f.id,
        f.display_order,
        f.name,
        f.description,
        f.block_id,
        b.name AS block_name
      FROM floors f
      JOIN blocks b ON f.block_id = b.id
      WHERE f.id = ?
      ORDER BY f.id DESC
      `,
      [id]
    );

    if (rows.length === 0)
      return errorResponse("Floor not found", "No record found");

    return successResponse(rows[0], "Floor fetched successfully");
  } catch (error) {
    return errorResponse(error, "Failed to fetch floor");
  }
}


  async updateFloors(data) {
    try {
      const { id, block_id, name, description,display_order } = data;

      const [result] = await this.db.pool.query(
        "UPDATE floors SET block_id = ?, name = ?, description = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [block_id, name, description,display_order, id]
      );

      if (result.affectedRows === 0)
        return errorResponse("Floor not found", "Update failed");

      return successResponse({ id }, "Floor updated successfully");
    } catch (error) {
      return errorResponse(error, "Failed to update floor");
    }
  }

  async deleteFloors(id) {
    try {
      const [result] = await this.db.pool.query(
        "DELETE FROM floors WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0)
        return errorResponse("Floor not found", "Delete failed");

      return successResponse({ id }, "Floor deleted successfully");
    } catch (error) {
      return errorResponse(error, "Failed to delete floor");
    }
  }
}

module.exports = FloorsService;
