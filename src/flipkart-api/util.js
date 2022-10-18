const logger = require('../logger/logger');

var request = require('request');

var util1 = function (affliateDetails) {

	var headers = [{
		"Fk-Affiliate-Id": affliateDetails.fk_details.trackingId,
		"Fk-Affiliate-Token": affliateDetails.fk_details.token
	}, 
	{
		"Authorization": "Bearer " + affliateDetails.strApi_details.full_access_auth_token
		,
	}];
	
    this.fetchProductByCategory = function( category, url) {

        logger.info("fetchProductByCategory:" + category + "   URL: " + url)
		// logger.info(headers[0])
        
    	return new Promise(function (resolve, reject) {
			url = url + "&inStock=true";
			request({
				url: url,
				headers: headers[0],
			}, function (error, response, body) {
                if (error) 
                    reject(error);
                else {
                	resolve({
						status: response.statusCode,
						error: getStatusError(response.statusCode),
						body: body
					});
				}
			});
		});
	};




    this.postCallToDB = function( _method, body, url) {
		logger.info("postCallToDB. Method: "+ _method + " Url: " + url)
		// logger.info(headers[1])
        
    	return new Promise(function (resolve, reject) {
			request({
				method: _method,
                url: url,
				headers: headers[1],
                json: true,
                body: body
            }, function (error, response, body) {
                if (error) 
                    reject(error);
                else {
                	resolve({
						status: response.statusCode,
						error: getStatusError(response.statusCode),
						body: body
					});
				}
			});
		});
	};

    this.getCallToDB = function( qs, url) {

        logger.info("getCallToDB, Url: " + url + " param:" + qs)
		// logger.info(headers[1])
        
    	return new Promise(function (resolve, reject) {
			request.get({
                url: url,
				headers: headers[1],
                qs: qs
            }, function (error, response, body) {
                if (error) 
                    reject(error);
                else {
                	resolve({
						status: response.statusCode,
						error: getStatusError(response.statusCode),
						body: body
					});
				}
			});
		});
	};
}


var getStatusError = function (statusCode) {
	if (statusCode == 400)
		return "Bad request";
	else if (statusCode == 401)
		return "Unauthorized. Affiliate Id or Token InCorrect";
	else if (statusCode == 403)
		return "Forbidden";
	else if (statusCode == 404)
		return "Error: Not Found"
	else if (statusCode == 500)
		return "Internal Server Error";
	else if (statusCode == 503)
		return "Service unavailable";
	else if (statusCode == 599)
		return "Connection timed out";
	else if (statusCode == 410)
		return "Resource requested is no longer available";
	else if (statusCode == 200)
		return null;
	else
		return "Unknown Error Occured";
}

module.exports = util1;
