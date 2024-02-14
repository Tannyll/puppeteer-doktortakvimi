import * as path from "path";
import {join} from "path";
import fs from "fs";
import {fileURLToPath} from "url";
import {Cluster} from "puppeteer-cluster";


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
        maxConcurrency: 6,
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


    await cluster.task(async ({page, data: data}) => {

        await page.goto(data.url, {
            waitUntil: 'networkidle2'
        });

        const product = await loadData(page,data)

        productsList.push(product)

        //await downloadImage(product.images, product.dataFragmentId)

        await saveData(productsList)

    });

    for (let link of urlList[0]) {
        console.log('Push in queue : ', link.url);
        await cluster.queue(link)
    }

    await cluster.idle();
    await cluster.close();

    console.log(`Chrome Closed.`);
})();

const loadData = async (page,data) => {
    const productInformation = await page.$$eval('#firstTab table tbody tr', (element) => {
            try {

                return element.map(e => ({
                    title: e.querySelector('th').innerText.trim(),
                    value: e.querySelector('td em').innerText.trim(),
                }))
            } catch (e) {
            }
        }
    )

    const dimensions = await page.$$eval('#secondTab table tbody tr', (element) => {
            try {
                return element.map(e => ({
                    title: e.querySelector('th').innerText.trim(),
                    value: e.querySelector('td em').innerText.trim(),
                }))
            } catch (e) {
            }
        }
    )
//
    const additions = await page.$$eval('#thirdTab table:nth-child(1)  tbody tr:nth-child(n+2)', (element) => {
            try {
                return element.map(e => ({
                    title: e.querySelector('th').innerText.trim(),
                    value: e.querySelector('td em') ? e.querySelector('td em').innerText.trim():'*',
                }))
            } catch (e) {
            }
        }
    )
    const additionsExtra = await page.$$eval('#thirdTab table:nth-child(2) > tbody > tr', (element) => {
            try {
                return element.map(e => ({
                    title: e.querySelector('th').innerText,
                    value: e.querySelector('td em') ? e.querySelector('td em').innerText:'*',
                }))
            } catch (e) {
            }
        }
    )

    return {
        id:data.id,
        product: productInformation,
        dimensions: dimensions,
        additions: additions,
    }
}




const getElementData = async (page, element) => {
    await page.evaluate(() => {
        try {
            return document.querySelector(element).innerText
        } catch (e) {
        }
    });
}
const saveData = async (data) => {
    fs.writeFile('products.json', JSON.stringify(data, null, 2), function (err) {
        if (err) throw err;
        console.log('completed write of products');
    });
}


/*
cron.schedule('*!/15 17-19 * * 1-5', async () => {

}*/