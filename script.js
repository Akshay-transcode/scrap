import puppeteer from 'puppeteer';
import fs from 'fs';
import { processUrls } from './categoryData';

export const dubaiScrap = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({headless: true,args:['--no-sandbox','--disable-setuid-sandbox'],ignoreDefaultArgs:['--disable-extensions']});
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15');

    await page.goto('https://dubai.dubizzle.com/en/property-for-rent/', {
      waitUntil: 'networkidle2',
    });

    await page.setViewport({ width: 1080, height: 1024 });

    await page.screenshot({
        path: 'category.png',
    });
    await page.evaluate(() => {
      const scroll = setInterval(() => {
        window.scrollBy(0, 2000);
      }, 300);

      setTimeout(() => {
        clearInterval(scroll);
      }, 2000);
    });

    console.log("first---");
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("first---");

    await page.waitForSelector('[data-testid="category_slide_item"]', { visible: true, timeout: 60000 });

    const result = await page.evaluate(() => {
      const anchorTags = Array.from(document.querySelectorAll('[data-testid="category_slide_item"]'));
      return anchorTags.map(anchor => anchor.href);
    });
    console.log("result", result);

    // Save result to JSON file
    const formattedResult = result.map(url => ({ url }));
    fs.writeFileSync('result.json', JSON.stringify(formattedResult, null, 2));
    return processUrls();
    return result;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}


// import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// puppeteer.use(StealthPlugin());
