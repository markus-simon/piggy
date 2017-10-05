var MongoClient = require('vertx-mongo-js/mongo_client');

var eb = vertx.eventBus();

var client = MongoClient.createShared(vertx, {
    db_name: 'piggy'
});


// we create a handler for messages sent on the address 'save'. When we receive a message, we try to save it.
var consumerSave = eb.consumer('save');
consumerSave.handler(function (message) {
    var document = message.body();

    if (!document.message_created_at) {
        document.message_created_at = calculateDate();
    }
    // TODO this is, how dates (like message_created_at) in mongo should be used ...
    //document.date = {'$date': '1937-09-21T00:00:00+00:00'};

    client.save(document.collection, document, function (res, res_err) {
        if (res_err === null) {
            document._id = res;
            message.reply(res);
            eb.publish('saved', document);
        } else {
            message.reply(res_err);
            res_err.printStackTrace();
        }
    });
});


// another handler to load messages
var consumerFind = eb.consumer('find');
consumerFind.handler(function (message) {
    var document = message.body();
    client.find(document.collection, document.matcher, function (res, res_err) {
        if (res_err === null) {
            message.reply(res);
        } else {
            message.reply(res_err);
            res_err.printStackTrace();
        }
    });
});


// another handler to delete messages
var consumerDelete = eb.consumer('delete');
consumerDelete.handler(function (message) {
    var document = message.body();
    client.remove(document.collection, document.matcher, function (res, res_err) {
        if (res_err === null) {
            eb.publish('deleted', document);
        } else {
            message.reply(res_err);
            res_err.printStackTrace();
        }
    });
});


// another handler to edit messages
var consumerEdit = eb.consumer('edit');
consumerEdit.handler(function (message) {
    var document = message.body();
    if (!document.message_created_at) {
        document.message_created_at = calculateDate();
    }
    var update = {
        "$set" : document
    };
    client.update(document.collection, {_id: document._id}, update, function (res, res_err) {
        if (res_err === null) {
            message.reply(document);
            eb.publish('saved', document);
        } else {
            message.reply(res_err);
            res_err.printStackTrace();
        }
    });
});

// TODO not working yet ... wrong mongo shell version!?
var consumerCollections = eb.consumer('getCollections');
consumerCollections.handler(function (message) {
    client.getCollections(function (res, res_err) {
        if (res_err == null) {
            message.reply(res.toString());
        } else {
            res_err.printStackTrace();
        }
    });
});


// another handler to run arbitrary commands
var consumerRunCommand = eb.consumer('runCommand');
consumerRunCommand.handler(function (message) {
    var command = message.body();
    client.runCommand('aggregate', JSON.parse(command) , function (res, res_err) {
        if (res_err == null) {
            message.reply(res);
        } else {
            message.reply(res_err);
            res_err.printStackTrace();
        }
    });
});


// date helper function .... just to have some message_created_at property added for each saved document, if not already present.
var calculateDate = function() {
    var dt = new Date();
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

var themes = [
    {
        collection: 'themes',
        name: 'blossom',
        headerColor: "#cb3577",
        headerFontColor: "#fff",
        amountColors: ['#ffacf6', '#d052d0', '#ff5fb8', '#ff00a5', '#6b486b', '#6b215c', '#3c1231','#ff55d2'],
        backgroundColor: '#ffdddc',
        lineColor: "#000",
        axisColor: '#000',
        wallpaper: ''
    },{
        collection: 'themes',
        name: 'dark',
        headerColor: "#002f2c",
        headerFontColor: "#fff",
        amountColors: ['#00625B', '#347B76', '#00bfb2', '#99abd4', '#564389', '#22076E', '#8dffce', '#3b77ff'],
        backgroundColor: '#151515',
        lineColor: '#fff',
        axisColor: '#fff',
        wallpaper: '',
        colors: {
            header: "#002f2c",
            headerFont: "#fff",
            background: "#151515",
            amount: ['#00625B', '#347B76', '#00bfb2', '#99abd4', '#564389', '#22076E', '#8dffce', '#3b77ff'],
            line: "#fff",
            axis: "#fff"
        }
    },{
        collection: 'themes',
        name: 'pirates',
        headerColor: "#cb3577",
        headerFontColor: "#fff",
        amountColors: ['#ffacf6', '#d052d0', '#ff5fb8', '#ff00a5', '#6b486b', '#6b215c', '#3c1231','#ff55d2'],
        backgroundColor: '#1188ff',
        lineColor: "#000",
        axisColor: '#000',
        wallpaper: ''
    },{
        collection: 'themes',
        name: 'vampire',
        headerColor: "#cb3577",
        headerFontColor: "#fff",
        amountColors: ['#ffacf6', '#d052d0', '#ff5fb8', '#ff00a5', '#6b486b', '#6b215c', '#3c1231','#ff55d2'],
        backgroundColor: '#11aaff',
        axisColor: '#ffa',
        lineColor: "#000",
        wallpaper: ''
    },{
        collection: 'themes',
        name: 'green',
        headerColor: "#cb3577",
        headerFontColor: "#f83",
        amountColors: ['#ffacf6', '#d052d0', '#ff5fb8', '#ff00a5', '#6b486b', '#6b215c', '#3c1231','#ff55d2'],
        backgroundColor: '#2299ee',
        lineColor: "#000",
        axisColor: '#ffa',
        wallpaper: '',

        colors: {
            header: "#002f2c",
            headerFont: "#fff",
            background: "#151515",
            amount: ['#00625B', '#347B76', '#00bfb2', '#99abd4', '#564389', '#22076E', '#8dffce', '#3b77ff'],
            line: "#fff",
            axis: "#fff"
        }
    }
];

themes.forEach(function(theme) {
    eb.send('save', theme);
});

var config = {
    collection: 'config',
    theme: 'blossom'
};
eb.send('save', config);
