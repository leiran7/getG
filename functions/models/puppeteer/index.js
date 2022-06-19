const config = require("../../config");

//should always call closeBrowser fun after start browser
exports.startBrowser = async () => {
  let browser;
  try {
    console.log("Opening the browser......");
    browser = await puppeteer.launch({
      headless: config.puppeteer.headless,
      args: config.puppeteer.args,
      ignoreHTTPSErrors: config.puppeteer.ignoreHTTPSErrors,
    });
  } catch (err) {
    console.log("Could not create a browser instance => : ", err);
  }

  return browser;
};

exports.closeBrowser = async (browser) => {
  await browser.close();
};

exports.scrapeAll = async (browserInstance) => {
  let browser;
  try {
    browser = await browserInstance;
    await scrapePage(browser, "");
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
};

//the function get the url that need to be scraped and the dedicated scrape code by pageScraper and scrape the page;
exports.scrapePage = async (browser, scrapeObject) => {
  let page = await browser.newPage();
  await page.goto(scrapeObject.url);
  await scrapeObject.pageScraper(page);
};


