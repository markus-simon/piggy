var ConfigRetriever = require("vertx-config-js/config_retriever");

var retriever = ConfigRetriever.create(vertx);

var verticles = [
    'httpserver.js',
    'persistor.js',
    'erm.js',
    'hue.js',
    'tts.js'
];


retriever.getConfig(function (res, res_err) {
    if (res_err !== null) {
        console.log('Failed to retrieve the configuration');
    } else {
        var options = {
            'config': res
        };
        verticles.forEach(function(verticle) {
            vertx.deployVerticle(verticle, options, function(res, res_err) {
                if (res_err === null) {
                    if (verticle === 'persistor.js') {
                        vertx.deployVerticle('upgrade.js', options);
                    }
                } else {
                    res_err.printStackTrace();
                }
            });
        });
    }
});

