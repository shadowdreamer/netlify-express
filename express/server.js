'use strict'
const express = require('express')
const serverless = require('serverless-http')
const app = express()
const bodyParser = require('body-parser')

const router = express.Router()
const cors = require('cors');

const axios = require('axios')
const url = require("url")

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
      let data=  await axios(`https://webview-dot-theaterdays.appspot.com/api/info?type=3&cursor=${cursor}&platform=google`)
      news[cursor] = data.data
      return data.data
    }
  }
}

async function getInfo(cursor = "",type=1){
    let {data} =  await axios(`https://webview-dot-theaterdays.appspot.com/api/info?type=${type}&cursor=${cursor}&platform=google`)
    return data

}
router.get('/news', async(req,res)=>{
  let query = url.parse(req.url,true).query;
  let data = await getInfo(query.cursor,3)  
  res.json(data)
})
router.get('/events', async(req,res)=>{
  let query = url.parse(req.url,true).query;
  let data = await getInfo(query.cursor,2)
  res.json(data)
})
router.get('/features', async(req,res)=>{
  let query = url.parse(req.url,true).query;
  let data = await getInfo(query.cursor,1)
  res.json(data)
})

app.use(cors())
app.use('/pub', express.static('public'))
app.use(bodyParser.json())
app.use('/.netlify/functions/server', router)  // path must route to lambda
module.exports = app
module.exports.handler = serverless(app)
