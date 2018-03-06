const puppeteer = require('puppeteer')
const { saveToCloud } = require('./store')

function extractTrendInfo(page, node) {
  return page.evaluate(node => {
    let map = function (list, cb) {
      let rtn = []
      for (let i = 0; i < list.length; i++) {
        rtn.push(cb(list[i]))
      }
      return rtn
    }
    return {
      title: node.querySelector('div.d-inline-block.col-9.mb-1 > h3 > a').innerText,
      href: node.querySelector('div.d-inline-block.col-9.mb-1 > h3 > a').href,
      desc: node.querySelector('div.py-1').innerText,
      star_num: node.querySelector('div.f6.text-gray.mt-2 > a:nth-child(2)').innerText.replace(',', ''),
      language: (node.querySelector('div.f6.text-gray.mt-2 > span:nth-child(1)') || { innerText: '' }).innerText.trim(),
      authors: map(node.querySelectorAll('div.f6.text-gray.mt-2 > span.d-inline-block.mr-3 > a img') || [], node => node.src)
    }
  }, node)
}

async function getLanguageList(page) {
  return await page.evaluate(() => {
    let data = []
    let languageEls = document.querySelectorAll('body > div.application-main > div.explore-pjax-container.container-lg.p-responsive.clearfix > div > div.col-md-3.float-md-left.mt-3.mt-md-0 > ul li')
    for (var el of languageEls) {
      data.push({
        language: el.innerText,
        src: el.children[0].href
      })
    }
  })
}

// (async () => {
//   const browser = await puppeteer.launch({
//     headless: true
//   });
//   const page = await browser.newPage();
//   await page.goto('https://github.com/trending');
//   let trending = await page.$$('.repo-list > li')
//   let data = []
//   for (let i = 0, l = trending.length; i < l; i++) {
//     let title = await extractTrendInfo(page, trending[i])
//     data.push(title)
//   }
//   await saveToCloud(timeFormat(new Date()), data)
//   await browser.close();
// })()

async function scrapy() {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.goto('https://github.com/trending');
  let trending = await page.$$('.repo-list > li')
  let data = []
  for (let i = 0, l = trending.length; i < l; i++) {
    let title = await extractTrendInfo(page, trending[i])
    data.push(title)
  }
  await saveToCloud(timeFormat(new Date()), data)
  await browser.close();
}

function timeFormat(date) {
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1, 2)}-${addZero(date.getDate(), 2)}`
}

function addZero(str, num) {
  str = str.toString()
  if (str.length < num) {
    return '0'.repeat(num - str.length) + str
  }
  return str
}


let schedule = null
let isRunning = false
scrapy().then(() => {
  console.log('start interval....')
  setInterval(async () => {
    if (isRunning) return
    isRunning = true
    try {
      await scrapy()
      isRunning = false
    } catch (error) {
      isRunning = false
    }
  }, 1000 * 60 * 60 * 5)
}).catch(err => {
  console.log(er)
})