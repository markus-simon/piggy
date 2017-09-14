var Vertx              = require('vertx-js/vertx');
var Router             = require('vertx-web-js/router');
var BodyHandler        = require('vertx-web-js/body_handler');
var StaticHandler      = require('vertx-web-js/static_handler');
var SockJSHandler      = require('vertx-web-js/sock_js_handler');

var eb = vertx.eventBus();

var options = {
    logActivity : true,
    ssl: false,
    outboundPermitteds : [
        {}
    ],
    inboundPermitteds : [
        {}
    ]
};

var router = Router.router(vertx);
router.route('/eventbus/*').handler(SockJSHandler.create(vertx).bridge(options).handle);
router.route().handler(StaticHandler.create().handle);
router.route().handler(BodyHandler.create().handle);


router.post().handler(function (routingContext) {
    var response = routingContext.response();
    response.end('Your input is welcome ... \n');
    try {
        var message = routingContext.getBodyAsJson();
        if (!message.collection) {
            throw new Error('You need to define a collection!');
        }

        eb.send('save', message);

    } catch (e) {
        console.log(e.message);
    }
});

vertx.createHttpServer(options).requestHandler(router.accept).listen(19000);