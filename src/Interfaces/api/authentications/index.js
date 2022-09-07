const AuthenticationHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'authentications',
  register: async (server, { container }) => {
    const authenticationHandler = new AuthenticationHandler(container);
    server.route(routes(authenticationHandler));
  },
};
