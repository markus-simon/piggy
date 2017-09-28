var eb = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/eventbus');

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

eb.onopen = function() {

    eb.registerHandler('saved', function(document) {
        updateData();

        switch (document.collection) {
            case 'erm':
                renderErmTable(document, '.erm-collection');
                break;
            default:
                break;
        }

    });

    eb.registerHandler('deleted', function(document) {
        switch (document.collection) {
            case 'erm':
                $('#erm-collection-' + document.matcher._id).remove();
                break;
            default:
                break;
        }
    });


    var updateData = function() {
        var query = {
            "aggregate" : "piggy",
            "pipeline" :[
                {
                    "$group": {
                        "_id": "$amount",
                        "amount": { "$sum" : 1 },
                        "type": { "$first": "$amount" },
                        "message_created_at": { "$first": "$message_created_at" }
                    }
                },{
                    "$sort" : {
                        "type" : 1
                    }
                }
            ]
        };
        eb.send("runCommand", JSON.stringify(query), function (res, res_err) {
            if (res.ok === 1) {
                var result = res.result;
                updateBars(result);
                updatePie(result);
            } else {
                alert('Something is fishy ... :-(');
            }
        });
    };





    // init
    updateData();




    // orientation change
    window.addEventListener("resize", function() {
        // poor mans resize charts
        location.reload(true);
    }, false);



    var showNotice = function(type, text) {
        $('#notice').removeClass().addClass(type);
        $('#notice').animate({ top: 20, opacity: 1, visibility: 'visible'},750).delay(2000).animate({ top: 300, opacity: 0, visibility: 'hidden'},750);
        $('#notice-content').html(text);
        switch (type) {
            case 'success':
                break;
            case 'warning':
                break;
            case 'error':
                break;
            default:
                break;
        }
    };


    // error handling
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












    $(window).keyup(function(e) {
        if (e.keyCode === 27) {
            $('#erm').fadeOut('slow');
            $('#show').fadeOut('slow');
            window.scrollTo(0, 0);
        }
        if (e.keyCode === 69) {
            if ( $('input:focus').length < 1 && $('textarea:focus').length < 1) {
                showErmOverlay();
            }
        }
    });

    $('#erm-add-show').click(function() {
        $('.show').toggle();
    });

    $('#erm-add-hue').click(function() {
        $('.hue').toggle();
    });


    /** asasasa **/
    $('#erm-add-hueconnect').click(function() {
        var form = $('#erm-add-form').serializeArray();
        var erm = formToJson(form);
    });


    var showErmOverlay = function() {
        $('#erm').fadeTo("slow", 0.97);
        var table = ".erm-collection";
        eb.send('find', {collection: 'erm', matcher: {}}, function(reply) {
            $(table + " > tbody").empty();
            $.each(reply, function(key, value) {
                renderErmTable(value, table);
            });
        });
    };

    var renderErmTable = function(value, table) {
        $(table + " > tbody").append(
            "<tr class='erm-collection-tr' id='erm-collection-" + value._id + "'>" +
            "<td>" + value.message_created_at + "</td>" +
            "<td>" + value.name +               "</td>" +
            "<td>" + value.matcher +            "</td>" +
            "<td>" + value.show +               "</td>" +
            "<td>" + value.hue +                "</td>" +
            "<td class='disable-erm'>&empty;</td>" +
            // TODO add classnames to ids, like delete-erm-58b12121212
            "<td class='delete-erm' id='" + value._id + "'>X</td>" +
            "</tr>"
        );
        $('.disable-erm').click(function() {
            alert('disable not working yet ... sorry');
        });
        $('.delete-erm').click(function() {
            var _id = this.id; // todo wie unten
            eb.send('delete', { collection: 'erm',  matcher: {_id: _id} }, function(reply) {
                if(reply.length > 0) {
                    $('#erm-collection-' + _id).remove();
                }
            })
        });
        $('.erm-collection tr').click(function() {
            var _id = this.id.substr((this.id.lastIndexOf('-') + 1));
            eb.send('find', {collection: 'erm', matcher: {_id: _id}}, function(reply) {
                if(reply.length > 0) {
                    jsonToForm('erm-add-form', reply[0]);
                }
            });
        });
    };

    $('#erm-add-send').click(function() {
        var form = $('#erm-add-form').serializeArray();
        var erm = formToJson(form);
        if (erm.matcher) {
            var matcher = JSON.stringify(erm.matcher);
            erm.matcher = matcher;
        }
        if (erm.huesetting) {
            var huesetting = JSON.stringify(erm.huesetting);
            erm.huesetting = huesetting;
        }
        eb.send('save', erm, function(reply) {
            if(reply) {
                $('#erm-add-form')[0].reset();
                $('.show, .hue').hide();
                $('#erm').fadeOut("slow");
            } else {
                alert('could not save erm!');
            }
        });
        event.preventDefault();
    });


    var formToJson = function(form) {
        var json = {};
        $.each(form, function(key, value) {
            $.each(value, function(key2, value2) {
                if(key2 == 'name' && value.value != "") {
                    if (isJson(value.value)) {
                        json[value2] = JSON.parse(value.value);
                    } else {
                        json[value2] = value.value;
                    }
                }
            });
        });
        return json;
    };

    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    var jsonToForm = function(form, data) {
        $.each(data, function(key, value) {
            key = key.replace(/_/g, '-');

            console.log(key);

            var ctrl = $('#erm-add-' + key);

            console.log(ctrl);

            if (ctrl.is('select')) {
                $("option", ctrl).each(function() {
                    if (this.value==value) { this.selected=true; }
                });
            } else {
                switch (ctrl.prop("type")) {
                    case "radio":
                    case "checkbox":
                        if (value != 'off') {
                            $('#erm-add-' + key).prop("checked", true);
                            $('.' + key).show();
                        } else {
                            $('#erm-add-' + key).prop("checked", false);
                            $('.' + key).hide();
                        }
                        break;
                    default:
                        ctrl.val(value);
                }
            }
        });
    };

    eb.registerHandler('show', function(document) {
        if (document.showurl && $('#show-content').is(':empty')) {
            var extension = document.showurl.substr((document.showurl.lastIndexOf('.') + 1)).toLowerCase();
            switch (extension) {
                case 'mp4':
                case 'mov':
                    var video = "<video autoplay width='1920' height='1080' controls><source src='" + document.showurl + "' type='video/mp4'>Your browser does not support the video tag.</video>";
                    $('#show-content').empty().append(video);
                    $('#show').fadeTo('slow', 1);
                    $(document).ready(function () {
                        $('#show video').on('ended', function endHandler(e) {
                            $('#show').fadeOut('slow');
                            $('#show-content').empty();
                        });
                    });
                    break;
                case 'gif':
                case 'jpg':
                case 'jpeg':
                case 'png':
                    var gif = '<img width="1920" src="' + document.showurl + '"/>';
                    $('#show-content').empty().append(gif);
                    $('#show').fadeTo('slow', 1).delay(5000).fadeOut('slow');
                    break;
                case 'wav':
                case 'mp3':
                    playSound(document.showurl);
                    break;
                default:
                    break;
            }
        }
        if (document.showtts) {
            playSound('assets/sound/' + document.showtts);
        }
    });

    var playSound = function(file) {
        var audioElement = document.createElement('audio');
/*
        if (!audioElement.paused && !audioElement.ended && 0 < audioElement.currentTime) {
*/
            audioElement.setAttribute('src', file);
            audioElement.setAttribute('autoplay', 'autoplay');
            audioElement.addEventListener("load", function () {
                audioElement.play();
            }, true);
/*
        }
*/
    };

};