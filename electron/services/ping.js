const ping = require('ping');
const { successResponse, errorResponse } = require("../utils/responseHandler");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

class PingService {
  constructor(database,AppSettingService) {
    this.db = database;
    this.appsettingservice = AppSettingService;
    this.cameraInterval = null;
    this.nvrInterval = null;
  }

    async updatePingInterval(data) {
      try {
        const{keyname,keyvalue} = data

        console.log('datavalue',keyvalue)
        if (!keyvalue) {
          return errorResponse(null, "Time value is required");
        }

        await this.db.pool.query(
          "UPDATE appsetting SET keyvalue = ? WHERE keyname = 'Health Check - Frequency in Milliseconds'",
          [keyvalue]
        );

        console.log(`Updated ping interval to ${keyvalue} ms`);

        // If needed, restart your scheduler
        await this.startPingScheduler?.();

        return successResponse( "Ping interval updated successfully");
      } catch (error) {
        return errorResponse(error, "Failed to update ping interval");
      }
    }


async getCamerasAndNVRs() {
  try {
    // ---------------- CAMERAS WITH JOINS ----------------
    const [cameras] = await this.db.pool.query(`
      SELECT 
        c.id, 
        c.asset_no, 
        c.model_name, 
        c.ip_address, 
        c.last_working_on, 
        c.is_working,
        c.location_id,
        l.name AS location_name,
        l.floor_id,
        f.name AS floor_name,
        f.block_id,
        b.name AS block_name
      FROM cameras c
      JOIN locations l ON c.location_id = l.id
      JOIN floors f ON l.floor_id = f.id
      JOIN blocks b ON f.block_id = b.id
    `);

    // ---------------- NVRs WITH JOINS ----------------
    const [nvrs] = await this.db.pool.query(`
      SELECT 
        n.id, 
        n.asset_no, 
        n.model_name, 
        n.ip_address, 
        n.last_working_on, 
        n.is_working,
        c.location_id 
        l.name AS location_name,
        f.id AS floor_id,
        f.name AS floor_name,
        b.id AS block_id,
        b.name AS block_name
      FROM nvrs n
      JOIN locations l ON n.location_id = l.id
      JOIN floors f ON l.floor_id = f.id
      JOIN blocks b ON f.block_id = b.id
    `);

    // ---------------- LAST 10 CAMERAS ----------------
    const [last10Cameras] = await this.db.pool.query(`
      SELECT 
        c.id, 
        c.asset_no, 
        c.model_name, 
        c.ip_address, 
        c.last_working_on, 
        c.is_working,
        c.location_id,
        l.name AS location_name,
        f.id AS floor_id,
        f.name AS floor_name,
        b.id AS block_id,
        b.name AS block_name
      FROM cameras c
      JOIN locations l ON c.location_id = l.id
      JOIN floors f ON l.floor_id = f.id
      JOIN blocks b ON f.block_id = b.id
      ORDER BY c.id DESC
      LIMIT 10
    `);

    // ---------------- LAST 10 NVRs ----------------
    const [last10NVRs] = await this.db.pool.query(`
      SELECT 
        n.id, 
        n.asset_no, 
        n.model_name, 
        n.ip_address, 
        n.last_working_on, 
        n.is_working,
        c.location_id,
        l.name AS location_name,
        l.floor_id,
        f.name AS floor_name,
        f.block_id,
        b.name AS block_name
      FROM nvrs n
      JOIN locations l ON n.location_id = l.id
      JOIN floors f ON l.floor_id = f.id
      JOIN blocks b ON f.block_id = b.id
      ORDER BY n.id DESC
      LIMIT 10
    `);

    return successResponse(
      {
        cameras,
        nvrs,
        last10Cameras,
        last10NVRs,
      },
      "Cameras and NVRs fetched successfully"
    );
  } catch (error) {
    return errorResponse(error, "Failed to fetch data");
  }
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
          l.floor_id,
          f.name as floor_name,
          f.block_id,
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
        join floors f on l.floor_id = f.id
        JOIN blocks b ON f.block_id = b.id
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
          l.floor_id,
          f.name as floor_name,
          f.block_id,
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
        join floors f on l.floor_id = f.id
        JOIN blocks b ON f.block_id = b.id
        WHERE n.is_working = 0
      `);

      return successResponse(rows, "Not Working NVRs fetched successfully");
    }

    return errorResponse("Invalid type. Use 'cameras' or 'nvrs'.");

  } catch (error) {
    return errorResponse(error, "Failed to fetch data");
  }
}



async downloadNotWorkingExcel(type) {
  try {
    if (!type) return errorResponse(null, "Type is required");

    const dataResponse = await this.notworkinglist({ type });

    if (!dataResponse.success) {
      return errorResponse(null, "Failed to fetch data");
    }

    const rows = dataResponse.data;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Not Working List");

    sheet.columns = [
      { header: "Asset No", key: "asset_no", width: 20 },
      { header: "Model Name", key: "model_name", width: 20 },
      { header: "IP Address", key: "ip_address", width: 20 },
      { header: "Last Working", key: "last_working_on", width: 25 },
      { header: "Location", key: "location_name", width: 20 },
      { header: "Floor", key: "floor_name", width: 15 },
      { header: "Block", key: "block_name", width: 15 }, 
    ];

    rows.forEach((row) => sheet.addRow(row));

    const fileName = `not_working_${type}_${Date.now()}.xlsx`;
    const filePath = path.join(__dirname, "../temp", fileName);

    await workbook.xlsx.writeFile(filePath);

    return successResponse(
      { filePath, fileName },
      "Excel file generated successfully"
    );

  } catch (error) {
    return errorResponse(error, "Failed to generate excel");
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
            `UPDATE cameras SET is_working=0 ,updated_at=CURRENT_TIMESTAMP WHERE id=?`,
            [cam.id]
          );
          console.log(`Camera ${cam.id} marked false`);
        }
      } else {
        console.log(`Camera ${cam.id} (${cam.ip_address}) is online`);
        await this.db.pool.query(
            `UPDATE cameras SET last_working_on=CURRENT_TIMESTAMP WHERE id=?`,
            [cam.id]
          );
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
         await this.db.pool.query(
            `UPDATE nvrs SET last_working_on=CURRENT_TIMESTAMP WHERE id=?`,
            [nvr.id]
          );
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
     const intervalTime = await this.appsettingservice.getPingInterval();

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
