const { successResponse } = require("../utils/responseHandler");

class AppsettingService {
  constructor(database) {
    this.db = database;
  }

  async listAppSettings() {
    try {
      const [rows] = await this.db.pool.query(`
        SELECT * FROM appsetting
      `);

    console.log('data',rows)
      return successResponse(rows, "App settings fetched successfully");
    } catch (error) {
      return errorResponse(error, "Failed to fetch app settings");
    }
  }

  async getPingInterval() {
  try {
    const keyName = "Health Check - Frequency in Milliseconds";

    const [rows] = await this.db.pool.query(
      "SELECT keyvalue FROM appsetting WHERE keyname = ?",
      [keyName]
    );

    console.log("Appsetting rows:", rows);

    if (rows.length > 0) {
      return parseInt(rows[0].keyvalue) * 1000; 
    }

    return 600 * 1000; 
  } catch (error) {
    console.error("Error fetching ping interval:", error);
    return 600 * 1000;
  }
}

}

module.exports = AppsettingService;
