/* eslint-disable no-unused-vars */

class AuthTokenManager {
  generateAccessToken(payload) {
    throw new Error('AUTH_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED');
  }

  generateRefreshToken(payload) {
    throw new Error('AUTH_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED');
  }

  verifyRefreshToken(refreshToken) {
    throw new Error('AUTH_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = AuthTokenManager;
