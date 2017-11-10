var svg = d3.select('#group3')
    .append("svg")
    .attr("id", "svg3")
    .attr("width", width * layout - 25)
    .attr("height", height);

g = svg.append("g").attr("transform", "translate(40, 0)");

var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
var coinTypes = generateCoinTypes([]);

/**
 *
 * @param value
 */
var setXYDomain = function(value) {
    return [
        d3.min(coinTypes, function(c) {
            return d3.min(c.values, function(d) {
                return d[value];
            });
        }),
        d3.max(coinTypes, function(c) {
            return d3.max(c.values, function(d) {
                return d[value];
            });
        })
    ];
};

var zoom = d3.zoom()
    .scaleExtent([1, 40])
    .translateExtent([[-100, -100], [width + 90, height]])
    .on("zoom", zoomed);

/*
svg.call(zoom);
*/

function zoomed() {
    g.attr("transform", d3.event.transform);
    axisXLine.call(xAxisLine.scale(d3.event.transform.rescaleX(xLine)));
}

var line = d3.line()
    .x(function(d) { return xLine(d.date); })
    .y(function(d) { return yLine(d.quantity); });

var xLine = d3.scaleTime().range([0, width * layout - 80]);
var yLine = d3.scaleLinear().range([height - 25, 25]);

var axisXLine = g.append("g");
var axisYLine = g.append("g");

var xAxisLine = d3.axisBottom(xLine).tickSizeInner(-height);
var yAxisLine = d3.axisLeft(yLine).ticks(10, ",f").tickSizeInner((-width * 2) + 20);

var axisYLineText = axisYLine.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 16)
    .attr("x", -12)
    .attr("fill", "#000");

var coinType = g.selectAll(".coin-type")
    .data(coinTypes);

var linePath = coinType.append("path")
    .attr("class", "lines")
    .attr("id", function(d) { return "line_" + d.idxs })
    .style("fill", "none")
    .style("stroke-width", "1")
    .attr("d", function(d) {
        return line(d.values);
    })
    .style("stroke", function(d) {
        return coinColors[d.idx] ? coinColors[d.idx] : fallbackColor;
    });

var area = d3.area()
    .x(function(d) { return xLine(d.date); })
    .y0(height - 25)
    .y1(function(d) { return yLine(d.quantity); });

var areaPath = coinType.append("path")
    .attr("class", "area")
    .attr("id", function(d) { return "area_" + d.idxs })
    .attr("d", function(d) {
        return area(d.values);
    });

axisYLineText.text(config['calculation-base']);

var focus = g.append('g').style('display', 'none');
focus.append('line')
    .attr('id', 'focusLineX')
    .attr('class', 'focusLine');
focus.append('line')
    .attr('id', 'focusLineY')
    .attr('class', 'focusLine');

/**
 * @type {{update: lines.update}}
 */
var lines = {
    init: function() {
        eb.send('find', {collection: 'piggy', matcher: {}}, function (reply) {
            coinTypes = generateCoinTypes(reply);

            xLine.domain(setXYDomain('date'));
            yLine.domain(setXYDomain('quantity'));

            axisXLine.attr("class", "x axis")
                .attr("transform", "translate(0," + (height - 25) + ")")
                .call(xAxisLine);

            axisYLine.attr("class", "y axis")
                .call(yAxisLine);

            // Update coin types
            var coinType = g.selectAll('.coin-type').data(coinTypes);
            var group    = coinType.enter().append('g').classed("coin-type", true).attr("id", function(d) { return "coin-type-" + d.idxs });

            group.merge(coinType);

            // Update path
            line.x(function (d) { return xLine(d.date); })
                .y(function (d) { return yLine(d.quantity); })
                .curve("yes" === config["curved"] ? d3.curveMonotoneX : d3.curveLinear);

            group.append("path")
                .classed("line", true)
                .attr("id", function(d) { return "line_" + d.idxs })
                .merge(coinType.select('.line'))
                .style("fill", "none")
                .style("stroke-width", "1")
                .attr("d", function(d) {
                    return line(d.values);
                })
                .transition()
                .duration(transitionDuration)
                .ease(transitionEasing)
                .attrTween("stroke-dasharray", function() {
                    var len = this.getTotalLength();
                    return function(t) { return (d3.interpolateString("0," + len, len + ",0"))(t) };
                })
                .style("stroke", function(d) {
                    return coinColors[d.idxs] ? coinColors[d.idxs] : fallbackColor;
                });

            // Update area
            /**
             * @todo: entrance animation
             */
            if (config['area-lines'] === 'yes') {
                area.x(function (d) { return xLine(d.date); })
                    .y0(height - 25)
                    .y1(function (d) { return yLine(d.quantity); })
                    .curve("yes" === config["curved"] ? d3.curveMonotoneX : d3.curveLinear);

                group.append("path")
                    .classed("area", true)
                    .attr("id", function(d) { return "line_" + d.idxs; })
                    .merge(coinType.select('.area'))
                    .attr("d", function(d) { return area(d.values); })
                    .attr('opacity', 0)
                    .transition()
                    .duration(transitionDuration)
                    .ease(transitionEasing)
                    .attrTween("stroke-dasharray", function () {
                        var len = this.getTotalLength();
                        return function (t) {
                            return (d3.interpolateString("0," + len, len + ",0"))(t)
                        };
                    })
                    .style("fill", function (d) {
                        return coinColors[d.idxs] ? coinColors[d.idxs] : fallbackColor;
                    })
                    .transition()
                    .delay(250)
                    .duration(500)
                    .ease(d3.easeCircle)
                    .attr("opacity", .1)

            }

            // Remove old stuff
            coinType.exit().remove();

            var timeFrame    = parseInt(config['timeframe']);
            var tickSettings = setTickSettings();

            lines.finish();
        });
    },
    update: function () {
        eb.send('find', {collection: 'piggy', matcher: {}}, function (reply) {
            coinTypes = generateCoinTypes(reply);

            xLine.domain(setXYDomain('date'));
            yLine.domain(setXYDomain('quantity'));

            line.x(function (d) { return xLine(d.date); })
                .y(function (d) { return yLine(d.quantity); })
                .curve("yes" === config["curved"] ? d3.curveMonotoneX : d3.curveLinear);

            axisXLine.transition()
                .duration(transitionDuration)
                .ease(transitionEasing)
                .call(xAxisLine);

            axisYLine.transition()
                .duration(transitionDuration)
                .ease(transitionEasing)
                .call(yAxisLine);

            g.selectAll('.coin-type').select('.line').data(coinTypes)
                .transition()
                .duration(transitionDuration)
                .ease(transitionEasing)
                .attr("d", function(d) { return line(d.values); });

            if (config['area-lines'] === 'yes') {
                area.x(function(d) { return xLine(d.date); })
                    .y0(height - 25)
                    .y1(function(d) { return yLine(d.quantity); })
                    .curve("yes" === config["curved"] ? d3.curveMonotoneX : d3.curveLinear);
                g.selectAll('.coin-type').select('.area').data(coinTypes)
                    .transition()
                    .duration(transitionDuration)
                    .ease(transitionEasing)
                    .attr("opacity", .1)
                    .attr("d", function (d) { return area(d.values); });
            } else {
                g.selectAll('.coin-type').select('.area').data(coinTypes)
                    .transition()
                    .duration(transitionDuration)
                    .ease(transitionEasing)
                    .attr("opacity", 0);
            }

            var timeFrame    = parseInt(config['timeframe']);
            var tickSettings = setTickSettings();
            lines.finish();
        });
    },
    finish: function() {
        axisYLineText.text(config['calculation-base']);
        d3.selectAll('line').transition().duration(transitionDuration).style('stroke', colors.axis);
        d3.selectAll('.domain').transition().duration(transitionDuration).style('stroke', colors.axis);
        d3.select('#svg3').selectAll('text').transition().duration(transitionDuration).style('fill', colors.axis);
        d3.selectAll(".tick").selectAll("line").attr("opacity", 0.1);
    }
};

/**
 * Set tick settings
 */
function setTickSettings() {
    var timeFrame    = parseInt(config['timeframe']);
    var tickSettings = {
        "amount": 0,
        "format": "%d.%m"
    };

    switch (true) {
        case timeFrame <= 7:
            tickSettings.amount = timeFrame;
            break;
        case timeFrame > 7 && timeFrame <= 31:
            tickSettings.amount = 7;
            break;
        case timeFrame > 31 && timeFrame <= 366:
            tickSettings.amount = 6 * layout;
            break;
        case timeFrame > 366:
            tickSettings.amount = Math.min(5, Math.ceil(timeFrame / 365));
            tickSettings.format = "%Y";
            break;
    }

    return tickSettings;
}

/**
 * Generate array of objects, for each coin type and given timeframe.
 * @param reply
 * @returns {Array}
 */
function generateCoinTypes(reply) {
    var timeframe       = config.timeframe ? config.timeframe : 14;
    var entries         = crossfilter(reply);
    var entriesByAmount = entries.dimension(function(d) { return d.amount; });
    var coinTypes       = [];

    var period = 'day';
    if (parseInt(timeframe) >= 365) {
        timeframe = 12;
        period = 'year';
    }
    var currentParsedDate;
    var currentOrgDate;

    for(var j = 0; j < dataBars.length; j++) {
        entriesByAmount.filter(function(d) { return d === parseInt(dataBars[j].amount)});

        var row                   = [];
        var quantity              = 0;
        var entriesFiltered       = crossfilter(entriesByAmount.top(Infinity));
        var entriesByAmountByDate = entriesFiltered.dimension(function(d) { return d.message_created_at; });

        // TODO vom Anbeginn der zeit ....
/*        if (parseInt(timeframe) === 0) {
            console.log('ss');
            console.log(entriesByAmountByDate.top(Infinity));
        }*/

        for(var i = 0; i <= timeframe; i++) {
            if (period === 'day') {
                entriesByAmountByDate.filterRange([
                    calculateDate(0, 0, 0 - timeframe + i,     -getZero('hours'), -getZero('minutes'), -getZero('seconds')),
                    calculateDate(0, 0, 0 - timeframe + i + 1, -getZero('hours'), -getZero('minutes'), -getZero('seconds') - 1)
                ]);
                currentParsedDate = parseTime(calculateDate(0, 0, 0 - timeframe + i, -getZero('hours'), -getZero('minutes'), -getZero('seconds')));
                currentOrgDate    = calculateDate(0, 0, 0 - timeframe + i,           -getZero('hours'), -getZero('minutes'), -getZero('seconds'));
            } else if (period === 'year') {
                entriesByAmountByDate.filterRange([
                    calculateDate(0, 0 - timeframe + i, 0,     -getZero('hours'), -getZero('minutes'), -getZero('seconds')),
                    calculateDate(0, 0 - timeframe + i + 1, 0, -getZero('hours'), -getZero('minutes'), -getZero('seconds') - 1)
                ]);
                currentParsedDate = parseTime(calculateDate(0, 0 - timeframe + i, 0, -getZero('hours'), -getZero('minutes'), -getZero('seconds')));
                currentOrgDate    = calculateDate(0, 0 - timeframe + i, 0,           -getZero('hours'), -getZero('minutes'), -getZero('seconds'));
            }
            var amount = entriesByAmountByDate.top(Infinity).length;

            if (config['combine-lines'] === 'yes') {
                quantity = quantity + amount;
            } else {
                quantity = amount;
            }

            row.push({
                date:     currentParsedDate,
                orgDate:  currentOrgDate,
                quantity: quantity,
                sum:      quantity,
                sumTotal: quantity * parseInt(dataBars[j].amount),
                amount:   parseInt(dataBars[j].amount),
                idx:      coinIndex[dataBars[j].amount]
            });
        }

        if (config['calculation-base'] === 'value') {
            row.forEach(function(entry) {
                entry.quantity = entry.quantity * parseInt(dataBars[j].amount) / 100;
                entry.sumTotal = entry.quantity * 100;
            });
        }

        coinTypes.push({
            id:     dataBars[j].amount,
            values: row,
            idxs: coinIndex[dataBars[j].amount]
        });
    }

    // TODO shame on me
    if (config['combine-all-lines'] === 'yes') {
        var all = [];
        coinTypes.forEach(function(entry2) {
            entry2.values.forEach(function(entry3) {
                all.push(entry3);
            })
        });

        var allEntries    = crossfilter(all);
        var entriesByDate = allEntries.dimension(function(d) {
            return d.orgDate;
        });

        var row2 = [];

        for (var i = 0; i <= timeframe; i++) {
            var qtyPerDay = 0;

            if (period === 'day') {
                entriesByDate.filterRange([
                    calculateDate(0, 0, 0 - timeframe + i, -getZero('hours'), -getZero('minutes'), -getZero('seconds')),
                    calculateDate(0, 0, 0 - timeframe + i + 1, -getZero('hours'), -getZero('minutes'), -getZero('seconds') - 1)
                ]);
                currentParsedDate = parseTime(calculateDate(0, 0, 0 - timeframe + i, -getZero('hours'), -getZero('minutes'), -getZero('seconds')));
                currentOrgDate    = calculateDate(0, 0, 0 - timeframe + i, -getZero('hours'), -getZero('minutes'), -getZero('seconds'));
            } else if (period === 'year') {
                entriesByDate.filterRange([
                    calculateDate(0, 0 - timeframe + i, 0, -getZero('hours'), -getZero('minutes'), -getZero('seconds')),
                    calculateDate(0, 0 - timeframe + i + 1, 0, -getZero('hours'), -getZero('minutes'), -getZero('seconds') - 1)
                ]);
                currentParsedDate = parseTime(calculateDate(0, 0 - timeframe + i, 0, -getZero('hours'), -getZero('minutes'), -getZero('seconds')));
                currentOrgDate    = calculateDate(0, 0 - timeframe + i, 0, -getZero('hours'), -getZero('minutes'), -getZero('seconds'));
            }

            var entriesByDateByAmount = entriesByDate.top(Infinity);
            entriesByDateByAmount.forEach(function(entry4) {
                qtyPerDay = qtyPerDay + entry4.quantity;
            });

            row2.push({
                date:     currentParsedDate,
                orgDate:  currentOrgDate,
                quantity: qtyPerDay,
                sum:      quantity,
                sumTotal: 999,
                amount:   999
            });
        }

        coinTypes = [];
        coinTypes.push({
            id:     "999",
            values: row2
        });
    }
    return coinTypes;
}