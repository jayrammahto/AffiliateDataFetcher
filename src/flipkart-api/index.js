const logger = require('../logger/logger');

const client = require('./flipkart-api');
var _util = require('./util')
const fs = require('fs')
const path = require('path')
const _affiliateDetails = require('../../affiliate-api-config')
// const dbUtil = require('../dbutil/db_util')
const request = require('request');


var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        logger.info('content-type:', res.headers['content-type']);
        logger.info('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};


var affiliateDetails = new _affiliateDetails();

var fkClient = new client(affiliateDetails, "json");

var _util = new _util(affiliateDetails);


var empCategory = ['televisions', 'mobiles', 'air_coolers', 'air_conditioners', 'refrigerator', 'microwave_ovens', 'laptops', 'washing_machine', 'home_appliances']; //'home_entertainment', 'tablets','cameras', 'wearable_smart_devices', 'kitchen_appliances', , 'desktops'
var empCategoryPath = function (_category) {
    category_mapping = {
        'televisions': "television",
        'mobiles': "mobile",
        'air_coolers': "air cooler",
        'air_conditioners': "air conditioner",
        'tablets': "tablet",
        'refrigerator': "refrigerator",
        'cameras': "camera",
        'wearable_smart_devices': "smart watch",
        'microwave_ovens': "microwave oven",
        'laptops': "laptop",
        'washing_machine': "washing machine",
        'desktops': "desktop"
    }

    var _t_cat = category_mapping[_category];
    if (_t_cat) return _t_cat;

    switch (_category) {
        case "home_entertainment":
            return "home entertainment";
        case "kitchen_appliances":
            return "kitchen appliance";
        case "home_appliances":
            return "home appliance";
        default:
            return _t_cat;
    }
}

function urlRemoveAffId(_url) {
    var lastIndex = _url.lastIndexOf('&affid');
    return _url.substring(0, lastIndex);
}



//Product listing api to fetch and update the database
fkClient.getProductsFeedListing().then(function (value) {

    if (value.status != 200) {
        logger.fatal('getProductsFeedListing failing. Status code: ' + value.status);
        return;
    }

    const body = JSON.parse(value.body);
    const apiListings = body.apiGroups.affiliate.apiListings;

    empCategory.forEach(cval => {
        var getUrl = apiListings[cval].availableVariants['v1.1.0'].get;
        do {
            _util.fetchProductByCategory(cval, getUrl).then(function (value1) {
                if (value1.status != 200) {
                    logger.fatal('fetchProductByCategory failing. Status Code: ' + value.status);
                    return;
                }


                const body1 = JSON.parse(value1.body);
                const products = body1.products.slice(0, 50);

                //To get next url.
                (products.length == 500) ? getUrl = body1.nextUrl : getUrl = '';

                //Iterate through each product
                products.forEach(_pval => {
                    //EStore - to Create record
                    const _productBaseInfoV1 = _pval.productBaseInfoV1;
                    const _categorySpecificInfoV1 = _pval.categorySpecificInfoV1;

                    _util.getCallToDB({ 'populate[e_stores][fields][0]': 'id', 'fields[0]': 'id', 'filters[productId][$eq]': _productBaseInfoV1.productId }, affiliateDetails.strApi_details.server_url + '/api/products').then(_val => {
                        let _method = 'POST';
                        if (_val.status != 200) {
                            logger.fatal('/api/products Get failing. Status Code: ' + _val.status);
                            return;
                        }

                        body_temp = JSON.parse(_val.body);
                        // logger.debug('Body_Temp : ' + JSON.stringify(body_temp))
                        // logger.debug('Body_Temp : ' + body_temp.data[0].attributes.e_stores.data.length)

                        if (body_temp.meta.pagination.total != '0' && body_temp.data[0].attributes.e_stores.data.length != 0) _method = 'PUT';

                        // logger.debug('_method : ' + _method)

                        //Add new product
                        if (_method === 'POST') {
                            logger.fatal('############: ' + JSON.stringify(_pval))
                            //will be passed to e-stores api to bind with product table.
                            let emp_prod_title = getProdTitle(cval, _productBaseInfoV1, _categorySpecificInfoV1);

                            var _product = {
                                "data": {
                                    "title": _productBaseInfoV1.title,
                                    "prodBrand": _productBaseInfoV1.productBrand,
                                    "category": empCategoryPath(cval),
                                    "attribute": _productBaseInfoV1.attributes,
                                    "productFamily": _productBaseInfoV1.productFamily,
                                    "specificationList": _categorySpecificInfoV1.specificationList,
                                    "imageUrls": _productBaseInfoV1.imageUrls,
                                    "listImageUrls": {},
                                    "keySpecs": _categorySpecificInfoV1.keySpecs,
                                    "description": "string",
                                    "productId": _productBaseInfoV1.productId,
                                    "productUrl": (_productBaseInfoV1.title.replace(/[^A-Za-z0-9]+/g, '-').replace(/-$/, '').toLowerCase()),
                                }
                            };

                            _util.postCallToDB(_method, _product, affiliateDetails.strApi_details.server_url + '/api/products').then((value1) => {

                                if (value1.status != 200) {
                                    logger.fatal('Url[POST]: /api/products Status Code(' + value1.status + "). ProductId : " + _productBaseInfoV1.productId);
                                    return;
                                }

                                logger.info("Products row updated. product_id : " + value1.body.data.id);

                                var _estore = {
                                    "data": {
                                        "mrp": _productBaseInfoV1.maximumRetailPrice.amount,
                                        "sellingPrice": _productBaseInfoV1.flipkartSellingPrice.amount,
                                        "specialPrice": _productBaseInfoV1.flipkartSpecialPrice.amount,
                                        "productUrl": urlRemoveAffId(_productBaseInfoV1.productUrl),
                                        "ecomStoreName": "Flipkart",
                                        "product": value1.body.data.id,
                                        "offers": _productBaseInfoV1.offers,
                                        "inStock": _productBaseInfoV1.inStock,
                                        "productId": _productBaseInfoV1.productId,
                                        "productTitle": emp_prod_title
                                    }
                                };

                                _util.postCallToDB(_method, _estore, affiliateDetails.strApi_details.server_url + '/api/e-stores').then(function (value1) {
                                    if (value1.status != 200) {
                                        logger.fatal('Url[POST]: /api/e-stores Status Code(' + value1.status + '). ProductId: ' + value1.body.data.id);
                                        return;
                                    }

                                    logger.info("E-stores row inserted. e_stores.id : " + value1.body.data.id);
                                }).catch(err => logger.info(err));

                            }).catch(err => logger.info(err));
                        }
                        //Update case
                        else {
                            var e_store_id = body_temp.data[0].attributes.e_stores.data[0].id;
                            logger.debug('Row found in e-stores table with product id. e-stores.id: ' + e_store_id)

                            var _estore = {
                                "data": {
                                    "mrp": _productBaseInfoV1.maximumRetailPrice.amount,
                                    "sellingPrice": _productBaseInfoV1.flipkartSellingPrice.amount,
                                    "specialPrice": _productBaseInfoV1.flipkartSpecialPrice.amount,
                                    "offers": _productBaseInfoV1.offers,
                                    "inStock": _productBaseInfoV1.inStock,
                                }
                            };

                            _util.postCallToDB(_method, _estore, affiliateDetails.strApi_details.server_url + '/api/e-stores/' + e_store_id).then(function (value1) {
                                if (value1.status != 200) {
                                    logger.fatal('Url: /api/e-stores Status code(' + value1.status + '). e_store_id : ' + e_store_id);
                                    return;
                                }

                                logger.info("Row updated in e-stores with id: " + e_store_id);
                            }).catch(err => logger.info(err));
                        }
                    });
                });
            });
            getUrl = '';
        } while (getUrl.length != 0);
    });
});


function getProdTitle(cval, _productBaseInfoV1, _categorySpecificInfoV1) {
    var prodTitle = cval;
    switch (cval) {
        case "televisions":
            return 'TVs';
        case "mobiles":
            return 'Mobiles';
        case "air_coolers":
            return 'Air Coolers';
        case "home_entertainment":
            return 'Home Entertainment';
        case "air_conditioners":
            return 'ACs';
        case "tablets":
            return 'Tables';
        case "refrigerator":
            return 'Refrigerators';
        case "cameras":
            return 'Cameras';
        case "wearable_smart_devices":
            return 'Wearable Smart Devices';
        case "microwave_ovens":
            return 'Microwave Ovens';
        case "kitchen_appliances":
            return 'Kitchen Appliances';
        case "laptops":
            return 'Laptops';
        case "washing_machine":
            return 'Washing Machines';
        case "home_appliances":
            return 'Home Appliances';
        case "desktops":
            return 'Desktops';
        default:
            return 'Products';
    }
}