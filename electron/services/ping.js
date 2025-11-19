// const ping = require("ping");
// const { successResponse, errorResponse } = require("../utils/responseHandler");
// const ExcelJS = require("exceljs");
// const os = require("os");
// const fs = require("fs");
// const path = require("path");
// const { app } = require("electron");

// class PingService {
//   constructor(database, AppSettingService) {
//     this.db = database;
//     this.appsettingservice = AppSettingService;
//     this.cameraInterval = null;
//     this.nvrInterval = null;
//   }

//   async updatePingInterval(data) {
//     try {
//       const { keyname, keyvalue } = data;

//       console.log("datavalue", keyvalue);
//       if (!keyvalue) {
//         return errorResponse(null, "Time value is required");
//       }

//       await this.db.pool.query(
//         "UPDATE appsetting SET keyvalue = ? WHERE keyname = 'Health Check - Frequency in Milliseconds'",
//         [keyvalue]
//       );

//       console.log(`Updated ping interval to ${keyvalue} ms`);

//       // If needed, restart your scheduler
//       await this.startPingScheduler?.();

//       return successResponse("Ping interval updated successfully");
//     } catch (error) {
//       return errorResponse(error, "Failed to update ping interval");
//     }
//   }

//   async getCamerasAndNVRs() {
//     try {
//       // ---------------- CAMERAS WITH JOINS ----------------
//       const [cameras] = await this.db.pool.query(`
//       SELECT 
//         c.id,
//         c.status, 
//         c.asset_no, 
//         c.model_name, 
//         c.ip_address, 
//         c.last_working_on, 
//         c.is_working,
//         c.location_id,
//         l.name AS location_name,
//         l.floor_id,
//         f.name AS floor_name,
//         f.block_id,
//         b.name AS block_name
//       FROM cameras c
//       JOIN locations l ON c.location_id = l.id
//       JOIN floors f ON l.floor_id = f.id
//       JOIN blocks b ON f.block_id = b.id
//     `);

//       // ---------------- NVRs WITH JOINS ----------------
//       const [nvrs] = await this.db.pool.query(`
//       SELECT 
//         n.id,
//         n.status, 
//         n.asset_no, 
//         n.model_name, 
//         n.ip_address, 
//         n.last_working_on, 
//         n.is_working,
//         n.location_id,
//         l.name AS location_name,
//         l.floor_id,
//         f.name AS floor_name,
//         f.block_id,
//         b.name AS block_name
//       FROM nvrs n
//       JOIN locations l ON n.location_id = l.id
//       JOIN floors f ON l.floor_id = f.id
//       JOIN blocks b ON f.block_id = b.id
//     `);

//       // ---------------- LAST 10 CAMERAS ----------------
//       const [last10Cameras] = await this.db.pool.query(`
//       SELECT 
//         c.id,
//         c.status,  
//         c.asset_no, 
//         c.model_name, 
//         c.ip_address, 
//         c.last_working_on, 
//         c.is_working,
//         c.location_id,
//         l.name AS location_name,
//         l.floor_id,
//         f.name AS floor_name,
//         f.block_id,
//         b.name AS block_name
//       FROM cameras c
//       JOIN locations l ON c.location_id = l.id
//       JOIN floors f ON l.floor_id = f.id
//       JOIN blocks b ON f.block_id = b.id
//       ORDER BY c.id DESC
//       LIMIT 10
//     `);

//       // ---------------- LAST 10 NVRs ----------------
//       const [last10NVRs] = await this.db.pool.query(`
//       SELECT 
//         n.id,
//         n.status,  
//         n.asset_no, 
//         n.model_name, 
//         n.ip_address, 
//         n.last_working_on, 
//         n.is_working,
//         n.location_id,
//         l.name AS location_name,
//         l.floor_id,
//         f.name AS floor_name,
//         f.block_id,
//         b.name AS block_name
//       FROM nvrs n
//       JOIN locations l ON n.location_id = l.id
//       JOIN floors f ON l.floor_id = f.id
//       JOIN blocks b ON f.block_id = b.id
//       ORDER BY n.id DESC
//       LIMIT 10
//     `);

//       return successResponse(
//         {
//           cameras,
//           nvrs,
//           last10Cameras,
//           last10NVRs,
//         },
//         "Cameras and NVRs fetched successfully"
//       );
//     } catch (error) {
//       return errorResponse(error, "Failed to fetch data");
//     }
//   }

//   async notworkinglist(data) {
//     try {
//       const { type } = data;

//       if (!type) {
//         return errorResponse("Type is required (cameras or nvrs)");
//       }

//       // ============================
//       // NOT WORKING CAMERAS
//       // ============================
//       if (type === "cameras") {
//         const [rows] = await this.db.pool.query(`
//         SELECT 
//           c.id,
//           c.status, 
//           c.location_id,
//           l.name AS location_name,
//           l.floor_id,
//           f.name as floor_name,
//           f.block_id,
//           b.name AS block_name,
//           c.nvr_id,
//           c.asset_no,
//           c.serial_number,
//           c.model_name,
//           c.ip_address,
//           c.manufacturer,
//           c.vendor,
//           c.install_date,
//           c.last_working_on,
//           c.is_working,
//           c.display_order,
//           c.status
//         FROM cameras c
//         JOIN locations l ON c.location_id = l.id
//         join floors f on l.floor_id = f.id
//         JOIN blocks b ON f.block_id = b.id
//         WHERE c.is_working = 0
//       `);

//         return successResponse(rows, "Not Working Camera fetched successfully");
//       }

//       // ============================
//       // NOT WORKING NVRS
//       // ============================
//       if (type === "nvrs") {
//         const [rows] = await this.db.pool.query(`
//         SELECT 
//           n.id,
//           n.status, 
//           n.location_id,
//           l.name AS location_name,
//           l.floor_id,
//           f.name as floor_name,
//           f.block_id,
//           b.name AS block_name,
//           n.asset_no,
//           n.serial_number,
//           n.model_name,
//           n.ip_address,
//           n.manufacturer,
//           n.vendor,
//           n.install_date,
//           n.last_working_on,
//           n.is_working,
//           n.display_order,
//           n.status
//         FROM nvrs n
//         JOIN locations l ON n.location_id = l.id
//         join floors f on l.floor_id = f.id
//         JOIN blocks b ON f.block_id = b.id
//         WHERE n.is_working = 0
//       `);

//         return successResponse(rows, "Not Working NVRs fetched successfully");
//       }

//       return errorResponse("Invalid type. Use 'cameras' or 'nvrs'.");
//     } catch (error) {
//       return errorResponse(error, "Failed to fetch data");
//     }
//   }

//   async downloadNotWorkingExcel(type) {
//   try {
//     if (!type) return errorResponse(null, "Type is required");

//     const dataResponse = await this.notworkinglist({ type });

//     if (!dataResponse.success) {
//       return errorResponse(null, "Failed to fetch data");
//     }

//     const rows = dataResponse.data;

//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet("Not Working List");

//     // Updated headers
//     sheet.columns = [
//       { header: "Asset No", key: "asset_no", width: 20 },
//       { header: "Status", key: "status", width: 15 },
//       { header: "Model Name", key: "model_name", width: 20 },
//       { header: "IP Address", key: "ip_address", width: 20 },
//       { header: "Last Working", key: "last_working_on", width: 25 },
//       { header: "Location", key: "location_combined", width: 40 },
//     ];

//     // Process rows before adding to Excel
//     rows.forEach((row) => {
//       sheet.addRow({
//         asset_no: row.asset_no,
//         status: row.status == 1 ? "active" : "inactive",  
//         model_name: row.model_name,
//         ip_address: row.ip_address,
//         last_working_on: row.last_working_on,    
//         location_combined: `${row.location_name} → ${row.floor_name} → ${row.block_name}`,
//       });
//     });

//     // Saving logic (Windows / Linux)
//     let saveDir;

//     if (os.platform() === "win32") {
//       saveDir = "C:/CamlytxAi/notworkingexcel";
//     } else {
//       saveDir = app.getPath("downloads");
//     }

//     if (!fs.existsSync(saveDir)) {
//       fs.mkdirSync(saveDir, { recursive: true });
//     }

//     const fileName = `not_working_${type}_${Date.now()}.xlsx`;
//     const filePath = path.join(saveDir, fileName);

//     await workbook.xlsx.writeFile(filePath);

//     return successResponse(
//       { filePath, fileName },
//       `Excel saved to: ${filePath}`
//     );
//   } catch (error) {
//     console.error("Excel Generation Error:", error);
//     return errorResponse(error, "Failed to generate excel");
//   }
// }


//   async nvrcamerasummary() {
//     try {
//       const [rows] = await this.db.pool.query(`
//       SELECT
//         SUM(total_cameras) AS total_cameras,
//         SUM(active_cameras) AS active_cameras,
//         SUM(inactive_cameras) AS inactive_cameras,
//         SUM(total_nvrs) AS total_nvrs,
//         SUM(active_nvrs) AS active_nvrs,
//         SUM(inactive_nvrs) AS inactive_nvrs
//       FROM (
//         SELECT 
//             COUNT(*) AS total_cameras,
//             SUM(is_working = 1) AS active_cameras,
//             SUM(is_working = 0) AS inactive_cameras,
//             0 AS total_nvrs,
//             0 AS active_nvrs,
//             0 AS inactive_nvrs
//         FROM cameras
        
//         UNION ALL
        
//         SELECT
//             0 AS total_cameras,
//             0 AS active_cameras,
//             0 AS inactive_cameras,
//             COUNT(*) AS total_nvrs,
//             SUM(is_working = 1) AS active_nvrs,
//             SUM(is_working = 0) AS inactive_nvrs
//         FROM nvrs
//       ) AS summary
//     `);

//       const summary = rows[0];

//       const result = {
//         total_cameras: summary.total_cameras || 0,
//         active_cameras: summary.active_cameras || 0,
//         inactive_cameras: summary.inactive_cameras || 0,
//         total_nvrs: summary.total_nvrs || 0,
//         active_nvrs: summary.active_nvrs || 0,
//         inactive_nvrs: summary.inactive_nvrs || 0,
//         timestamp: new Date().toISOString(),
//       };

//       return successResponse(result, "nvrcamerasummery fetched successfully");
//     } catch (error) {
//       return errorResponse(error, "Failed to fetch nvrcamerasummery");
//     }
//   }

//   async cctvCameraPing() {
//     const [cameras] = await this.db.pool.query(`SELECT * FROM cameras`);
//     if (cameras.length === 0) {
//       console.log("No camera found");
//     } else {
//       console.log(`${cameras.length} cameras found`);
//     }

//     for (const cam of cameras) {
//       const result = await ping.promise.probe(cam.ip_address, { timeout: 2 });

//       if (!result.alive) {
//         console.log(`Camera ${cam.id} (${cam.ip_address}) is unreachable`);
//         if (cam.is_working === 1) {
//           await this.db.pool.query(
//             `UPDATE cameras SET is_working=0 ,updated_at=CURRENT_TIMESTAMP WHERE id=?`,
//             [cam.id]
//           );
//           console.log(`Camera ${cam.id} marked false`);
//         }
//       } else {
//         console.log(`Camera ${cam.id} (${cam.ip_address}) is online`);
//         await this.db.pool.query(
//           `UPDATE cameras SET last_working_on=CURRENT_TIMESTAMP WHERE id=?`,
//           [cam.id]
//         );
//         if (cam.is_working === 0) {
//           await this.db.pool.query(
//             `UPDATE cameras SET is_working=1, last_working_on=CURRENT_TIMESTAMP WHERE id=?`,
//             [cam.id]
//           );
//           console.log(`Camera ${cam.id} marked true`);
//         }
//       }
//     }
//   }

//   async nvrsPing() {
//     const [nvrs] = await this.db.pool.query(`SELECT * FROM nvrs`);
//     if (nvrs.length === 0) {
//       console.log("No NVR found");
//     } else {
//       console.log(`${nvrs.length} cameras found`);
//     }
//     for (const nvr of nvrs) {
//       const result = await ping.promise.probe(nvr.ip_address, { timeout: 2 });

//       if (!result.alive) {
//         console.log(`NVR ${nvr.id} (${nvr.ip_address}) unreachable`);
//         if (nvr.is_working === 1) {
//           await this.db.pool.query(
//             `UPDATE nvrs SET is_working=0, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
//             [nvr.id]
//           );
//           console.log(`NVR ${nvr.id} marked false`);
//         }
//       } else {
//         console.log(`NVR ${nvr.id} (${nvr.ip_address}) online`);
//         await this.db.pool.query(
//           `UPDATE nvrs SET last_working_on=CURRENT_TIMESTAMP WHERE id=?`,
//           [nvr.id]
//         );
//         if (nvr.is_working === 0) {
//           await this.db.pool.query(
//             `UPDATE nvrs SET is_working=1, last_working_on=CURRENT_TIMESTAMP WHERE id=?`,
//             [nvr.id]
//           );
//           console.log(`NVR ${nvr.id} marked true`);
//         }
//       }
//     }
//   }

//   async startPingScheduler() {
//     try {
//       const intervalTime = await this.appsettingservice.getPingInterval();

//       console.log(`Ping interval: ${intervalTime / 1000} seconds`);

//       if (this.cameraInterval) clearInterval(this.cameraInterval);
//       if (this.nvrInterval) clearInterval(this.nvrInterval);

//       await this.cctvCameraPing();
//       await this.nvrsPing();

//       // Schedule repeated ping
//       this.cameraInterval = setInterval(
//         () => this.cctvCameraPing(),
//         intervalTime
//       );
//       this.nvrInterval = setInterval(() => this.nvrsPing(), intervalTime);

//       return successResponse(
//         { interval: intervalTime },
//         "Ping scheduler started successfully"
//       );
//     } catch (error) {
//       console.error("Error starting ping scheduler:", error);
//       return errorResponse(error, "Failed to start ping scheduler");
//     }
//   }

//   async manualPingTrigger() {
//   try {
//     console.log("⚡ Manual ping triggered");

//     // Run camera & NVR pings in parallel
//     await Promise.all([this.cctvCameraPing(), this.nvrsPing()]);

//     // Restart scheduler
//     await this.startPingScheduler();

//     return successResponse(
//       null,
//       "Manual ping executed and scheduler restarted successfully"
//     );
//   } catch (error) {
//     console.error("Manual ping error:", error);
//     return errorResponse(error, "Manual ping failed");
//   }
// }

// }

// module.exports = PingService;


const ping = require("ping");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const { format } = require("@fast-csv/format");
const { to12HourFormat } = require("../utils/helper");

class PingService {
  constructor(database, AppSettingService) {
    this.db = database;
    this.appsettingservice = AppSettingService;
    this.cameraInterval = null;
    this.nvrInterval = null;
  }

  async updatePingInterval(data) {
    try {
      const { keyvalue } = data;
      if (!keyvalue) return errorResponse(null, "Time value is required");

      await this.db.pool.query(
        "UPDATE appsetting SET keyvalue = ? WHERE keyname = 'Health Check - Frequency in Milliseconds'",
        [keyvalue]
      );

      // Restart scheduler if running
      await this.startPingScheduler?.();

      return successResponse("Ping interval updated successfully");
    } catch (error) {
      return errorResponse(error, "Failed to update ping interval");
    }
  }

  async getCamerasAndNVRs() {
    try {
      const [cameras] = await this.db.pool.query(`
        SELECT 
          c.id, c.status, c.asset_no, c.model_name, c.ip_address, 
          c.last_working_on, c.is_working, c.location_id,
          l.name AS location_name, l.floor_id, f.name AS floor_name,
          f.block_id, b.name AS block_name
        FROM cameras c
        JOIN locations l ON c.location_id = l.id
        JOIN floors f ON l.floor_id = f.id
        JOIN blocks b ON f.block_id = b.id
      `);

      const [nvrs] = await this.db.pool.query(`
        SELECT 
          n.id, n.status, n.asset_no, n.model_name, n.ip_address, 
          n.last_working_on, n.is_working, n.location_id,
          l.name AS location_name, l.floor_id, f.name AS floor_name,
          f.block_id, b.name AS block_name
        FROM nvrs n
        JOIN locations l ON n.location_id = l.id
        JOIN floors f ON l.floor_id = f.id
        JOIN blocks b ON f.block_id = b.id
      `);

      const [last10Cameras] = await this.db.pool.query(`
        SELECT 
          c.id, c.status, c.asset_no, c.model_name, c.ip_address, 
          c.last_working_on, c.is_working, c.location_id,
          l.name AS location_name, l.floor_id, f.name AS floor_name,
          f.block_id, b.name AS block_name
        FROM cameras c
        JOIN locations l ON c.location_id = l.id
        JOIN floors f ON l.floor_id = f.id
        JOIN blocks b ON f.block_id = b.id
        ORDER BY c.id DESC
        LIMIT 10
      `);

      const [last10NVRs] = await this.db.pool.query(`
        SELECT 
          n.id, n.status, n.asset_no, n.model_name, n.ip_address, 
          n.last_working_on, n.is_working, n.location_id,
          l.name AS location_name, l.floor_id, f.name AS floor_name,
          f.block_id, b.name AS block_name
        FROM nvrs n
        JOIN locations l ON n.location_id = l.id
        JOIN floors f ON l.floor_id = f.id
        JOIN blocks b ON f.block_id = b.id
        ORDER BY n.id DESC
        LIMIT 10
      `);

      return successResponse(
        { cameras, nvrs, last10Cameras, last10NVRs },
        "Cameras and NVRs fetched successfully"
      );
    } catch (error) {
      return errorResponse(error, "Failed to fetch data");
    }
  }

  async notworkinglist(data) {
    try {
      const { type } = data;
      if (!type) return errorResponse("Type is required (cameras or nvrs)");

      if (type === "cameras") {
        const [rows] = await this.db.pool.query(`
          SELECT 
            c.id, c.status, c.location_id, l.name AS location_name, l.floor_id,
            f.name as floor_name, f.block_id, b.name AS block_name,
            c.nvr_id, c.asset_no, c.serial_number, c.model_name,
            c.ip_address, c.manufacturer, c.vendor, c.install_date,
            c.last_working_on, c.is_working, c.display_order
          FROM cameras c
          JOIN locations l ON c.location_id = l.id
          JOIN floors f on l.floor_id = f.id
          JOIN blocks b ON f.block_id = b.id
          WHERE c.is_working = 0
        `);

        return successResponse(rows, "Not Working Camera fetched successfully");
      }

      if (type === "nvrs") {
        const [rows] = await this.db.pool.query(`
          SELECT 
            n.id, n.status, n.location_id, l.name AS location_name, l.floor_id,
            f.name as floor_name, f.block_id, b.name AS block_name,
            n.asset_no, n.serial_number, n.model_name, n.ip_address,
            n.manufacturer, n.vendor, n.install_date, n.last_working_on,
            n.is_working, n.display_order
          FROM nvrs n
          JOIN locations l ON n.location_id = l.id
          JOIN floors f on l.floor_id = f.id
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

  async downloadNotWorkingCSV(type) {
  try {
    if (!type) return errorResponse(null, "Type is required");

    // Fetch data
    const dataResponse = await this.notworkinglist({ type });
    if (!dataResponse.success) return errorResponse(null, "Failed to fetch data");

    const rows = dataResponse.data;

    // Set folder path
    const saveDir =
      os.platform() === "win32"
        ? "C:/CamlytxAi/notworkingcsv"
        : app.getPath("downloads");

    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

    const fileName = `not_working_${type}_${Date.now()}.csv`;
    const filePath = path.join(saveDir, fileName);

    // Create write stream
    const ws = fs.createWriteStream(filePath);

    const csvStream = format({ headers: true });

    csvStream.pipe(ws).on("finish", () => {
      console.log(`CSV saved to: ${filePath}`);
    });

    // Add rows
    rows.forEach((row) => {
      csvStream.write({
        asset_no: row.asset_no,
        status: row.status == 1 ? "active" : "inactive",
        model_name: row.model_name,
        ip_address: row.ip_address,
        last_working_on: to12HourFormat(row.last_working_on),
        location: `${row.block_name} → ${row.floor_name} → ${row.location_name}`,
      });
    });

    csvStream.end();

    return successResponse({ filePath, fileName }, `CSV saved to: ${filePath}`);
  } catch (error) {
    console.error("CSV Generation Error:", error);
    return errorResponse(error, "Failed to generate csv");
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
          SELECT COUNT(*) AS total_cameras,
                 SUM(is_working = 1) AS active_cameras,
                 SUM(is_working = 0) AS inactive_cameras,
                 0 AS total_nvrs,
                 0 AS active_nvrs,
                 0 AS inactive_nvrs
          FROM cameras
          UNION ALL
          SELECT 0 AS total_cameras,
                 0 AS active_cameras,
                 0 AS inactive_cameras,
                 COUNT(*) AS total_nvrs,
                 SUM(is_working = 1) AS active_nvrs,
                 SUM(is_working = 0) AS inactive_nvrs
          FROM nvrs
        ) AS summary
      `);

      const summary = rows[0];
      return successResponse({
        total_cameras: summary.total_cameras || 0,
        active_cameras: summary.active_cameras || 0,
        inactive_cameras: summary.inactive_cameras || 0,
        total_nvrs: summary.total_nvrs || 0,
        active_nvrs: summary.active_nvrs || 0,
        inactive_nvrs: summary.inactive_nvrs || 0,
        timestamp: new Date().toISOString(),
      }, "nvrcamerasummery fetched successfully");
    } catch (error) {
      return errorResponse(error, "Failed to fetch nvrcamerasummery");
    }
  }

  // ===========================
  // CAMERA & NVR PING
  // ===========================
  async cctvCameraPing() {
    const [cameras] = await this.db.pool.query(`SELECT * FROM cameras`);
    if (!cameras.length) return console.log("No cameras found");

    console.log(`${cameras.length} cameras found`);

    const pingPromises = cameras.map(async (cam) => {
      try {
        const result = await ping.promise.probe(cam.ip_address, { timeout: 2 });

        if (!result.alive) {
          console.log(`Camera ${cam.id} (${cam.ip_address}) unreachable`);
          if (cam.is_working === 1) {
            await this.db.pool.query(
              `UPDATE cameras SET is_working=0, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
              [cam.id]
            );
          }
        } else {
          console.log(`Camera ${cam.id} (${cam.ip_address}) online`);
          await this.db.pool.query(
            `UPDATE cameras SET last_working_on=CURRENT_TIMESTAMP WHERE id=?`,
            [cam.id]
          );
          if (cam.is_working === 0) {
            await this.db.pool.query(
              `UPDATE cameras SET is_working=1, last_working_on=CURRENT_TIMESTAMP WHERE id=?`,
              [cam.id]
            );
          }
        }
      } catch (e) {
        console.log(`Camera ${cam.id} ping error:`, e.message);
      }
    });

    await Promise.allSettled(pingPromises);
  }

  async nvrsPing() {
    const [nvrs] = await this.db.pool.query(`SELECT * FROM nvrs`);
    if (!nvrs.length) return console.log("No NVRs found");

    console.log(`${nvrs.length} NVRs found`);

    const pingPromises = nvrs.map(async (nvr) => {
      try {
        const result = await ping.promise.probe(nvr.ip_address, { timeout: 2 });

        if (!result.alive) {
          console.log(`NVR ${nvr.id} (${nvr.ip_address}) unreachable`);
          if (nvr.is_working === 1) {
            await this.db.pool.query(
              `UPDATE nvrs SET is_working=0, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
              [nvr.id]
            );
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
          }
        }
      } catch (e) {
        console.log(`NVR ${nvr.id} ping error:`, e.message);
      }
    });

    await Promise.allSettled(pingPromises);
  }

  async startPingScheduler() {
    try {
      const intervalTime = await this.appsettingservice.getPingInterval();
      console.log(`Ping interval: ${intervalTime / 1000} seconds`);

      if (this.cameraInterval) clearInterval(this.cameraInterval);
      if (this.nvrInterval) clearInterval(this.nvrInterval);

      // Run initial ping without blocking
      this.cctvCameraPing();
      this.nvrsPing();

      this.cameraInterval = setInterval(() => this.cctvCameraPing(), intervalTime);
      this.nvrInterval = setInterval(() => this.nvrsPing(), intervalTime);

      return successResponse({ interval: intervalTime }, "Ping scheduler started");
    } catch (error) {
      console.error("Error starting ping scheduler:", error);
      return errorResponse(error, "Failed to start ping scheduler");
    }
  }

  async manualPingTrigger() {
    try {
      console.log("⚡ Manual ping triggered");

      await Promise.all([this.cctvCameraPing(), this.nvrsPing()]);

      // Restart scheduler asynchronously
      this.startPingScheduler();

      return successResponse(
        null,
        "Manual ping run successfully"
      );
    } catch (error) {
      console.error("Manual ping error:", error);
      return errorResponse(error, "Manual ping failed");
    }
  }
}

module.exports = PingService;
