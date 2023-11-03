const puppeteer = require("puppeteer");
const fs = require('fs');
const request = require('request');
const {Cluster} = require('puppeteer-cluster');

(async (url = 'https://www.trendyol.com/hummel/aerolite-ii-unisex-gri-ayakkabi-p-32282887') => {
    let products = []
    let product = {}

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 100,
        monitor: true,
        puppeteerOptions: {
            headless: false,
            defaultViewport: false,
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            userDataDir: 'C:\\Users\\serda\\AppData\\Local\\Google\\Chrome\\User Data\\Default',
            //executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            //userDataDir: '/Users/serdar/Library/Application Support/Google/Chrome',
        }
    });

    cluster.on("task error", (err, data) => {
        console.log(`Error crawling ${data}: ${err.message}`);
    });

    await cluster.task(async ({page, data: url}) => {

        await page.goto(url);
        console.log("detailPage: ", url)

        const browser = await puppeteer.launch({
            headless: 'new'
        });


        const title = await page.evaluate(() => {
                //const data = document.querySelector('#product-detail-app > div > div.flex-container > div > div:nth-child(2) > div:nth-child(2) > div > div.product-detail-wrapper > div.pr-in-w > div > div > div:nth-child(1) > h1 > span');
                const data = document.querySelector('#product-detail-app h1 > span');
                return data.innerHTML
            }
        );
        const details = await page.evaluate(() => {
                //const data = document.querySelector('#product-detail-app > div > section > div > div > div > ul');
                const data = document.querySelector('#product-detail-app > div > section > div > div > div > ul');
                return data.innerHTML
            }
        );
        const urunOzellikleri = await page.evaluate(() => {
                //const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(4)');
                const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(4)');
                return data.innerHTML
            }
        );

        const materyalBileseni = await page.evaluate(() => {
                //const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(6)');
                const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(6)');
                return data.innerHTML
            }
        );

        const yikamaTalimati = await page.evaluate(() => {
                //const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(8)');
                const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(8)');
                return data.innerHTML
            }
        );

        product = {
            title,
            details,
            urunOzellikleri,
            materyalBileseni,
            yikamaTalimati

        }

        products.push(product)


        await browser.close();

    });


    await cluster.queue(url)


    fs.writeFile(`products.json`, JSON.stringify(product), (err) => {
        console.log(products)
        if (err) throw err;
    })


    await cluster.idle();
    await cluster.close();
})();