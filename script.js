import puppeteer from 'puppeteer';
import fs from 'fs';

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
    return  processUrls();
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

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
    // Additional user agents
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.59',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
];

function getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

const dubaiCategoryScrap = async (url) => {
  let browser;
  try {
    browser = await puppeteer.launch({headless: true,args:['--no-sandbox','--disable-setuid-sandbox'],ignoreDefaultArgs:['--disable-extensions']});
    const page = await browser.newPage();
    await page.setUserAgent(getRandomUserAgent());
    // const url = `https://dubai.dubizzle.com/en/property-for-rent/residential/apartmentflat/in/jumeirah-golf-estates/78/`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.setViewport({ width: 1080, height: 1024 });
    await page.screenshot({
        path: 'hn.png',
      });
    await page.waitForSelector('h1', { visible: true, timeout: 60000 });

    const counts = await page.evaluate(() => {
        const h1Element = document.querySelector('h1');
          if (h1Element) {
            const spans = h1Element.querySelectorAll('span');
            const text = spans?.[1]?.textContent ?? '';
            const match = text.match(/\d+/); // Extract digits
            return match ? parseInt(match[0], 10) : null;
          }
          return null;
      });

    console.log("counts", counts)
    const totalResults = counts;
    const results = [];
    let pageNumber = 1;
    let hasData = true;

    while (hasData) {
      const link = url + `?page=${pageNumber}`;
      await page.goto(link, { waitUntil: 'networkidle2' });

      await page.setViewport({ width: 1080, height: 1024 });
      await page.waitForSelector('#listing-card-wrapper', { visible: true, timeout: 60000 });

      await page.evaluate(() => {
        const scroll = setInterval(() => {
          window.scrollBy(0, 2000);
        }, 300);

        setTimeout(() => {
          clearInterval(scroll);
        }, 2000);
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        await page.waitForSelector('#listing-card-wrapper', { visible: true, timeout: 60000 });

        const pageResults = await page.evaluate(() => {
          const anchorTags = Array.from(document.querySelectorAll('#listing-card-wrapper a[type="property"]'));
          return anchorTags.map(anchor => anchor.href);
        });

        // if (pageResults.length > 0 && results.length < totalResults) {
        if (pageResults.length > 0 && (results.length < 50 || results.length < totalResults)) {
          results.push(...pageResults);
          pageNumber++;
        } else {
          hasData = false;
        }
      } catch (error) {
        console.error(`Error on page ${pageNumber}:`, error);
        hasData = false;
      }
    }

    console.log("All results", results, results.length);
    return results;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// dubaiScrap();

const processUrls = async () => {
    try {
      const data = await fs.readFile('result.json', 'utf8');
      const urls = JSON.parse(data);
  
      for (const urlObj of urls) {
        const propertyDetails = await dubaiCategoryScrap(urlObj.url);
        if (propertyDetails) {
          // Append property details to the URL object
          urlObj.propertyDetails = propertyDetails;
  
          // Write updated data back to the JSON file immediately
          await fs.writeFile('result.json', JSON.stringify(urls, null, 2));
          console.log(`Updated JSON file with property details for ${urlObj.url}.`);
        }
      }
    } catch (error) {
      console.error('Error processing URLs:', error);
    }
  };

