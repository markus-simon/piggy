var eb = vertx.eventBus();
var Buffer = require("vertx-js/buffer");


var consumerHue = eb.consumer('tts');
consumerHue.handler(function (message) {
    var result  = message.body();
    var showtts = result.showtts;
    var file    = showtts.replace(/\s+/g, '-').toLowerCase() + '.mp3';
    var folder  = 'webroot/assets/sound/';
    vertx.fileSystem().exists(folder + file, function (res, err) {
        if (err === null && res) {
            result.showtts = file;
            eb.publish('show', result);
        } else {
            var query = encodeURI(showtts);
            var client = vertx.createHttpClient({
                ssl: true
            });
            var request = client.get(443, 'translate.google.com', '/translate_tts?ie=ISO-8859-1&q=' + query + '&tl=de-DE&client=tw-ob', function (response) {
                response.bodyHandler(function (totalBuffer) {
                    var buffer = Buffer.buffer(totalBuffer.toString("ISO-8859-1"), "ISO-8859-1");
                    vertx.fileSystem().writeFile(folder + file, buffer, function (ress, ress_err) {
                        if (ress_err === null) {
                            result.showtts = file;
                            eb.publish('show', result);
                        } else {
                            console.error("Oh oh ..." + ress_err);
                        }
                    });
                });
            });
            request.end();
            client.close();
        }
    });
});