import { LinkedInProfileScraper } from "../index";

export const scraper = async (profile) => {
  const vpnConf = {
    user: "nizaretto@gmail.com",
    password: "kseina@85",
    server: "https://uk1785.nordvpn.com:89",
  };
  const cookie =
    "AQEDATxkRawE4SssAAABgZnKsYMAAAGBvdc1g1YAt3XRLOfEUDcAMz86rTweNQe_-okzGJCXivz-mPaidXignwy2ElQkEd2xRj7Jni8TZTB9z85UCOApF735qKxSK5Wkf3HxftsUhvnL7OsQQ78q4x4r";
  const scraper = new LinkedInProfileScraper({
    sessionCookieValue: `${cookie}`,
    keepAlive: false,
    timeout: 100000,
    vpn: vpnConf,
  });

  // Prepare the scraper
  // Loading it in memory
  await scraper.setup();

  const result = await scraper.run(profile);

  // When keepAlive: true, you can manually close the session using the method below.
  // This will free up your system's memory. Otherwise Puppeteer will sit idle in the background consuming memory.
  // await scraper.close()

  console.log(result);
  return result;
};
