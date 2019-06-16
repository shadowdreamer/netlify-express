'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const router = express.Router();
const axios = require('axios');
const schedule = require('node-schedule')

const data = {
  version: '',
  cards: '',
  status:''
}

function getData(ver) {
  data.status = 'updating'
  console.log('getting new card info')
  axios('https://api.matsurihi.me/mltd/v1/cards?prettyPrint=false').then(resp => {
    console.log('get new card info successed')
    data.version = ver
    data.cards = resp.data
    data.status = 'updated'
  })
}
function checkUpdate() {
  axios('https://api.matsurihi.me/mltd/v1/version/latest').then(e => {
    console.log('check card update')
    if (e.data.res.updateTime != data.version) {
      getData(e.data.res.updateTime)
    }
  })
}
getData()
schedule.scheduleJob('30 39 3 * *', checkUpdate)

router.get('/', (req, res) => {
  // res.writeHead(200, { 'Content-Type': 'text/html' });
  res.json(data)
  res.end()
});

router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
router.post('/', (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
