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
        var request = client.getAbs(hueurl + '/api/' + huekey + '/lights', function (response) {
            response.bodyHandler(function (totalBuffer) {
                console.log('Hue says: ' + totalBuffer.toString());
                message.reply(totalBuffer.toString());
            });
        });
        request.end();
        client.close();
    } else if (huerequesttype === 'put') {
        if (config.huesetting) {
            var huesetting = JSON.stringify(config.huesetting).replace(
                new RegExp( "randomColor\\(+?.*\\)", 'gi' ),
                function($0) {return eval($0)}
            );
            var payload = JSON.parse(huesetting);
        }

        var request = client.putAbs(hueurl + '/api/' + huekey + huepath, function (response) {
            response.bodyHandler(function (totalBuffer) {
                console.log('Hue says: ' + totalBuffer.toString());
                message.reply(totalBuffer.toString());
            });
        });

        request.setChunked(true);
        if (payload) {
            request.write(payload);
        }
        request.end();
        client.close();
    }
});



var randomColor = function() {
    return Math.floor((Math.random() * 45000) + 1);
};



