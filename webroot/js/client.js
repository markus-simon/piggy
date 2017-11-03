var eb       = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/eventbus');
var config   = {};
var dataBars = [
    { idx: 0, amount: "1",   sum: 0, sumTotal: 0},
    { idx: 1, amount: "2",   sum: 0, sumTotal: 0},
    { idx: 2, amount: "5",   sum: 0, sumTotal: 0},
    { idx: 3, amount: "10",  sum: 0, sumTotal: 0},
    { idx: 4, amount: "20",  sum: 0, sumTotal: 0},
    { idx: 5, amount: "50",  sum: 0, sumTotal: 0},
    { idx: 6, amount: "100", sum: 0, sumTotal: 0},
    { idx: 7, amount: "200", sum: 0, sumTotal: 0}
];

var colorMapping = {
    "table": {
        0: {
            "head": {
                "property": 'background-color',
                "elements": ['thead']
            }
        },
        1: {
            "odd": {
                "property": 'background-color',
                "elements": ['tr:nth-child(odd)']
            }
        },
        2: {
            "even": {
                "property": 'background-color',
                "elements": ['tr:nth-child(even)']
            }
        },
        3: {
            "color": {
                "property": 'color',
                "elements": ['th','td']
            }
        }
    },
    "input": {
        0: {
            "background": 'background-color'
        },
        1: {
            "inset": 'box-shadow'
        },
        2: {
            "color": 'color'
        }
    }
};

var headerFontSize  = (window.innerHeight / 17) * (layout / 2);
var fallbackColor   = "#f00";
var coinColors      = ["#ffacf6", "#d052d0", "#ff5fb8", "#ff00a5", "#6b486b", "#6b215c", "#3c1231","#ff55d2"];
var colors          = {
    "header":           '#CB3577',
    "headerFont":       '#fff',
    "font":             '#fff',
    "background":       '#ffdddc',
    "line":             '#000',
    "axis":             '#000',
    "input_background": '',
    "input_inset":      '',
    "input":            ''
};

eb.onopen = function()
{
    /**
     * Find config
     */
    eb.send('find', {collection: 'config', matcher: {}}, function(reply) {
        config = reply[0];
        if (!$.isEmptyObject(config)) {
            jsonToForm('config-', config);
            $('#config-save-id').val(config._id);
            ms = config['duration'] ? config['duration'] : 5000;
            eb.send('find', {collection: 'theme', matcher: {name: config.theme}}, function (reply) {
                changeTheme(reply[0]);
/*
                wishesList(reply[0]);
*/
            });
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
     * Register theme handler
     */
    eb.registerHandler('theme', function(document) {
        changeTheme(document);
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
                    $('#show').fadeTo('slow', 1).delay(ms).fadeOut('slow');
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
     * Register edited handler
     */
    eb.registerHandler('edited', function(document) {
        $('#' + document.collection + '-collection-' + document._id).remove();
        renderTable(document, '.' + document.collection + '-collection');
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
                var result  = reply.result;
                var newData = [];

                if (config['calculation-base'] === 'quantity') {
                    result.forEach(function(row) {
                        row.calculatedTotal = row.sum;
                        newData.push(row);
                    });
                } else if (config['calculation-base'] === 'value') {
                    result.forEach(function(row) {
                        row.calculatedTotal = row.sumTotal / 100;
                        newData.push(row);
                    });
                }

                updateBars(newData);
                updatePie(newData);
                updateLine(newData);
                updateHeader(newData);
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
                eb.send('find', {collection: 'theme', matcher: {name: config.theme}}, function(reply) {
                    changeTheme(reply[0]);
                });
            }
            if (e.keyCode === 67) {
                if (config) {
                    $('#config-save-id').val(config._id);
                }
                showConfigOverlay();
            }
            if (true === keyMapping.hasOwnProperty(e.keyCode)) {
                showOverlay(keyMapping[e.keyCode]);
            }
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
     *
     */
    $('#config-theme').change(function() {
        var theme = $(this).val();
        eb.send('find', {collection: 'theme', matcher: {name: theme}}, function (reply) {
            changeTheme(reply[0]);
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
        $('body').append('<style id="theme-style">' + rule + '</style>')
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
                    if ('object' === typeof theme['colors'][color]) {
                        var pLi = $('<li class="input theme-property">');
                        var ul  = $('<ul class="sub-list">');

                        for (var subColor in theme['colors'][color]) {
                            var elem = renderThemeProperty(color + '_' + subColor, theme['colors'][color][subColor], true, true);
                            elem.appendTo(ul);
                        }
                        pLi.append(ul).appendTo($('.theme-preview-container > ul'));
                    } else {
                        renderThemeProperty(color, theme['colors'][color], true);
                    }
                }
            } else if (property === 'wallpaper') {
                renderThemeProperty(property, theme[property]);
            }
        }
        d3.selectAll('form').selectAll('label').transition().duration(ms).style('color', colors.font); // doppelt hält besser
    };

    /**
     * Render single theme property
     *
     * @param name
     * @param value
     * @param colorpicker
     * @param dontAppend
     * @returns {string}
     */
    var renderThemeProperty = function(name, value, colorpicker, dontAppend) {
        var li    = $('<li class="theme-property">');
        var label = '';

        if (name.match(/_/) && '0' === name.split('_')[1]) {
            label = $('<label class="theme-property-label">' + name.split('_')[0] + '</label>');
        } else if (!name.match(/_/)) {
            label = $('<label class="theme-property-label">' + name + '</label>');
        }

        var input = $('<input type="text" name="' + name + '" value="' + value + '" class="theme-property-value">');

        if (true === colorpicker) {
            input.colorPicker({
                renderCallback: function($elm, toggled) {
                    if (toggled !== true && toggled !== false) {
                        var prop        = $elm[0].name; //offsetParent.innerText.replace(/(\r\n|\n|\r)/gm,"");
                        var pickedColor = $elm.text;
                        changeColor(prop, pickedColor);
                        updateData();
                    }
                }
            })
            .css('background-color', value);
        }

        li.append($(label).css('color', colors.font))
            .append(input);

        if (true === dontAppend) {
            return li;
        } else {
            li.appendTo($('.theme-preview-container > ul'));
        }
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
        coinColors  = theme.colors.amount;
        colors      = {
            "header":           theme.colors.header,
            "headerFont":       theme.colors.headerFont,
            "font":             theme.colors.font,
            "background":       theme.colors.background,
            "line":             theme.colors.line,
            "axis":             theme.colors.axis,
            "input_background": theme.colors.input[0],
            "input_inset":      theme.colors.input[1],
            "input":            theme.colors.input[2]
        };

        // change header color
        d3.selectAll('.accordion-title').transition().duration(ms).style('background-color', colors.header);
        d3.selectAll('.overlay-title').transition().duration(ms).style('background-color', colors.header);
        $('#config-overlay').css('border-color', colors.header);

        // change body/background color
        var colorParts = ['body', '#wishes-overlay', '#config-overlay', '#erm-overlay', '#piggy-overlay', '#checkout-overlay', '#theme-overlay', '#upgrade-overlay'];
        $.each(colorParts, function(key, value) {
            d3.select(value).transition().duration(ms).style('background-color', colors.background)
        });

        // change input color
        d3.selectAll('.input-text').transition().duration(ms).style('background', colors.input_background);
        d3.selectAll('.input-text').transition().duration(ms).style('box-shadow', colors.input_inset);
        d3.selectAll('.input-text').transition().duration(ms).style('color', colors.input);
        d3.select('#percent').transition().duration(ms).style('fill', colors.axis);
        d3.selectAll('form').selectAll('label').transition().duration(ms).style('color', colors.font); // hä?

        updateData();
    };

    /**
     * Show overlay
     *
     * @param collection
     */
    var showOverlay = function(collection) {
        eb.send('find', {collection: 'theme', matcher: {name: config.theme}}, function(reply) {
            changeTheme(reply[0]);
        });
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
        if ('' !== target && 'undefined' !== typeof target) {
            if ('config' === target) {
                showConfigOverlay();
            } else {
                showOverlay(target);
            }
        }
    });

    /**
     * Save wish
     *
     * @param update
     */
    var saveWish = function(update) {
        var form = $('#wishes-form').serializeArray();
        var wish = formToJson(form);

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
                $(".overlay").fadeOut('slow');
                eb.send('find', {collection: 'theme', matcher: {name: config.theme}}, function (reply) {
                    eb.publish('theme', reply[0]);
                });
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

        if (true === validate(erm, true)) {
            erm.huepath = getHuePath();
            eb.send(action, erm, function (reply) {
                if (reply) {
                    $('#erm-form')[0].reset();
                    $('.show, .hue').hide();
                    $('.invalid-input').removeClass('invalid-input');
                    $('#erm-overlay').fadeOut("slow");
                } else {
                    piggyError('Speichern ging nicht', false);
                    return;
                }
            });
        }
        event.preventDefault();
    };

    /**
     * Validate form
     *
     * use data-attributes required, depends, format, err_msg
     *
     * @examples
     * data-required="true" - field is required
     * data-format="json" - field value must pass format check for json
     * data-err_msg="Name fehlt" - error message
     * data-depends="$show.on" - field is only validated if e.g. checkbox show is on
     *
     * @param form - form to validate
     * @param stopFirstError - stop validation on first error and throw message
     * @returns {boolean}
     */
    var validate = function(form, stopFirstError) {
        $.each(form, function(element, value) {
            var dependsOn;
            var dependencyCheck = true;
            var validateCheck   = true;
            var selector = $('#' + form['collection'] + '-' + element);

            if ('undefined' === typeof selector[0]) return true;

            if (selector[0].dataset['validate'] && '' !== form[element]) {
                switch (selector[0].dataset['validate']) {
                    case 'json':
                        form[element] = JSON.stringify(form[element]);
                        if (!isJson(form[element]))
                            validateCheck = false;
                        break;
                    case 'url':
                        if (true !== checkUrl(form[element]))
                            validateCheck = false;
                        break;
                }
            }

            if (selector[0].dataset['depends']) {
                dependsOn = selector[0].dataset['depends'].split('.');
                if (form[dependsOn[0].replace('$', '')] !== dependsOn[1]) {
                    dependencyCheck = false;
                }
            }

            if (('true' === selector[0].dataset['required'] && !form[element] && true === dependencyCheck)
                || false === validateCheck
            ) {
                if (true === stopFirstError) {
                    if (selector[0].dataset['err_msg']) {
                        piggyError(false, selector[0].dataset['err_msg']);
                    }
                    selector.addClass("invalid-input");
                    return false;
                }
                selector.addClass("invalid-input");
            } else {
                selector.removeClass("invalid-input");
            }
        });

        if (0 === $('.invalid-input').length) {
            return true;
        }
        return false;
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
            if (key !== '_id' && key !== 'collection' && key !== 'wallpaper' && key !== 'name' && key !== 'message_created_at' && key !== 'css') {
                colors[key] = value;
                delete theme[key];
            }
            if (key.match(/amount_/)) {
                delete colors[key];
            }
            if (key.match(/table_/)) {
                delete colors[key];
            }
            if (key.match(/input_/)) {
                delete colors[key];
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
        if (element.match(/_/)) {
            var mappingKey = element.split('_')[1];
            element        = element.split('_')[0];
            var objectKey  = Object.keys(colorMapping[element][mappingKey]);
            var property   = colorMapping[element][mappingKey][objectKey];
            element        = element + '_';
        }

        colors[element] = color;

        switch (element) {
            case 'header':
                var colorParts = ['#menu','.accordion-title','.overlay-title'];
                $.each(colorParts, function(key, value) {
                    d3.selectAll(value)
                        .transition()
                        .duration(ms)
                        .style('background-color', color);
                });
                $('.overlay').css('border-color', color);
                break;
            case 'input_':
                d3.selectAll('.input-text')
                    .transition()
                    .duration(ms)
                    .style(property, color);
                break;
            case 'table_':
                $.each(property.elements, function(key, value) {
                    d3.selectAll(value)
                        .transition()
                        .duration(ms)
                        .style(property.property, color);
                });
                break;
            case 'background':
                var colorParts = ['body', '#config-overlay', '#erm-overlay', '#wishes-overlay', '#piggy-overlay', '#theme-overlay', '#checkout-overlay', '#upgrade-overlay'];
                $.each(colorParts, function(key, value) {
                    d3.select(value)
                        .transition()
                        .duration(ms)
                        .style('background-color', color);
                });
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
     * Wishes front list
     */
/*    var wishesList = function(theme) {
        var idx  = 1;
        var wSvg = d3.select('#wishes-p')
            .append("svg")
            .attr("id", "wishes-bar")
            .attr("width", (width * 2))
            .append("g");

        wSvg.append("text")
            .transition()
            .duration(ms)
            .ease(d3.easeElastic)
            .attr("y", 0)
            .attr("x", 10)
            .attr("dy", "0.71em")
            .attr("fill", "#000")
            .text('Wishes');

        eb.send('find', {collection: 'wishes', matcher: {}}, function(reply) {
            var bar = wSvg.selectAll(".rect")
                .data(reply)
                .enter().append("g");

            bar.append("rect")
                .transition()
                .duration(ms)
                .ease(d3.easeElastic)
                .delay(function(d, i) { return 30 * i } )
                .attr("x", function(d, i) {
                    if (0 === i) {
                        return 10;
                    } else if (1 === i) {
                        return (10 + 200);
                    } else {
                        return ((reply[i-1].priority * 10) + 200);
                    }
                })
                .attr("width", function(d) { return (d.priority * 10); })
                .attr("y", 30)
                .attr("height", 100)
                .style("fill", function(d, i) { return theme.colors.amount[idx++]; });

            bar.append("text")
                .transition()
                .duration(ms)
                .ease(d3.easeElastic)
                .delay(function(d, i) { return 30 * i } )
                .attr("y", 45)
                .attr("x", function(d, i) {
                    if (0 === i) {
                        return 25;
                    } else if (1 === i) {
                        return (25 + 200);
                    } else {
                        return ((reply[i-1].priority * 10) + 215);
                    }
                })
                .attr("dy", "0.71em")
                .attr("fill", "#fff")
                .style("font-size", "16px")
                .text(function(d) { return d.name + ' (' + d.goal + ' EUR)'; });

            bar.append("text")
                .transition()
                .duration(ms)
                .ease(d3.easeElastic)
                .delay(function(d, i) { return 30 * i } )
                .attr("y", 80)
                .attr("x", function(d, i) {
                    if (0 === i) {
                        return 25;
                    } else if (1 === i) {
                        return (25 + 200);
                    } else {
                        return ((reply[i-1].priority * 10) + 215);
                    }
                })
                .attr("dy", "0.71em")
                .attr("fill", "#fff")
                .style("font-size", "14px")
                .text(function(d) { return 'Percentage: ' + calculatePercentage(d.goal, true) + ' %'; });

            bar.append("text")
                .transition()
                .duration(ms)
                .ease(d3.easeElastic)
                .delay(function(d, i) { return 30 * i } )
                .attr("y", 100)
                .attr("x", function(d, i) {
                    if (0 === i) {
                        return 25;
                    } else if (1 === i) {
                        return (25 + 200);
                    } else {
                        return ((reply[i-1].priority * 10) + 215);
                    }
                })
                .attr("dy", "0.71em")
                .attr("fill", "#fff")
                .style("font-size", "14px")
                .text(function(d) { return 'Priority: ' + d.priority + ' %'; });
        });
    };*/

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
                    html += wrapValue($(column).data('wrap'), 'td', value);
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
     * Wrap given value
     *
     * @param element
     * @param type
     * @param values
     * @returns {string}
     */
    var wrapValue = function(element, type, values) {
        var html     = '';
        var wrappers = [];

        if (element.match(/\[/)) {
            wrappers = element.split(/\[/);
            $.each(wrappers, function(key, value) {
               wrappers[key] = value.split(/(?=[.#])/g);
            });
        } else {
            wrappers[0] = element.split(/(?=[.#])/g);
        }

        html += '<' + type + '>';

        // Wrappers
        $.each(wrappers, function(key, value) {
            var attrClass = ' class="';
            var attrId    = ' id="';

            // Ids or classes
            $.each(value, function (kk, vv) {
                var attrSymbol = vv.match(/#/) ? '#' :'.';
                var needle     = vv.replace('{$', '').replace('}', '').replace(attrSymbol, '');

                if (vv.match(/{/) && true === values.hasOwnProperty(needle)) {
                    vv = values[needle];
                }

                if (null !== vv.match(/#/)) {
                    attrId += vv.replace('#', '') + ' '
                } else {
                    attrClass += vv.replace('.', '') + ' '
                }
            });

            attrClass += '"';
            attrId    += '"';

            html += '<' + value[0] + attrId + attrClass + '>';
            if (key === wrappers.length) {
                $.each(wrappers, function(k, v) {
                    html += '</' + v[0] + '>';
                });
            }
        });
        return html += '</' + type + '>';
    };

    /**
     * Throw error
     *
     * @param message
     * @param show
     * @param log
     */
    var piggyError = function(message, show, log) {
        if (message) {
            var error = {};
            error.showtts = message;
            eb.send('tts', error, function(reply) {
                playSound(reply);
            });
        }
        if (show) {
            showNotice('error', show);
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
var calculatePercentage = function(value, valueOnly) {
    // var pSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // pSvg.setAttribute('class', 'percentage');
    //
    // //d3.select().append();
    //
    // console.log(pSvg);
    // var p = d3.selectAll('.percentage'); //.attr('class', 'percentage');
    //
    // console.log(p);



    var ts = sumTotalLabel.text();
    var p2 = ((ts/value) * 100).toFixed(2);

    if (p2 >= 100) {
        p2 = 100;
    }
    if (true === valueOnly) {
        return p2;
    } else {
        return '<progress value="' + p2 + '" max="100"></progress>';
    }
};
