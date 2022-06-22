"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const index_1 = require("../index");
const app = (0, express_1.default)();
(async () => {
    // Setup environment variables to fill the sessionCookieValue
    const scraper = new index_1.LinkedInProfileScraper({
        sessionCookieValue: `${process.env.LINKEDIN_SESSION_COOKIE_VALUE}`,
        keepAlive: true,
    });
    // Prepare the scraper
    // Loading it in memory
    await scraper.setup();
    // Usage: http://localhost:3000/?url=https://www.linkedin.com/in/jvandenaardweg/
    app.get('/', async (req, res) => {
        const urlToScrape = req.query.url;
        const result = await scraper.run(urlToScrape);
        return res.json(result);
    });
    app.listen(process.env.PORT || 3000);
})();
//# sourceMappingURL=server.js.map