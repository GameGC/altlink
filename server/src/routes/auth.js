const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const { LINKEDIN_CLIENT_ID ,REACT_APP_SERVER_URI  } = process.env;

    if (!LINKEDIN_CLIENT_ID || !REACT_APP_SERVER_URI) {
        return res.status(500).send('Missing LinkedIn environment variables.');
    }

    const encodedRedirect = encodeURIComponent(`${REACT_APP_SERVER_URI}/api/linkedin/callback`);
    const scope = encodeURIComponent('openid profile email');
    console.log(REACT_APP_SERVER_URI);

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodedRedirect}&scope=${scope}`;

    console.log(authUrl);
    res.redirect(authUrl);
});

module.exports = router;
