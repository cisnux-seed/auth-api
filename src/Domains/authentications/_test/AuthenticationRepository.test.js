const AuthenticationRepository = require('../AuthenticationRepository');

describe('AuthenticationRepository interface', () => {
  it('should throw error when invoke abstract behavior', () => {
    // Arrange
    const authenticationRepository = new AuthenticationRepository();

    // Act and Assert
    expect(authenticationRepository.addRefreshToken('')).rejects.toThrowError('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(authenticationRepository.verifyRefreshToken('')).rejects.toThrowError('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(authenticationRepository.deleteRefreshToken('')).rejects.toThrowError('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
