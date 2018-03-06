var AV = require('leancloud-storage');
var { APP_KEY, APP_ID } = require('./config')

AV.init({
  appId: APP_ID,
  appKey: APP_KEY
})

async function saveToCloud(date, trendingList) {
  var Trending = AV.Object.extend('Trending');

  var query = new AV.Query('Trending')
  query.equalTo('date', date)
  var result = await query.first()
  if (result) {
    result.set('list', trendingList)
    return await result.save()
  } else {
    var trending = new Trending();
    trending.set('date', date)
    trending.set('list', trendingList)
    return await trending.save()
  }
}

module.exports = {
  saveToCloud
}
