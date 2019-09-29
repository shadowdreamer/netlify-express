'use strict'
const express = require('express')
const serverless = require('serverless-http')
const app = express()
const bodyParser = require('body-parser')

const router = express.Router()
const cors = require('cors');

const axios = require('axios')
const url = require("url")

const corsOptions = {
  origin: 'http://mltd.dovahkiin.top', 
  optionsSuccessStatus: 200 
}

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
router.get('/',cors(corsOptions), async (req, res) => {
  await checkAndGet()
  return res.json(cards)
})
router.get('/another', async (req, res) => res.json({ route: req.originalUrl }))
router.post('/',cors(corsOptions), async (req, res) => {
  let clientLen = req.body.localLength || 0
  let sendData
  if (req.body.version != localVer) {
    await checkAndGet()     
  } 
  if(clientLen > 0){
    sendData = cards.slice(clientLen)
    sendData = sendData.concat(rank5)
  }else{
    sendData = cards
  }
  return res.json(sendData)
})

//获取游戏更新情报
const news={}
async function getNews(cursor){
  if(!cursor){
    if(news.start){
      return news.start
    }else{
      let data =  await axios(`https://webview-dot-theaterdays.appspot.com/api/info?type=3&cursor=&platform=google`)
      news.start = data.data
      return data.data
    }
  }else{
    if(news[cursor]){
      return news[cursor]
    }else{
      let {data} =  await axios(`https://webview-dot-theaterdays.appspot.com/api/info?type=3&cursor=${cursor}&platform=google`)
      news[data.cursor] = data
      return data
    }
  }
}
router.get('/news', cors(corsOptions),async(req,res)=>{
  let query = url.parse(req.url,true).query;
  let data = await getNews(query.cursor)  
  res.json(data)
})


app.use('/pub', express.static('public'))
app.use(bodyParser.json())
app.use('/.netlify/functions/server', router)  // path must route to lambda
module.exports = app
module.exports.handler = serverless(app)
