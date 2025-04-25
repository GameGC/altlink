const express = require('express');
const axios = require('axios');
const qs = require('qs');

const router = express.Router();

router.get('/', async (req, res) => {
    const { code, error: authError } = req.query;
    const { LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, REACT_APP_SERVER_URI } = process.env;

    if (authError) {
        return res.status(400).send(`Authorization error: ${authError}`);
    }

    if (!code) {
        return res.status(400).json({ error: 'Missing authorization code from LinkedIn.' });
    }

    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !REACT_APP_SERVER_URI) {
        return res.status(500).json({ error: 'Missing LinkedIn environment variables.' });
    }

    try {
        const tokenRes = await axios.post(
            'https://www.linkedin.com/oauth/v2/accessToken',
            qs.stringify({
                grant_type: 'authorization_code',
                code,
                redirect_uri: `${REACT_APP_SERVER_URI}/api/linkedin/callback`,
                client_id: LINKEDIN_CLIENT_ID,
                client_secret: LINKEDIN_CLIENT_SECRET,
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );

        const { access_token } = tokenRes.data;
        console.log('✅ Access token received:', access_token);
        console.log('LinkedIn callback query:', req.query);

        res.redirect(`${REACT_APP_SERVER_URI}?access_token=${access_token}`);
    } catch (err) {
        console.error('❌ Token exchange failed:', err.response?.data || err.message);
        res.status(500).json({
            error: 'Failed to fetch access token from LinkedIn.',
            details: err.response?.data || err.message,
        });
    }
});

module.exports = router;
