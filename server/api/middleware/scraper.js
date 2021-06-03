const axios = require('axios');
const url = require('url');
const path = require('path');

module.exports = (req, res, next) => {

    if(req.body.url.includes('bestbuy')) {
        const query = url.parse(req.body.url,true).query;
        const sku = query.skuId;
        const scrape_link = `https://api.bestbuy.com/v1/products/${sku}.json?show=sku,name,salePrice,longDescription,images&apiKey=${process.env.BEST_BUY_KEY}`;
    
        (async () => {
            try {
                const response = await axios.get(`${scrape_link}`);
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
                req.error = error;
                next();
            }
        })();
    }
    // } else if(req.body.url.includes('etsy')) {
    //     const listingId = req.body.url.split('/')[4];
    //     const product_link = `https://openapi.etsy.com/v2/listings/${listingId}?api_key=${process.env.ETSY_KEY}`;
    //     const image_link = `https://openapi.etsy.com/v2/listings/${listingId}/images?api_key=${process.env.ETSY_KEY}`;

    //     (async () => {
    //         try {
    //             const response = await axios.get(`${product_link}`);
    //             const item = {
    //                 "name": response.data.title,
    //                 "price": response.data.price,
    //                 "description": response.data.description
    //             };
    //             const image = await axios.get(`${image_link}`);
    //             item["imagehref"] = image.results[0].url_fullxfull;
    //             req.item = item;
    //             next();

    //         }
    //         catch (error) {
    //             req.error = error;
    //             next();
    //         }
    //     })();    
        
    // }
     else {
        req.error = 'Sorry - at this time our app does not support this site\'s products';
        next();
    }
 }