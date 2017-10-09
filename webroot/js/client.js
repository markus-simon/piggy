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

eb.onopen = function() {
    /**
     * Find config
     */
    eb.send('find', {collection: 'config', matcher: {}}, function(reply) {
        config = reply[0];
        if (!$.isEmptyObject(config)) {
            $('#config-save-id').val(config._id);
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
                renderTable(document, '.erm-collection', true);
                break;
            case 'themes':
                renderTable(document, '.themes-collection', true);
                break;
            default:
                break;
        }
    });

    /**
     * Register delete handler
     */
    eb.registerHandler('deleted', function(document) {
        switch (document.collection) {
            case 'upgrades':
                $('#version-collection-' + document.matcher._id).remove();
                break;
            case 'erm':
                $('#erm-collection-' + document.matcher._id).remove();
                break;
            case 'themes':
                $('#themes-collection-' + document.matcher._id).remove();
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
     * Register dropped handler
     */
    eb.registerHandler('dropped', function(document) {
        location.reload(true);
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
            if (e.keyCode === 72) showOverlay('history', 'history', false);
            if (e.keyCode === 75) showCheckoutOverlay();
            if (e.keyCode === 84) showOverlay('themes', 'themes', true);
            if (e.keyCode === 86) showOverlay('version', 'version', false);
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
     * @param theme
     */
    var renderTheme = function(theme) {
        $('.theme-preview-container ul').html('');
        var themesObject = theme;
        for (var property in themesObject) {
            if (property === 'colors') {
                for (var color in themesObject['colors']) {
                    if ('object' === typeof(themesObject['colors'][color])) {
                        var pLi = $('<li class="input theme-property">');
                        var ul = $('<ul class="sub-list">');

                        for (var subColor in themesObject['colors'][color]) {
                            var li = $('<li class="input theme-property">');
                            if (0 == subColor) {
                                var inputLabel = $('<label class="theme-property-label">' + color + '</label>');
                                li.append(inputLabel);
                            }
                            var inputValue = $('<input name="' + color + '_' + subColor + '" class="theme-property-value" value="' + themesObject['colors'][color][subColor] + '">')
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

                            li.append(inputValue).appendTo(ul);
                        }
                        pLi.append(ul).appendTo($('.theme-preview-container > ul'));
                    } else {
                        var li       = $('<li class="input theme-property">');
                        var inputLabel = $('<label class="theme-property-label">' + color + '</label>');
                        var inputValue = $('<input name="' + color + '" class="theme-property-value" value="' + themesObject['colors'][color] + '">')
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

                        li.append(inputLabel)
                            .append(inputValue).appendTo($('.theme-preview-container > ul'));
                    }
                }
            } else if (property === 'wallpaper') {
                var li       = $('<li class="input theme-property">');
                var inputLabel = $('<label class="theme-property-label">' + property + '</label>');
                var inputValue = $('<input name="' + property + '" class="theme-property-value" value="' + themesObject[property] + '">');

                li.append(inputLabel)
                    .append(inputValue).appendTo($('.theme-preview-container > ul'));
            }
        }
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
            $('#config-themes').empty();
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
        document.collections = ['config','upgrades','themes'];
        eb.send('drop', document, function(reply) {
            console.log(reply);
        });
    });

    /**
     * Change theme colors undso
     */
    var changeTheme = function(theme) {
        eb.send('find', {collection: 'themes', matcher: { name: theme }}, function (res) {
            color = d3.scaleOrdinal(res[0].colors.amount);
            headerColor = res[0].colors.header;
            headerFontColor = res[0].colors.headerFont;
            fontColor = res[0].colors.font;
            backgroundColor = res[0].colors.background;
            axisColor = res[0].colors.axis;
            lineColor = res[0].colors.line;
            var colorParts = ['body', '#menu', '#config', '#erm', '#history', '#checkout', '#themes', '#version'];
            $('#config').fadeOut('slow');

            $.each(colorParts, function (key, value) {
                d3.select(value)
                    .transition()
                    .duration(500)
                    .style('background-color', backgroundColor)
            });

            d3.selectAll('form').selectAll('label').transition().duration(500).style('color', fontColor); // hä?
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
                renderTable(value, table, true);
            });
        });
    };

    /**
     * Show overlay
     *
     * @param overlay
     * @param collection
     * @param editable
     */
    var showOverlay = function(overlay, collection, editable) {
        $('#' + overlay).fadeTo("slow", 0.97);
        var table = "." + collection + "-collection";

        if ('version' === collection) {
            collection = 'upgrades';
        } else if ('history' === collection) {
            collection = 'piggy';
        }

        eb.send('find', {collection: collection, matcher: {}}, function (reply) {
            $(table + " > tbody").empty();
            $.each(reply, function (key, value) {
                renderTable(value, table, editable);
            });
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
    $('#config-save').click(function () {
        saveConfig();
    });

    /**
     * Save theme
     */
    $('#theme-update, #theme-save').click(function () {
        saveTheme($(this).data('update'));
    });

    /**
     * Menu links
     */
    $('#menu a').click(function(){
        var target = $(this).attr('id').split('-')[1];
        $('#header, #nav-icon3').toggleClass('open');
        $(".overlay").fadeOut('slow');
        switch (target) {
            case 'version':
            case 'themes':
            case 'history':
                showOverlay(target, target, false);
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
        }
    });

    /**
     * Save configuration
     */
    var saveConfig = function() {
        var form   = $('#config-save-form').serializeArray();
        config     = formToJson(form);
        var action = 'edit';
        eb.send(action, config, function (reply) {
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

    /**
     * Save theme
     */
    var saveTheme = function(update) {
        var form = $('#theme-form').serializeArray();

        var amount = [];
        $.each(form , function(key, value) {
            if(value.name.match(/amount_/)) {
                amount.push(value.value);
            }
        });

        var theme = formToJson(form);

        theme.amount = amount;
        var colors = {};

        $.each(theme , function(key, value) {
            if (key != '_id' && key != 'collection' && key != 'wallpaper' && key != 'name' && key != 'message_created_at') {
                colors[key] = value;
                delete theme[key]
            }
            if (key.match(/amount_/)) {
                delete colors[key]
            }
        });



        theme.colors = colors;
        theme.wallpaper = '';
        console.log('theme');
        console.log(theme);

        var action = 'save';
        if (update) {
            action = 'edit';
        } else {
            delete theme._id;
        }

        eb.send(action, theme, function (reply) {
            if (reply) {
                $('#theme-id').val(reply);
                changeTheme(reply.theme);
            } else {
                alert('Hoppala, irgendwas ging halt nicht!');
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
            case 'font':
                fontColor = color;
                break;
            case 'background':
                backgroundColor = color;
                var colorParts = ['body', '#menu', '#config', '#erm', '#history', '#themes', '#checkout', '#version'];
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

    /**
     * Render table
     *
     * @param value
     * @param table
     * @param editable
     */
    var renderTable = function(value, table, editable) {
        var columns    = $(table + ' thead th');
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
                html += '<td id="disable-' + collection + '-' + value._id + '"><span class="btn">&empty;</span></td>';
            } else if ('delete' === key) {
                deletable = true;
                html += '<td id="delete-' + collection + '-' + value._id + '"><span class="btn">X</span></td>';
            } else {
                html += '<td>' + value[key] + '</td>';
            }
        });
        html += '</tr>';

        $(table + " > tbody").append(html);

        if ('history' === collection) {
            collection = 'piggy';
        }

        if ('version' === collection) {
            collection = 'upgrades';
        }

        // Delete
        if (true === deletable) {
            $('#delete-' + collection + '-' + value._id).click(function() {
                eb.send('delete', {collection: collection, matcher: {_id: value._id}}, function(reply) {
                     // TODO delete per publish erfassen, weil anderer tab undso ...
                     if (reply.length > 0) {
                         $(table + '-' + value._id).remove();
                     }
                 });
            });
        }

        // Edit
        if (true === editable) {
            if ('themes' === collection) {
                var form = 'theme';
            } else if ('erm' === collection) {
                var form = 'erm-add';
            }

            $('#' + table.replace('.', '') + '-' + value._id).click(function() {
                eb.send('find', {collection: collection, matcher: {_id: value._id}}, function(reply) {
                    if (reply.length > 0) {
                        $('#' + form + '-update').show();
                        $('#' + form + '-id').val(value._id);
                        if ('themes' === collection) {
                            renderTheme(reply[0]);
                        }
                        jsonToForm(form + '-', reply[0]);
                    }
                });
            });
        }
    };
};