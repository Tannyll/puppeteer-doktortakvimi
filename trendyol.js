const puppeteer = require("puppeteer");
const fs = require('fs');
const request = require('request');
const {Cluster} = require('puppeteer-cluster');

(async (category = '') => {
    let products = []
    let urls = [
        {
            url: "https://www.trendyol.com/hummel/aerolite-ii-unisex-gri-ayakkabi-p-32282887"
        }]

    //var fileData = fs.readFileSync('products.json', 'utf8')
    //urls = JSON.parse(fileData)


    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 100,
        monitor: true,
        puppeteerOptions: {
            headless: false,
            defaultViewport: false,
            executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            userDataDir: '/Users/serdar/Library/Application Support/Google/Chrome',
        }
    });

    cluster.on("taskerror", (err, data) => {
        console.log(`Error crawling ${data}: ${err.message}`);
    });

    await cluster.task(async ({page, data: url}) => {

        await page.goto(url);
        console.log("detailPage: ", url)

        const browser = await puppeteer.launch({
            headless: 'new'
        });


        const productHandles = await page.$$('#product-detail-container');

        for (const productHandle of productHandles ){
            console.log(productHandle)
            let id = "Null";
            let url = "Null";
            let fullName = "Null";
            let isActive = "Null";
            let clinic = "Null";

            try {
                id = await page.evaluate(el => el.querySelector('h1 > a > span').getAttribute("data-drroot"), productHandle)

                console.log(id)
            } catch (e) {
            }
        }

        id = await page.evaluate(() => {
            const data = document.querySelector('[data-drroot="h1"]');
            return data.getAttribute('span')
        });

        const data = {
            id
        }


        products.push(data)

        await browser.close();

    });


    for (const link of urls) {
        console.log(link)
        await cluster.queue(link.url)
    }


    fs.writeFile(`products.json`, JSON.stringify(products), (err) => {
        if (err) throw err;
    })


    await cluster.idle();
    await cluster.close();
})();