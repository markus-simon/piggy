var eb = vertx.eventBus();

var consumerHue = eb.consumer('hue');
consumerHue.handler(function (message) {

    var config         = message.body();
    var hueurl         = config.hueurl;
    var huekey         = config.huekey;
    var huepath        = config.huepath;
    var huerequesttype = config.huerequesttype;

    console.log(JSON.stringify(config));

    var client = vertx.createHttpClient();

    if (huerequesttype === 'get') {
        var requestGet = client.getAbs(hueurl + '/api/' + huekey + '/lights', function (ar, ar_err) {
            if (ar_err === null) {
                ar.bodyHandler(function (totalBuffer) {
                    console.log('Hue says: ' + totalBuffer.toString());
                    message.reply(totalBuffer.toString());
                });
            } else {
                console.log('error'); // TODO reply error to frontend
            }
        });
        requestGet.end();
        client.close();
    } else if (huerequesttype === 'put') {
        if (config.huesetting) {
            var huesetting = JSON.stringify(config.huesetting).replace(
                new RegExp( "randomColor\\(+?.*\\)", 'gi' ),
                function($0) {return eval($0)}
            );
            var payload = JSON.parse(huesetting);
        }

        var requestPut = client.putAbs(hueurl + '/api/' + huekey + huepath, function (ar, ar_err) {
            if (ar_err === null) {
                ar.bodyHandler(function (totalBuffer) {
                    console.log('Hue says: ' + totalBuffer.toString());
                    message.reply(totalBuffer.toString());
                });
            } else {
                console.log('error'); // TODO reply error to frontend
            }
        });

        requestPut.setChunked(true);
        if (payload) {
            requestPut.write(payload);
        }
        requestPut.end();
        client.close();
    }

});



var randomColor = function() {
    return Math.floor((Math.random() * 45000) + 1);
};



