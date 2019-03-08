const pg = require('pg'),
  // connectString = 'postgres://postgres:123456mvp@localhost:5432/node-test';
  connectConfig = {
    user: 'postgres',
    database: 'node-test',
    port: 5432,
    host: 'localhost',
    password: '123456mvp',
  };

const client = new pg.Client(connectConfig);

module.exports = {
  client,
};
