const express = require('express');
const cors = require('cors');
const runScraper = require('./src/scraper');
const axios = require('axios');
const { fetchJobs, DatePosted } = require('./src/jobService');
const StreamEmitter = require("./src/StreamEmitter"); // assuming you rename your main logic file


const authRoute = require('./src/routes/auth');
const callbackRoute = require('./src/routes/callback');
const { fetchJobsApi } = require('./src/routes/jobs');



const app = express();

// Enable CORS
app.use(cors());

app.get('/scrape', async (req, res) => {
  try {
    await runScraper();
    res.status(200).send('Scraping done.');
  } catch (err) {
    console.error('Error during scraping:', err);
    res.status(500).send('Scraping failed.');
  }
});
app.get('/api/jobsNew', (req, res) => {
  const { title = '', location = '', datePosted = '' } = req.query;

  // Create a new StreamEmitter for the current request
  const streamEmitter = new StreamEmitter();

  // Set appropriate headers for streaming
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked'); // Inform the client that we're sending chunks

  // Listen to 'job' events and stream job data to client
  streamEmitter.on('job', (job) => {
    // Send each job as a chunk to the client
    res.write(JSON.stringify(job) + '\n'); // Send job data followed by a newline (for better readability)
  });

  // When all jobs have been processed, end the response stream
  fetchJobs(title, location, datePosted, streamEmitter)
      .then(() => {
        res.end(); // End the response when done
      })
      .catch((err) => {
        console.error('Error fetching jobs:', err);
        res.status(500).send('Failed to fetch jobs');
      });
});

// server/index.js
require('dotenv').config();

app.use('/api/linkedin/auth', authRoute);
app.use('/api/linkedin/callback', callbackRoute);
app.get('/api/linkedin/jobs', (req, res) => {
  const {title = '', location = '', datePosted = '', access_token} = req.query;

  // Create a new StreamEmitter for the current request
  const streamEmitter = new StreamEmitter();

  // Set appropriate headers for streaming
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked'); // Inform the client that we're sending chunks

  streamEmitter.on('job', (job) => {
    // Send each job as a chunk to the client
    res.write(JSON.stringify(job) + '\n'); // Send job data followed by a newline (for better readability)
  });

  fetchJobsApi(title, location, datePosted,access_token, streamEmitter)
      .then(() => {
        res.end(); // End the response when done
      })
      .catch((err) => {
        console.error('Error fetching jobs:', err);
        res.status(500).send('Failed to fetch jobs');
      });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

