

class BlockService {
  constructor(database) {
    this.db = database;
  }

  async createBlock(blockData) {
    const { block_name, description } = blockData;
    const [result] = await this.db.pool.query(
      'INSERT INTO block (block_name, description) VALUES (?, ?)',
      [block_name, description]
    );
    return { id: result.insertId, ...blockData };
  }

  async getAllBlocks() {
    const [rows] = await this.db.pool.query('SELECT * FROM block');
    return rows;
  }

  async getByIDBlocks(id) {
  const [rows] = await this.db.pool.query(
    'SELECT * FROM block WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}


  async updateBlock(blockData) {
    const { id, block_name, description } = blockData;
    await this.db.pool.query(
      'UPDATE block SET block_name = ?, description = ? WHERE id = ?',
      [block_name, description, id]
    );
    return { success: true };
  }

  async deleteBlock(id) {
    await this.db.pool.query('DELETE FROM block WHERE id = ?', [id]);
    return { success: true };
  }
}

module.exports = BlockService;
