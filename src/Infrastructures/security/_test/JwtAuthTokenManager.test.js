const JwtAuthTokenManager = require('../JwtAuthTokenManager');

describe('JwtAuthTokenManager', () => {
  it('should generate access token correctly', () => {
    // Arrange
    const MockJwt = {};
    const accessToken = 'ar123';
    const payload = 'u123';

    MockJwt.token = {};
    MockJwt.token.generate = jest.fn()
      .mockReturnValue(accessToken);
    const authTokenManager = new JwtAuthTokenManager(MockJwt, process.env);

    // Action
    const generatedAccessToken = authTokenManager.generateAccessToken(payload);

    // Assert
    expect(generatedAccessToken).toStrictEqual(accessToken);
    expect(MockJwt.token.generate).toBeCalledWith(payload, process.env.ACCESS_TOKEN_KEY);
  });

  it('should generate refresh token correctly', () => {
    // Arrange
    const MockJwt = {};
    const refreshToken = 'ru123';
    const payload = 'u123';

    MockJwt.token = {};
    MockJwt.token.generate = jest.fn()
      .mockReturnValue(refreshToken);
    const authTokenManager = new JwtAuthTokenManager(MockJwt, process.env);

    // Action
    const generatedRefreshToken = authTokenManager.generateRefreshToken(payload);

    // Assert
    expect(generatedRefreshToken).toStrictEqual(refreshToken);
    expect(MockJwt.token.generate).toBeCalledWith(payload, process.env.REFRESH_TOKEN_KEY);
  });

  it('refresh token should had verified', () => {
    // Arrange
    const MockJwt = {};
    const refreshToken = { token: 'ru123', artifacts: {} };
    const artifacts = { decoded: { payload: { id: 'u123' } } };

    MockJwt.token = {};
    MockJwt.token.decode = jest.fn()
      .mockReturnValue(artifacts);
    MockJwt.token.verifySignature = jest.fn()
      .mockImplementation(() => {});
    const authTokenManager = new JwtAuthTokenManager(MockJwt, process.env);

    // Action
    const payload = authTokenManager.verifyRefreshToken(refreshToken);

    // Assert
    expect(MockJwt.token.decode).toBeCalledWith(refreshToken);
    expect(MockJwt.token.verifySignature).toBeCalledWith(artifacts, process.env.REFRESH_TOKEN_KEY);
    expect(payload).toStrictEqual(artifacts.decoded.payload);
  });
});
