const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const AuthTokenManager = require('../../security/AuthTokenManager');
const PasswordHash = require('../../security/PasswordHash');
const AuthenticationUseCase = require('../AuthenticationUseCase');

describe('AuthenticationUseCase', () => {
  describe('login', () => {
    it('should orchestrating the login action correctly', async () => {
      // Arrange
      const useCasePayload = {
        username: '123',
        password: 'secret',
      };

      const expectedUser = {
        id: '123',
        password: 'hashedPassword',
      };
      const expectedToken = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      /** creating dependency of use case */
      const mockUserRepository = new UserRepository();
      const mockAuthenticationRepository = new AuthenticationRepository();
      const mockPasswordHash = new PasswordHash();
      const mockAuthTokenManager = new AuthTokenManager();

      /** mocking needed function */
      mockUserRepository.verifyUserCredential = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedUser));
      mockPasswordHash.compare = jest.fn()
        .mockImplementation(() => Promise.resolve(true));
      mockAuthTokenManager.generateAccessToken = jest.fn()
        .mockImplementation(() => expectedToken.accessToken);
      mockAuthTokenManager.generateRefreshToken = jest.fn()
        .mockImplementation(() => expectedToken.refreshToken);
      mockAuthenticationRepository.addRefreshToken = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedToken.refreshToken));

      /** creating use case instance */
      const authenticationUseCase = new AuthenticationUseCase({
        userRepository: mockUserRepository,
        passwordHash: mockPasswordHash,
        authenticationRepository: mockAuthenticationRepository,
        authTokenManager: mockAuthTokenManager,
      });

      // Action
      const result = await authenticationUseCase.login(useCasePayload);

      // Assert
      expect(mockUserRepository.verifyUserCredential).toBeCalledWith(useCasePayload.username);
      expect(mockPasswordHash.compare)
        .toBeCalledWith(useCasePayload.password, expectedUser.password);
      expect(mockAuthTokenManager.generateAccessToken).toBeCalledWith({ id: expectedUser.id });
      expect(mockAuthTokenManager.generateRefreshToken).toBeCalledWith({ id: expectedUser.id });
      expect(mockAuthenticationRepository.addRefreshToken)
        .toBeCalledWith(expectedToken.refreshToken);
      expect(result).toStrictEqual(expectedToken);
    });

    it('should throw an error when password doesn\'t match', async () => {
      // Arrange
      const useCasePayload = {
        username: '123',
        password: 'secret',
      };

      const expectedUser = {
        id: '123',
        password: 'hashedPassword',
      };
      const expectedToken = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      /** creating dependency of use case */
      const mockUserRepository = new UserRepository();
      const mockAuthenticationRepository = new AuthenticationRepository();
      const mockPasswordHash = new PasswordHash();
      const mockAuthTokenManager = new AuthTokenManager();

      /** mocking needed function */
      mockUserRepository.verifyUserCredential = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedUser));
      mockPasswordHash.compare = jest.fn()
        .mockImplementation(() => Promise.resolve(false));
      mockAuthTokenManager.generateAccessToken = jest.fn()
        .mockImplementation(() => expectedToken.accessToken);
      mockAuthTokenManager.generateRefreshToken = jest.fn()
        .mockImplementation(() => expectedToken.refreshToken);
      mockAuthenticationRepository.addRefreshToken = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedToken.refreshToken));

      /** creating use case instance */
      const authenticationUseCase = new AuthenticationUseCase({
        userRepository: mockUserRepository,
        passwordHash: mockPasswordHash,
        authenticationRepository: mockAuthenticationRepository,
        authTokenManager: mockAuthTokenManager,
      });

      // Action and Assert
      await expect(() => authenticationUseCase.login(useCasePayload)).rejects.toThrowError('AUTHENTICATION_USE_CASE.LOGIN.INVALID_CREDENTIAL');
    });
  });

  describe('update access token', () => {
    it('should orchestrating the update access token action correctly', async () => {
      // Arrange
      const id = '123';
      const refreshToken = 'refreshToken';
      const accessToken = 'accessToken';

      /** creating dependency of use case */
      const mockUserRepository = new UserRepository();
      const mockAuthenticationRepository = new AuthenticationRepository();
      const mockPasswordHash = new PasswordHash();
      const mockAuthTokenManager = new AuthTokenManager();

      /** mocking needed function */
      mockAuthenticationRepository.verifyRefreshToken = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockAuthTokenManager.verifyRefreshToken = jest.fn()
        .mockImplementation(() => ({ id }));
      mockAuthTokenManager.generateAccessToken = jest.fn()
        .mockImplementation(() => accessToken);

      /** creating use case instance */
      const authenticationUseCase = new AuthenticationUseCase({
        userRepository: mockUserRepository,
        passwordHash: mockPasswordHash,
        authenticationRepository: mockAuthenticationRepository,
        authTokenManager: mockAuthTokenManager,
      });

      // Action
      const result = await authenticationUseCase.updateAccessToken(refreshToken);

      // Assert
      expect(mockAuthenticationRepository.verifyRefreshToken).toBeCalledWith(refreshToken);
      expect(mockAuthTokenManager.verifyRefreshToken).toBeCalledWith(refreshToken);
      expect(mockAuthTokenManager.generateAccessToken).toBeCalledWith(id);
      expect(result).toStrictEqual(accessToken);
    });
  });

  describe('logout', () => {
    it('should orchestrating the logout action correctly', async () => {
      // Arrange
      const refreshToken = 'refreshToken';

      /** creating dependency of use case */
      const mockUserRepository = new UserRepository();
      const mockAuthenticationRepository = new AuthenticationRepository();
      const mockPasswordHash = new PasswordHash();
      const mockAuthTokenManager = new AuthTokenManager();

      /** mocking needed function */
      mockAuthenticationRepository.verifyRefreshToken = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockAuthenticationRepository.deleteRefreshToken = jest.fn()
        .mockImplementation(() => Promise.resolve());

      /** creating use case instance */
      const authenticationUseCase = new AuthenticationUseCase({
        userRepository: mockUserRepository,
        passwordHash: mockPasswordHash,
        authenticationRepository: mockAuthenticationRepository,
        authTokenManager: mockAuthTokenManager,
      });

      // Action
      await authenticationUseCase.logout(refreshToken);

      // Assert
      expect(mockAuthenticationRepository.verifyRefreshToken).toBeCalledWith(refreshToken);
      expect(mockAuthenticationRepository.deleteRefreshToken).toBeCalledWith(refreshToken);
    });
  });
});
