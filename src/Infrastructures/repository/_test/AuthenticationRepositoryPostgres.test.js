const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const AuthenticationError = require('../../../Commons/exceptions/AuthenticationError');
const pool = require('../../database/postgres/pool');
const AuthenticationRepositoryPostgres = require('../AuthenticationRepositoryPostgres');

describe('UserRepositoryPostgres', () => {
  beforeEach(() => {
    jest.setTimeout(60000);
  });

  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyRefreshToken function', () => {
    it('should throw AuthenticationError when refresh token not available', async () => {
      // Arrange
      await AuthenticationsTableTestHelper.addToken('r123');
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);

      // Action and Assert
      await expect(authenticationRepository.verifyRefreshToken('r231')).rejects.toThrowError(AuthenticationError);
    });

    it('should not throw AuthenticationError when refresh token available', async () => {
      // Arrange
      await AuthenticationsTableTestHelper.addToken('r123');
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);

      // Action & Assert
      await expect(authenticationRepository.verifyRefreshToken('r123')).resolves.not.toThrowError(AuthenticationError);
    });
  });

  describe('addRefreshToken function', () => {
    it('should persist refresh token', async () => {
      // Arrange
      const refreshToken = 'r123';
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);

      // Action
      await authenticationRepository.addRefreshToken(refreshToken);

      // Assert
      const refreshTokens = await AuthenticationsTableTestHelper.findToken(refreshToken);
      expect(refreshTokens).toHaveLength(1);
    });

    it('should return refresh token correctly', async () => {
      // Arrange
      const refreshToken = 'r123';
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);

      // Action
      const { token: addedRefreshToken } = await authenticationRepository
        .addRefreshToken(refreshToken);

      // Assert
      expect(addedRefreshToken).toStrictEqual(refreshToken);
    });
  });

  describe('deleteRefreshToken', () => {
    it('should delete refresh token correctly', async () => {
      // Arrange
      const refreshToken = 'r123';
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);

      // Action
      await authenticationRepository.deleteRefreshToken(refreshToken);

      // Assert
      const refreshTokens = await AuthenticationsTableTestHelper.findToken(refreshToken);
      expect(refreshTokens).toHaveLength(0);
    });
  });
});
