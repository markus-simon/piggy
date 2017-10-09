var eb       = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/eventbus');
var config   = {};
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

var headerColor     = "#CB3577";
var headerFontColor = "#fff";
var headerFontSize  = "7vh";
var backgroundColor = "#ffdddc";
var color           = d3.scaleOrdinal(["#ffacf6", "#d052d0", "#ff5fb8", "#ff00a5", "#6b486b", "#6b215c", "#3c1231","#ff55d2"]);
var lineColor       = "#000";
var axisColor       = "#000";

eb.onopen = function() {
    /**
     * Find config
     */
    eb.send('find', {collection: 'config', matcher: {}}, function(reply) {
        config = reply[0];
        console.log('config28');
        console.log(config);
        if (!$.isEmptyObject(config)) {
            $('#config-save-id').val(config._id);
            renderTheme(config.name);
            changeTheme(config.theme);
        }
        updateData();
    });

    /**
     * Register saved handler
     */
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

    /**
     * Register delete handler
     */
    eb.registerHandler('deleted', function(document) {
        console.log(document);
        switch (document.collection) {
            case 'upgrades':
                $('#version-collection-' + document.matcher._id).remove();
                break;
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

    /**
     * Register show handler
     */
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
        if (document.showtts) playSound('assets/sound/' + document.showtts);
    });

    /**
     * Update data
     */
    var updateData = function() {
        var query = {
            "aggregate": "piggy",
            "pipeline": [
                {
                    "$group": {
                        "_id": "$amount",
                        "amount": { "$first": "$amount" },
                        "type": { "$first": "$type" },
                        "sum": { "$sum": 1 }
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
                        "sumTotal": { "$multiply": [ "$sum", "$amount" ] }/*,
                        "weightTotal": {
                            "$switch": {
                                "branches": [
                                    { "case": { "$eq": [ 0, 5   ] }, "then": "equals" },
                                    { "case": { "$eq": [ 0, 5   ] }, "then": "greater than" },
                                    { "case": { "$eq": [ 0, 5   ] }, "then": "less than" }
                                ]
                            }
                        }*/
                    }
                }
            ]
        };

        eb.send("runCommand", JSON.stringify(query), function(res, res_err) {
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
    window.addEventListener("resize", function() {
        // poor mans resize charts
        location.reload(true);
    }, false);

    /**
     * Open overlay on key press
     */
    $(window).keyup(function(e) {
        if ($('input:focus').length < 1 && $('textarea:focus').length < 1) {
            $(".overlay").fadeOut('slow');
            if (e.keyCode === 27) {
                $('#header, #nav-icon3').removeClass('open');
                $('#checkout, #erm, #history, #config, #version, #show').fadeOut('slow');
            }
            if (e.keyCode === 67) {
                if (config) {
                    $('#config-save-id').val(config._id);
                }
                showConfigOverlay();
            }

            if (e.keyCode === 69) showErmOverlay();
            if (e.keyCode === 72) showHistoryOverlay();
            if (e.keyCode === 75) showCheckoutOverlay();
            if (e.keyCode === 86) showVersionOverlay();
        }
    });

    $('.field').click(function() {
        var changeValue = this.textContent;
        $('#display').text($('#display').text() + changeValue);
    });

    $('#withdraw').click(function() {
        alert('withdrawal not working yet ... sorry');
    });

    $('#place').click(function() {
        var value       = parseFloat($('#display').text());
        var transaction = {
            'collection': 'piggy',
            'type': 'virtual',
            'amount': value
        };

        eb.send('save', transaction, function(reply) {
            if (reply) {
                $('#display').empty();
            } else {
                alert('Hoppala, irgendwas ging halt nicht!');
            }
        });
    });

    /**
     * Toggle checkboxes in erm form
     */
    $('#erm-add-form input[type="checkbox"]').click(function() {
        $('.' + $(this).attr('name')).toggle();
    });

    /**
     * Hue connect
     */
    $('#erm-add-hueconnect').click(function() {
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

    /**
     * Render lights
     *
     * @param parsed
     */
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

    /**
     * Render theme
     *
     * @param t
     */
    var renderTheme = function(t) {
        $('.theme-preview-container ul').html('');
        eb.send('find', {collection: 'themes', matcher: { name: t }}, function(res) {
            var themesObject = res[0];

            for (var property in themesObject) {
                if (property === 'colors') {
                    for (var color in themesObject['colors']) {
                        if ('object' === typeof(themesObject['colors'][color])) {
                            var pLi = $('<li class="input theme-property">');
                            var ul = $('<ul class="sub-list">');

                            for (var subColor in themesObject['colors'][color]) {
                                var li = $('<li class="input theme-property">');
                                if (0 == subColor) {
                                    var divLabel = $('<div class="theme-property-label">' + color + '</div>');
                                    li.append(divLabel);
                                }
                                var divValue = $('<div class="theme-property-value">')
                                    .colorPicker(
                                        {
                                            renderCallback: function($elm, toggled) {
                                                if (toggled !== true && toggled !== false) { // hihi ...
                                                    console.log('true1');
                                                }
                                            }
                                        }

                                    )
                                    .css('background-color', themesObject['colors'][color][subColor]);

                                li.append(divValue).appendTo(ul);
                            }
                            pLi.append(ul).appendTo($('.theme-preview-container > ul'));
                        } else {
                            var li       = $('<li class="input theme-property">');
                            var divLabel = $('<div class="theme-property-label">' + color + '</div>');
                            var divValue = $('<div class="theme-property-value">')
                                .colorPicker({
                                    renderCallback: function($elm, toggled) {
                                        if (toggled !== true && toggled !== false) { // hihi ...
                                            var prop        = $elm[0].offsetParent.innerText.replace(/(\r\n|\n|\r)/gm,"");
                                            var pickedColor = $elm.text;
                                            changeColor(prop, pickedColor);
                                            updateData();
                                        }
                                    }
                                })
                                .css('background-color', themesObject['colors'][color]);

                            li.append(divLabel)
                                .append(divValue).appendTo($('.theme-preview-container > ul'));
                        }
                    }
                } else if (property === 'wallpaper') {
                    var li       = $('<li class="input theme-property">');
                    var divLabel = $('<div class="theme-property-label">' + property + '</div>');
                    var divValue = $('<div class="theme-property-value">' + themesObject[property] + '</div>');

                    li.append(divLabel)
                        .append(divValue).appendTo($('.theme-preview-container > ul'));
                }
            }
        });
    };

    /**
     * Show checkout overlay
     */
    var showCheckoutOverlay = function () {
        $('#checkout').fadeTo("slow", 0.97);
    };

    /**
     * Show config overlay
     */
    var showConfigOverlay = function () {
        $('#config').fadeTo("slow", 0.97);
        eb.send('find', {collection: 'themes', matcher: {}}, function (reply) {
            var selected = '';

            $.each(reply, function (key, value) {
                if (!$.isEmptyObject(config)) {
                    if (value.name === config.theme) {
                        selected = 'selected ';
                    } else {
                        selected = '';
                    }
                }
                $('<option ' + selected + 'value=' + value.name + '>').text(value.name).appendTo($('#config-themes'));
            });
        });
    };


    /**
     * Show version overlay
     */
    var showVersionOverlay = function () {
        $('#version').fadeTo("slow", 0.97);
        var table = ".version-collection";
        eb.send('find', {collection: 'upgrades', matcher: {}}, function (reply) {
            $(table + " > tbody").empty();
            $.each(reply, function (key, value) {
                renderVersionTable(value, table);
            });
        });
    };



    /**
     * Display main theme colors
     */
    var fillColorFields = function(t) {
        var previewFields = $('.theme-preview');
        var i = 0;

        eb.send('find', {collection: 'themes', matcher: { name: t }}, function (res) {
            $.each(res[0].amountColors, function(key, value){
                $(previewFields[i++]).css('background', value);
            });
            $('.theme-preview-line').css('background', res[0].axisColor);
            $('.theme-preview-bg').css('background', res[0].backgroundColor);
        });
    };

    /**
     * Change preview colors
     */
    $('#config-themes').change(function() {
        renderTheme($('option:selected', this).val());
    });

    /**
     * Toggle navigation
     */
    $('#nav-icon3').click(function(){
        $(this).toggleClass('open');
        $('#header').toggleClass('open');
    });


    /**
     * Change theme colors undso
     */
    var changeTheme = function(theme) {
        console.log('theme420');
        console.log(theme);
        eb.send('find', {collection: 'themes', matcher: { name: theme }}, function (res) {
            console.log('res423');
            console.log(res);
            color = d3.scaleOrdinal(res[0].colors.amount);
            backgroundColor = res[0].colors.background;
            axisColor = res[0].colors.axis;
            lineColor = res[0].colors.line;
            var colorParts = ['body', '#config', '#erm', '#history', '#checkout', '#version'];
            $('#config-themes').empty();
            $('#config').fadeOut('slow');

            $.each(colorParts, function (key, value) {
                d3.select(value)
                    .transition()
                    .duration(500)
                    .style('background-color', backgroundColor)
            });

            d3.select('#erm-add-form').selectAll('label').transition().duration(500).style('color', axisColor); // hä?
            updateData();
        });
    };


    /**
     * Show erm overlay
     */
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

    /**
     * Render erm table
     *
     * @param value
     * @param table
     */
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

    /**
     * Show history table
     */
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

    /**
     * Render history table
     *
     * @param value
     * @param table
     */
    var renderHistoryTable = function (value, table) {
        $(table + " > tbody").append(
            "<tr id='history-collection-" + value._id + "'>" +
            "<td>" + value.message_created_at + "</td>" +
            "<td>" + value.amount + "</td>" +
            "<td>" + value.type + "</td>" +
            "<td id='delete-history-" + value._id + "'><span class='btn'>X</span></td>" +
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



    /**
     * Render version table
     *
     * @param value
     * @param table
     */
    var renderVersionTable = function (value, table) {
        $(table + " > tbody").append(
            "<tr id='version-collection-" + value._id + "'>" +
            "<td>" + value.message_created_at + "</td>" +
            "<td>" + value.verticle + "</td>" +
            "<td id='delete-upgrade-" + value._id + "'><span class='btn'>X</span></td>" +
            "</tr>"
        );

        $('#delete-upgrade-' + value._id).click(function () {
            eb.send('delete', {collection: 'upgrades', matcher: {_id: value._id}}, function (reply) {
                // TODO delete per publish erfassen, weil anderer tab undso ...
                if (reply.length > 0) {
                    $('#version-collection-' + value._id).remove();
                }
            })
        });
    };

    /**
     * Save erm
     */
    $('#erm-add-update, #erm-add-send').click(function () {
        saveErm($(this).data('update'));
    });

    /**
     * Save config
     */
    $('#config-update, #config-send').click(function () {
        saveConfig($(this).data('update'));
    });


    /**
     * Menu links
     */
    $('#menu a').click(function(){
        var target = $(this).attr('id').split('-')[1];
        console.log($(this).attr('id'));
        console.log(target);
        $('#header, #nav-icon3').toggleClass('open');
        $(".overlay").fadeOut('slow');
        switch (target) {
            case 'history':
                showHistoryOverlay();
                break;
            case 'config':
                showConfigOverlay();
                break;
            case 'alert':
                showErmOverlay();
                break;
            case 'checkout':
                showCheckoutOverlay();
                break;
            case 'version':
                showVersionOverlay();
                break;
        }
    });










    /**
     * Save configuration
     */
    var saveConfig = function(update) {
        var form = $('#config-save-form').serializeArray();
        var config = formToJson(form);

        var action = 'edit';

        console.log(config);
        console.log(action);

        eb.send(action, config, function (reply) {
            console.log(reply);
            if (reply) {
                $('#config-save-id').val(reply);
                changeTheme(reply.theme);
            } else {
                alert('Hoppala, irgendwas ging halt nicht!');
            }
        });
    };

    /**
     * Save erm
     *
     * @param update
     */
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

    var changeColor = function(element, color) {
        switch (element) {
            case 'header':
                headerColor = color;
                var colorParts = ['#menu'];
                $.each(colorParts, function (key, value) {
                    d3.select(value)
                        .transition()
                        .duration(500)
                        .style('background-color', headerColor);
                });
                break;
            case 'headerFont':
                headerFontColor = color;
                break;
            case 'background':
                backgroundColor = color;
                var colorParts = ['body', '#menu', '#config', '#erm', '#history', '#checkout', '#version'];
                $.each(colorParts, function (key, value) {
                    d3.select(value)
                        .transition()
                        .duration(500)
                        .style('background-color', backgroundColor);
                });
                break;
            case 'line':
                lineColor = color;
                break;
            case 'axis':
                axisColor = color;
                break;
        }
    };

    /**
     * Accordion
     */
    $('.accordion .accordion-title.open')
        .next('.accordion-content')
        .show();

    $('.accordion .accordion-title').click(function() {
       $('.accordion-title').removeClass('open');

       if ($(this).next('.accordion-content').is(':visible')) {
           $(this).next('.accordion-content').hide();
       } else {
           $('.accordion-content').hide();
           $(this).next('.accordion-content').show();
           $(this).addClass('open');
       }
    });
};