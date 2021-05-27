const axios = require('axios');
const url = require('url');

module.exports = (req, res, next) => {

    const query = url.parse(req.body.url,true).query;
    const sku = query.skuId;
    
    const scrape_link = `https://api.bestbuy.com/v1/products/${sku}.json?show=sku,name,salePrice,longDescription,images&apiKey=${process.env.BEST_BUY_KEY}`;
 
    (async () => {
        try {
            const response = await axios.get(`${scrape_link}`);
            console.log(response.data);
            const item = {
                "name": response.data.name,
                "price": response.data.salePrice,
                "description": response.data.longDescription,
                "imagehref": response.data.images[0].href
            };
            req.item = item;
            next();
        }
        catch (error) {
            console.log(error.response.body);
            next();
        }
    })();
 }