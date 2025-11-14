const ping = require('ping');

class PingService {
  constructor(database) {
    this.db = database;
    this.cameraInterval = null;
    this.nvrInterval = null;
  }


  async nvrcamerasummery(){
    try{
      const [cameraNvrCount] = await this.db.pool.query(`
          SELECT
  (SELECT COUNT(*) FROM cameras) AS total_cameras,
  (SELECT COUNT(*) FROM cameras WHERE is_working = 'active') AS active_cameras,
  (SELECT COUNT(*) FROM cameras WHERE is_working = 'inactive') AS inactive_cameras,
  (SELECT COUNT(*) FROM nvrs) AS total_nvrs,
  (SELECT COUNT(*) FROM nvrs WHERE is_working = 'active') AS active_nvrs,
  (SELECT COUNT(*) FROM nvrs WHERE is_working = 'inactive') AS inactive_nvrs;
        `)

        const result={
          total_cameras : cameraNvrCount[0].total_cameras|| 0 ,
          active_cameras: cameraNvrCount[0].active_cameras||0,
          inactive_camera: cameraNvrCount[0].inactive_camera||0,
          total_nvrs: cameraNvrCount[0].total_nvrs||0,
          active_nvrs: cameraNvrCount[0].active_nvrs||0,
          inactive_nvrs:cameraNvrCount[0].inactive_nvrs||0,
          timestamp: new Date().toISOString(),
        }
      return successResponse(result, "nvrcamerasummery fetched successfully");
    }catch(error){
       return errorResponse(error, "Failed to fetch nvrcamerasummery");
    }
  }

  async getPingInterval() {
    const [rows] = await this.db.pool.query(
      "SELECT value FROM pinginterval WHERE name = 'ping_interval' LIMIT 1"
    );

    if (rows.length > 0) return rows[0].value * 1000;
    return 600 * 1000;
  }

  async updatePingInterval(data) {
    const {time} = data;
    await this.db.pool.query(
      "UPDATE pinginterval SET value = ? WHERE name = 'ping_interval'",
      [time]
    );
    console.log(`Updated ping interval to ${time} seconds`);
    await this.startPingScheduler(); // restart scheduler dynamically
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
        if (cam.is_working === 'active') {
          await this.db.pool.query(
            `UPDATE cameras SET is_working='inactive', updated_at=CURRENT_TIMESTAMP WHERE id=?`,
            [cam.id]
          );
          console.log(`Camera ${cam.id} marked inactive`);
        }
      } else {
        console.log(`Camera ${cam.id} (${cam.ip_address}) is online`);
        if (cam.is_working === 'inactive') {
          await this.db.pool.query(
            `UPDATE cameras SET is_working='active', last_working_on=CURRENT_TIMESTAMP WHERE id=?`,
            [cam.id]
          );
          console.log(`Camera ${cam.id} marked active`);
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
        if (nvr.is_working === 'active') {
          await this.db.pool.query(
            `UPDATE nvrs SET is_working='inactive', updated_at=CURRENT_TIMESTAMP WHERE id=?`,
            [nvr.id]
          );
          console.log(`NVR ${nvr.id} marked inactive`);
        }
      } else {
        console.log(`NVR ${nvr.id} (${nvr.ip_address}) online`);
        if (nvr.is_working === 'inactive') {
          await this.db.pool.query(
            `UPDATE nvrs SET is_working='active', last_working_on=CURRENT_TIMESTAMP WHERE id=?`,
            [nvr.id]
          );
          console.log(`NVR ${nvr.id} marked active`);
        }
      }
    }
  }

  async startPingScheduler() {
    const intervalTime = await this.getPingInterval();

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
