var coinIndex = {
    "1": 0,
    "2": 1,
    "5": 2,
    "10": 3,
    "20": 4,
    "50": 5,
    "100": 6,
    "200": 7
};

/**
 *
 * @returns {string}
 */
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

/**
 *
 * @param form
 * @returns {{}}
 */
var formToJson = function(form) {
    var json = {};
    $.each(form, function(key, value) {
        $.each(value, function(key2, value2) {
            if(key2 === 'name') {
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

/**
 * Determine if given string is valid json
 *
 * @param str
 * @returns {boolean}
 */
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

/**
 *
 * @param prefix
 * @param data
 */
var jsonToForm = function(prefix, data) {
    $.each(data, function(key, value) {
        key = key.replace(/_/g, '-');
        var ctrl = $('#' + prefix + key);
        if (ctrl.is('select')) {
            $("option", ctrl).each(function() {
                if (this.value === value) {
                    this.selected=true;
                }
            });
        } else {
            switch (ctrl.prop("type")) {
                case "radio":
                case "checkbox":
                    if (value !== 'off') {
                        $('#' + prefix + key).prop("checked", true);
                        $('.' + key).show();
                    } else {
                        $('#' + prefix + key).prop("checked", false);
                        $('.' + key).hide();
                    }
                    break;
                default:
                    ctrl.val(value);
            }
        }
    });
};

/**
 * Search in object
 *
 * @param items
 * @param attribute
 * @param value
 * @returns {*}
 */
var findByAttribute = function(items, attribute, value) {
    for (var i = 0; i < items.length; i++) {
        if ('number' === typeof value) {
            if (value === parseInt(items[i][attribute])) {
                return items[i];
            }
        } else {
            if (value === items[i][attribute]) {
                return items[i];
            }
        }
    }
    return null;
};

/**
 * Highlight selected amount
 *
 * @param type
 * @param d
 * @param i
 */
var piggySelection = function(type, d, i) {
    if ('on' === type) {
        tweenText('#total-quantity', d.sum, formats.quantity);
        tweenText('#total-sum-pie', (d.sumTotal/100), formats.currency);
        tweenText('#total-weight', calculateWeight(d), formats.weight);
        d3.select("#percent").text(formats.percent(calculatePercent(d)));
        d3.select("#percent").transition().style('opacity', 1);
        d3.selectAll('.pie-parts').transition()
            .duration(ms)
            .ease(d3.easeElastic)
            .style('opacity', function() {
                return (this.id === 'path_' + i) ? 1 : .1;
            })
            .attr("d", arc1.innerRadius(radius - 20).outerRadius(radius - 40).cornerRadius(4));
        d3.select("#path_" + i)
            .transition()
            .duration(ms)
            .ease(d3.easeElastic)
            .attr("d", arc1.innerRadius(radius - 20).outerRadius(radius - 120).cornerRadius(4))
            .style("opacity", "1");
        d3.selectAll('.bar').transition().style('opacity', function() {
            return (this.id === 'bar_' + i) ? 1 : .1;
        });
        d3.selectAll('.dot').transition().style('opacity', function() {
            return (this.parentNode.id === 'dots_' + i) ? 1 : .1;
        });
        d3.selectAll('.lines').transition().style('opacity', function() {
            return (this.id === 'line_' + i) ? 1 : .1;
        });
        d3.selectAll('.area').transition().style('opacity', function() {
            return (this.id === 'area_' + i) ? 0.1 : 0.01;
        });
    } else {
        tweenText('#total-quantity', piggyLocal.get(quantityTotalLabel), formats.quantity);
        tweenText('#total-sum-pie', piggyLocal.get(sumTotalLabel), formats.currency);
        tweenText('#total-weight',  piggyLocal.get(weightTotalLabel), formats.weight);
        d3.select("#percent").transition().style('opacity', 0);
        d3.selectAll(".pie-parts")
            .transition()
            .duration(ms)
            .style("opacity", 1);
        d3.select("#path_" + i)
            .transition()
            .duration(ms)
            .ease(d3.easeElastic)
            .attr("d", arc1.innerRadius(radius - 20).outerRadius(radius - 40).cornerRadius(4));
        d3.selectAll(".bar, .dot, .lines").transition().style("opacity", 1);
        d3.selectAll(".area").transition().style("opacity", .1);
    }
};

/**
 *
 * @param id
 * @param value
 * @param format
 */
var tweenText = function(id, value, format) {
    d3.select(id).transition()
        .duration(ms)
        .ease(d3.easeCubic)
        .on("start", function repeat() {
            d3.active(this)
                .tween("text", function () {
                    var that = d3.select(this),
                        i = d3.interpolateNumber(that.text().replace(/,/g, ""), value);
                    return function (t) {
                        that.text(format(i(t)));
                    };
                })
                .transition()
        })
};

/**
 * Weight per amount
 *
 * @type {{1: number, 2: number, 5: number, 10: number, 20: number, 50: number, 100: number, 200: number}}
 */
var weightMapping = {
    1: 2.3, 2: 3.06, 5: 3.92, 10: 4.1, 20: 5.74, 50: 7.8, 100: 7.5, 200: 8.5
};

/**
 * Calculate amount weight
 *
 * @param row
 * @returns {number}
 */
var calculateWeight = function (row) {
    if (weightMapping.hasOwnProperty(row.amount)) {
        return row.sum * weightMapping[row.amount] / 1000;
    }
    return 0;
};

/**
 *
 * @param row
 * @returns {number}
 */
var calculatePercent = function(row) {
    var total = 0;

    if (config['calculation-base'] === 'value') {
        total = piggyLocal.get(sumTotalLabel);
    } else if (config['calculation-base'] === 'quantity') {
        total = piggyLocal.get(quantityTotalLabel);
    }
    return row.calculatedTotal / total;
};

/**
 *
 * @param file
 */
var playSound = function(file) {
    var audioElement = document.createElement('audio');
    audioElement.setAttribute('src', file);
    audioElement.setAttribute('autoplay', 'autoplay');
    audioElement.addEventListener("load", function () {
        audioElement.play();
    }, true);
};

// TODO
var checkUrl = function(url) {
    return true;
};

/**
 *
 * @param offset_years
 * @param offset_months
 * @param offset_days
 * @param offset_hours
 * @param offset_minutes
 * @param offset_seconds
 * @returns {string}
 */
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

/**
 *
 * @param unit
 * @returns {number}
 */
var getZero = function(unit) {
    var dt = new Date();
    switch (unit) {
        case 'hours':
            return dt.getHours();
        case 'minutes':
            return dt.getMinutes();
        case 'seconds':
            return dt.getSeconds();
    }
};