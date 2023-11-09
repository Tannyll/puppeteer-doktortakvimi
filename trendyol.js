import {Cluster} from "puppeteer-cluster";
import {join} from "path"

import fs from "fs"
import {fileURLToPath} from 'url';
import * as path from "path";
import {Axios} from "axios";


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


    await cluster.task(async ({page, data: url}) => {


        await page.goto(url, {
            waitUntil: 'networkidle2'
        });

        const product = await loadData(page)

        productsList.push(product)

        await downloadImage(product.images,product.dataFragmentId)

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

const loadData = async (page) => {
    //await page.screenshot({path: 'data/' + await page.title() + '.png'});
    // const cookies = await page.cookies()
    const url = await page.url()
    /*    fs.writeFile('data/cookie.json', JSON.stringify(cookies, null, 2), function (err) {
            if (err) throw err;
            console.log('completed write of cookies');
        });*/

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
            //const data = document.querySelector('.product-slide-container .product-slide img');   // önce .product-slide-container .product-slide img hover olacak sonrasında .gallery-modal-content img seçilecek
            //const data = document.querySelector('.gallery-modal-content img');   // hover oldugunda bu image çekilecek
            //const data = document.querySelector('a[class^='slc-img'] img');
            const allImage = []
            const data = document.querySelectorAll('.product-slide-container .product-slide');

            data.forEach((element) => {
                 element.hover()
                console.log(element)
                const images = document.querySelectorAll('.gallery-modal-content img');
                images.forEach((image)=> {
                    console.log(image)
                    allImage.push(image.src)
                })

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

const saveData = async (data) => {
    fs.writeFile('data/products.json', JSON.stringify(data, null, 2), function (err) {
        if (err) throw err;
        console.log('completed write of products');
    });
}

const downloadImage = async (images, dataFragmentId) => {

        //console.log(product.images)
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        for (const url of images) {
            const image = await fetch(url)
            const imageBlog = await image.blob()


            const fileName = `${new Date().getTime().toString()}${url.split('/').pop()}`
            const filePath = `${__dirname}\\data\\images\\${dataFragmentId.split('-')[0]}\\`
            const fullPath = filePath + fileName

            console.log(imageBlog)
            //console.log(filePath)

            const buffer = Buffer.from(await imageBlog.arrayBuffer());

            try {
                fs.mkdir(filePath, {recursive: true}, () => console.log("Created folder."))
                fs.writeFile(fullPath, buffer, () => console.log('saved image.'));

            } catch (e) {
                console.log(e)
            }
        }


}


async function download(uri) {
    const image = await fetch(uri)
    const imageBlog = await image.blob()


    const fileName = uri.split('/').pop();
    const writeFile = fs.writeFile(imageBlog);
    writeFile.close()

}

function blobToFile(theBlob, fileName) {
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
}

/*
cron.schedule('*!/15 17-19 * * 1-5', async () => {

}*/