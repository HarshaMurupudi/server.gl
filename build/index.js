"use strict";
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
const express = require('express');
const cors = require('cors');
const { glDB } = require('./config/database');
const jobRoutes = require('./routes/jobs');
glDB
    .authenticate()
    .then(() => console.log('DB Authenticated'))
    .catch((err) => {
    console.log('Error: ' + err);
    // console.log(logger.error());
    // logger.error(err.stack);
    // throw err;
});
const PORT = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(jobRoutes);
app.listen(PORT, () => {
    console.log(`Sever is up and listening on port ${PORT}`);
    console.log(process.env.DB_NAME, 'env');
});
