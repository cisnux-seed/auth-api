/* istanbul ignore file */

const { createContainer } = require('instances-container');

// external agency
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');
const pool = require('./database/postgres/pool');

// service {repository, helper, manager, etc}
const UserRepositoryPostgres = require('./repository/UserRepositoryPostgres');
const AuthenticationRepositoryPostgres = require('./repository/AuthenticationRepositoryPostgres');
const BcryptPasswordHash = require('./security/BcryptPasswordHash');
const JwtAuthTokenManager = require('./security/JwtAuthTokenManager');

// use case
const AddUserUseCase = require('../Applications/use_case/AddUserUseCase');
const AuthenticationUseCase = require('../Applications/use_case/AuthenticationUseCase');
const UserRepository = require('../Domains/users/UserRepository');
const AuthenticationRepository = require('../Domains/authentications/AuthenticationRepository');
const PasswordHash = require('../Applications/security/PasswordHash');
const AuthTokenManager = require('../Applications/security/AuthTokenManager');

// creating container
const container = createContainer();

// registering services and repository
container.register([
  {
    key: UserRepository.name,
    Class: UserRepositoryPostgres,
    parameter: {
      dependencies: [
        { concrete: pool },
        { concrete: nanoid },
      ],
    },
  },
  {
    key: AuthenticationRepository.name,
    Class: AuthenticationRepositoryPostgres,
    parameter: {
      dependencies: [
        { concrete: pool },
      ],
    },
  },
  {
    key: PasswordHash.name,
    Class: BcryptPasswordHash,
    parameter: {
      dependencies: [
        { concrete: bcrypt },
      ],
    },
  },
  {
    key: AuthTokenManager.name,
    Class: JwtAuthTokenManager,
    parameter: {
      dependencies: [
        { concrete: Jwt },
        { concrete: process.env },
      ],
    },
  },
]);

// registering use cases
container.register([
  {
    key: AddUserUseCase.name,
    Class: AddUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'userRepository',
          internal: UserRepository.name,
        },
        {
          name: 'passwordHash',
          internal: PasswordHash.name,
        },
      ],
    },
  },
  {
    key: AuthenticationUseCase.name,
    Class: AuthenticationUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'userRepository',
          internal: UserRepository.name,
        },
        {
          name: 'authenticationRepository',
          internal: AuthenticationRepository.name,
        },
        {
          name: 'passwordHash',
          internal: PasswordHash.name,
        },
        {
          name: 'authTokenManager',
          internal: AuthTokenManager.name,
        },
      ],
    },
  },
]);

module.exports = container;
