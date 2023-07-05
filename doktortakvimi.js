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
        const arrayList = []
        const grabFromRow = (row) => row
            .replace(/[\n\r]+|[\s]{2,}/g, ' ').trimStart().trimEnd()

        const listData = document.querySelectorAll('[id="data-type-disease"]  li');
        for (const li of listData) {
            if (li.querySelector('a')) {
                arrayList.push({title: li.querySelector('a').innerText});
            } else {
                arrayList.push({title: grabFromRow(li.innerText)});
            }
        }
        return arrayList
    });

    const practice = await page.evaluate(() => {
            const grabFromRowEl = (row, classname) => row
                .querySelector(classname)
                .innerText
                .trim()

            const arrayList = []
            const grabFromRow = (row) => row
                .replace(/[\n\r]+|[\s]{2,}/g, ' ').trimStart().trimEnd()

            const listData = document.querySelectorAll('[id="data-type-practice"]  li');
            for (const li of listData) {
                if (li.querySelector('a')) {
                    arrayList.push({title: li.querySelector('a').innerText});
                } else {
                    arrayList.push({title: grabFromRow(li.innerText)});
                }
            }
            return arrayList


        }
    );

    const school = await page.evaluate(() => {
            const arrayList = []
            const grabFromRow = (row) => row
                .replace(/[\n\r]+|[\s]{2,}/g, ' ').trimStart().trimEnd()

            const detailHref = document.querySelector('[data-test-id="doctor-exp-school"] a');

            if (detailHref) {
                const listData = document.querySelectorAll('[modal-id="#data-type-school"] li');

                for (const li of listData) {
                    arrayList.push({title: grabFromRow(li.innerText)});
                }

                return arrayList
            } else {
                const listData = document.querySelectorAll('[data-test-id="doctor-exp-school"] .media-body ul li');
                for (const li of listData) {
                    if (li.querySelector('a')) {
                        arrayList.push({title: li.querySelector('a').innerText});
                    } else {
                        arrayList.push({title: grabFromRow(li.innerText)});
                    }
                }
                return arrayList
            }


        }
    );

    const photo = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('[data-test-id="doctor-exp-photo"] ul li'), (e) =>
                (e.querySelector('a').href ?? e.querySelector('a').href)
            )
        }
    );

    const service = await page.evaluate(() => {
            const arrayList = []
            const grabFromRow = (row) => row
                .replace(/[\n\r]+|[\s]{2,}/g, ' ').trimStart().trimEnd()

            const listData = document.querySelectorAll('.card-body [data-test-id="profile-pricing-list-element"] .media-body');
            for (const li of listData) {
                if (li.querySelector('p')) {
                    arrayList.push({title: grabFromRow(li.querySelector('p').innerText)});
                } else {
                    arrayList.push({title: grabFromRow(li.innerText)});
                }
            }
            return arrayList
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


    for (let i = 10; i < 499; i++) {
        const doctorLinks = await page.$$eval('#search-content .has-cal-active', (element) =>
            element.map(e => ({
                url: e.querySelector(".card-body .media-body h3 a").href,
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

    fs.writeFile(`doctors_${category}.json`, JSON.stringify(Array.from(new Set(doctors))), (err) => {
        if (err) throw err;

        console.log(`${doctors.length} item saved!`)
    })


    await browser.close();
}

run('Psikoloji');