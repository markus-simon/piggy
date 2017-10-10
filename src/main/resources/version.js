var eb = vertx.eventBus();

/**
 * First read dir for upgrade files
 */
var getUpgradeFiles = function() {
    vertx.fileSystem().readDir('version', function(res, err) {
        if (!err) {
            res.forEach(function(verticle) {
                checkIfInstalled(verticle);
            })
        }
    });
};

/**
 * Then check for each file, if it's installed currently
 * @param verticle
 */
var checkIfInstalled = function(verticle) {
    var fileName = verticle.substring(verticle.lastIndexOf("/") + 1);
    eb.send('find', {collection: 'version', matcher: { verticle: fileName }}, function(reply) {
        if (reply.body().length < 1) {
            deployUpgrade(verticle);
        }
    });
};

/**
 * Last task is to deploy upgrades, that are not installed
 * @param verticle
 */
var deployUpgrade = function(verticle) {
    var fileName = verticle.substring(verticle.lastIndexOf("/") + 1);
    vertx.deployVerticle(verticle, function(res, err) {
        if (!err) {
            var version = {};
            version.collection = 'version';
            version.verticle   = fileName;
            eb.send('save', version);
        } else {
            err.printStackTrace();
        }
    });
};

getUpgradeFiles();

