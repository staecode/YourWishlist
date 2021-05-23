// request Axios
const axios = require('axios');
const querystring = require('querystring');

module.exports = (req, res, next) => {

    const url = encodeURIComponent(req.body.url);
    const scrape_link = 'https://app.scrapingbee.com/api/v1';
    const api_key = 'SHMK5K4CFH1P5OYW5O53WA3S74JLM8TCK2N3UVDPFRZKXL5Z96SJ9B90XIUZ8H8PR2WWU150MVI4KQ4U';
 
    (async () => {
        try {
            const response = await axios.get(`${scrape_link}`, {
                params: {
                    'api_key': api_key,
                    'url': url
                }
            })
            console.log(response);
            req.product = response;
            next();
        }
        catch (error) {
            req.error = error;
            next();
        }
    })
 }