const axios = require('axios');
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const router = express.Router();
router.get('/', (req, res) => res.json({ route: req.originalUrl }));
router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
router.post('/', (req, res) => res.json({ postBody: req.body }));
app.use(express.static('public'))
app.use(bodyParser.json());
app.use('/test', router)
app.use('/.netlify/functions/server', router);  // path must route to lambda

module.exports.handler = serverless(app);

module.exports = app;
