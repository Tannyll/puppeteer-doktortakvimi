const puppeteer = require("puppeteer");
const fs = require('fs')
let allDoctorLinks = []
let doctors = []

async function detailPage(url) {
    console.log("detailPage : " + url)
    const browser = await puppeteer.launch({
        headless: 'new'
    });


    const page = await browser.newPage();
    await page.goto(url);

    const title = await page.evaluate(() => {
            const title = document.querySelector('.unified-doctor-header-info__name span');
            return title.innerText
        }
    );
    const fullName = await page.evaluate(() => {
            const title = document.querySelector('.unified-doctor-header-info__name [itemprop="name"]');
            return title.innerText
        }
    );

    const about = await page.evaluate(() => {
            const about = document.querySelector('[data-test-id="doctor-exp-about"] .media-body .text-muted p');
            return about.innerText
        }
    );

    const data = {
        title,
        fullName,
        about,
    }
    doctors.push(data)
    console.log(data)


    await browser.close();
}

async function run(category = 'Psikoloji') {
    const browser = await puppeteer.launch({
        headless: 'new'
    });
    const search = encodeURIComponent(category)

    const page = await browser.newPage();
    await page.goto(`https://www.doktortakvimi.com/ara?q=${search}`);


    for (let i = 0; i < 2; i++) {
        const doctorLinks = await page.$$eval('#search-content .has-cal-active', (element) =>
            element.map(e => ({
                url: e.querySelector('.card-body h3 a').href.split('#')[0],

            })))

        for (let ix = 0; ix < doctorLinks.length; ix++) {
            await detailPage(doctorLinks[ix].url)
        }


        allDoctorLinks.push(...doctorLinks)

        // pagination
        await page.evaluate(() => {
            const el = HTMLAnchorElement = document.querySelector(
                'a[data-test-id="pagination-next"]'
            );
            el.click();
        });

        const pageNumber = i + 2;
        await page.waitForResponse((response) => {
            console.log("Page : " + pageNumber)
            return response.url().includes(`&page=${pageNumber}`)
        })

        await page.waitForSelector("#search-content .has-cal-active")
    }

    fs.writeFile('doctors.json', JSON.stringify(Array.from(new Set(doctors))), (err) => {
        if (err) throw err;

        console.log(`${doctors.length} item saved!`)
    })


    await browser.close();
}

run('Psikoloji');