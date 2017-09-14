var eb = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/eventbus');
eb.onopen = function() {

    var dataBars = [
        { type: "1",   amount: 0},
        { type: "2",   amount: 0},
        { type: "5",   amount: 0},
        { type: "10",  amount: 0},
        { type: "20",  amount: 0},
        { type: "50",  amount: 0},
        { type: "100", amount: 0},
        { type: "200", amount: 0}
    ];

    render(dataBars);

    eb.registerHandler('saved', function() {
        var query = {
            "aggregate" : "piggy",
            "pipeline" :[
                {
                    "$group": {
                        "_id": "$amount",
                        "amount": { "$sum" : 1 },
                        "type": { "$first": "$amount" }
                    }
                },{
                    "$sort" : {
                        "type" : 1
                    }
                }
            ]
        };
        eb.send("runCommand", JSON.stringify(query), function (res, res_err) {
            if (res.ok == 1) {
                updateBars(res.result);
            } else {
                alert('Something is fishy ... :-(');
            }
        });
    });

    window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
        console.log('jetzte, wa?!');
        if (errorMsg.indexOf('INVALID_STATE_ERR') > -1) {
            showNotice('error', 'Server down!');
        }
    };

    var serverState = 1;
    function checkServer() {
        $.ajax({
            url: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '?' + new Date().getTime(),
            success: function() {
                if (serverState == 0) {
                    serverState = 1;
                    location.reload();
                }
            },
            error: function (jqXHR, exception) {
                if (jqXHR.status !== 200) {
                    showNotice('warning', 'Server down! Retry in 10s');
                    serverState = 0;
                }
            },
            complete: function() {
                setTimeout(checkServer, 10000);
            }
        });
    }
    setTimeout(checkServer, 10000);

};