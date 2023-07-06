const puppeteer = require("puppeteer");
(async () => {

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
        userDataDir: './tmp',
    });

    //const search = encodeURIComponent(category)

    const page = await browser.newPage();
    await page.goto(`https://www.doktortakvimi.com/ara?q=Nefroloji&loc=Ankara&page=6`, {
        waitUntil: "load"
    });

    const isDisabled = (await page.$('[data-test-id="pagination-next"]')) !== null;

    console.log(isDisabled)

    //await browser.close();
})();