const puppeteer = require("puppeteer");
const fs = require("fs");
(async () => {
//initialize browser
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 250,
    });
    const page = await browser.newPage();
//goes to url, waits until no more network requests being made
    await page.goto("http://quotes.toscrape.com/", {
        waitUntil: "networkidle2",
    });
//click login link to navigate to login page
    await page.click(".col-md-4 a");
//complete login form
    await page.focus("#username");
    await page.keyboard.type("shinji.ikari@email.com");
    await page.focus("#password");
    await page.keyboard.type("123");
    await page.keyboard.press("Enter");
//uncomment following line if you remove slowMo option
    //await page.waitForNavigation("networkidle2");
//loop for number of pages you want to scrape
    for (let i = 0; i < 3; i++) {
        let data = await page.evaluate(() => {
//get all quote divs from page
            let quoteDivs = document.querySelectorAll(".quote");
            let quotes = [];
            quoteDivs.forEach((quote) => {
//get quote text and author for each quote
                let text = quote.querySelector(".text").innerHTML;
                let author = quote.querySelector(".author").innerHTML;
                quotes.push({ text, author });
            });
            return quotes;
        });
//Outputting scraped data
// console.log(data);
        let dataAsText = "";
        data.forEach((quote) => {
            dataAsText += `${quote.text} \n ${quote.author} \n\n`;
        });
        console.log(dataAsText);
        fs.appendFileSync("TopQuotes.txt", dataAsText);
//scroll to the bottom of the page and go to next page
        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });
        await page.waitForSelector(".pager");
        await page.click(".next a");
    }
    await browser.close();
})();