'use strict'
const express = require('express')
const serverless = require('serverless-http')
const app = express()
const bodyParser = require('body-parser')

const router = express.Router()
const axios = require('axios')

let cards = []
let rank5 = []
let localVer = 'not ready'
function checkVersion () {
  console.log('checking version')
  return axios('https://api.matsurihi.me/mltd/v1/version/latest')
}
function getData () {
  console.log('getting data')
  return axios('https://api.matsurihi.me/mltd/v1/cards?prettyPrint=false')
}
async function checkAndGet () {
  let serverVer = await checkVersion()
  if (serverVer.data.res.updateTime != localVer) {
    console.log('updating data')
    let serverCards = await getData()
    localVer = serverVer.data.res.updateTime
    cards = serverCards.data
    rank5 = cards.filter(el=>!!el.rank5Costume)
    return
  } else {
    console.log('need not update')
    return
  }
}
router.get('/', async (req, res) => {
  await checkAndGet()
  return res.json(cards)
})
router.get('/another', async (req, res) => res.json({ route: req.originalUrl }))
router.post('/', async (req, res) => {
  let clientLen = req.body.localLength || 0
  let sendData = cards
  if(clientLen > 0){
    let sendData = cards.slice(clientLen)
    sendData = sendData.concat(rank5)
  }
  if (req.body.version == localVer) {
    return res.json(sendData)
  } else {
    await checkAndGet()
    return res.json(sendData)
  }
})
app.use('/pub', express.static('public'))
app.use(bodyParser.json())
app.use('/.netlify/functions/server', router)  // path must route to lambda
module.exports = app
module.exports.handler = serverless(app)
