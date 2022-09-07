const AuthenticationError = require('../../Commons/exceptions/AuthenticationError');

class AuthenticationRepositoryPostgres {
  #pool;

  constructor(pool) {
    this.#pool = pool;
  }

  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1) RETURNING token',
      values: [token],
    };

    const result = await this.#pool.query(query);

    return result.rows[0];
  }

  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new AuthenticationError('invalid authentication');
    }
  }

  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };

    await this.#pool.query(query);
  }
}

module.exports = AuthenticationRepositoryPostgres;
