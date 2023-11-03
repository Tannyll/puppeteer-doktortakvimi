const puppeteer = require("puppeteer");
const fs = require('fs');
detailPage()
async function detailPage(url = 'https://www.trendyol.com/hummel/aerolite-ii-unisex-gri-ayakkabi-p-32282887') {
    let products = []
    let product = {}

    console.log("detailPage: ", url)

    const browser = await puppeteer.launch({
        headless: 'new'
    });

    const page = await browser.newPage();
    await page.goto(url);

    const dataFragmentId = await page.evaluate(() => {
            //const data = document.querySelector('[data-fragment-name="ProductDetail"]');
            const data = document.querySelector('[data-fragment-name="ProductDetail"]');
            return data.getAttribute("data-fragment-id")
        }
    );

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
    const productFeatures = await page.evaluate(() => {
            //const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(4)');
            const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(4)');
            return data.innerHTML
        }
    );

    const materialComponent = await page.evaluate(() => {
            //const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(6)');
            const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(6)');
            return data.innerHTML
        }
    );

    const washingInstructions = await page.evaluate(() => {
            //const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(8)');
            const data = document.querySelector('#product-detail-app > div > section > div > ul:nth-child(8)');
            return data.innerHTML
        }
    );
    const price = await page.evaluate(() => {
            //const data = document.querySelector('#product-detail-app > div > div.flex-container > div > div:nth-child(2) > div:nth-child(2) > div > div.product-detail-wrapper > div.pr-in-w > div > div > div.product-price-container > div > div > span');
            const data = document.querySelector('#product-detail-app > div > div.flex-container > div > div:nth-child(2) > div:nth-child(2) > div > div.product-detail-wrapper > div.pr-in-w > div > div > div.product-price-container > div > div > span');
            return data.innerHTML
        }
    );

    const brand = await page.evaluate(() => {
            //const data = document.querySelector('#product-detail-app .product-brand-name-with-link');
            const data = document.querySelector('#product-detail-app .product-brand-name-with-link');
            return data.innerHTML
        }
    );

    const beden = await page.evaluate(() => {
            //const data = document.querySelector('#product-detail-app [title="Beden seçmek için tıklayınız"]');
        const allBeden =   []
        const data = document.querySelectorAll('#product-detail-app [title="Beden seçmek için tıklayınız"]');
            data.forEach((element)=> {
                allBeden.push(element.innerHTML)
            })
            return allBeden
        }
    );

    const images = await page.evaluate(() => {
            //const data = document.querySelector('[data-drroot="slicing-attributes"] a');
        const allImage =   []
        const data = document.querySelectorAll('[data-drroot="slicing-attributes"] a > img');
            data.forEach((element)=> {
                allImage.push(element.src)
            })
            return allImage
        }
    );

    product = {
        dataFragmentId,
        url,
        title,
        details,
        productFeatures,
        materialComponent,
        washingInstructions,
        price,
        beden,
        brand,
        images

    }

    products.push(product)


    await browser.close();


    fs.writeFile(`products.json`, JSON.stringify(product), (err) => {
        console.log(products)
        if (err) throw err;
    })
};
