import {Cluster} from "puppeteer-cluster";
import {join} from "path"
import { pipeline }  from "stream/promises"

import fs from "fs"
import { fileURLToPath } from 'url';
import * as path from "path";
import * as https from "https";


(async () => {
    let urlList = []
    let productsList = []
    const data = fs.readFileSync('urls.json', 'utf8');
    urlList = JSON.parse(data);
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

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

        productsList.push(await loadData(page))

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
    const url = await page.url()
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
            //const data = document.querySelector('a[class^='slc-img'] img');
            const allImage = []
            const data = document.querySelectorAll('[data-drroot="slicing-attributes"] a > img');
            data.forEach((element) => {
                download(element.src);
                allImage.push(element.src)
            })
            return allImage
        } catch (e) {
        }
    });


    return {
        dataFragmentId,
        url,
        title: productTitle,
        details,
        productFeatures,
        materialComponent,
        washingInstructions,
        price,
        size,
        brand,
        images,
        updatedAt: new Date()
    }
}
async function download(url) {
    return new Promise(async (onSuccess) => {
        https.get(url, async (res) => {
            let fileName = url.split("/").pop()
            const fileWriteStream = fs.createWriteStream(path.join(__dirname, __filename), {
                autoClose: true,
                flags: "w",
            })
            await pipeline(res, fileWriteStream)
            onSuccess("success")
        })
    })
}

/*
cron.schedule('*!/15 17-19 * * 1-5', async () => {

}*/