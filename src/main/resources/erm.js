var Buffer = require("vertx-js/buffer");


var eb     = vertx.eventBus();
var consumerErm = eb.consumer('saved333');
consumerErm.handler(function (message) {
    var document = message.body();
    eb.send('find', {
        collection: 'erm',
        batch_size: 1000,
        matcher: {
            target_collection: 'piggy'
        }
    }, function(reply) {
        reply.body().forEach(function(result) {
            if(result.matcher) {
                var matcher = JSON.parse(result.matcher);
                matcher._id = document._id;
            } else {
                matcher = {};
            }
            eb.send('find', {collection: document.collection, matcher: matcher}, function(res, res_err) {

                if (res_err === null) {
                    if (res.body().length > 0) {

                        // TODO toString is bad, on/off even worse
                        if (typeof result.hue !== 'undefined' && result.hue.toString() == 'on') { // 1x runter
                            result.huerequesttype = 'put';
                            eb.publish('hue', result);
                        }

                        if (typeof result.show !== 'undefined' && result.show.toString() == 'on') {
                            if (result.showurl) {
                                document.showurl = result.showurl;
                            }
                            if (result.showtts) {
                                eb.publish('tts', result);
                            } else {
                                eb.publish('show', document);
                            }

                        }
                    }
                } else {
                    res_err.printStackTrace();
                }
            });
        });
    })
});

var calculateDate = function(offset_years,offset_months,offset_days,offset_hours,offset_minutes,offset_seconds) {
    var dt = new Date();
    dt.setFullYear(dt.getFullYear() + offset_years);
    dt.setMonth(dt.getMonth()       + offset_months);
    dt.setDate(dt.getDate()         + offset_days);
    dt.setHours(dt.getHours()       + offset_hours);
    dt.setMinutes(dt.getMinutes()   + offset_minutes);
    dt.setSeconds(dt.getSeconds()   + offset_seconds);
    var calculatedDate =
        dt.getFullYear() + '-' +
        ('0' + (dt.getMonth() + 1)).slice(-2) + '-' +
        ('0' + dt.getDate()).slice(-2) + ' ' +
        ('0' + dt.getHours()).slice(-2) + ':' +
        ('0' + dt.getMinutes()).slice(-2) + ':' +
        ('0' + dt.getSeconds()).slice(-2)
    ;
    return calculatedDate;
};

