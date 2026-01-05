const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Proxy endpoint for Awair API
app.all('/api/*', async (req, res) => {
    try {
        const awairPath = req.params[0];
        const awairUrl = `https://developer-apis.awair.is/v1/${awairPath}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;

        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ error: 'No authorization token provided' });
        }

        const response = await fetch(awairUrl, {
            method: req.method,
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Awair Dashboard server running at http://localhost:${PORT}`);
    console.log(`📊 Open http://localhost:${PORT}/index.html in your browser`);
});
