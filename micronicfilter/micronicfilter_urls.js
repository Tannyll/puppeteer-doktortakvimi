import path, {join} from "path";
import {fileURLToPath} from "url";
import puppeteer from "puppeteer";
import writeJsonFile from "../util/helper.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const browser = await puppeteer.launch({
    headless: false,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    userDataDir: join(__dirname, 'user_data/main'),
//        args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
let pageCount = 7
const page = await browser.newPage();
await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36")
//await page.setViewport({width: 1200, height: 800});
await page.goto("https://catalog.micronicfilter.com/product-search-result/?page=2&code=3S4", {
    waitUntil: "networkidle2"
});


async function getData(page) {
    let items = []

    items = await page.$$eval('#tableDetail a[href^="/product/"', (element) =>
        element.map(e => ({
                id: e.getAttribute('href').split('/')[2],
                url: 'https://catalog.micronicfilter.com' + e.getAttribute('href')
            })
        ))
    return items
}

async function hasPage(page) {
    try {
        return await page.$x("//a[starts-with(@href, '?page') and contains(text(),'next')]")

    } catch (e) {

    }
}

async function pagination(page) {
    //const firstLink = await page.waitForSelector("#pagination > ul > li:nth-child(4) > a")
    //const endPage = await page.$x("//a[contains(text(),'Page ')]")[0]
    //const bodyHandle = await page.$x("//a[contains(text(),'Page ')]");
    let item = [];
    await page.evaluate(() => {
        try {
            const extracted = document.querySelectorAll('#pagination > ul > li');
            extracted.forEach((element) => {
                item.push({href: element.querySelector('a')})
                console.log(element)

            })

        } catch (e) {
        }
    });

    return item

    /*    const selector = await page.$('#pagination > ul > li')
        const pag = await page.evaluate(async () => {
            const bar = document.querySelectorAll(selector)
        })*/


}

async function goNext(page) {
    try {

        page.setDefaultTimeout(3000)
        //await page.waitForXPath("//a[starts-with(@href, '?page') and contains(text(),'next')]")
        const pageFirst = page.waitForSelector("#pagination > ul > li:nth-child(2) > a")
        const pageLast = page.waitForSelector("#pagination > ul > li:nth-child(4) > a")
        if (pageFirst)
            await page.click("#pagination > ul > li:nth-child(2) > a")

        if (pageLast)
            await page.click("#pagination > ul > li:nth-child(4) > a")


        await pagination(page)
    } catch (e) {
        console.log(e)
    }


    /*
        await pagination(page)

        if (pageCount === "1") {
            await page.click("#pagination > ul > li:nth-child(2) > a")
            pageCount++
        } else {
            await page.click("#pagination > ul > li:nth-child(4) > a")
            pageCount++
        }
    */

}

let allData = []
while (true) {
    let data = await getData(page)
    allData.push(data)
    console.log("Row : ", data.length)
    console.log("Page : ", allData.length)
    let hasNext = await hasPage(page);
    if (hasNext) {
        await goNext(page)
    } else {
        break
    }
}
//console.log(allData)

writeJsonFile(allData)
await browser.close();


/*let items = []

items = await page.$$eval('#tableDetail a[href^="/product/"', (element) =>
    element.map(e => ({
            id: e.getAttribute('href').split('/')[2],
            url: 'https://catalog.micronicfilter.com' + e.getAttribute('href')
        })
    ))


//await page.waitForNavigation()


//const xp = "//a[starts-with(@href, '?page') and contains(text(),'next')]";
//const pagination = await page.$x(xp)
//let nextLink = await pagination[0].evaluate(element => element.href)
//console.log("pagination :::::: ", nextLink)
//await page.waitForXPath(xp,1000);
//await page.goto(nextLink)


console.log(items)
console.log(items.length)
writeJsonFile(items)
await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
});

const pagination0 = await page.$("#pagination > ul > li:nth-child(4) > a")
await page.waitForSelector("#pagination > ul > li:nth-child(4) > a")
await page.click("#pagination > ul > li:nth-child(4) > a")

/!*     const pagination = await page.$x("//a[starts-with(@href, '?page') and contains(text(),'next')]")
     await pagination[0].click()
     await page.waitForXPath("//a[starts-with(@href, '?page') and contains(text(),'next')]")*!/


//await page.close()
//await browser.close();*/


async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });

}


function wait(ms) {
    return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

function extractItems() {

    const extractedElements = document.querySelectorAll('.prdct-cntnr-wrppr .p-card-wrppr');
    const items = [];
    for (let element of extractedElements) {

        items.push(
            {
                url: 'https://www.trendyol.com' + element.querySelector('[data-id] div a').getAttribute('href'),
                id: element.getAttribute('data-id'),
            });
    }
    return items;
}

function extractItem(page) {
    let items = [];

    page.evaluate(() => {
        try {
            //const data = document.querySelector('a[class^='slc-img'] img');

            const extractedElements = document.querySelectorAll('.prdct-cntnr-wrppr .p-card-wrppr');

            for (let element of extractedElements) {

                items.push(
                    {
                        url: 'https://www.trendyol.com' + element.querySelector('[data-id] div a').getAttribute('href'),
                        id: element.getAttribute('data-id'),
                    });
            }

        } catch (e) {
        }
    });

    return items;
}

async function scrapeItems(page) {

    let items = [];
    try {

        await page.evaluate(() => {
            try {

                const data = document.querySelectorAll(".prdct-cntnr-wrppr .p-card-wrppr");
                data.forEach((e) => {
                    items.push({
                        url: 'https://www.trendyol.com' + e.querySelector('[data-id] div a').getAttribute('href'),
                        id: e.getAttribute('data-id'),
                    })
                })
                return items
            } catch (e) {
            }
        });

        return items;

    } catch (e) {
    }
    return items;
}


async function scrollToBottom() {
    await new Promise(resolve => {
        const distance = 100; // should be less than or equal to window.innerHeight
        const delay = 100;
        const timer = setInterval(() => {
            document.scrollingElement.scrollBy(0, distance);
            if (document.scrollingElement.scrollTop + window.innerHeight >= document.scrollingElement.scrollHeight) {
                clearInterval(timer);
                resolve();
            }
        }, delay);
    });
}

async function ScrollDown(page, {size = 500, delay = 1000, stepsLimit = 4} = {}) {
    const lastScrollPosition = await page.evaluate(
        async (pixelsToScroll, delayAfterStep, limit) => {
            const getElementScrollHeight = element => {
                if (!element) return 0
                const {scrollHeight, offsetHeight, clientHeight} = element
                return Math.max(scrollHeight, offsetHeight, clientHeight)
            }

            const availableScrollHeight = getElementScrollHeight(document.body)
            let lastPosition = 0

            const scrollFn = resolve => {
                const intervalId = setInterval(() => {
                    window.scrollBy(0, pixelsToScroll)
                    lastPosition += pixelsToScroll

                    if ((lastPosition >= availableScrollHeight) || (limit !== null && lastPosition >= pixelsToScroll * limit)) {
                        clearInterval(intervalId)
                        resolve(lastPosition)
                    }
                }, delayAfterStep)
            }

            return new Promise(scrollFn)
        },
        size,
        delay,
        stepsLimit
    )

    return lastScrollPosition
}


//https://blog.francium.tech/web-scraping-with-puppeteer-ca9e5c1b7802