class AuthenticationUseCase {
  #userRepository;

  #passwordHash;

  #authenticationRepository;

  #authTokenManager;

  constructor({
    userRepository,
    passwordHash,
    authenticationRepository,
    authTokenManager,
  }) {
    this.#userRepository = userRepository;
    this.#passwordHash = passwordHash;
    this.#authenticationRepository = authenticationRepository;
    this.#authTokenManager = authTokenManager;
  }

  async login({ username, password }) {
    const { id, password: hashedPassword } = await this.#userRepository
      .verifyUserCredential(username);
    const match = await this.#passwordHash.compare(password, hashedPassword);

    if (!match) {
      throw new Error('AUTHENTICATION_USE_CASE.LOGIN.INVALID_CREDENTIAL');
    }

    const accessToken = this.#authTokenManager.generateAccessToken({ id });
    const refreshToken = this.#authTokenManager.generateRefreshToken({ id });

    await this.#authenticationRepository.addRefreshToken(refreshToken);

    return { accessToken, refreshToken };
  }

  async updateAccessToken(refreshToken) {
    await this.#authenticationRepository.verifyRefreshToken(refreshToken);

    const { id } = this.#authTokenManager.verifyRefreshToken(refreshToken);
    const accessToken = this.#authTokenManager.generateAccessToken(id);

    return accessToken;
  }

  async logout(refreshToken) {
    await this.#authenticationRepository.verifyRefreshToken(refreshToken);
    await this.#authenticationRepository.deleteRefreshToken(refreshToken);
  }
}

module.exports = AuthenticationUseCase;
