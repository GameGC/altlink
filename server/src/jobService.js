const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const DatePosted = {
    AnyTime: '',
    Past24Hours: 'r86400',
    PastWeek: 'r604800',
    PastMonth: 'r2592000',
    Past12Hours: 'r43200',
    Past3Days: 'r259200',
    Past5Days: 'r432000',
};

const BASE_URL = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';
const JOB_DETAIL_URL = 'https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/';



let browser;

function randomDelay(min = 200, max = 1000) {
    return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
}

async function simulateHuman(page) {
    await page.mouse.move(
        Math.floor(Math.random() * 300),
        Math.floor(Math.random() * 300),
        { steps: 10 }
    );
    await randomDelay(300, 1000);
    await page.mouse.wheel({ deltaY: Math.floor(Math.random() * 300) });
    await randomDelay(300, 800);
}

const JOBS_DIR = path.join(__dirname, 'jobs');

function saveJobToFile(job) {
    if (!fs.existsSync(JOBS_DIR)) {
        fs.mkdirSync(JOBS_DIR, { recursive: true });
    }

    const filePath = path.join(JOBS_DIR, `${job.id}.json`);

    try {
        fs.writeFileSync(filePath, JSON.stringify(job, null, 2));
    } catch (error) {
        console.error(`Failed to write job file ${filePath}:`, error);
        throw error; // rethrow so upstream can handle/log
    }
}

function loadJobFromFile(jobId) {
    const filePath = path.join(__dirname, 'jobs', `${jobId}.json`);
    if (fs.existsSync(filePath)) {
        const jobData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(jobData);
    }
    return null; // Return null if the file doesn't exist
}

async function fetchJobs(title, location, datePosted, streamEmitter) {
    browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: null
    });

    const page = await browser.newPage();
    await simulateHuman(page);

    let start = 0;
    const maxPages = 20; // safety cap
    const jobsPerPage = 25;

    console.log(DatePosted[datePosted]);
    try {
        for (let pageNum = 0; pageNum < maxPages; pageNum++) {
            const params = new URLSearchParams({
                keywords: title,
                location: location,
                f_TPR: DatePosted[datePosted],
                start: start.toString(),
            });

            const url = `${BASE_URL}?${params.toString()}`;
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

            await simulateHuman(page);
            await randomDelay(1000, 2000);

            const jobs = await page.evaluate(() => {
                const jobList = [];
                const jobElements = document.querySelectorAll('li > div.base-card');

                function getJobIdFromUrl(url) {
                    try {
                        const partialLink = url.split('?')[0];
                        const jobId = partialLink.split('-').pop();
                        return jobId || null;
                    } catch (error) {
                        console.error('Error parsing job ID from URL:', error);
                        return null;
                    }
                }

                jobElements.forEach((element) => {
                    const jobUrl = element.querySelector('[class*=_full-link]')?.getAttribute('href') || '';
                    const jobId = getJobIdFromUrl(jobUrl);
                    if (jobId) {
                        const basicJobInfo = {
                            id: jobId,
                            title: element.querySelector('[class*=_title]')?.textContent?.trim() || '',
                            url: jobUrl,
                            company: element.querySelector('[class*=_subtitle]')?.textContent?.trim() || '',
                            location: element.querySelector('[class*=_location]')?.textContent?.trim() || '',
                            timePosted: element.querySelector('[class*=listdate]')?.textContent?.trim() || '',
                        };
                        jobList.push(basicJobInfo);
                    }
                });

                return jobList;
            });

            if (jobs.length === 0) {
                await browser.close();
                break;
            } // no more jobs, exit loop

            // For each job, fetch detailed info and stream it back
            for (const job of jobs) {
                const savedJob = loadJobFromFile(job.id);
                let jobDetails;

                if (savedJob) {
                    console.log(`Loading job ${job.id} from file.`);
                    jobDetails = savedJob; // Use the saved job if it exists
                } else {
                    await randomDelay(1500, 3000); // Simulate delay between jobs

                    console.log(`Fetching details for job ${job.id}.`);
                    jobDetails = await fetchJobDetails(job);
                    saveJobToFile(jobDetails); // Save the job after fetching details
                }

                // Stream the job to the client
                await streamEmitter.emitJob(jobDetails);

            }

            start += jobsPerPage;

            await randomDelay(2000, 4000); // wait before next page
        }

        await page.close();
    } catch (error) {
        console.error('Error fetching jobs:', error);
        console.error(page.url());
    }
}

async function fetchJobDetails(basicJobInfo) {
    const page = await browser.newPage();
    await simulateHuman(page);
    await randomDelay(800, 1500);

    try {
        await page.goto(`${JOB_DETAIL_URL}${basicJobInfo.id}`, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await simulateHuman(page);
        await randomDelay(1000, 2000);

        const job = await page.evaluate((basicJobInfo) => {
            // Helper function to safely query elements
            function safeQuerySelector(selector) {
                const element = document.querySelector(selector);
                return element ? element : null;
            }

            const job = {
                ...basicJobInfo,
                applicants: parseInt(safeQuerySelector('.num-applicants__caption')?.textContent?.trim() || '0', 10),
                workType: Array.from(safeQuerySelector('[class*=_job-criteria-list] [class*=_work-type]')?.querySelectorAll('*') || [])
                    .map((item) => item.textContent?.trim() || ''),
                easyApply: safeQuerySelector('.job-search-card__easy-apply-label') !== null,
                logo: safeQuerySelector('[class*=artdeco-entity-image]')?.getAttribute('data-delayed-url') || undefined,
                description: (function() {
                    // First try fetching from the new fallback approach
                    const fallbackDescription = safeQuerySelector('[class*=description] > section > div')?.textContent?.trim();
                    if (fallbackDescription) {
                        return fallbackDescription;
                    }

                    // If fallback fails, try the existing method
                    const descriptionElement = safeQuerySelector('.description__text--rich .show-more-less-html__markup');
                    if (descriptionElement) {
                        return descriptionElement.innerHTML.trim();  // We can use innerHTML for full content including HTML tags
                    }
                    return null;  // If description is not available
                })(),

                // Apply URL logic (wrapped to handle missing elements)
                applyUrl: (function() {
                    const codeEl = safeQuerySelector('#applyUrl');
                    if (codeEl) {
                        const match = codeEl.textContent.match(/"(https:\/\/www\.linkedin\.com\/jobs\/view\/externalApply[^"]+)"/);
                        if (match) {
                            return match[1];
                        }
                    }

                    const btn = safeQuerySelector('a[href*="linkedin.com/jobs/view/externalApply"]');
                    if (btn) {
                        return btn.getAttribute('href');
                    }

                    const easyApplyBtn = safeQuerySelector('button[data-tracking-control-name*="apply"]');
                    if (easyApplyBtn) {
                        return `https://www.linkedin.com/jobs/view/${basicJobInfo.id}`;
                    }

                    return null;
                })(),

                // Hiring team logic (wrapped to handle missing elements)
                hiringTeam: (function() {
                    const card = safeQuerySelector('.message-the-recruiter');
                    if (card) {
                        const name = safeQuerySelector('h3') ? safeQuerySelector('h3').textContent.trim() : '';
                        const title = safeQuerySelector('h4') ? safeQuerySelector('h4').textContent.trim() : '';
                        const messageUrl = safeQuerySelector('.message-the-recruiter__cta') ?
                            safeQuerySelector('.message-the-recruiter__cta').getAttribute('href') : undefined;

                        const connectionText = safeQuerySelector('h4') ? safeQuerySelector('h4').textContent : '';
                        const connectionMatch = connectionText.match(/\b[1-3]rd\b/);
                        const connection = connectionMatch ? connectionMatch[0] : 'Unknown';

                        return {
                            name: name,
                            title: title,
                            connection: connection,
                            messageUrl: messageUrl
                        };
                    }
                    return null;
                })()
            };

            return job;
        }, basicJobInfo);

        await page.close();
        return job;

    } catch (error) {
        console.error('Error fetching job details:', error);
        await page.close();
        return {
            ...basicJobInfo,
            applicants: 0,
            workType: [],
            easyApply: false,
            hiringTeam: null,
        };
    }
}

module.exports = { fetchJobs, saveJobToFile, loadJobFromFile, DatePosted };
