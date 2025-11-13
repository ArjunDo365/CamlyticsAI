

class LocationService {
  constructor(database) {
    this.db = database;
  }

  async createLocation(data) {
    const { floors_id,name, description } = data;
    const [result] = await this.db.pool.query(
      'INSERT INTO location (floors_id,name, description) VALUES (?, ?, ?)',
      [floors_id,name, description]
    );
    return { id: result.insertId, ...data };
  }

  async getAllLocation() {
    const [rows] = await this.db.pool.query('SELECT * FROM location');
    return rows;
  }

  async getByIdLocation(id) {
  const [rows] = await this.db.pool.query(
    'SELECT * FROM location WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}


  async updateLocation(data) {
    const { id,floors_id, name, description } = data;
    await this.db.pool.query(
      'UPDATE location SET floors_id = ?,name = ?, description = ?,update_on = CURRENT_TIMESTAMP WHERE id = ?',
      [floors_id,name, description, id]
    );
    return { success: true };
  }

  async deleteLocation(id) {
    await this.db.pool.query('DELETE FROM location WHERE id = ?', [id]);
    return { success: true };
  }
}

module.exports = LocationService;
