//pages scrape Objects go here
//every array parameter describs one scrape object
//first elemnt in the array converst to the map elemnt key
//second elemnt in the array converst to the map elemnt value
module.exports = new Map([
    "linkdinProfile",
    {
        url: "http://books.toscrape.com",
        pageScraper: linkdinProfileScraper,
    },
]);
//scrape functions:
//every scrape function must get a browser.newPage() as param
let linkdinProfileScraper = async (page) => {
    await page.waitForSelector(".page_inner");
    // Get the link to all the required books
    let urls = await page.$$eval("section ol > li", (links) => {
        // Make sure the book to be scraped is in stock
        links = links.filter((link) => link.querySelector(".instock.availability > i").textContent !==
            "In stock");
        // Extract the links from the data
        links = links.map((el) => el.querySelector("h3 > a").href);
        return links;
    });
};
//# sourceMappingURL=scraperObjects.js.map