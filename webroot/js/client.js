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







    eb.registerHandler('saved', function (document) {
        updateData();

        switch (document.collection) {
            case 'erm':
                renderErmTable(document, '.erm-collection');
                break;
            default:
                break;
        }

    });

    eb.registerHandler('deleted', function (document) {
        switch (document.collection) {
            case 'erm':
                $('#erm-collection-' + document.matcher._id).remove();
                break;
            case 'piggy':
                $('#history-collection-' + document.matcher._id).remove();
                updateData();
                break;
            default:
                break;
        }
    });

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




    var updateData = function () {
        var query = {
            "aggregate": "piggy",
            "pipeline": [
                {
                    "$match": {
                        "type": {"$ne": "virtual"}
                    }
                },{
                    "$group": {
                        "_id": "$amount",
                        "amount": {"$sum": 1},
                        "type": {"$first": "$amount"}
                    }
                },{
                    "$sort": {
                        "type": 1
                    }
                },{
                    "$project": {
                        "_id": 0,
                        "amount": "$amount",
                        "type": "$type"
                    }
                }
            ]
        };


        eb.send("runCommand", JSON.stringify(query), function (res, res_err) {
            if (res.ok === 1) {
                var result = res.result;
                updateBars(result);
                updatePie(result);
//                updateLine(result);
                updateSum(result);  // wirklich 4x übergeben!? ne ...
            } else {
                alert('Something is fishy ... :-(');
            }
        });
    };


    // init
    updateData();


    // orientation change
    window.addEventListener("resize", function () {
        // poor mans resize charts
        location.reload(true);
    }, false);


    var showNotice = function (type, text) {
        $('#notice').removeClass().addClass(type);
        $('#notice').animate({top: 20, opacity: 1, visibility: 'visible'}, 750).delay(2000).animate({
            top: 300,
            opacity: 0,
            visibility: 'hidden'
        }, 750);
        $('#notice-content').html(text);
    };


    // error handling
    window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
        if (errorMsg.indexOf('INVALID_STATE_ERR') > -1) {
            showNotice('error', 'Server down!');
        }
    };

    var serverState = 1;

    function checkServer() {
        $.ajax({
            url: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '?' + new Date().getTime(),
            success: function () {
                if (serverState === 0) {
                    serverState = 1;
                    location.reload();
                }
            },
            error: function (jqXHR, exception) {
                if (jqXHR.status !== 200) {
                    showNotice('error', 'Server down! Retry in 10s');
                    serverState = 0;
                }
            },
            complete: function () {
                setTimeout(checkServer, 10000);
            }
        });
    }

    setTimeout(checkServer, 10000);


    $(window).keyup(function (e) {
        if (e.keyCode === 27) {
            $('#checkout, #erm, #history, #show').fadeOut('slow');
        }
        if (e.keyCode === 67) {
            if ($('input:focus').length < 1 && $('textarea:focus').length < 1) {
                showCheckoutOverlay();
            }
        }

        if (e.keyCode === 69) {
            if ($('input:focus').length < 1 && $('textarea:focus').length < 1) {
                showErmOverlay();
            }
        }

        if (e.keyCode === 72) {
            if ($('input:focus').length < 1 && $('textarea:focus').length < 1) {
                showHistoryOverlay();
            }
        }
    });

    $('.field').click(function () {
        var changeValue = this.textContent;
        $('#display').text($('#display').text() + changeValue);
    });

    $('#withdraw').click(function () {
        alert('withdrawal not working yet ... sorry');
    });

    $('#place').click(function () {
        var value = parseFloat($('#display').text());

        var transaction = {
            'collection': 'piggy',
            'type': 'virtual',
            'amount': value
        };
        eb.send('save', transaction, function (reply) {
            if (reply) {
                $('#display').empty();
            } else {
                alert('Hoppala, irgendwas ging halt nicht!');
            }
        });
    });


    $('#erm-add-show').click(function () {
        $('.show').toggle();
    });

    $('#erm-add-hue').click(function () {
        $('.hue').toggle();
    });


    $('#erm-add-hueconnect').click(function () {
        var form = $('#erm-add-form').serializeArray();
        var erm = formToJson(form);
        erm.huerequesttype = 'get';
        eb.send('hue', erm, function (res, res_err) {
            var parsed = JSON.parse(res);
            if (!$.isEmptyObject(parsed)) {
                renderLights(parsed);
            }
        });
    });

    var renderLights = function (parsed) {
        $('.light').remove();

        var i = 1;
        for (var prop in parsed) {
            var li = $('<li class="input light">');
            var divLabel = $('<div id="light-' + i + '" class="light-label">');
            divLabel.text(parsed[prop].name);
            li.append(divLabel);
            var divColor = $('<div class="light-color">');
            li.append(divColor);
            li.appendTo($('#connect-li'));
            i++;
        }
        $('.light-label').click(function () {
            $('#' + this.id).toggleClass("light-enabled");
        });
        $('.light-color').colorPicker();

    };


    var getHuePath = function () {
        var url = '';
        var lights = 6; // refactor ...
        if ($('.light-enabled').length === 0) {
            url = 'nope';
        } else if ($('.light-enabled').length === 1) {
            var id = $('.light-enabled')[0].id.substr(($('.light-enabled')[0].id.lastIndexOf('-') + 1)); // more complex please ..
            url = '/lights/' + id + '/state';
        } else if ($('.light-enabled').length === lights) { // lights is magic number ... burps
            url = '/groups/0/action';
        } else {
            url = 'group muss erstellt werden (?oder nicht!?)';
        }
        return url;
    };


    var showCheckoutOverlay = function () {
        $('#checkout').fadeTo("slow", 0.97);
    };


    var showErmOverlay = function () {
        $('#erm').fadeTo("slow", 0.97);
        var table = ".erm-collection";
        eb.send('find', {collection: 'erm', matcher: {}}, function (reply) {
            $(table + " > tbody").empty();
            $.each(reply, function (key, value) {
                renderErmTable(value, table);
            });
        });
    };

    var renderErmTable = function (value, table) {
        $(table + " > tbody").append(
            "<tr id='erm-collection-" + value._id + "'>" +
            "<td>" + value.message_created_at + "</td>" +
            "<td>" + value.name + "</td>" +
            "<td>" + value.matcher + "</td>" +
            "<td>" + value.show + "</td>" +
            "<td>" + value.hue + "</td>" +
            "<td id='disable-erm-" + value._id + "'>&empty;</td>" +
            "<td id='delete-erm-" + value._id + "'>X</td>" +
            "</tr>"
        );
        $('#disable-erm-' + value._id).click(function () {
            alert('disable not working yet ... sorry');
        });
        $('#delete-erm-' + value._id).click(function () {
            eb.send('delete', {collection: 'erm', matcher: {_id: value._id}}, function (reply) {
                if (reply.length > 0) {
                    $('#erm-collection-' + value._id).remove();
                }
            })
        });
        $('#erm-collection-' + value._id).click(function () {
            eb.send('find', {collection: 'erm', matcher: {_id: value._id}}, function (reply) {
                if (reply.length > 0) {
                    $('#erm-add-update').show();
                    $('#erm-add-id').val(value._id);
                    jsonToForm('erm-add-form', reply[0]);
                }
            });
        });
    };


    var showHistoryOverlay = function () {
        $('#history').fadeTo("slow", 0.97);
        var table = ".history-collection";
        eb.send('find', {collection: 'piggy', matcher: {}}, function (reply) {
            $(table + " > tbody").empty();
            $.each(reply, function (key, value) {
                renderHistoryTable(value, table);
            });
        });
    };

    var renderHistoryTable = function (value, table) {
        $(table + " > tbody").append(
            "<tr id='history-collection-" + value._id + "'>" +
            "<td>" + value.message_created_at + "</td>" +
            "<td>" + value.amount + "</td>" +
            "<td>" + value.type + "</td>" +
            "<td id='delete-history-" + value._id + "'>X</td>" +
            "</tr>"
        );

        $('#delete-history-' + value._id).click(function () {
            eb.send('delete', {collection: 'piggy', matcher: {_id: value._id}}, function (reply) {
                if (reply.length > 0) {
                    $('#history-collection-' + value._id).remove();
                }
            })
        });
    };

    $('#erm-add-update').click(function () {
        saveErm(true);
    });

    $('#erm-add-send').click(function () {
        saveErm(false);
    });

    var saveErm = function(update) {
        var form = $('#erm-add-form').serializeArray();
        var erm = formToJson(form);

        var action = 'save';
        if (update) {
            action = 'edit';
        } else {
            delete erm._id;
        }

        if (!erm.name) {
            $('#erm-add-name').addClass("invalid-input");
            $('html, body').animate({scrollTop: ($(".invalid-input").offset().top)}, 'slow');
            return;
        }
        $('#erm-add-name').removeClass("invalid-input");

        if (erm.matcher) {
            erm.matcher = JSON.stringify(erm.matcher);
            if (!isJson(erm.matcher)) {
                $('#erm-add-matcher').addClass("invalid-input");
                $('html, body').animate({scrollTop: ($(".invalid-input").offset().top)}, 'slow');
                return;
            }
        } else {
            erm.matcher = '';
        }
        $('#erm-add-matcher').removeClass("invalid-input");

        if (erm.hue) {
            erm.huepath = getHuePath();
        }
        if (erm.huesetting) {
            var huesetting = JSON.stringify(erm.huesetting);
            erm.huesetting = huesetting;
        }


        eb.send(action, erm, function (reply) {
            if (reply) {
                $('#erm-add-form')[0].reset();
                $('.show, .hue').hide();
                $('.invalid-input').removeClass('invalid-input');
                $('#erm').fadeOut("slow");
            } else {
                alert('could not save erm!');
            }
        });
        event.preventDefault();
    };



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
            var parsed = JSON.parse(str);
            if(typeof parsed ==='object') {
                return true;
            }
        } catch (e) {
            return false;
        }
    }

    var jsonToForm = function(form, data) {
        $.each(data, function(key, value) {
            key = key.replace(/_/g, '-');
            var ctrl = $('#erm-add-' + key);
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