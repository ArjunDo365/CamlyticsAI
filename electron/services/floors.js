

class FloorsService {
  constructor(database) {
    this.db = database;
  }

  async createfloors(data) {
    const { block_id,block_name, description } = data;
    const [result] = await this.db.pool.query(
      'INSERT INTO floors (block_id,name, description) VALUES (?, ?, ?)',
      [block_id,block_name, description]
    );
    return { id: result.insertId, ...data };
  }

  async getAllFloors() {
    const [rows] = await this.db.pool.query('SELECT * FROM floors');
    return rows;
  }

  async getByIdFloors(id) {
  const [rows] = await this.db.pool.query(
    'SELECT * FROM floors WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}


  async updateFloors(data) {
    const { id,block_id, name, description } = data;
    await this.db.pool.query(
      'UPDATE floors SET block_id = ?,name = ?, description = ?,update_on = CURRENT_TIMESTAMP WHERE id = ?',
      [block_id,name, description, id]
    );
    return { success: true };
  }

  async deleteFloors(id) {
    await this.db.pool.query('DELETE FROM floors WHERE id = ?', [id]);
    return { success: true };
  }
}

module.exports = FloorsService;
