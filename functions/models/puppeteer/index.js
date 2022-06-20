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

//the function get the browser instance and the scrape data (the url and the dedicated scrape code) by pageScraper and scrape the page
exports.scrapePage = async (browserInstance, scrapeObject) => {
  try {
    let browser = await browserInstance;
    let page = await browser.newPage();
    await page.goto(scrapeObject.url);
    await scrapeObject.pageScraper(page);
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
};
