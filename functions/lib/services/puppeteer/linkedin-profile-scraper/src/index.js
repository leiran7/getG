"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedInProfileScraper = void 0;
const puppeteer = __importStar(require("puppeteer"));
// import treeKill from "tree-kill";
const blocked_hosts_1 = __importDefault(require("./blocked-hosts"));
const utils_1 = require("./utils");
const errors_1 = require("./errors");
async function autoScroll(page) {
    await page.evaluate(() => {
        return new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 500;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve(null);
                }
            }, 100);
        });
    });
}
class LinkedInProfileScraper {
    constructor(userDefinedOptions) {
        this.options = {
            sessionCookieValue: "",
            keepAlive: false,
            timeout: 10000,
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
            headless: true,
        };
        this.browser = null;
        /**
         * Method to load Puppeteer in memory so we can re-use the browser instance.
         */
        this.setup = async () => {
            const logSection = "setup";
            try {
                (0, utils_1.statusLog)(logSection, `Launching puppeteer in the ${this.options.headless ? "background" : "foreground"}...`);
                this.browser = await puppeteer.launch({
                    headless: this.options.headless,
                    args: [
                        ...(this.options.headless
                            ? "---single-process"
                            : "---start-maximized"),
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--proxy-server='direct://",
                        "--proxy-bypass-list=*",
                        "--disable-dev-shm-usage",
                        "--disable-accelerated-2d-canvas",
                        "--disable-gpu",
                        "--disable-features=site-per-process",
                        "--enable-features=NetworkService",
                        "--allow-running-insecure-content",
                        "--enable-automation",
                        "--disable-background-timer-throttling",
                        "--disable-backgrounding-occluded-windows",
                        "--disable-renderer-backgrounding",
                        "--disable-web-security",
                        "--autoplay-policy=user-gesture-required",
                        "--disable-background-networking",
                        "--disable-breakpad",
                        "--disable-client-side-phishing-detection",
                        "--disable-component-update",
                        "--disable-default-apps",
                        "--disable-domain-reliability",
                        "--disable-extensions",
                        "--disable-features=AudioServiceOutOfProcess",
                        "--disable-hang-monitor",
                        "--disable-ipc-flooding-protection",
                        "--disable-notifications",
                        "--disable-offer-store-unmasked-wallet-cards",
                        "--disable-popup-blocking",
                        "--disable-print-preview",
                        "--disable-prompt-on-repost",
                        "--disable-speech-api",
                        "--disable-sync",
                        "--disk-cache-size=33554432",
                        "--hide-scrollbars",
                        "--ignore-gpu-blacklist",
                        "--metrics-recording-only",
                        "--mute-audio",
                        "--no-default-browser-check",
                        "--no-first-run",
                        "--no-pings",
                        "--no-zygote",
                        "--password-store=basic",
                        "--use-gl=swiftshader",
                        "--use-mock-keychain",
                    ],
                    timeout: this.options.timeout,
                });
                (0, utils_1.statusLog)(logSection, "Puppeteer launched!");
                await this.checkIfLoggedIn();
                (0, utils_1.statusLog)(logSection, "Done!");
            }
            catch (err) {
                // Kill Puppeteer
                await this.close();
                (0, utils_1.statusLog)(logSection, "An error occurred during setup.");
                throw err;
            }
        };
        /**
         * Create a Puppeteer page with some extra settings to speed up the crawling process.
         */
        this.createPage = async () => {
            const logSection = "setup page";
            if (!this.browser) {
                throw new Error("Browser not set.");
            }
            // Important: Do not block "stylesheet", makes the crawler not work for LinkedIn
            const blockedResources = [
                "image",
                "media",
                "font",
                "texttrack",
                "object",
                "beacon",
                "csp_report",
                "imageset",
            ];
            try {
                const page = await this.browser.newPage();
                // Use already open page
                // This makes sure we don't have an extra open tab consuming memory
                const firstPage = (await this.browser.pages())[0];
                await firstPage.close();
                // Method to create a faster Page
                // From: https://github.com/shirshak55/scrapper-tools/blob/master/src/fastPage/index.ts#L113
                const session = await page.target().createCDPSession();
                await page.setBypassCSP(true);
                await session.send("Page.enable");
                await session.send("Page.setWebLifecycleState", {
                    state: "active",
                });
                (0, utils_1.statusLog)(logSection, `Blocking the following resources: ${blockedResources.join(", ")}`);
                // A list of hostnames that are trackers
                // By blocking those requests we can speed up the crawling
                // This is kinda what a normal adblocker does, but really simple
                const blockedHosts = this.getBlockedHosts();
                const blockedResourcesByHost = ["script", "xhr", "fetch", "document"];
                (0, utils_1.statusLog)(logSection, `Should block scripts from ${Object.keys(blockedHosts).length} unwanted hosts to speed up the crawling.`);
                // Block loading of resources, like images and css, we dont need that
                await page.setRequestInterception(true);
                page.on("request", (req) => {
                    if (blockedResources.includes(req.resourceType())) {
                        return req.abort();
                    }
                    const hostname = (0, utils_1.getHostname)(req.url());
                    // Block all script requests from certain host names
                    if (blockedResourcesByHost.includes(req.resourceType()) &&
                        hostname &&
                        blockedHosts[hostname] === true) {
                        (0, utils_1.statusLog)("blocked script", `${req.resourceType()}: ${hostname}: ${req.url()}`);
                        return req.abort();
                    }
                    return req.continue();
                });
                await page.setUserAgent(this.options.userAgent);
                await page.setViewport({
                    width: 1200,
                    height: 720,
                });
                (0, utils_1.statusLog)(logSection, `Setting session cookie using cookie: ${process.env.LINKEDIN_SESSION_COOKIE_VALUE}`);
                await page.setCookie({
                    name: "li_at",
                    value: this.options.sessionCookieValue,
                    domain: ".www.linkedin.com",
                });
                (0, utils_1.statusLog)(logSection, "Session cookie set!");
                (0, utils_1.statusLog)(logSection, "Done!");
                return page;
            }
            catch (err) {
                // Kill Puppeteer
                await this.close();
                (0, utils_1.statusLog)(logSection, "An error occurred during page setup.");
                (0, utils_1.statusLog)(logSection, err.message);
                throw err;
            }
        };
        /**
         * Method to block know hosts that have some kind of tracking.
         * By blocking those hosts we speed up the crawling.
         *
         * More info: http://winhelp2002.mvps.org/hosts.htm
         */
        this.getBlockedHosts = () => {
            const blockedHostsArray = blocked_hosts_1.default.split("\n");
            let blockedHostsObject = blockedHostsArray.reduce((prev, curr) => {
                const frags = curr.split(" ");
                if (frags.length > 1 && frags[0] === "0.0.0.0") {
                    prev[frags[1].trim()] = true;
                }
                return prev;
            }, {});
            blockedHostsObject = Object.assign(Object.assign({}, blockedHostsObject), { "static.chartbeat.com": true, "scdn.cxense.com": true, "api.cxense.com": true, "www.googletagmanager.com": true, "connect.facebook.net": true, "platform.twitter.com": true, "tags.tiqcdn.com": true, "dev.visualwebsiteoptimizer.com": true, "smartlock.google.com": true, "cdn.embedly.com": true });
            return blockedHostsObject;
        };
        /**
         * Method to complete kill any Puppeteer process still active.
         * Freeing up memory.
         */
        this.close = (page) => {
            return new Promise(async (resolve, reject) => {
                const loggerPrefix = "close";
                if (page) {
                    try {
                        (0, utils_1.statusLog)(loggerPrefix, "Closing page...");
                        await page.close();
                        (0, utils_1.statusLog)(loggerPrefix, "Closed page!");
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                if (this.browser) {
                    try {
                        (0, utils_1.statusLog)(loggerPrefix, "Closing browser...");
                        await this.browser.close();
                        (0, utils_1.statusLog)(loggerPrefix, "Closed browser!");
                        const browserProcessPid = this.browser.process().pid;
                        // Completely kill the browser process to prevent zombie processes
                        // https://docs.browserless.io/blog/2019/03/13/more-observations.html#tip-2-when-you-re-done-kill-it-with-fire
                        if (browserProcessPid) {
                            (0, utils_1.statusLog)(loggerPrefix, `Killing browser process pid: ${browserProcessPid}...`);
                            // treeKill(browserProcessPid, "SIGKILL", (err) => {
                            //   if (err) {
                            //     return reject(
                            //       `Failed to kill browser process pid: ${browserProcessPid}`
                            //     );
                            //   }
                            //   statusLog(
                            //     loggerPrefix,
                            //     `Killed browser pid: ${browserProcessPid} Closed browser.`
                            //   );
                            //   resolve();
                            // });
                        }
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                return resolve();
            });
        };
        /**
         * Simple method to check if the session is still active.
         */
        this.checkIfLoggedIn = async () => {
            const logSection = "checkIfLoggedIn";
            const page = await this.createPage();
            (0, utils_1.statusLog)(logSection, "Checking if we are still logged in...");
            // Go to the login page of LinkedIn
            // If we do not get redirected and stay on /login, we are logged out
            // If we get redirect to /feed, we are logged in
            await page.goto("https://www.linkedin.com/login", {
                waitUntil: "networkidle2",
                timeout: this.options.timeout,
            });
            const url = page.url();
            const isLoggedIn = !url.endsWith("/login");
            await page.close();
            if (isLoggedIn) {
                (0, utils_1.statusLog)(logSection, "All good. We are still logged in.");
            }
            else {
                const errorMessage = 'Bad news, we are not logged in! Your session seems to be expired. Use your browser to login again with your LinkedIn credentials and extract the "li_at" cookie value for the "sessionCookieValue" option.';
                (0, utils_1.statusLog)(logSection, errorMessage);
                throw new errors_1.SessionExpired(errorMessage);
            }
        };
        /**
         * Method to scrape a user profile.
         */
        this.run = async (profileUrl) => {
            const logSection = "run";
            const scraperSessionId = new Date().getTime();
            if (!this.browser) {
                throw new Error("Browser is not set. Please run the setup method first.");
            }
            if (!profileUrl) {
                throw new Error("No profileUrl given.");
            }
            if (!profileUrl.includes("linkedin.com/")) {
                throw new Error("The given URL to scrape is not a linkedin.com url.");
            }
            try {
                // Eeach run has it's own page
                const page = await this.createPage();
                (0, utils_1.statusLog)(logSection, `Navigating to LinkedIn profile: ${profileUrl}`, scraperSessionId);
                await page.goto(profileUrl, {
                    // Use "networkidl2" here and not "domcontentloaded".
                    // As with "domcontentloaded" some elements might not be loaded correctly, resulting in missing data.
                    waitUntil: "networkidle2",
                    timeout: this.options.timeout,
                });
                (0, utils_1.statusLog)(logSection, "LinkedIn profile page loaded!", scraperSessionId);
                (0, utils_1.statusLog)(logSection, "Getting all the LinkedIn profile data by scrolling the page to the bottom, so all the data gets loaded into the page...", scraperSessionId);
                await autoScroll(page);
                (0, utils_1.statusLog)(logSection, "Parsing data...", scraperSessionId);
                // Only click the expanding buttons when they exist
                const expandButtonsSelectors = [
                    ".pv-profile-section.pv-about-section .lt-line-clamp__more",
                    "#experience-section .pv-profile-section__see-more-inline.link",
                    ".pv-profile-section.education-section button.pv-profile-section__see-more-inline",
                    '.pv-skill-categories-section [data-control-name="skill_details"]', // Skills
                ];
                const seeMoreButtonsSelectors = [
                    '.pv-entity__description .lt-line-clamp__line.lt-line-clamp__line--last .lt-line-clamp__more[href="#"]',
                    '.lt-line-clamp__more[href="#"]:not(.lt-line-clamp__ellipsis--dummy)',
                ];
                (0, utils_1.statusLog)(logSection, 'Expanding all sections by clicking their "See more" buttons', scraperSessionId);
                for (const buttonSelector of expandButtonsSelectors) {
                    try {
                        if ((await page.$(buttonSelector)) !== null) {
                            (0, utils_1.statusLog)(logSection, `Clicking button ${buttonSelector}`, scraperSessionId);
                            await page.click(buttonSelector);
                        }
                    }
                    catch (err) {
                        (0, utils_1.statusLog)(logSection, `Could not find or click expand button selector "${buttonSelector}". So we skip that one.`, scraperSessionId);
                    }
                }
                // To give a little room to let data appear. Setting this to 0 might result in "Node is detached from document" errors
                await page.waitFor(100);
                (0, utils_1.statusLog)(logSection, 'Expanding all descriptions by clicking their "See more" buttons', scraperSessionId);
                for (const seeMoreButtonSelector of seeMoreButtonsSelectors) {
                    const buttons = await page.$$(seeMoreButtonSelector);
                    for (const button of buttons) {
                        if (button) {
                            try {
                                (0, utils_1.statusLog)(logSection, `Clicking button ${seeMoreButtonSelector}`, scraperSessionId);
                                await button.click();
                            }
                            catch (err) {
                                (0, utils_1.statusLog)(logSection, `Could not find or click see more button selector "${button}". So we skip that one.`, scraperSessionId);
                            }
                        }
                    }
                }
                (0, utils_1.statusLog)(logSection, "Parsing profile data...", scraperSessionId);
                const rawUserProfileData = await page.evaluate(() => {
                    const profileSection = document.querySelector(".pv-top-card");
                    const url = window.location.href;
                    const fullNameElement = profileSection === null || profileSection === void 0 ? void 0 : profileSection.querySelector(".pv-top-card--list li:first-child");
                    const fullName = (fullNameElement === null || fullNameElement === void 0 ? void 0 : fullNameElement.textContent) || null;
                    const titleElement = profileSection === null || profileSection === void 0 ? void 0 : profileSection.querySelector("h2");
                    const title = (titleElement === null || titleElement === void 0 ? void 0 : titleElement.textContent) || null;
                    const locationElement = profileSection === null || profileSection === void 0 ? void 0 : profileSection.querySelector(".pv-top-card--list.pv-top-card--list-bullet.mt1 li:first-child");
                    const location = (locationElement === null || locationElement === void 0 ? void 0 : locationElement.textContent) || null;
                    const photoElement = (profileSection === null || profileSection === void 0 ? void 0 : profileSection.querySelector(".pv-top-card__photo")) ||
                        (profileSection === null || profileSection === void 0 ? void 0 : profileSection.querySelector(".profile-photo-edit__preview"));
                    const photo = (photoElement === null || photoElement === void 0 ? void 0 : photoElement.getAttribute("src")) || null;
                    const descriptionElement = document.querySelector(".pv-about__summary-text .lt-line-clamp__raw-line"); // Is outside "profileSection"
                    const description = (descriptionElement === null || descriptionElement === void 0 ? void 0 : descriptionElement.textContent) || null;
                    return {
                        fullName,
                        title,
                        location,
                        photo,
                        description,
                        url,
                    };
                });
                // Convert the raw data to clean data using our utils
                // So we don't have to inject our util methods inside the browser context, which is too damn difficult using TypeScript
                const userProfile = Object.assign(Object.assign({}, rawUserProfileData), { fullName: (0, utils_1.getCleanText)(rawUserProfileData.fullName), title: (0, utils_1.getCleanText)(rawUserProfileData.title), location: rawUserProfileData.location
                        ? (0, utils_1.getLocationFromText)(rawUserProfileData.location)
                        : null, description: (0, utils_1.getCleanText)(rawUserProfileData.description) });
                (0, utils_1.statusLog)(logSection, `Got user profile data: ${JSON.stringify(userProfile)}`, scraperSessionId);
                (0, utils_1.statusLog)(logSection, `Parsing experiences data...`, scraperSessionId);
                const rawExperiencesData = await page.$$eval("#experience-section ul > .ember-view", (nodes) => {
                    let data = [];
                    // Using a for loop so we can use await inside of it
                    for (const node of nodes) {
                        const titleElement = node.querySelector("h3");
                        const title = (titleElement === null || titleElement === void 0 ? void 0 : titleElement.textContent) || null;
                        const employmentTypeElement = node.querySelector("span.pv-entity__secondary-title");
                        const employmentType = (employmentTypeElement === null || employmentTypeElement === void 0 ? void 0 : employmentTypeElement.textContent) || null;
                        const companyElement = node.querySelector(".pv-entity__secondary-title");
                        const companyElementClean = companyElement && (companyElement === null || companyElement === void 0 ? void 0 : companyElement.querySelector("span"))
                            ? (companyElement === null || companyElement === void 0 ? void 0 : companyElement.removeChild(companyElement.querySelector("span"))) && companyElement
                            : companyElement || null;
                        const company = (companyElementClean === null || companyElementClean === void 0 ? void 0 : companyElementClean.textContent) || null;
                        const descriptionElement = node.querySelector(".pv-entity__description");
                        const description = (descriptionElement === null || descriptionElement === void 0 ? void 0 : descriptionElement.textContent) || null;
                        const dateRangeElement = node.querySelector(".pv-entity__date-range span:nth-child(2)");
                        const dateRangeText = (dateRangeElement === null || dateRangeElement === void 0 ? void 0 : dateRangeElement.textContent) || null;
                        const startDatePart = (dateRangeText === null || dateRangeText === void 0 ? void 0 : dateRangeText.split("–")[0]) || null;
                        const startDate = (startDatePart === null || startDatePart === void 0 ? void 0 : startDatePart.trim()) || null;
                        const endDatePart = (dateRangeText === null || dateRangeText === void 0 ? void 0 : dateRangeText.split("–")[1]) || null;
                        const endDateIsPresent = (endDatePart === null || endDatePart === void 0 ? void 0 : endDatePart.trim().toLowerCase()) === "present" || false;
                        const endDate = endDatePart && !endDateIsPresent ? endDatePart.trim() : "Present";
                        const locationElement = node.querySelector(".pv-entity__location span:nth-child(2)");
                        const location = (locationElement === null || locationElement === void 0 ? void 0 : locationElement.textContent) || null;
                        data.push({
                            title,
                            company,
                            employmentType,
                            location,
                            startDate,
                            endDate,
                            endDateIsPresent,
                            description,
                        });
                    }
                    return data;
                });
                // Convert the raw data to clean data using our utils
                // So we don't have to inject our util methods inside the browser context, which is too damn difficult using TypeScript
                const experiences = rawExperiencesData.map((rawExperience) => {
                    const startDate = (0, utils_1.formatDate)(rawExperience.startDate);
                    const endDate = (0, utils_1.formatDate)(rawExperience.endDate) || null;
                    const endDateIsPresent = rawExperience.endDateIsPresent;
                    const durationInDaysWithEndDate = startDate && endDate && !endDateIsPresent
                        ? (0, utils_1.getDurationInDays)(startDate, endDate)
                        : null;
                    const durationInDaysForPresentDate = endDateIsPresent && startDate
                        ? (0, utils_1.getDurationInDays)(startDate, new Date())
                        : null;
                    const durationInDays = endDateIsPresent
                        ? durationInDaysForPresentDate
                        : durationInDaysWithEndDate;
                    return Object.assign(Object.assign({}, rawExperience), { title: (0, utils_1.getCleanText)(rawExperience.title), company: (0, utils_1.getCleanText)(rawExperience.company), employmentType: (0, utils_1.getCleanText)(rawExperience.employmentType), location: (rawExperience === null || rawExperience === void 0 ? void 0 : rawExperience.location)
                            ? (0, utils_1.getLocationFromText)(rawExperience.location)
                            : null, startDate,
                        endDate,
                        endDateIsPresent,
                        durationInDays, description: (0, utils_1.getCleanText)(rawExperience.description) });
                });
                (0, utils_1.statusLog)(logSection, `Got experiences data: ${JSON.stringify(experiences)}`, scraperSessionId);
                (0, utils_1.statusLog)(logSection, `Parsing education data...`, scraperSessionId);
                const rawEducationData = await page.$$eval("#education-section ul > .ember-view", (nodes) => {
                    var _a, _b;
                    // Note: the $$eval context is the browser context.
                    // So custom methods you define in this file are not available within this $$eval.
                    let data = [];
                    for (const node of nodes) {
                        const schoolNameElement = node.querySelector("h3.pv-entity__school-name");
                        const schoolName = (schoolNameElement === null || schoolNameElement === void 0 ? void 0 : schoolNameElement.textContent) || null;
                        const degreeNameElement = node.querySelector(".pv-entity__degree-name .pv-entity__comma-item");
                        const degreeName = (degreeNameElement === null || degreeNameElement === void 0 ? void 0 : degreeNameElement.textContent) || null;
                        const fieldOfStudyElement = node.querySelector(".pv-entity__fos .pv-entity__comma-item");
                        const fieldOfStudy = (fieldOfStudyElement === null || fieldOfStudyElement === void 0 ? void 0 : fieldOfStudyElement.textContent) || null;
                        // const gradeElement = node.querySelector('.pv-entity__grade .pv-entity__comma-item');
                        // const grade = (gradeElement && gradeElement.textContent) ? window.getCleanText(fieldOfStudyElement.textContent) : null;
                        const dateRangeElement = node.querySelectorAll(".pv-entity__dates time");
                        const startDatePart = (dateRangeElement && ((_a = dateRangeElement[0]) === null || _a === void 0 ? void 0 : _a.textContent)) || null;
                        const startDate = startDatePart || null;
                        const endDatePart = (dateRangeElement && ((_b = dateRangeElement[1]) === null || _b === void 0 ? void 0 : _b.textContent)) || null;
                        const endDate = endDatePart || null;
                        data.push({
                            schoolName,
                            degreeName,
                            fieldOfStudy,
                            startDate,
                            endDate,
                        });
                    }
                    return data;
                });
                // Convert the raw data to clean data using our utils
                // So we don't have to inject our util methods inside the browser context, which is too damn difficult using TypeScript
                const education = rawEducationData.map((rawEducation) => {
                    const startDate = (0, utils_1.formatDate)(rawEducation.startDate);
                    const endDate = (0, utils_1.formatDate)(rawEducation.endDate);
                    return Object.assign(Object.assign({}, rawEducation), { schoolName: (0, utils_1.getCleanText)(rawEducation.schoolName), degreeName: (0, utils_1.getCleanText)(rawEducation.degreeName), fieldOfStudy: (0, utils_1.getCleanText)(rawEducation.fieldOfStudy), startDate,
                        endDate, durationInDays: (0, utils_1.getDurationInDays)(startDate, endDate) });
                });
                (0, utils_1.statusLog)(logSection, `Got education data: ${JSON.stringify(education)}`, scraperSessionId);
                (0, utils_1.statusLog)(logSection, `Parsing volunteer experience data...`, scraperSessionId);
                const rawVolunteerExperiences = await page.$$eval(".pv-profile-section.volunteering-section ul > li.ember-view", (nodes) => {
                    // Note: the $$eval context is the browser context.
                    // So custom methods you define in this file are not available within this $$eval.
                    let data = [];
                    for (const node of nodes) {
                        const titleElement = node.querySelector(".pv-entity__summary-info h3");
                        const title = (titleElement === null || titleElement === void 0 ? void 0 : titleElement.textContent) || null;
                        const companyElement = node.querySelector(".pv-entity__summary-info span.pv-entity__secondary-title");
                        const company = (companyElement === null || companyElement === void 0 ? void 0 : companyElement.textContent) || null;
                        const dateRangeElement = node.querySelector(".pv-entity__date-range span:nth-child(2)");
                        const dateRangeText = (dateRangeElement === null || dateRangeElement === void 0 ? void 0 : dateRangeElement.textContent) || null;
                        const startDatePart = (dateRangeText === null || dateRangeText === void 0 ? void 0 : dateRangeText.split("–")[0]) || null;
                        const startDate = (startDatePart === null || startDatePart === void 0 ? void 0 : startDatePart.trim()) || null;
                        const endDatePart = (dateRangeText === null || dateRangeText === void 0 ? void 0 : dateRangeText.split("–")[1]) || null;
                        const endDateIsPresent = (endDatePart === null || endDatePart === void 0 ? void 0 : endDatePart.trim().toLowerCase()) === "present" || false;
                        const endDate = endDatePart && !endDateIsPresent
                            ? endDatePart.trim()
                            : "Present";
                        const descriptionElement = node.querySelector(".pv-entity__description");
                        const description = (descriptionElement === null || descriptionElement === void 0 ? void 0 : descriptionElement.textContent) || null;
                        data.push({
                            title,
                            company,
                            startDate,
                            endDate,
                            endDateIsPresent,
                            description,
                        });
                    }
                    return data;
                });
                // Convert the raw data to clean data using our utils
                // So we don't have to inject our util methods inside the browser context, which is too damn difficult using TypeScript
                const volunteerExperiences = rawVolunteerExperiences.map((rawVolunteerExperience) => {
                    const startDate = (0, utils_1.formatDate)(rawVolunteerExperience.startDate);
                    const endDate = (0, utils_1.formatDate)(rawVolunteerExperience.endDate);
                    return Object.assign(Object.assign({}, rawVolunteerExperience), { title: (0, utils_1.getCleanText)(rawVolunteerExperience.title), company: (0, utils_1.getCleanText)(rawVolunteerExperience.company), description: (0, utils_1.getCleanText)(rawVolunteerExperience.description), startDate,
                        endDate, durationInDays: (0, utils_1.getDurationInDays)(startDate, endDate) });
                });
                (0, utils_1.statusLog)(logSection, `Got volunteer experience data: ${JSON.stringify(volunteerExperiences)}`, scraperSessionId);
                (0, utils_1.statusLog)(logSection, `Parsing skills data...`, scraperSessionId);
                const skills = await page.$$eval(".pv-skill-categories-section ol > .ember-view", (nodes) => {
                    // Note: the $$eval context is the browser context.
                    // So custom methods you define in this file are not available within this $$eval.
                    return nodes.map((node) => {
                        var _a, _b;
                        const skillName = node.querySelector(".pv-skill-category-entity__name-text");
                        const endorsementCount = node.querySelector(".pv-skill-category-entity__endorsement-count");
                        return {
                            skillName: skillName ? (_a = skillName.textContent) === null || _a === void 0 ? void 0 : _a.trim() : null,
                            endorsementCount: endorsementCount
                                ? parseInt(((_b = endorsementCount.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || "0")
                                : 0,
                        };
                    });
                });
                (0, utils_1.statusLog)(logSection, `Got skills data: ${JSON.stringify(skills)}`, scraperSessionId);
                (0, utils_1.statusLog)(logSection, `Done! Returned profile details for: ${profileUrl}`, scraperSessionId);
                if (!this.options.keepAlive) {
                    (0, utils_1.statusLog)(logSection, "Not keeping the session alive.");
                    await this.close(page);
                    (0, utils_1.statusLog)(logSection, "Done. Puppeteer is closed.");
                }
                else {
                    (0, utils_1.statusLog)(logSection, "Done. Puppeteer is being kept alive in memory.");
                    // Only close the current page, we do not need it anymore
                    await page.close();
                }
                return {
                    userProfile,
                    experiences,
                    education,
                    volunteerExperiences,
                    skills,
                };
            }
            catch (err) {
                // Kill Puppeteer
                await this.close();
                (0, utils_1.statusLog)(logSection, "An error occurred during a run.");
                // Throw the error up, allowing the user to handle this error himself.
                throw err;
            }
        };
        const logSection = "constructing";
        const errorPrefix = "Error during setup.";
        if (!userDefinedOptions.sessionCookieValue) {
            throw new Error(`${errorPrefix} Option "sessionCookieValue" is required.`);
        }
        if (userDefinedOptions.sessionCookieValue &&
            typeof userDefinedOptions.sessionCookieValue !== "string") {
            throw new Error(`${errorPrefix} Option "sessionCookieValue" needs to be a string.`);
        }
        if (userDefinedOptions.userAgent &&
            typeof userDefinedOptions.userAgent !== "string") {
            throw new Error(`${errorPrefix} Option "userAgent" needs to be a string.`);
        }
        if (userDefinedOptions.keepAlive !== undefined &&
            typeof userDefinedOptions.keepAlive !== "boolean") {
            throw new Error(`${errorPrefix} Option "keepAlive" needs to be a boolean.`);
        }
        if (userDefinedOptions.timeout !== undefined &&
            typeof userDefinedOptions.timeout !== "number") {
            throw new Error(`${errorPrefix} Option "timeout" needs to be a number.`);
        }
        if (userDefinedOptions.headless !== undefined &&
            typeof userDefinedOptions.headless !== "boolean") {
            throw new Error(`${errorPrefix} Option "headless" needs to be a boolean.`);
        }
        this.options = Object.assign(this.options, userDefinedOptions);
        (0, utils_1.statusLog)(logSection, `Using options: ${JSON.stringify(this.options)}`);
    }
}
exports.LinkedInProfileScraper = LinkedInProfileScraper;
//# sourceMappingURL=index.js.map