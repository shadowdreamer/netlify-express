const axios = require('axios');
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const router = express.Router();

const data = {
  version: '',
  cards: ''
}
router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  console.log(data)
  axios('https://api.matsurihi.me/mltd/v1/version/latest').then(e => {
    console.log(e)
    if (e.data.res.updateTime == data.version) {
      res.write(data.cards);
      res.end();
    } else {
      data.version = e.data.res.updateTime
      axios('https://api.matsurihi.me/mltd/v1/cards?prettyPrint=false').then(resp => {
        console.log(resp)
        data.cards = JSON.stringify(resp.data)
        res.write(data.cards)
        res.end()
      })
    }
  })
});

router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
router.post('/', (req, res) => res.json({ postBody: req.body }));
app.use(express.static('public'))
app.use(bodyParser.json());
app.use('/test', router)
app.use('/.netlify/functions/server', router);  // path must route to lambda

module.exports.handler = serverless(app);

module.exports = app;
