const axios = require('axios');

// Helper function to format date into LinkedIn API format
function formatDate(date) {
    const d = new Date(date);
    return `(day:${d.getDate()},month:${d.getMonth() + 1},year:${d.getFullYear()})`;
}
const DatePosted = {
    AnyTime: '',
    Past24Hours: 'r86400',
    PastWeek: 'r604800',
    PastMonth: 'r2592000',
    Past12Hours: 'r43200',
    Past3Days: 'r259200',
    Past5Days: 'r432000',
};

// Main function to fetch jobs and stream them
async function fetchJobsApi(title, location, datePosted, access_token, streamEmitter) {
    if (!access_token) {
        console.error('Missing access_token');
        return;
    }

    const url = 'https://api.linkedin.com/rest/jobLibrary';
    let dateRange = '';

    console.log(datePosted)
    // Calculate the date range based on the `datePosted` argument
    if (datePosted in DatePosted) {
        const now = new Date();
        let startDate;

        // Handling the "PastXDays" cases like "Past3Days"
        if (datePosted.startsWith('Past') && datePosted.length > 4) {
            const daysAgo = parseInt(datePosted.slice(4), 10);  // Extract the number of days
            startDate = new Date(now);
            startDate.setDate(now.getDate() - daysAgo); // Subtract the specified number of days from today
            startDate.setHours(0, 0, 0, 0); // Round to the start of the day (midnight)
        } else if (datePosted === 'Past24Hours') {
            // For Past24Hours, round to the start of the previous day (yesterday at midnight)
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 1); // Move to the previous day
            startDate.setHours(0, 0, 0, 0);  // Set to midnight of the previous day
        } else {
            // For other cases like 'PastWeek', 'PastMonth', use the original calculation
            const pastSeconds = parseInt(DatePosted[datePosted], 10);
            startDate = new Date(now - pastSeconds);
        }

        const endDate = new Date(now);

        dateRange = `(start:${formatDate(startDate)},end:${formatDate(endDate)})`;
    } else {
        // If `datePosted` is not a valid key in `DatePosted`, log a warning and default to 'AnyTime'
        console.warn(`Unsupported datePosted value: ${datePosted}. Using 'AnyTime' as default.`);
        dateRange = ''; // LinkedIn API might accept an empty value to return all results
    }

    try {
        for (let i = 0; i < 200; i+=24) { // Example: limiting to 100 pages of jobs (adjust as needed)
            const params = {
                q: 'criteria',
                keyword: `${title} in ${location}`,
                dateRange: dateRange,  // Keep date range fixed for now
                start: i,  // The current page start index
                count: 24,  // Number of results per page
            };
            console.log(dateRange);

            const response = await axios.get(url, {
                params,
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'X-RestLi-Protocol-Version': '2.0.0',
                    'Linkedin-Version': '202503',
                },
            });

            const jobs = response.data.elements.map(job => {
                const jobDetails = job.jobDetails || {};
                const id = job.jobPostingUrl.split('/').pop();
                return {
                    id: id,
                        title: jobDetails.jobTitle || '',
                    company: jobDetails.organizationName || '',
                    location: jobDetails.jobLocation || '',
                    timePosted: "10 minutes ago",//jobDetails.jobListTimeInMilliseconds || null,
                    applicants: 0,
                    easyApply: false,
                    logo : null,
                    workType: [],
                      //  jobTargeting: jobDetails.jobTargeting || [],
                        //isRestricted: jobDetails.isRestricted || false,
                       // organizationUrl: jobDetails.organizationUrl || '',
                    description: jobDetails.jobDescription || '',
                    applyUrl:`https://www.linkedin.com/jobs/view/${id}/`,
                        hiringTeam: jobDetails.hiringTeam ? {
                            name: jobDetails.hiringTeam.name || '',
                            title: jobDetails.hiringTeam.title || '',
                            connection: jobDetails.hiringTeam.connection || '',
                            messageUrl: jobDetails.hiringTeam.messageUrl || null,
                        } : null
                };
            });

            console.log("api jobs"+jobs.length)

            // Emit the batch of jobs to the streamEmitter
            jobs.forEach(job => {
                streamEmitter.emitJob(job);
            });

            // If the number of jobs fetched is less than the results per page, no more results are available
            if (response.data.elements.length < 24) {
                break; // No more results, exit the loop
            }
        }
    } catch (error) {
        console.error(error?.response?.data || error.message);
        console.log(error.request.url)
    }
}

module.exports = { fetchJobsApi };
