const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const router = express.Router();

const { ZENQUOTES_API_URL } = process.env;

router.get('/inspiration', async (req, res) => {
    try {
        const response = await fetch(ZENQUOTES_API_URL);
        const data = await response.json();
        
        if (response.ok) {
            res.status(200).json({ inspiration: data[0].q });
        } else {
            res.status(response.status).json({ error: 'Failed to fetch inspiration' });
        }
    } catch (error) {
        console.error('Error fetching inspiration:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
