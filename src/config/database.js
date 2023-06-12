import { Sequelize } from 'sequelize';

// Option 3: Passing parameters separately (other dialects)
const glDB = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mssql',
    define: {
      schema: process.env.DB_SCHEMA,
    },
  }
);

module.exports = {
  glDB,
};
