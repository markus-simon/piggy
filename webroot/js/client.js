var eb = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/eventbus');

var dataBars = [
    { amount: "1",   sum: 0},
    { amount: "2",   sum: 0},
    { amount: "5",   sum: 0},
    { amount: "10",  sum: 0},
    { amount: "20",  sum: 0},
    { amount: "50",  sum: 0},
    { amount: "100", sum: 0},
    { amount: "200", sum: 0}
];

var config = {};

eb.onopen = function() {



    eb.send('find', {collection: 'config', matcher: {}}, function (reply) {
        config = reply[0];
        updateData();
    });

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
                    "$group": {
                        "_id": "$amount",
                        "amount": {"$first": "$amount"},
                        "type": {"$first": "$type"},
                        "sum": {"$sum": 1}
                    }
                },{
                    "$sort": {
                        "amount": 1
                    }
                },{
                    "$project": {
                        "_id": 0,
                        "type": 1,
                        "amount": 1,
                        "sum": 1,
                        "sumTotal": { "$multiply": [ "$sum", "$amount" ] }
                    }
                }
            ]
        };


        eb.send("runCommand", JSON.stringify(query), function (res, res_err) {
            if (res.ok === 1) {
                var result = res.result;
                updateBars(result);
                updatePie(result);
                updateLine(result);
                updateHeader(result);  // wirklich 4x übergeben!? ne ...

            } else {
                alert('Something is fishy ... :-(');
            }
        });
    };

    // orientation change
    window.addEventListener("resize", function () {
        // poor mans resize charts
        location.reload(true);
    }, false);





    $(window).keyup(function (e) {
        if (e.keyCode === 27) {
            $('#checkout, #erm, #history, #config, #show').fadeOut('slow');
        }
        if (e.keyCode === 67) {
            if ($('input:focus').length < 1 && $('textarea:focus').length < 1) {
                if (config) {
                    $('#config-save-id').val(config._id);
                }
                showConfigOverlay();
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

        if (e.keyCode === 75) {
            if ($('input:focus').length < 1 && $('textarea:focus').length < 1) {
                showCheckoutOverlay();
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
        eb.send('hue', erm, function (res) {
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


    var showCheckoutOverlay = function () {
        $('#checkout').fadeTo("slow", 0.97);
    };

    var showConfigOverlay = function () {
        $('#config').fadeTo("slow", 0.97);
        eb.send('find', {collection: 'themes', matcher: {}}, function (reply) {
            $.each(reply, function (key, value) {
                $('<option value=' + value.name + '>').text(value.name).appendTo($('#config-themes'));
            });
        });
    };



    $('#config-save').click(function () {
        var form = $('#config-save-form').serializeArray();
        var document = formToJson(form);

        var action = 'save';
        if (document._id) {
            action = 'edit';
        }
        eb.send(action, document, function (reply) {
            if (reply) {
                $('#config-save-id').val(reply);

                eb.send('find', {collection: 'themes', matcher: { name: reply.theme }}, function (res) {
                    color           = d3.scaleOrdinal(res[0].amountColors);
                    backgroundColor = res[0].backgroundColor;
                    axisColor       = res[0].axisColor
                    lineColor       = res[0].axisColor;
                    $('#config-themes').empty();
                    $('#config').fadeOut('slow');
                    d3.select('body').transition().duration(500).style('background-color', backgroundColor);
                    d3.select('#config').transition().duration(500).style('background-color', backgroundColor);
                    d3.select('#erm').transition().duration(500).style('background-color', backgroundColor);
                    d3.select('#history').transition().duration(500).style('background-color', backgroundColor);
                    d3.select('#checkout').transition().duration(500).style('background-color', backgroundColor);
                    d3.select('#erm-add-form').selectAll('label').transition().duration(500).style('color', axisColor);
                    d3.select('body').transition().duration(500).style('background-color', backgroundColor);
                    updateData();
                });
            } else {
                alert('Hoppala, irgendwas ging halt nicht!');
            }
        });
    });



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
            "<td><span class='" + value.show + "'>" + value.show + "</span></td>" +
            "<td><span class='" + value.hue + "'>" + value.hue + "</span></td>" +
            "<td id='disable-erm-" + value._id + "'><span class='btn'>&empty;</span></td>" +
            "<td id='delete-erm-" + value._id + "'><span class='btn'>X</span></td>" +
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
                // TODO delete per publish erfassen, weil anderer tab undso ...
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
            console.log(action);
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

};