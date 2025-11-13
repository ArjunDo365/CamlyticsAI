const { successResponse, errorResponse } = require("../utils/responseHandler");

class BlockService {
  constructor(database) {
    this.db = database;
  }

  async createBlock(data) {
    try {
      const { name, description,display_order } = data;
      const [result] = await this.db.pool.query(
        "INSERT INTO blocks (name, description,display_order) VALUES (?, ?)",
        [name, description,display_order]
      );
      return successResponse(
        { nvrId: result.insertId },
        "block created successfully"
      );
    } catch (error) {
      return errorResponse(error, "Failed to create block");
    }
  }

  async getAllBlocks() {
    try{
    const [rows] = await this.db.pool.query("SELECT * FROM blocks");
     return successResponse(rows, "block fetched successfully");
        } catch (error) {
          return errorResponse(error, "Failed to fetch block");
        }
  }

  async getByIdBlocks(id) {
    try{
    const [rows] = await this.db.pool.query(
      "SELECT * FROM blocks WHERE id = ?",
      [id]
    );
     if (rows.length === 0) {
            return errorResponse("block not found", "No record found");
          }
          return successResponse(rows[0], "block fetched successfully");
        } catch (error) {
          return errorResponse(error, "Failed to fetch block");
        }
  }

  async updateBlock(data) {
    try{
    const { id, name, description,display_order } = data;
   const [result]= await this.db.pool.query(
      "UPDATE blocks SET name = ?, description = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [name, description,display_order, id]
    );
    console.log('block data:',result)
    if (result.affectedRows === 0) {
            return errorResponse("block not found", "Update failed");
          }
    
          return successResponse({ id }, "block updated successfully");
        } catch (error) {
          return errorResponse(error, "Failed to update block");
        }
  }

  async deleteBlock(id) {
    try{
    const [result]= await this.db.pool.query("DELETE FROM blocks WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
            return errorResponse("block not found", "Delete failed");
          }
    
          return successResponse({ id }, "block deleted successfully");
        } catch (error) {
          return errorResponse(error, "Failed to delete block");
        }
      }
  }


module.exports = BlockService;
