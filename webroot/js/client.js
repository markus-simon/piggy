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
var fontColor       = '#fff';
var backgroundColor = "#ffdddc";
var color           = d3.scaleOrdinal(["#ffacf6", "#d052d0", "#ff5fb8", "#ff00a5", "#6b486b", "#6b215c", "#3c1231","#ff55d2"]);
var lineColor       = "#000";
var axisColor       = "#000";

eb.onopen = function()
{
    /**
     * Find config
     */
    eb.send('find', {collection: 'config', matcher: {}}, function(reply) {
        config = reply[0];
        if (!$.isEmptyObject(config)) {
            $('#config-save-id').val(config._id);
            eb.send('find', {collection: 'theme', matcher: {name: config.theme}}, function(reply) {
                changeTheme(reply[0]);
            })
        }
        updateData();
    });

    /**
     * Register saved handler
     */
    eb.registerHandler('saved', function(document) {
        updateData();
        renderTable(document, '.' + document.collection + '-collection');
    });

    /**
     * Register delete handler
     */
    eb.registerHandler('deleted', function(document) {
        $('#' + document.collection + '-collection-' + document.matcher._id).remove();
        if (document.collection === 'piggy') {
            updateData();
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
                    $(document).ready(function() {
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
     * Register dropped handler
     */
    eb.registerHandler('dropped', function(document) {
        $('.' + document.collection + '-collection tbody').html('');
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
                        "sumTotal": { "$multiply": [ "$sum", "$amount" ] }
                    }
                }
            ]
        };

        eb.send("runCommand", JSON.stringify(query), function(reply) {
            if (!reply.cause) {
                var result = reply.result;
                updateBars(result);
                updatePie(result);
/*
                updateLine(result);
*/
                updateHeader(result);
            } else {
                piggyError('Konnte Kommando nicht ausfuehren', false, reply.cause);
            }
        });
    };

    /**
     * Orientation change
     */
    window.addEventListener("orientationchange", function() {
        // poor mans resize charts
        location.reload(true);
    }, false);

    /**
     * Open overlay on key press
     */
    $(window).keyup(function(e) {
        if ($('input:focus').length < 1 && $('textarea:focus').length < 1) {
            if (e.keyCode === 27) {
                $('#header, #nav-icon3').removeClass('open');
                $('.overlay').fadeOut('slow');
            }
            if (e.keyCode === 67) {
                if (config) {
                    $('#config-save-id').val(config._id);
                }
                showConfigOverlay();
            }

            if (e.keyCode === 87) showOverlay('wishes');
            if (e.keyCode === 69) showOverlay('erm');
            if (e.keyCode === 72) showOverlay('piggy');
            if (e.keyCode === 75) showOverlay('checkout');
            if (e.keyCode === 84) showOverlay('theme');
            if (e.keyCode === 85) showOverlay('upgrade');
        }
    });

    /**
     *
     */
    $('.field').click(function() {
        var changeValue = this.textContent;
        $('#display').text($('#display').text() + changeValue);
    });

    /**
     *
     */
    $('#withdraw').click(function() {
        piggyError('keine Entnahme moeglich', true);
    });

    /**
     *
     */
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
                piggyError('Hoppala irgendwas ging halt nicht', false);
            }
        });
    });

    /**
     * Toggle checkboxes in erm form
     */
    $('#erm-form input[type="checkbox"]').click(function() {
        $('.' + $(this).attr('name')).toggle();
    });

    /**
     * Hue connect
     */
    $('#erm-hueconnect').click(function() {
        var form = $('#erm-form').serializeArray();
        var erm = formToJson(form);
        erm.huerequesttype = 'get';
        eb.send('hue', erm, function(res) {
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
    var renderLights = function(parsed) {
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
        $('.light-label').click(function() {
            $('#' + this.id).toggleClass("light-enabled");
        });
        $('.light-color').colorPicker();

    };

    /**
     * Inject styles
     *
     * @param rule
     */
    function injectStyles(rule) {
        $("<div />", {
            html: '&shy;<style id="theme-style">' + rule + '</style>'
        }).appendTo("body");
    }

    /**
     * Render theme
     *
     * @param theme
     */
    var renderTheme = function(theme) {
        $('.theme-preview-container ul').html('');
        for (var property in theme) {
            if (property === 'colors') {
                for (var color in theme['colors']) {
                    if ('object' === typeof(theme['colors'][color])) {
                        var pLi = $('<li class="input theme-property">');
                        var ul = $('<ul class="sub-list">');

                        for (var subColor in theme['colors'][color]) {
                            var li = $('<li class="input theme-property">');
                            if ('0' === subColor) {
                                var inputLabel = $('<label class="theme-property-label">' + color + '</label>');
                                inputLabel.css('color', fontColor);
                                li.append(inputLabel);
                            }
                            var inputValue = $('<input name="' + color + '_' + subColor + '" class="theme-property-value" value="' + theme['colors'][color][subColor] + '">')
                                .colorPicker(
                                    {
                                        renderCallback: function($elm, toggled) {
                                            if (toggled !== true && toggled !== false) { // hihi ...
                                                console.log('true1');
                                            }
                                        }
                                    }
                                )
                                .css('background-color', theme['colors'][color][subColor]);

                            li.append(inputValue).appendTo(ul);
                        }
                        pLi.append(ul).appendTo($('.theme-preview-container > ul'));
                    } else {
                        var li       = $('<li class="input theme-property">');
                        var inputLabel = $('<label class="theme-property-label">' + color + '</label>');
                        inputLabel.css('color', fontColor);
                        var inputValue = $('<input name="' + color + '" class="theme-property-value" value="' + theme['colors'][color] + '">')
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
                            .css('background-color', theme['colors'][color]);

                        li.append(inputLabel)
                            .append(inputValue).appendTo($('.theme-preview-container > ul'));
                    }
                }
            } else if (property === 'wallpaper') {
                var li       = $('<li class="input theme-property">');
                var inputLabel = $('<label class="theme-property-label">' + property + '</label>');
                inputLabel.css('color', fontColor);
                var inputValue = $('<input name="' + property + '" class="theme-property-value" value="' + theme[property] + '">');

                li.append(inputLabel)
                    .append(inputValue).appendTo($('.theme-preview-container > ul'));
            }
        }
        d3.selectAll('form').selectAll('label').transition().duration(500).style('color', fontColor); // doppelt hält besser
    };

    /**
     * Show config overlay
     */
    var showConfigOverlay = function() {
        $(".overlay").fadeOut('slow');

        $('#config-overlay').fadeTo("slow", 0.97);
        eb.send('find', {collection: 'theme', matcher: {}}, function(reply) {
            $('#config-theme').empty();
            var selected = '';
            $.each(reply, function(key, value) {
                if (!$.isEmptyObject(config)) {
                    if (value.name === config.theme) {
                        selected = 'selected ';
                    } else {
                        selected = '';
                    }
                }
                $('<option ' + selected + 'value=' + value.name + '>').text(value.name).appendTo($('#config-theme'));
            });
        });
    };

    /**
     * Toggle navigation
     */
    $('#nav-icon3').click(function(){
        $(this).toggleClass('open');
        $('#header').toggleClass('open');
    });

    /**
     * Factory reset
     */
    $('#factory-reset').click(function() {
        var document = {};
        document.collections = ['upgrade','config','theme','erm'];
        eb.publish('reset', document);
    });

    /**
     * Change theme colors undso
     */
    var changeTheme = function(theme) {

        renderTheme(theme);

        $('#theme-style').remove();
        injectStyles(theme.css);
        color           = d3.scaleOrdinal(theme.colors.amount);
        headerColor     = theme.colors.header;
        headerFontColor = theme.colors.headerFont;
        fontColor       = theme.colors.font;
        backgroundColor = theme.colors.background;
        axisColor       = theme.colors.axis;
        lineColor       = theme.colors.line;

        d3.selectAll('.accordion-title')
            .transition()
            .duration(500)
            .style('background-color', headerColor);

        var colorParts = ['body', '#menu', '#config-overlay', '#erm-overlay', '#piggy-overlay', '#checkout-overlay', '#theme-overlay', '#upgrade-overlay'];
        $('#config-overlay').fadeOut('slow');

        $.each(colorParts, function(key, value) {
            d3.select(value)
                .transition()
                .duration(500)
                .style('background-color', backgroundColor)
        });

        d3.selectAll('form').selectAll('label').transition().duration(500).style('color', fontColor); // hä?
        updateData();
    };

    /**
     * Show overlay
     *
     * @param collection
     */
    var showOverlay = function(collection) {
        $(".overlay").fadeOut('slow');
        $('#' + collection + '-overlay').fadeTo("slow", 0.97);
        if ('checkout' !== collection) {
            var table = "." + collection + "-collection";
            eb.send('find', {collection: collection, matcher: {}}, function(reply) {
                $(table + " > tbody").empty();
                $.each(reply, function(key, value) {
                    renderTable(value, table);
                });
            });
        }
    };

    /**
     * Save erm
     */
    $('#erm-update, #erm-send').click(function() {
        saveErm($(this).data('update'));
    });

    /**
     * Save config
     */
    $('#config-save').click(function() {
        saveConfig();
    });

    /**
     * Save wish
     */
    $('#wishes-update, #wishes-save').click(function() {
       saveWish($(this).data('update'));
    });

    /**
     * Save theme
     */
    $('#theme-update, #theme-save').click(function() {
        saveTheme($(this).data('update'));
    });

    /**
     * Menu links
     */
    $('#menu a').click(function() {
        var target = $(this).attr('id').split('-')[1];
        $('#header, #nav-icon3').toggleClass('open');
        $(".overlay").fadeOut('slow');
        switch (target) {
            case 'upgrade':
            case 'piggy':
            case 'checkout':
                showOverlay(target);
                break;
            case 'config':
                showConfigOverlay();
                break;
            case 'theme':
            case 'erm':
            case 'wishes':
                showOverlay(target);
                break;
        }
    });

    /**
     * Save wish
     *
     * @param update
     */
    var saveWish = function(update) {
        var form   = $('#wishes-form').serializeArray();
        wish       = formToJson(form);

        var action = 'save';
        if (update) {
            action = 'edit';
        } else {
            delete wish._id;
        }

        eb.send(action, wish, function(reply) {
            if (reply) {
                $('#wishes-form')[0].reset();
                $('#wishes-id').val(reply);
                $('#wishes-overlay').fadeOut("slow");
            } else {
                piggyError('Hoppala irgendwas ging halt nicht', false);
            }
        });
    };

    /**
     * Save configuration
     */
    var saveConfig = function() {
        var form   = $('#config-save-form').serializeArray();
        config     = formToJson(form);
        var action = 'edit';
        eb.send(action, config, function(reply) {
            if (reply) {
                $('#config-save-id').val(reply);
                changeTheme(reply.theme); // TODO geladenes theme übergeben!
            } else {
                piggyError('Hoppala irgendwas ging halt nicht', false);
            }
        });
    };

    /**
     * Save erm
     *
     * @param update
     */
    var saveErm = function(update) {
        var form = $('#erm-form').serializeArray();
        var erm = formToJson(form);

        var action = 'save';
        if (update) {
            action = 'edit';
        } else {
            delete erm._id;
        }

        if (!erm.name) {
            $('#erm-name').addClass("invalid-input");
            $('html, body').animate({scrollTop: ($(".invalid-input").offset().top)}, 'slow');
            return;
        }
        $('#erm-name').removeClass("invalid-input");

        if (erm.matcher) {
            erm.matcher = JSON.stringify(erm.matcher);
            if (!isJson(erm.matcher)) {
                $('#erm-matcher').addClass("invalid-input");
                $('html, body').animate({scrollTop: ($(".invalid-input").offset().top)}, 'slow');
                return;
            }
        } else {
            erm.matcher = '';
        }
        $('#erm-matcher').removeClass("invalid-input");

        if (erm.hue) {
            erm.huepath = getHuePath();
        }
        if (erm.huesetting) {
            var huesetting = JSON.stringify(erm.huesetting);
            erm.huesetting = huesetting;
        }

        eb.send(action, erm, function(reply) {
            if (reply) {
                $('#erm-form')[0].reset();
                $('.show, .hue').hide();
                $('.invalid-input').removeClass('invalid-input');
                $('#erm-overlay').fadeOut("slow");
            } else {
                piggyError('Speichern ging nicht', false);
            }
        });
        event.preventDefault();
    };

    /**
     * Save theme
     */
    var saveTheme = function(update) {
        var form = $('#theme-form').serializeArray();

        var amount = [];
        var table  = [];
        var input  = [];
        $.each(form , function(key, value) {
            if(value.name.match(/amount_/)) {
                amount.push(value.value);
            }
            if(value.name.match(/table_/)) {
                table.push(value.value);
            }
            if(value.name.match(/input_/)) {
                input.push(value.value);
            }
        });

        var theme = formToJson(form);

        theme.amount = amount;
        theme.table  = table;
        theme.input  = input;
        var colors   = {};

        $.each(theme , function(key, value) {
            if (key !== '_id' && key !== 'collection' && key !== 'wallpaper' && key !== 'name' && key !== 'message_created_at') {
                colors[key] = value;
                delete theme[key]
            }
            if (key.match(/amount_/)) {
                delete colors[key]
            }
            if (key.match(/table_/)) {
                delete colors[key]
            }
            if (key.match(/input_/)) {
                delete colors[key]
            }
        });

        theme.colors = colors;
        theme.wallpaper = '';

        var action = 'save';
        if (update) {
            action = 'edit';
        } else {
            delete theme._id;
        }

        eb.send(action, theme, function(reply) {
            if (reply) {
                changeTheme(theme);
                $('#theme-form')[0].reset();
                $('#theme-id').val(reply); // ?? hä
                $('.invalid-input').removeClass('invalid-input');
                $('#theme-overlay').fadeOut("slow");
            } else {
                piggyError('Theme speichern ging nicht', false);
            }
        });
    };

    /**
     * Change color
     *
     * @param element
     * @param color
     */
    var changeColor = function(element, color) {
        switch (element) {
            case 'header':
                headerColor = color;
                var colorParts = ['#menu'];
                $.each(colorParts, function(key, value) {
                    d3.select(value)
                        .transition()
                        .duration(500)
                        .style('background-color', headerColor);
                });
                d3.selectAll('.accordion-title')
                    .transition()
                    .duration(500)
                    .style('background-color', headerColor);
                break;
            case 'headerFont':
                headerFontColor = color;
                break;
            case 'font':
                fontColor = color;
                break;
            case 'background':
                backgroundColor = color;
                var colorParts = ['body', '#menu', '#config-overlay', '#erm-overlay', '#piggy-overlay', '#theme-overlay', '#checkout-overlay', '#upgrade-overlay'];
                $.each(colorParts, function(key, value) {
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

    /**
     * Render table
     *
     * @param value
     * @param table
     */
    var renderTable = function(value, table) {
        var columns    = $(table + ' thead th');
        var editable   = $(table).data('edit');
        var collection = table.split('-')[0].replace('.','');
        var deletable  = false;
        var html       = '';
        var mapping    = {
            'created_at': 'message_created_at'
        };

        html += '<tr id="' + table.replace('.','') + '-' + value._id + '">';
        $.each(columns, function(cKey, column) {
            var key = column.textContent.toLocaleLowerCase();
            if (true === mapping.hasOwnProperty(key.replace(' ', '_'))) {
                key = mapping[key.replace(' ', '_')];
            }
            if ('disable' === key) {
                html += '<td id="disable-' + collection + '-' + value._id + '"><span class="btn">&empty; Disable</span></td>';
            } else if ('delete' === key) {
                deletable = true;
                html += '<td id="delete-' + collection + '-' + value._id + '"><span class="btn">X Remove</span></td>';
            } else {
                if ($(column).data('func')) {
                    var func = $(column).data('func');
                    html += '<td>' + window[func](value[$(column).data('column')]) + '</td>';
                } else if ($(column).data('wrap')) {
                    var elem = $(column).data('wrap').split(/[.#]/);
                    var sel  = '';
                    var sel2 = '';

                    if (elem[2]) {
                        sel2 = value[elem[2].replace('{$','').replace('}','')];
                    }

                    if (elem[1].match(/./)) {
                        sel += ' class="' + elem[1].replace('.','') + ' ' + sel2 + '"';
                    } else if (elem[1].match(/#/)) {
                        sel += ' id="' + elem[1].replace('#','') + ' ' + sel2 + '"';
                    }

                    html += '<td><' + elem[0] + sel + '>' + value[key] + '</' + elem[0] + '></td>';
                } else {
                    html += '<td>' + value[key] + '</td>';
            }
            }
        });
        html += '</tr>';

        $(table + " > tbody").append(html);

        // Delete
        if (true === deletable) {
            $('#delete-' + collection + '-' + value._id).click(function() {
                eb.send('delete', {collection: collection, matcher: {_id: value._id}}, function(reply) {
                    // error handling
                });
            });
        }

        // Edit
        if (true === editable) {
            $('#' + table.replace('.', '') + '-' + value._id).click(function() {
                eb.send('find', {collection: collection, matcher: {_id: value._id}}, function(reply) {
                    if (reply.length > 0) {
                        $('#' + collection + '-update').show();
                        $('#' + collection + '-id').val(value._id);
                        if ('theme' === collection) {
                            changeTheme(reply[0])
                        }
                        jsonToForm(collection + '-', reply[0]);
                    }
                });
            });
        }
    };

    /**
     * Throw error
     *
     * @param message
     * @param show
     * @param log
     */
    var piggyError = function(message, show, log) {
        var error = {};
        error.showtts = message;
        eb.send('tts', error, function(reply) {
            playSound(reply);
        });
        if (show) {
            showNotice('error', message);
        }
        if (log) {
            console.log(log);
        }
    };
};

/**
 * Calculate percentage
 *
 * @param value
 */
var calculatePercentage = function(value) {
    // var pSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // pSvg.setAttribute('class', 'percentage');
    //
    // var p = d3.selectAll('percentage'); //.attr('class', 'percentage');
    //
    // console.log(p);

    var ts = sumTotalLabel.text();
    var p2 = ((ts/value) * 100).toFixed(3);
    return '<progress value="' + p2 + '" max="100"></progress>';
};
