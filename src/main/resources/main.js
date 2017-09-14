var eb = vertx.eventBus();

var verticles = [
    'persistor.js',
    'httpserver.js'
];


verticles.forEach(function(verticle) {
    vertx.deployVerticle(verticle, function(res, res_err) {
        if (res_err == null) {
            eb.send('save', {collection: 'verticle', verticle: verticle, deployment_id: res, status: 1});
        } else {
            res_err.printStackTrace();
        }
    });
});

