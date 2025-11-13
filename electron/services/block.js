

class BlockService {
  constructor(database) {
    this.db = database;
  }

  async createBlock(data) {
    const { name, description } = data;
    const [result] = await this.db.pool.query(
      'INSERT INTO block (name, description) VALUES (?, ?)',
      [name, description]
    );
    return { id: result.insertId, ...data };
  }

  async getAllBlocks() {
    const [rows] = await this.db.pool.query('SELECT * FROM block');
    return rows;
  }

  async getByIdBlocks(id) {
  const [rows] = await this.db.pool.query(
    'SELECT * FROM block WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}


  async updateBlock(data) {
    const { id, name, description } = data;
    await this.db.pool.query(
      'UPDATE block SET name = ?, description = ?, update_on = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, id]
    );
    return { success: true };
  }

  async deleteBlock(id) {
    await this.db.pool.query('DELETE FROM block WHERE id = ?', [id]);
    return { success: true };
  }
}

module.exports = BlockService;
