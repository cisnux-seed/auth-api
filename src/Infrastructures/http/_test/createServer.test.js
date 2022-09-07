const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('HTTP server', () => {
  afterAll(async () => {
    await pool.end();
  });

  beforeEach(() => {
    jest.setTimeout(60000);
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  describe('users', () => {
    describe('when POST /users', () => {
      it('should response 201 and persisted user', async () => {
        // Arrange
        const requestPayload = {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        };
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/users',
          payload: requestPayload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.addedUser).toBeDefined();
      });

      it('should response 400 when request payload not contain needed property', async () => {
        // Arrange
        const requestPayload = {
          username: 'dicoding',
          password: 'secret',
        };
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/users',
          payload: requestPayload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual(
          'tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada',
        );
      });

      it('should response 400 when request payload not meet data type specification', async () => {
        // Arrange
        const requestPayload = {
          username: 'dicoding',
          password: 'secret',
          fullname: ['Dicoding Indonesia'],
        };
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/users',
          payload: requestPayload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual(
          'tidak dapat membuat user baru karena tipe data tidak sesuai',
        );
      });

      it('should response 400 when username more than 50 character', async () => {
        // Arrange
        const requestPayload = {
          username:
            'dicodingindonesiadicodingindonesiadicodingindonesiadicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        };
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/users',
          payload: requestPayload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual(
          'tidak dapat membuat user baru karena karakter username melebihi batas limit',
        );
      });

      it('should response 400 when username contain restricted character', async () => {
        // Arrange
        const requestPayload = {
          username: 'dicoding indonesia',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        };
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/users',
          payload: requestPayload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual(
          'tidak dapat membuat user baru karena username mengandung karakter terlarang',
        );
      });

      it('should response 400 when username unavailable', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ username: 'dicoding' });
        const requestPayload = {
          username: 'dicoding',
          fullname: 'Dicoding Indonesia',
          password: 'super_secret',
        };
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/users',
          payload: requestPayload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('username tidak tersedia');
      });

      it('should handle server error correctly', async () => {
        // Arrange
        const requestPayload = {
          username: 'dicoding',
          fullname: 'Dicoding Indonesia',
          password: 'super_secret',
        };
        const server = await createServer({}); // fake container

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/users',
          payload: requestPayload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(500);
        expect(responseJson.status).toEqual('error');
        expect(responseJson.message).toEqual(
          'terjadi kegagalan pada server kami',
        );
      });

      it('should response 404 when request unregistered route', async () => {
        // Arrange
        const server = await createServer({});

        // Action
        const response = await server.inject({
          method: 'GET',
          url: '/unregisteredRoute',
        });

        // Assert
        expect(response.statusCode).toEqual(404);
      });
    });

    describe('when GET /', () => {
      it('should return 200 and hello world', async () => {
        // Arrange
        const server = await createServer({});
        // Action
        const response = await server.inject({
          method: 'GET',
          url: '/',
        });
        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.value).toEqual('Hello world!');
      });
    });
  });

  describe('authentications', () => {
    describe('when POST /authentications', () => {
      it('should response 201 and response with access token and refresh token', async () => {
        // Arrange
        const requestPayload = {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        };

        const server = await createServer(container);

        // Action
        await server.inject({
          method: 'POST',
          url: '/users',
          payload: requestPayload,
        });

        const response = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: requestPayload.username,
            password: requestPayload.password,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.accessToken).toBeDefined();
        expect(responseJson.data.refreshToken).toBeDefined();
      });

      it('should response with status code 401', async () => {
        // Arrange
        const requestPayload = {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        };

        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: requestPayload.username,
            password: requestPayload.password,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.status).toEqual('fail');
      });
    });

    describe('when PUT /authentications', () => {
      it('response status code should be 201 and response with new access token', async () => {
        // Arrange
        const requestPayload = {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        };

        const server = await createServer(container);

        // Action
        await server.inject({
          method: 'POST',
          url: '/users',
          payload: requestPayload,
        });

        const authResponse = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: requestPayload.username,
            password: requestPayload.password,
          },
        });

        const postResponse = JSON.parse(authResponse.payload);
        const { refreshToken } = postResponse.data;

        const response = await server.inject({
          method: 'PUT',
          url: '/authentications',
          payload: { refreshToken },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.accessToken).toBeDefined();
      });
    });

    describe('when DELETE /authentications', () => {
      it('response status code should be 201 and response with new access token', async () => {
        // Arrange
        const requestPayload = {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        };

        const server = await createServer(container);

        // Action
        await server.inject({
          method: 'POST',
          url: '/users',
          payload: requestPayload,
        });

        const authResponse = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: requestPayload.username,
            password: requestPayload.password,
          },
        });

        const postResponse = JSON.parse(authResponse.payload);
        const { refreshToken } = postResponse.data;

        const response = await server.inject({
          method: 'DELETE',
          url: '/authentications',
          payload: { refreshToken },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
      });
    });
  });
});
