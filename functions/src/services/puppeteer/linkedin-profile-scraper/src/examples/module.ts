require("dotenv").config();

import { LinkedInProfileScraper } from "../index";

export const scraper = async (profile) => {
  const vpnConf = {
    user: "nizaretto@gmail.com",
    password: "Abc132!@",
    server: "https://uk1785.nordvpn.com:89",
  };
  const cookie =
    "AQEDATxitDYDwiYNAAABgZHR92YAAAGBtd57Zk0AUko0CLWV2LXVCPSQelYe-BQ1bmHDH0HI9CX03CR0NZsMPhyO6xPvP71TFqFOqvZl1szLs61hIDb3quS7veNZW1BrE9ThLxxa6kTq_FZuCNCUYQ6F";
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
