const puppeteer = require('puppeteer');


const scrapeImages = async (username) => {
    const browser = await puppeteer.launch( { headless: true });
    const page = await browser.newPage();
    
    await page.goto('https://www.google.de');


    // Login form
    await page.screenshot({path: '1.png'});

    await page.type('[aria-label="Suche"]', 'Lama');

    await page.screenshot({path: '2.png'});

    await page.click('[type=submit]');

    // Social Page

    await page.waitFor(5000);

    await page.waitForSelector('img ', {
        visible: true,
    });


    await page.screenshot({path: '3.png'});


    // Execute code in the DOM
    const data = await page.evaluate( () => {

        const images = document.getElementsByClassName('aCOpRe');
        console.log("images");

        const urls = Array.from(images).map(v => v.innerHTML);
        let url = urls[0];
        url = url.replace(/<\/?[^>]+(>|$)/g, "");

        return url
    });
  
    await browser.close();

    console.log(data);

    return data;
}

scrapeImages();
