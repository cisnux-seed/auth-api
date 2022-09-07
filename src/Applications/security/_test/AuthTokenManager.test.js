const AuthTokenManager = require('../AuthTokenManager');

describe('AuthTokenManager', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const authTokenManager = new AuthTokenManager();
    const refreshToken = 'refreshToken';
    const payload = 'payload';

    // Act
    expect(() => authTokenManager.generateAccessToken(payload)).toThrowError('AUTH_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED');
    expect(() => authTokenManager.generateRefreshToken(payload)).toThrowError('AUTH_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED');
    expect(() => authTokenManager.verifyRefreshToken(refreshToken)).toThrowError('AUTH_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED');
  });
});
