"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHostname = exports.autoScroll = exports.statusLog = exports.getCleanText = exports.getLocationFromText = exports.getDurationInDays = exports.formatDate = exports.getIsCity = exports.getIsCountry = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const i18n_iso_countries_1 = __importDefault(require("i18n-iso-countries"));
const all_the_cities_1 = __importDefault(require("all-the-cities"));
const getIsCountry = (text) => {
    const countriesList = Object.values(i18n_iso_countries_1.default.getNames("en"));
    const lowerCaseText = text.toLowerCase();
    // Some custom text that we assume is also a country (lower cased)
    // But is not detected correctly by the iso-countries module
    if (["united states", "the netherlands"].includes(lowerCaseText)) {
        return true;
    }
    return !!countriesList.find((country) => country.toLowerCase() === lowerCaseText);
};
exports.getIsCountry = getIsCountry;
const getIsCity = (text) => {
    const lowerCaseText = text.toLowerCase();
    if (["new york"].includes(lowerCaseText)) {
        return true;
    }
    return !!all_the_cities_1.default.find((city) => city.name.toLowerCase() === lowerCaseText);
};
exports.getIsCity = getIsCity;
const formatDate = (date) => {
    if (date === "Present") {
        return (0, moment_timezone_1.default)().format();
    }
    return (0, moment_timezone_1.default)(date, "MMMY").format();
};
exports.formatDate = formatDate;
const getDurationInDays = (formattedStartDate, formattedEndDate) => {
    if (!formattedStartDate || !formattedEndDate)
        return null;
    // +1 to include the start date
    return (0, moment_timezone_1.default)(formattedEndDate).diff((0, moment_timezone_1.default)(formattedStartDate), "days") + 1;
};
exports.getDurationInDays = getDurationInDays;
const getLocationFromText = (text) => {
    // Text is something like: Amsterdam Oud-West, North Holland Province, Netherlands
    if (!text)
        return null;
    const cleanText = text.replace(" Area", "").trim();
    const parts = cleanText.split(", ");
    let city = null;
    let province = null;
    let country = null;
    // If there are 3 parts, we can be sure of the order of each part
    // So that must be a: city, province/state and country
    if (parts.length === 3) {
        city = parts[0];
        province = parts[1];
        country = parts[2];
        return {
            city,
            province,
            country,
        };
    }
    // If we only have 2 parts, we don't know exactly what each part is;
    // it could still be: city, province/state or a country
    // For example: Sacramento, California Area
    if (parts.length === 2) {
        // 2 possible scenario's are most likely. We strictly check for the following:
        // first: city + country
        // second: city + province/state
        if ((0, exports.getIsCity)(parts[0]) && (0, exports.getIsCountry)(parts[1])) {
            return {
                city: parts[0],
                province,
                country: parts[1],
            };
        }
        // If the second part is NOT a country, it's probably a province/state
        if ((0, exports.getIsCity)(parts[0]) && !(0, exports.getIsCountry)(parts[1])) {
            return {
                city: parts[0],
                province: parts[1],
                country,
            };
        }
        return {
            city,
            province: parts[0],
            country: parts[1],
        };
    }
    // If we only have one part we'll end up here
    // Just find out if it's one of: city, province/state or country
    if ((0, exports.getIsCountry)(parts[0])) {
        return {
            city,
            province,
            country: parts[0],
        };
    }
    if ((0, exports.getIsCity)(parts[0])) {
        return {
            city: parts[0],
            province,
            country,
        };
    }
    // Else, it must be a province/state. We just don't know and assume it is.
    return {
        city,
        province: parts[0],
        country,
    };
};
exports.getLocationFromText = getLocationFromText;
const getCleanText = (text) => {
    const regexRemoveMultipleSpaces = / +/g;
    const regexRemoveLineBreaks = /(\r\n\t|\n|\r\t)/gm;
    if (!text)
        return null;
    const cleanText = text
        .replace(regexRemoveLineBreaks, "")
        .replace(regexRemoveMultipleSpaces, " ")
        .replace("...", "")
        .replace("See more", "")
        .replace("See less", "")
        .trim();
    return cleanText;
};
exports.getCleanText = getCleanText;
const statusLog = (section, message, scraperSessionId) => {
    const sessionPart = scraperSessionId ? ` (${scraperSessionId})` : "";
    const messagePart = message ? `: ${message}` : null;
    return console.log(`Scraper (${section})${sessionPart}${messagePart}`);
};
exports.statusLog = statusLog;
const autoScroll = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
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
};
exports.autoScroll = autoScroll;
const getHostname = (url) => {
    return new URL(url).hostname;
};
exports.getHostname = getHostname;
//# sourceMappingURL=index.js.map