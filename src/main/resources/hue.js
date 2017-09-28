var eb = vertx.eventBus();

var consumerHue = eb.consumer('hue');
consumerHue.handler(function (message) {

    var config     = message.body();
    var hueurl     = config.hueurl;
    var huekey     = config.huekey;
    var huesetting = JSON.stringify(config.huesetting).replace(
        new RegExp( "randomColor\\(+?.*\\)", 'gi' ),
        function($0) {return eval($0)}
    );

    var payload = JSON.parse(huesetting);
/*
    console.log(payload);
*/
/*
    payload.hue = parseInt(payload.hue);
*/
    var client = vertx.createHttpClient();
    //  var request = client.put(80, hueurl, '/api/' + huekey + '/lights/1/state', function (response) {
    var request = client.putAbs(hueurl + '/api/' + huekey + '/lights'/*/1/state'*/, function (response) {
        response.bodyHandler(function (totalBuffer) {
            console.log('Hue says: ' + totalBuffer.toString())
        });
    });
    request.setChunked(true);
    request.write(payload);
    request.end();
    client.close();
});



var randomColor = function() {
    return Math.floor((Math.random() * 45000) + 1);
};



