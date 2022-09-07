const AuthenticationUseCase = require('../../../Applications/use_case/AuthenticationUseCase');

class AuthenticationHandler {
  #container;

  constructor(container) {
    this.#container = container;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    const { username, password } = request.payload;
    const result = await this.#container.getInstance(AuthenticationUseCase.name)
      .login({ username, password });

    const response = h.response({
      status: 'success',
      message: 'login has been successful',
      data: result,
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request) {
    const { refreshToken } = request.payload;
    const accessToken = await this.#container.getInstance(AuthenticationUseCase.name)
      .updateAccessToken(refreshToken);

    return {
      status: 'success',
      message: 'update refresh token has been successful',
      data: { accessToken },
    };
  }

  async deleteAuthenticationHandler(request) {
    const { refreshToken } = request.payload;

    await this.#container.getInstance(AuthenticationUseCase.name)
      .logout(refreshToken);

    return {
      status: 'success',
      message: 'logout has been successful',
    };
  }
}

module.exports = AuthenticationHandler;
