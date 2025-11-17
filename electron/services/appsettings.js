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

      return successResponse(rows, "App settings fetched successfully");
    } catch (error) {
      return errorResponse(error, "Failed to fetch app settings");
    }
  }

  async getPingInterval() {
    try {
      const keyName = "Health Check - Frequency in Milliseconds";

      const [rows] = await this.db.pool.query(
        "SELECT KeyValue FROM appsetting WHERE KeyName = ?",
        [keyName]
      );

      console.log("Appsetting rows:", rows);

      if (rows.length > 0) {
        return parseInt(rows[0].KeyValue) * 1000; 
      }

      return 600 * 1000; 
    } catch (error) {
      console.error("Error fetching ping interval:", error);
      return 600 * 1000;
    }
  }

  async updatePingInterval(data) {
    try {
      const { keyvalue } = data;

      if (!keyvalue) {
        return errorResponse(null, "Time value is required");
      }

      await this.db.pool.query(
        "UPDATE appsetting SET KeyValue = ? WHERE KeyName = 'Health Check - Frequency in Milliseconds'",
        [keyvalue]
      );

      console.log(`Updated ping interval to ${keyvalue} ms`);

      // If needed, restart your scheduler
      await this.startPingScheduler?.();

      return successResponse(null, "Ping interval updated successfully");
    } catch (error) {
      return errorResponse(error, "Failed to update ping interval");
    }
  }
}

module.exports = AppsettingService;
