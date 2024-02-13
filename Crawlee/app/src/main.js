// For more information, see https://crawlee.dev/
import {PuppeteerCrawler, ProxyConfiguration} from 'crawlee';
import {router} from './routes.js';

const startUrls = ['https://catalog.micronicfilter.com/product-search-result/?code=3L0'];

const crawler = new PuppeteerCrawler({

    launchContext: {
        launchOptions: {headless: true}
    },
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    requestHandler: router,
    // Comment this option to scrape the full website.
    maxRequestsPerCrawl: 50,
});

await crawler.run(startUrls);