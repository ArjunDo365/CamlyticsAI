const ping = require('ping');
const { successResponse, errorResponse } = require("../utils/responseHandler");
class PingService {
  constructor(database,AppsettingService) {
    this.db = database;
    this.appsettingService = AppsettingService;
    this.cameraInterval = null;
    this.nvrInterval = null;
  }


  async notworkinglist(data) {
  try {
    const { type } = data;

    if (!type) {
      return errorResponse("Type is required (cameras or nvrs)");
    }

    // ============================
    // NOT WORKING CAMERAS
    // ============================
    if (type === "cameras") {
      const [rows] = await this.db.pool.query(`
        SELECT 
          c.id,
          c.location_id,
          l.name AS location_name,
          l.block_id,
          b.name AS block_name,
          c.nvr_id,
          c.asset_no,
          c.serial_number,
          c.model_name,
          c.ip_address,
          c.manufacturer,
          c.vendor,
          c.install_date,
          c.last_working_on,
          c.is_working,
          c.display_order,
          c.status
        FROM cameras c
        JOIN locations l ON c.location_id = l.id
        JOIN blocks b ON l.block_id = b.id
        WHERE c.is_working = 0
      `);

      return successResponse(rows, "Not Working Camera fetched successfully");
    }

    // ============================
    // NOT WORKING NVRS
    // ============================
    if (type === "nvrs") {
      const [rows] = await this.db.pool.query(`
        SELECT 
          n.id,
          n.location_id,
          l.name AS location_name,
          l.block_id,
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
          n.display_order,
          n.status
        FROM nvrs n
        JOIN locations l ON n.location_id = l.id
        JOIN blocks b ON l.block_id = b.id
        WHERE n.is_working = 0
      `);

      return successResponse(rows, "Not Working NVRs fetched successfully");
    }

    return errorResponse("Invalid type. Use 'cameras' or 'nvrs'.");

  } catch (error) {
    return errorResponse(error, "Failed to fetch data");
  }
}


  async nvrcamerasummary() {
  try {
    const [rows] = await this.db.pool.query(`
      SELECT
        SUM(total_cameras) AS total_cameras,
        SUM(active_cameras) AS active_cameras,
        SUM(inactive_cameras) AS inactive_cameras,
        SUM(total_nvrs) AS total_nvrs,
        SUM(active_nvrs) AS active_nvrs,
        SUM(inactive_nvrs) AS inactive_nvrs
      FROM (
        SELECT 
            COUNT(*) AS total_cameras,
            SUM(is_working = 1) AS active_cameras,
            SUM(is_working = 0) AS inactive_cameras,
            0 AS total_nvrs,
            0 AS active_nvrs,
            0 AS inactive_nvrs
        FROM cameras
        
        UNION ALL
        
        SELECT
            0 AS total_cameras,
            0 AS active_cameras,
            0 AS inactive_cameras,
            COUNT(*) AS total_nvrs,
            SUM(is_working = 1) AS active_nvrs,
            SUM(is_working = 0) AS inactive_nvrs
        FROM nvrs
      ) AS summary
    `);

    const summary = rows[0];

    const result = {
      total_cameras: summary.total_cameras || 0,
      active_cameras: summary.active_cameras || 0,
      inactive_cameras: summary.inactive_cameras || 0,
      total_nvrs: summary.total_nvrs || 0,
      active_nvrs: summary.active_nvrs || 0,
      inactive_nvrs: summary.inactive_nvrs || 0,
      timestamp: new Date().toISOString()
    };

    return successResponse(result, "nvrcamerasummery fetched successfully");

  } catch (error) {
    return errorResponse(error, "Failed to fetch nvrcamerasummery");
  }
}

  async cctvCameraPing() {
    const [cameras] = await this.db.pool.query(`SELECT * FROM cameras`);
    if (cameras.length === 0) {
  console.log('No camera found');
} else {
  console.log(`${cameras.length} cameras found`);
}
    
    for (const cam of cameras) {
      const result = await ping.promise.probe(cam.ip_address, { timeout: 3 });

      if (!result.alive) {
        console.log(`Camera ${cam.id} (${cam.ip_address}) is unreachable`);
        if (cam.is_working === 1) {
          await this.db.pool.query(
            `UPDATE cameras SET is_working=0, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
            [cam.id]
          );
          console.log(`Camera ${cam.id} marked false`);
        }
      } else {
        console.log(`Camera ${cam.id} (${cam.ip_address}) is online`);
        if (cam.is_working === 0) {
          await this.db.pool.query(
            `UPDATE cameras SET is_working=1, last_working_on=CURRENT_TIMESTAMP WHERE id=?`,
            [cam.id]
          );
          console.log(`Camera ${cam.id} marked true`);
        }
      }
    }
  }


  async nvrsPing() {
    const [nvrs] = await this.db.pool.query(`SELECT * FROM nvrs`);
if (nvrs.length === 0) {
  console.log('No NVR found');
} else {
  console.log(`${nvrs.length} cameras found`);
}
    for (const nvr of nvrs) {
      const result = await ping.promise.probe(nvr.ip_address, { timeout: 3 });

      if (!result.alive) {
        console.log(`NVR ${nvr.id} (${nvr.ip_address}) unreachable`);
        if (nvr.is_working === 1) {
          await this.db.pool.query(
            `UPDATE nvrs SET is_working=0, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
            [nvr.id]
          );
          console.log(`NVR ${nvr.id} marked false`);
        }
      } else {
        console.log(`NVR ${nvr.id} (${nvr.ip_address}) online`);
        if (nvr.is_working === 0) {
          await this.db.pool.query(
            `UPDATE nvrs SET is_working=1, last_working_on=CURRENT_TIMESTAMP WHERE id=?`,
            [nvr.id]
          );
          console.log(`NVR ${nvr.id} marked true`);
        }
      }
    }
  }

  async startPingScheduler() {
     const intervalTime = await this.appsettingService.getPingInterval();

    console.log(`Ping interval: ${intervalTime / 1000} seconds`);

    // clear existing timers
    if (this.cameraInterval) clearInterval(this.cameraInterval);
    if (this.nvrInterval) clearInterval(this.nvrInterval);

    // run immediately once
    await this.cctvCameraPing();
    await this.nvrsPing();

    // schedule repeated
    this.cameraInterval = setInterval(() => this.cctvCameraPing(), intervalTime);
    this.nvrInterval = setInterval(() => this.nvrsPing(), intervalTime);
  }

  // 🧭 Manual trigger from UI (Ping Now)
  async manualPingTrigger() {
    console.log("⚡ Manual ping triggered");
    await this.cctvCameraPing();
    await this.nvrsPing();
    await this.startPingScheduler(); // reset timer from now
  }
}

module.exports = PingService;
