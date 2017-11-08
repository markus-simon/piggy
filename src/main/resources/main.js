var ConfigRetriever = require("vertx-config-js/config_retriever");

/*var httpStore = {
    "type" : "http",
    "config" : {
        "host" : "https://neuron.stayglossy.net",
        "port" : 19000,
        "path" : "/conf"
    }
};*/

var fileStore = {
    "type" : "file",
    "config" : {
        "path" : "conf.json"
    }
};

var options = {
    "stores" : [
/*
        httpStore,
*/
        fileStore
    ]
};

var retriever = ConfigRetriever.create(vertx, options);

var verticles = [
    'httpserver.js',
    'persistor.js',
    'upgrade.js',
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
            vertx.deployVerticle(verticle, options);
        });
    }
});
