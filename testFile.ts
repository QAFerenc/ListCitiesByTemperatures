import puppeteer from 'puppeteer';

const agreeButtonSelector = '#qc-cmp2-ui > div:nth-child(2) > div > button:nth-child(2)';

// Base path for tbody where city names and temperatures are located
const basePathCityName = "body > div.main-content-div > section.bg--grey.pdflexi-t--small > div > section > div:nth-child(3) > div > table > tbody";
    
async function listCityTemperaturesOnPageByDescendingOrder(url: string): Promise<void> {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);

    // Check if the "AGREE" button is present on the page
    const agreeButton = await page.$(agreeButtonSelector);
  
    if (agreeButton) {
      // Click on the "AGREE" button if it exists
      await agreeButton.click();
    } 

    let allResults: { cityName: string; temperature: number; }[] = [];
    
   
        // Iterate through each row (assuming 47 cities per column)
        for (let row = 1; row <= 47; row++) {
            // Adjusted loop to iterate through each of the 3 sets of columns by changing td:nth-child(index) accordingly
            for (let colIndex = 1; colIndex <= 9; colIndex +=4) { // Assuming first set starts at index 1, second at index 5, third at index 9
                let currentPathCityNameSelector = `${basePathCityName} tr:nth-child(${row}) td:nth-child(${colIndex}) a`;
                let currentPathTemperatureSelector= `${basePathCityName} tr:nth-child(${row}) td:nth-child(${colIndex +3})`;
                
                const cityElementHandle = await page.$(currentPathCityNameSelector);

                const temperatureElementHandle = await page.$(currentPathTemperatureSelector);

                if(cityElementHandle && temperatureElementHandle) {
                    let cityNameValuePromise=await cityElementHandle.getProperty('textContent');
                    let cityNameValue =(await cityNameValuePromise?.jsonValue()) ?? '';
                    cityNameValue= typeof cityNameValue === 'string' ? cityNameValue.trim() : 'Unknown';

                    let temperatureTextContentPromise=await temperatureElementHandle.getProperty('textContent');
                    let temperatureText =(await temperatureTextContentPromise?.jsonValue()) ?? '';
                    temperatureText= typeof temperatureText === 'string' ? temperatureText.trim() : '';

                     // Parsing extracted text content to float for numeric sorting.
                     let parsedTemperature=parseFloat(temperatureText.replace(/[^\d.-]+/g, ''));

                     if (!isNaN(parsedTemperature)) {
                        allResults.push({
                            cityName:cityNameValue,
                            temperature:parsedTemperature,
                        });
                     }
                 }
             }
         }

   allResults.sort((a,b)=>b.temperature-a.temperature)

   console.log('Cities and temperatures in descending order : ');
   allResults.forEach(result => {
      console.log(`${result.cityName}: ${result.temperature}`);
   });

   await browser.close();
}

listCityTemperaturesOnPageByDescendingOrder("https://www.timeanddate.com/weather/");
