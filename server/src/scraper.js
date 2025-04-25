const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
//const StealthPlugin = require('puppeteer-extra-plugin-stealth');

//puppeteer.use(StealthPlugin());

const runScraper = async () => {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Log in to LinkedIn
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });
    //await page.type('#username', 'mogabos375@clubemp.com');
    //await page.type('#password', 'saDSFDG623243###');

    await page.type('#username', 'powovas837@ptiong.com');
    await page.type('#password', 'adsfzdv44$');

    await Promise.all([
      page.waitForNavigation(), // Wait for navigation after clicking the login button
      page.click('.btn__primary--large')
    ]);

    // Verify login success by checking for a specific element on the homepage
    const isLoggedIn = await verifyLogin(page);
    if (!isLoggedIn) {
      throw new Error('Login failed');
    }
    console.log('Login successful');

    await page.goto('https://www.linkedin.com/jobs/search/?keywords=Unity%20Developer');

    // Navigate to the jobs page
    const isJobsPageLoaded = await waitForJobsPageLoaded(page);
    if (!isJobsPageLoaded) {
      throw new Error('Jobs page did not load successfully');
    }
    console.log('Jobs page loaded successfully');

    // Scroll to trigger lazy loading
    await autoScroll(page);
    console.log('Scrolled to load dynamic content');

    // Extract job details
    // Extract job headers
    const jobHeaders = await extractJobsHeaders(page);
    console.log('Scraped headers:', jobHeaders);


    // Extract detailed job information
    const jobs = [];
    for (const header of jobHeaders) {
      console.log("test")
      await page.click(`.job-card-container__link[href="${header.link}"]`);
      await page.waitForSelector('.jobs-company__box', { visible: true });
      await new Promise(resolve => setTimeout(resolve, 3000));
      const jobDetails = await extractJobDetails(page);
      console.log(jobDetails);
      jobs.push({ ...header, ...jobDetails });
    }
    console.log('Scraped jobs:', jobs);

   // await browser.close();
    return jobs;
  } catch (error) {
    console.error('Error in runScraper:', error);
    throw error;
  }
};

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function verifyLogin(page, timeout = 60000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const isLoggedIn = await page.evaluate(() => {
      // Check for the presence of the "Start a post" button
      return document.querySelector('button span span span strong')?.textContent.includes('Start a post');
    });

    if (isLoggedIn) {
      return true;
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before checking again
  }

  return false;
}

async function waitForJobsPageLoaded(page, timeout = 60000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const isLoaded = await page.evaluate(() => {
      // Check for the presence of the jobs filter bar
      return document.querySelector('.grid.grid--no-gutters') !== null;
    });

    if (isLoaded) {
      return true;
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before checking again
  }

  return false;
}

async function extractJobsHeaders(page) {
  return page.evaluate(() => {
    const jobs = [];
    const jobElements = document.querySelectorAll('.job-card-container');

    jobElements.forEach(jobElement => {
      const job = {};

      // Extract job ID
      job.id = jobElement.querySelector('.job-card-container__link')?.getAttribute('href')?.split('/')?.pop() || '';

      // Extract job title
      job.title = jobElement.querySelector('.job-card-container__link strong')?.textContent.trim() || '';

      // Extract job link
      job.link = jobElement.querySelector('.job-card-container__link')?.getAttribute('href') || '';

      // Extract company name
      job.company = jobElement.querySelector('.artdeco-entity-lockup__subtitle')?.textContent.trim() || '';

      // Extract location
      job.location = jobElement.querySelector('.job-card-container__metadata-wrapper li:first-child')?.textContent.trim() || '';

      // Extract time posted
      job.timePosted = '';

      // Extract applicants count (if available)
      job.applicants = 0;

      // Extract work type
      job.workType = null;

      // Extract easy apply status
      job.easyApply = jobElement.querySelector('.job-card-container__footer-item .job-card-list__icon') !== null;

      // Extract logo URL
      job.logo = jobElement.querySelector('.job-card-list__logo img')?.getAttribute('src') || undefined;

      // Extract job description (if available)
      job.description = jobElement.querySelector('.job-card-container__description')?.textContent.trim() || undefined;

      // Extract apply URL
      job.applyUrl = jobElement.querySelector('.job-card-container__apply-link')?.getAttribute('href') || undefined;

      job.hiringTeam = null;

      jobs.push(job);
    });

    return jobs;
  });
}

async function extractJobDetails(page) {
  return page.evaluate(() => {
    const jobDetails = {};

    // Extract job title
    jobDetails.title = document.querySelector('.jobs-details__job-details--container .t-24.t-bold.inline h1')?.textContent.trim() || '';

    // Extract company name
    jobDetails.company = document.querySelector('.jobs-details__job-details--container .artdeco-entity-lockup__subtitle')?.textContent.trim() || '';

    // Extract location
    jobDetails.location = document.querySelector('.jobs-details__job-details--container .job-details-jobs-unified-top-card__job-title span')?.textContent.trim() || '';

    // Extract time posted
    jobDetails.timePosted = document.querySelector('.jobs-details__job-details--container .job-details-jobs-unified-top-card__primary-description-container .t-black--light.mt2 span:nth-child(2)')?.textContent.trim() || '';

    // Extract applicants count (if available)
    const applicantsText = document.querySelector('.jobs-details__job-details--container .job-details-jobs-unified-top-card__primary-description-container .t-black--light.mt2 span:nth-child(3)')?.textContent.trim();
    jobDetails.applicants = applicantsText ? parseInt(applicantsText.split(' ')[0]) : 0;

    // Extract work type
    jobDetails.workType = Array.from(document.querySelectorAll('.jobs-details__job-details--container .job-details-jobs-unified-top-card__job-insight-text-button span'))
        .map(el => el.textContent.trim());

    // Extract easy apply status
    jobDetails.easyApply = document.querySelector('.jobs-details__job-details--container .jobs-apply-button') !== null;

    // Extract logo URL
    jobDetails.logo = document.querySelector('.jobs-details__job-details--container .artdeco-entity-lockup__image img')?.getAttribute('src') || undefined;

    // Extract job description (if available)
    jobDetails.description = document.querySelector('#job-details').innerText.trim();
    console.log(jobDetails.description); // ✅ correct

    // Extract apply URL
    jobDetails.applyUrl = document.querySelector('.jobs-details__job-details--container .jobs-apply-button')?.getAttribute('href') || undefined;

    // Extract hiring team info (if available)
    const hiringTeamElement = document.querySelector('.jobs-details__job-details--container .job-details-module .hiring-team');
    if (hiringTeamElement) {
      jobDetails.hiringTeam = {
        name: hiringTeamElement.querySelector('.hiring-team__name')?.textContent.trim() || '',
        title: hiringTeamElement.querySelector('.hiring-team__title')?.textContent.trim() || '',
        connection: hiringTeamElement.querySelector('.hiring-team__connection')?.textContent.trim() || '',
        messageUrl: hiringTeamElement.querySelector('.hiring-team__message-link')?.getAttribute('href') || undefined
      };
    } else {
      jobDetails.hiringTeam = null;
    }

    return jobDetails;
  });
}

module.exports = runScraper;