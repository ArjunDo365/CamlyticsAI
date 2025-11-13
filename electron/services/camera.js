class CameraService {
  constructor(database) {
    this.db = database;
  }


  async createCamera(data) {
    const {
      location_id,
      nvr_id,
      asset_no,
      serial_number,
      model_name,
      ip_address,
      port,
      manufacturer,
      vendor,
      install_date,
      last_working_on,
      is_working
    } = data;

    const [result] = await this.db.pool.query(
      `INSERT INTO cameras 
      (location_id, nvr_id, asset_no, serial_number, model_name, ip_address, port, manufacturer, vendor, install_date, last_working_on, is_working)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        location_id,
        nvr_id,
        asset_no,
        serial_number,
        model_name,
        ip_address,
        port || 80,
        manufacturer,
        vendor,
        install_date,
        last_working_on,
        is_working || 'active'
      ]
    );

    return { id: result.insertId, ...data };
  }

  async getAllCameras() {
    const [rows] = await this.db.pool.query('SELECT * FROM cameras');
    return rows;
  }

  async getCameraById(id) {
    const [rows] = await this.db.pool.query('SELECT * FROM cameras WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async updateCamera(data) {
    const {
      id,
      location_id,
      nvr_id,
      asset_no,
      serial_number,
      model_name,
      ip_address,
      port,
      manufacturer,
      vendor,
      install_date,
      last_working_on,
      is_working
    } = data;

    await this.db.pool.query(
      `UPDATE cameras 
       SET location_id=?, nvr_id=?, asset_no=?, serial_number=?, model_name=?, ip_address=?, port=?, manufacturer=?, vendor=?, 
           install_date=?, last_working_on=?, is_working=?, updated_at=CURRENT_TIMESTAMP 
       WHERE id=?`,
      [
        location_id,
        nvr_id,
        asset_no,
        serial_number,
        model_name,
        ip_address,
        port,
        manufacturer,
        vendor,
        install_date,
        last_working_on,
        is_working,
        id
      ]
    );

    return { success: true };
  }

  async deleteCamera(id) {
    await this.db.pool.query('DELETE FROM cameras WHERE id = ?', [id]);
    return { success: true };
  }
}

module.exports = CameraService;
