class NvrService {
  constructor(database) {
    this.db = database;
  }


  async createNvr(data) {
    const {
      location_id,
      asset_no,
      serial_number,
      model_name,
      ip_address,
      manufacturer,
      vendor,
      install_date,
      last_working_on,
      is_working
    } = data;

    const [result] = await this.db.pool.query(
      `INSERT INTO nvrs 
      (location_id, asset_no, serial_number, model_name, ip_address, manufacturer, vendor, install_date, last_working_on, is_working)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        location_id,
        asset_no,
        serial_number,
        model_name,
        ip_address,
        manufacturer,
        vendor,
        install_date,
        last_working_on,
        is_working || 'active'
      ]
    );

    return { id: result.insertId, ...data };
  }


  async getAllNvrs() {
    const [rows] = await this.db.pool.query('SELECT * FROM nvrs');
    return rows;
  }


  async getNvrById(id) {
    const [rows] = await this.db.pool.query('SELECT * FROM nvrs WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  }


  async updateNvr(data) {
    const {
      id,
      location_id,
      asset_no,
      serial_number,
      model_name,
      ip_address,
      manufacturer,
      vendor,
      install_date,
      last_working_on,
      is_working
    } = data;

    await this.db.pool.query(
      `UPDATE nvrs 
       SET location_id=?, asset_no=?, serial_number=?, model_name=?, ip_address=?, manufacturer=?, vendor=?, 
           install_date=?, last_working_on=?, is_working=?, updated_at=CURRENT_TIMESTAMP 
       WHERE id=?`,
      [
        location_id,
        asset_no,
        serial_number,
        model_name,
        ip_address,
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


  async deleteNvr(id) {
    await this.db.pool.query('DELETE FROM nvrs WHERE id = ?', [id]);
    return { success: true };
  }
}

module.exports = NvrService;