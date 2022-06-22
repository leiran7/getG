"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
// Make sure our CI uses the same timezone
const moment_timezone_1 = __importDefault(require("moment-timezone"));
moment_timezone_1.default.tz.setDefault('Europe/Amsterdam');
describe('utils', () => {
    describe('getIsCity()', () => {
        it('should return true for "Amsterdam"', () => {
            expect((0, index_1.getIsCity)('Amsterdam')).toBe(true);
        });
        it('should return true for "New York City"', () => {
            expect((0, index_1.getIsCity)('New York City')).toBe(true);
        });
        it('should return true for "New York"', () => {
            expect((0, index_1.getIsCity)('New York')).toBe(true);
        });
        it('should return true for "San Francisco"', () => {
            expect((0, index_1.getIsCity)('San Francisco')).toBe(true);
        });
        it('should return false for "Netherlands"', () => {
            expect((0, index_1.getIsCity)('Netherlands')).toBe(false);
        });
        it('should return false for "United States"', () => {
            expect((0, index_1.getIsCity)('United States')).toBe(false);
        });
    });
    describe('getIsCountry()', () => {
        it('should return true for "Netherlands"', () => {
            expect((0, index_1.getIsCountry)('Netherlands')).toBe(true);
        });
        it('should return true for "The Netherlands"', () => {
            expect((0, index_1.getIsCountry)('The Netherlands')).toBe(true);
        });
        it('should return true for "Sweden"', () => {
            expect((0, index_1.getIsCountry)('Sweden')).toBe(true);
        });
        it('should return true for "United States of America"', () => {
            expect((0, index_1.getIsCountry)('United States of America')).toBe(true);
        });
        it('should return true for "United States"', () => {
            expect((0, index_1.getIsCountry)('United States')).toBe(true);
        });
        it('should return false for "Amsterdam"', () => {
            expect((0, index_1.getIsCountry)('Amsterdam')).toBe(false);
        });
        it('should return false for "New York City"', () => {
            expect((0, index_1.getIsCountry)('New York City')).toBe(false);
        });
    });
    describe('formatDate()', () => {
        it('should return a formatted date', () => {
            const formattedDate = (0, index_1.formatDate)(new Date('2020-12-31T01:11:00+01:00'));
            expect(formattedDate).toBe('2020-12-31T01:11:00+01:00');
        });
        it('should return the Present date', () => {
            const formattedDate = (0, index_1.formatDate)('Present');
            expect(formattedDate).toBeTruthy();
        });
    });
    describe('getDurationInDays()', () => {
        it('should return the duration in days between two dates', () => {
            const durationInDays = (0, index_1.getDurationInDays)('2019-12-31', '2020-12-31');
            expect(durationInDays).toBe(367);
        });
    });
    describe('getLocationFromText()', () => {
        it('should return a location object with a country from a string', () => {
            const location = (0, index_1.getLocationFromText)('Netherlands');
            expect(location).toMatchObject({
                city: null,
                country: 'Netherlands',
                province: null
            });
        });
        it('should return a location object with a city from a string', () => {
            const location = (0, index_1.getLocationFromText)('San Francisco');
            expect(location).toMatchObject({
                city: 'San Francisco',
                country: null,
                province: null
            });
        });
        it('should return a location object with a province/state from a string', () => {
            const location = (0, index_1.getLocationFromText)('San Francisco Bay Area');
            expect(location).toMatchObject({
                city: null,
                country: null,
                province: 'San Francisco Bay'
            });
        });
        it('should return a location object with a city and province/state from a string', () => {
            const location = (0, index_1.getLocationFromText)('Sacramento, California Area');
            expect(location).toMatchObject({
                city: 'Sacramento',
                country: null,
                province: 'California'
            });
        });
        it('should return a location object with a city from a string', () => {
            const location = (0, index_1.getLocationFromText)('Amsterdam');
            expect(location).toMatchObject({
                city: 'Amsterdam',
                country: null,
                province: null
            });
        });
        it('should return a location object with a city and country from a string', () => {
            const location = (0, index_1.getLocationFromText)('Amsterdam, Netherlands');
            expect(location).toMatchObject({
                city: 'Amsterdam',
                country: 'Netherlands',
                province: null
            });
        });
        it('should return a location object with a city, province and country from a string', () => {
            const location = (0, index_1.getLocationFromText)('Amsterdam, North-Holland, Netherlands');
            expect(location).toMatchObject({
                city: 'Amsterdam',
                country: 'Netherlands',
                province: 'North-Holland'
            });
        });
    });
    describe('getCleanText()', () => {
        it('should return a clean text', () => {
            const cleanText = (0, index_1.getCleanText)('Some text. See more');
            expect(cleanText).toBe('Some text.');
        });
        it('should return a clean text', () => {
            const cleanText = (0, index_1.getCleanText)('Some text. See less');
            expect(cleanText).toBe('Some text.');
        });
        it('should return a clean text', () => {
            const cleanText = (0, index_1.getCleanText)('Some text...');
            expect(cleanText).toBe('Some text');
        });
        it('should return a clean text', () => {
            const cleanText = (0, index_1.getCleanText)('Some text.\nOn a new line.');
            // TODO: fix space between dot
            expect(cleanText).toBe('Some text.On a new line.');
        });
        it('should return a clean text', () => {
            const cleanText = (0, index_1.getCleanText)('Some text with  more   spacing.');
            expect(cleanText).toBe('Some text with more spacing.');
        });
    });
});
//# sourceMappingURL=index.test.js.map