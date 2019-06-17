'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const router = express.Router();
const axios = require('axios');

const localData = {
  version: 'not ready',
  cards: '',
}
function checkVersion(){
  console.log('checking version')
  return axios('https://api.matsurihi.me/mltd/v1/version/latest')
}
function getData(){
  console.log('getting data')
  return axios('https://api.matsurihi.me/mltd/v1/cards/33?prettyPrint=false')
}
async function checkAndGet(){
  let serverVer = await checkVersion()
  if( serverVer.data.res.updateTime != localData.version){
    console.log('updating data')
    let serverCards = await getData()
    localData.version = serverVer.data.res.updateTime
    localData.cards = serverCards.data
    return 
  }else{
    console.log('need not update')
    return
  }
}
router.get('/', async (req, res) => {  
  await checkAndGet()
  return res.json(localData)   
});

router.get('/another', async (req, res) => res.json({ route: req.originalUrl }));
router.post('/', async (req, res) => {
  console.log(req.body)
  if(req.body.version == localData.version){
    return res.json(localData)
  }else{
    await checkAndGet()
    return res.json(localData)
  }
});
app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
module.exports = app;
module.exports.handler = serverless(app);
