const axios = require('axios');

const redirectMiddleware = async (req, res, next) => {
    console.log(req.protocol);
    if (req.protocol === 'http') {
        try {
            // Create a new POST request to the HTTPS version of the same URL
            const httpsUrl = `https://gmc-api-21v6.onrender.com/api/opc/send-data`;
            const response = await axios({
                method: req.method,
                url: httpsUrl,
                headers: req.headers, // Forward original headers
                data: req.body, // Forward the original request body
            });

            // Send back the response from the HTTPS server to the client
            res.status(response.status).send(response.data);
        } catch (error) {
            console.error('Error while forwarding request to HTTPS:', error.message);
            res.status(error.response?.status || 500).send(error.response?.data || 'Internal Server Error');
        }
    } else {
        next();
    }
};

module.exports = redirectMiddleware;
