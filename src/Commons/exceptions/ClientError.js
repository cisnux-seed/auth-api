class ClientError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;

    if (this.constructor.name === 'ClientError') {
      throw new Error('cannot instantiate abstract class');
    }

    this.statusCode = statusCode;
    this.name = 'ClientError';
  }
}

module.exports = ClientError;
