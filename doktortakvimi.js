const puppeteer = require("puppeteer");
const fs = require('fs');
const request = require('request');

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
            const fullName = document.querySelector('.unified-doctor-header-info__name [itemprop="name"]');
            return fullName.innerText
        }
    );

    const about = await page.evaluate(() => {
            const about = document.querySelector('[id="data-type-about" ] .modal-body p');
                return about.innerText
        }
    );

    const disease = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('[id="data-type-disease"] ul li'), (e) =>
                (e.querySelector('a').innerText ?? e.querySelector('a').innerText)
            )
        }
    );

    const practice = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('[id="data-type-practice"] ul li'), (e) =>
                (e.querySelector('a').innerText ?? e.querySelector('a').innerText)
            )
        }
    );

    const school = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('[data-test-id="doctor-exp-school"] ul li'), (e) =>
                (e.innerText ?? e.innerText)
            )
        }
    );

    const photo = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('[data-test-id="doctor-exp-photo"] ul li'), (e) =>
                (e.querySelector('a').href ?? e.querySelector('a').href)
            )
        }
    );

    const service = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('[id="profile-pricing"] .card-body [data-test-id="profile-pricing-list-element"] .media-body'), (e) =>
                (e.querySelector('p').innerText ?? e.querySelector('p').innerText)
            )
        }
    );


    const data = {
        title,
        fullName,
        about,
        disease,
        school,
        practice,
        photo,
        service
    }

    doctors.push(data)
    console.log(data)


    await browser.close();
}

async function trimClear(value) {
    if (value)
        return value.replace(/[\n\r]+|[\s]{2,}/g, ' ').trimStart().trimEnd()
}

async function download(uri, filename) {
    return new Promise((resolve, reject) => {
        request.head(uri, function (err, res, body) {
            request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve);
        });
    });
}

async function run(category = 'Psikoloji') {
    const browser = await puppeteer.launch({
        headless: 'new'
    });
    const search = encodeURIComponent(category)

    const page = await browser.newPage();
    await page.goto(`https://www.doktortakvimi.com/ara?q=${search}`);


    for (let i = 0; i < 499; i++) {
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