const puppeteer = require("puppeteer");

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new'
    });

    const page = await browser.newPage();
    await page.goto('https://www.hepsiburada.com/bilgisayarlar-c-2147483646')
    //await page.screenshot({path: 'hepsiburada.png', fullPage: true})
    // const grabParagraf = await page.evaluate(() => {
    //     const pTag = document.querySelector('.productListContent-frGrtf5XrVXRwJ05HUfU .productListContent-rEYj2_8SETJUeqNhyzSm li div ')
    //     return pTag.innerText
    // })

    const products = await page.$$eval('.productListContent-frGrtf5XrVXRwJ05HUfU .productListContent-rEYj2_8SETJUeqNhyzSm ul', (element) =>
        element.map(e => ({
            title: e.querySelector('li').innerText,
        })))

    console.log(products)


    await browser.close()

})();