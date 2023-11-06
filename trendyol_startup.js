const puppeteer = require("puppeteer");
const fs = require("fs");
const {join} = require("path");

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        userDataDir: join(__dirname, 'user_data/main'),
//        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36")
    await page.setViewport({width: 1200, height: 800});
    await page.goto("https://www.trendyol.com/sr?wb=125&wg=1&wc=121&tmpl=true&pr=4.5&sst=MOST_FAVOURITE", {
        waitUntil: "networkidle2"
    });
    let items = []

    //await ScrollDown(page, {size: 500, delay: 600, stepsLimit: 30})

    await autoScroll(page).then(async () => {

        items = await page.$$eval('.prdct-cntnr-wrppr .p-card-wrppr', (element) =>
            element.map(e => ({
                url: 'https://www.trendyol.com' + e.querySelector('[data-id] div a').getAttribute('href'),
                id: e.getAttribute('data-id'),

            })))
    })


    //const items = await scrapeItems(page);


    console.log(items)
    fs.writeFileSync(`urls.json`, JSON.stringify(items), (err) => {
        console.log(items)
        console.log(items.length)
        if (err) throw err;
    })

    await browser.close();

})();

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