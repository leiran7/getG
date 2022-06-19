//pages scrape Objects go here
module.exports = [
  {
    name: "bookUrls",
    url: "http://books.toscrape.com",
    pageScraper: async (page) => {
      await page.waitForSelector(".page_inner");
      // Get the link to all the required books
      let urls = await page.$$eval("section ol > li", (links) => {
        // Make sure the book to be scraped is in stock
        links = links.filter(
          (link) =>
            link.querySelector(".instock.availability > i").textContent !==
            "In stock"
        );
        // Extract the links from the data
        links = links.map((el) => el.querySelector("h3 > a").href);
        return links;
      });
    },
  },
];
