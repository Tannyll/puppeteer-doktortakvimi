import {createPuppeteerRouter, Dataset, EnqueueStrategy} from 'crawlee';

export const router = createPuppeteerRouter();

router.addDefaultHandler(async ({enqueueLinks, log}) => {
    log.info(`enqueueing new URLs`);
    await enqueueLinks({
        strategy: EnqueueStrategy.All,
        globs: ['https://catalog.micronicfilter.com/product/1e8c70be-ea29-49de-8c42-69f19fbf5815/'],

        label: 'detail',
    });
});

router.addHandler('detail', async ({request, page, log, pushData}) => {
    const title = await page.title();
    log.info(`${title}`, {url: request.loadedUrl});
    log.info('request : ', request)


//


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
            const field = $post.querySelector('th').innerText.
            scrapedData.push(
                {
                    title : field,
                    value: $post.querySelector('td em').innerText
                }
            )
        });

        return scrapedData;
    });


    await pushData({Product: {...data}, dimensions: {dimensions}});

    console.log({Product: {...data}, dimensions: {...dimensions}})


});
