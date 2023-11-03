const puppeteer = require("puppeteer");
const fs = require('fs');
const request = require('request');
const {Cluster} = require('puppeteer-cluster');


(async () => {
    let allDoctorLinks = []
    let doctors = []
    let items = [];
    let urls = []


    var data = fs.readFileSync('OrtopediVeTravmatoloji_all.json', 'utf8');
    urls = JSON.parse(data);
    console.log(urls)

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 100,
        monitor: true,
        puppeteerOptions: {
            headless: false,
            defaultViewport: false,
            executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            userDataDir: '/Users/serdar/Library/Application Support/Google/Chrome',
        }
    });

    cluster.on("taskerror", (err, data) => {
        console.log(`Error crawling ${data}: ${err.message}`);
    });

    await cluster.task(async ({page, data: url}) => {

        await page.goto(url);

        console.log("detailPage : " + url)
        const browser = await puppeteer.launch({
            headless: 'new'
        });


        const doctorId = await page.evaluate(() => {
                const data = document.querySelector('.unified-doctor-content-column');
                return data.getAttribute('data-doctor-id')
            }
        );

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
                const isAbout = document.querySelector('[data-test-id="doctor-exp-about"]');

                if (isAbout) {
                    const about = document.querySelector('[data-id="doctor-items-modals"] .modal-body p');
                    return about.innerText
                }
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
            doctorId,
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


        await browser.close();

    });

    for (const link of urls) {
        await cluster.queue(link.url)
    }

    fs.writeFile(`doctors.json`, JSON.stringify(doctors), (err) => {
        if (err) throw err;
    })

    await cluster.idle();
    await cluster.close();
});


async function download(uri, filename) {
    return new Promise((resolve, reject) => {
        request.head(uri, function (err, res, body) {
            request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve);
        });
    });
}
