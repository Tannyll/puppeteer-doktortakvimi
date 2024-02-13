import {createPuppeteerRouter, EnqueueStrategy, htmlToText} from 'crawlee';

export const router = createPuppeteerRouter();

router.addDefaultHandler(async ({request, enqueueLinks, log}) => {
    log.info(`enqueueing new URLs`);

    log.info(request.loadedUrl);

    const infos = await enqueueLinks({
        //strategy: EnqueueStrategy.SameDomain,
        globs: ['https://catalog.micronicfilter.com/product-search-result/?code=3L0', 'https://catalog.micronicfilter.com/product-search-result/?code=3S4'],
        selector: '#tableDetail a[href^="/product/',
        label: 'list',
    });

    if (infos.processedRequests.length === 0)
        log.info(`${request.url} >>> is the last page!`);


});

router.addHandler('list', async ({request, enqueueLinks, page, log, pushData}) => {
    const title = await page.title();
    log.info(`${title}`, {url: request.loadedUrl});
    log.info('List')

    const data = await page.$$eval('#tableDetail tr', ($posts) => {
        const scrapedData = [];
        $posts.forEach(($post) => {

            scrapedData.push(
                {
                    url: $post.querySelector('a').href,

                }
            )
        });

        return scrapedData;
    });

    console.log(data)

    const infos = await enqueueLinks({
        globs: ['https://catalog.micronicfilter.com/product-search-result/?code=3L0'],
        selector: '#tableDetail a[href^="/product/"]',
        label: 'list',
    })

    if (infos.processedRequests.length === 0)
        log.info(`${request.url} is the last page!`);


});

router.addHandler('detail', async ({request, enqueueLinks, page, log, pushData}) => {
    const title = await page.title();
    log.info(`${title}`, {url: request.loadedUrl});
    log.info('detail')

    const data = await page.$$eval('#firstTab table tbody tr', ($posts) => {
        const scrapedData = [];
        //console.log('POST : ' + $posts)
        //const scrapedData: { title: string; rank: string; href: string }[] = [];

        // We're getting the title, rank and URL of each post on Hacker News.
        $posts.forEach(($post) => {

            scrapedData.push(
                {
                    title: $post.querySelector('th').innerText,
                    value: $post.querySelector('td em').innerText
                }
            )
        });

        return scrapedData;
    });

    const dimensions = await page.$$eval('#secondTab table tbody tr', ($posts) => {
        const scrapedData = [];
        //console.log('POST : ' + $posts)
        //const scrapedData: { title: string; rank: string; href: string }[] = [];

        // We're getting the title, rank and URL of each post on Hacker News.
        $posts.forEach(($post) => {
            scrapedData.push(
                {
                    title: $post.querySelector('th').innerText,
                    value: $post.querySelector('td em').innerText
                }
            )
        });

        return scrapedData;
    });


    await pushData({Product: {...data}, dimensions: {dimensions}});

    console.log({Product: {...data}, dimensions: {...dimensions}})

    const infos = await enqueueLinks({
        globs: ['https://catalog.micronicfilter.com/product/1e8c70be-ea29-49de-8c42-69f19fbf5815/'],
        //selector: '#pagination > ul > li:nth-child(2) > a'
    })

    if (infos.processedRequests.length === 0)
        log.info(`${request.url} is the last page!`);

    console.log('Crawler finished.');
});
