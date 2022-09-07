const PasswordHash = require('../../Applications/security/PasswordHash');

class BcryptPasswordHash extends PasswordHash {
  #bcrypt;

  #saltRound;

  constructor(bcrypt, saltRound = 10) {
    super();
    this.#bcrypt = bcrypt;
    this.#saltRound = saltRound;
  }

  async hash(password) {
    return this.#bcrypt.hash(password, this.#saltRound);
  }

  async compare(password, hashedPassword) {
    const isMatch = await this.#bcrypt.compare(password, hashedPassword);
    return isMatch;
  }
}

module.exports = BcryptPasswordHash;
