const AuthTokenManager = require('../../Applications/security/AuthTokenManager');

class JwtAuthTokenManager extends AuthTokenManager {
  #jwt;

  #env;

  constructor(jwt, env) {
    super();
    this.#jwt = jwt;
    this.#env = env;
  }

  generateAccessToken(payload) {
    return this.#jwt.token.generate(payload, this.#env.ACCESS_TOKEN_KEY);
  }

  generateRefreshToken(payload) {
    return this.#jwt.token.generate(payload, this.#env.REFRESH_TOKEN_KEY);
  }

  verifyRefreshToken(refreshToken) {
    const artifacts = this.#jwt.token.decode(refreshToken);
    this.#jwt.token.verifySignature(artifacts, this.#env.REFRESH_TOKEN_KEY);
    const { payload } = artifacts.decoded;
    return payload;
  }
}

module.exports = JwtAuthTokenManager;
