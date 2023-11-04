const puppeteer = require("puppeteer");
const fs = require('fs');
const {Cluster} = require("puppeteer-cluster");
const {join} = require("path");

const listData = []
let productsList = []
let product = {}

//linkFetcher("https://www.trendyol.com/kadin-ayakkabi-x-g1-c114")
async function linkFetcher(url) {

    const browser = await puppeteer.launch({
        headless: 'new'
    });

    const page = await browser.newPage();
    await page.goto(url);

    const urls = await page.$$eval('.prdct-cntnr-wrppr .p-card-wrppr', (element) =>
        element.map(e => ({
            url: 'https://www.trendyol.com' + e.querySelector('[data-id] div a').getAttribute('href'),
            id: e.getAttribute('data-id'),

        })))

    await browser.close();

    fs.writeFile(`urls.json`, JSON.stringify(urls), (err) => {
        console.log(urls)
        if (err) throw err;
    })
};

//https://blog.francium.tech/web-scraping-with-puppeteer-ca9e5c1b7802

(async () => {


    let urlList = []


    const data = fs.readFileSync('urls.json', 'utf8');
    urlList = JSON.parse(data);

    console.log(`Chrome Launched...`);


    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 3,
        skipDuplicateUrls: true,

        monitor: true,
        puppeteerOptions: {
            headless: false,
            defaultViewport: false,
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            userDataDir: join(__dirname, 'user_data/main'),
            //userDataDir: 'C:\\Users\\LENOVO\\AppData\\Local\\Google\\Chrome\\User Data\\Default',
            //executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            //userDataDir: '/Users/serdar/Library/Application Support/Google/Chrome',
        }
    });

    cluster.on("task error", (err, data) => {
        console.log(`Error crawling ${data}: ${err.message}`);
    });


    await cluster.task(async ({page, data: url}) => {


        await page.goto(url, {
            waitUntil: 'networkidle2'
        });

        productsList = await loadData(page)

        await saveData(productsList)

    });

    for (let link of urlList) {
        console.log('Push in queue : ', link.url);
        await cluster.queue(link.url)
    }

    await cluster.idle();
    await cluster.close();

    console.log(`Chrome Closed.`);
})();

const saveData = async (data) => {
    fs.writeFile('data/products.json', JSON.stringify(data, null, 2), function (err) {
        if (err) throw err;
        console.log('completed write of products');
    });
}
const loadData = async (page) => {

    //await page.screenshot({path: 'data/' + await page.title() + '.png'});

    const cookies = await page.cookies()
    fs.writeFile('data/cookie.json', JSON.stringify(cookies, null, 2), function (err) {
        if (err) throw err;
        console.log('completed write of cookies');
    });

    const dataFragmentId = await page.evaluate(() => {
        try {
            //const data = document.querySelector('[data-fragment-name="ProductDetail"]');
            const data = document.querySelector('[data-fragment-name="ProductDetail"]');
            return data.getAttribute("data-fragment-id")
        } catch (e) {
        }
    });


    const productTitle = await page.evaluate(() => {
        try {
            //const data = document.querySelector('#product-detail-app > div > div.flex-container > div > div:nth-child(2) > div:nth-child(2) > div > div.product-detail-wrapper > div.pr-in-w > div > div > div:nth-child(1) > h1 > span');
            const data = document.querySelector('#product-detail-app h1 > span');
            return data.innerHTML
        } catch (e) {
        }
    });

    const details = await page.evaluate(() => {
        try {
//const data = document.querySelector('#product-detail-app > div > section > div > div > div > ul');
            const data = document.querySelector('#product-detail-app > div > section > div > div > div > ul');
            return data.innerHTML
        } catch (e) {
        }
    });

    const productFeatures = await page.evaluate(() => {
        try {
            //const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(4)');
            const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(4)');
            return data.innerHTML
        } catch (e) {
        }
    });

    const materialComponent = await page.evaluate(() => {
        try {
            //const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(6)');
            const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(6)');
            return data.innerHTML
        } catch (e) {
        }
    });

    const washingInstructions = await page.evaluate(() => {
        try {
            //const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(8)');
            const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(8)');
            return data.innerHTML
        } catch (e) {
        }
    });

    const price = await page.evaluate(() => {
        try {
            //const data = document.querySelector('#product-detail-app > div > div.flex-container > div > div:nth-child(2) > div:nth-child(2) > div > div.product-detail-wrapper > div.pr-in-w > div > div > div.product-price-container > div > div > span');
            const data = document.querySelector('#product-detail-app > div > div.flex-container > div > div:nth-child(2) > div:nth-child(2) > div > div.product-detail-wrapper > div.pr-in-w > div > div > div.product-price-container > div > div > span');
            return data.innerHTML
        } catch (e) {
        }
    });

    const brand = await page.evaluate(() => {
        try {
            //const data = document.querySelector('#product-detail-app .product-brand-name-with-link');
            const data = document.querySelector('#product-detail-app .product-brand-name-with-link');
            return data.innerHTML
        } catch (e) {
        }
    });

    const size = await page.evaluate(() => {
        try {
            //const data = document.querySelector('#product-detail-app [title="Beden seçmek için tıklayınız"]');
            const allSize = []
            const data = document.querySelectorAll('#product-detail-app [title="Beden seçmek için tıklayınız"]');
            data.forEach((element) => {
                allSize.push(element.innerHTML)
            })
            return allSize
        } catch (e) {
        }
    });

    const images = await page.evaluate(() => {
        try {
            //const data = document.querySelector('[data-drroot="slicing-attributes"] a');
            const allImage = []
            const data = document.querySelectorAll('[data-drroot="slicing-attributes"] a > img');
            data.forEach((element) => {
                allImage.push(element.src)
            })
            return allImage
        } catch (e) {
        }
    });


    productsList.push({
        dataFragmentId,
        title: productTitle,
        details,
        productFeatures,
        materialComponent,
        washingInstructions,
        price,
        size,
        brand,
        images
    })

    return productsList
}


/*
cron.schedule('*!/15 17-19 * * 1-5', async () => {

}*/