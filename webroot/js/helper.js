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
 * Highlight selected amount
 *
 * @param type
 * @param d
 * @param i
 */
var piggySelection = function(type, d, i) {
    if ('on' === type) {
        tweenText('#total-quantity', d.sum, formatQuantity);
        tweenText('#total-sum-pie', (d.sumTotal/100), formatCurrency);
        tweenText('#total-weight', calculateWeight(d), formatWeight);
        d3.select("#percent").text(formatPercent(calculatePercent(d)));
        d3.select("#percent").transition().style('opacity', 1);
        d3.select("#path_" + i)
            .transition()
            .duration(1000)
            .ease(d3.easeElastic)
            .attr("d", arc1.innerRadius(radius - 20).outerRadius(radius - 120).cornerRadius(4));
        d3.selectAll('.bar').transition().style('opacity', function() {
            return (this.id === 'bar_' + i) ? 1 : .1;
        });
        d3.selectAll('.line').transition().style('opacity', function() {
            return (this.id === 'line_' + i) ? 1 : .1;
        });
    } else {
        tweenText('#total-quantity', piggyLocal.get(quantityTotalLabel), formatQuantity);
        tweenText('#total-sum-pie', piggyLocal.get(sumTotalLabel), formatCurrency);
        tweenText('#total-weight',  piggyLocal.get(weightTotalLabel), formatWeight);
        d3.select("#percent").transition().style('opacity', 0);
        d3.select("#path_" + i)
            .transition()
            .duration(1000)
            .ease(d3.easeElastic)
            .attr("d", arc1.innerRadius(radius - 20).outerRadius(radius - 40).cornerRadius(4));
        d3.selectAll(".bar").transition().style("opacity", "1");
        d3.selectAll(".line").transition().style("opacity", "1");
    }
};


var tweenText = function(id, value, format) {
    d3.select(id).transition()
        .duration(1000)
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

var calculateWeight = function (row) {
    var weightTotal = 0;
    switch (row.amount) {
        case 1:
            weightTotal = row.sum * 2.3;
            break;
        case 2:
            weightTotal = row.sum * 3.06;
            break;
        case 5:
            weightTotal = row.sum * 3.92;
            break;
        case 10:
            weightTotal = row.sum * 4.1;
            break;
        case 20:
            weightTotal = row.sum * 5.74;
            break;
        case 50:
            weightTotal = row.sum * 7.8;
            break;
        case 100:
            weightTotal = row.sum * 7.5;
            break;
        case 200:
            weightTotal = row.sum * 8.5;
            break;
    }
    return weightTotal / 1000;
};

var calculatePercent = function(row) {
    var percent = 0;
    var total   = 0;

    if (config['calculation-base'] === 'value') {
        total = piggyLocal.get(sumTotalLabel);
    } else if (config['calculation-base'] === 'quantity') {
        total = piggyLocal.get(quantityTotalLabel);
    }
    percent = row.calculatedTotal / total;

    return percent;
};


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

var getZero = function(unit) {
    var dt = new Date();
    switch (unit) {
        case 'hours':
            return dt.getHours();
            break;
        case 'minutes':
            return dt.getMinutes();
            break;
        case 'seconds':
            return dt.getSeconds();
            break;
    }
};