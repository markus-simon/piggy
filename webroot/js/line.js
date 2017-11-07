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
var setDomain = function(value) {
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


var xLine = d3.scaleTime()
    .domain(setDomain('date'))
    .range([0, width * layout - 80]);

var yLine = d3.scaleLinear()
    .domain(setDomain('quantity'))
    .range([height - 25, 25]);

var line = d3.line()
    .x(function(d) { return xLine(d.date); })
    .y(function(d) { return yLine(d.quantity); });

var xAxisLine = d3.axisBottom(xLine).ticks(0).tickSizeInner(-height)/*.tickFormat(d3.timeFormat(tickFormat))*/;
var yAxisLine = d3.axisLeft(yLine).ticks(10, ",f").tickSizeInner((-width * 2) + 20);

var axisXLine = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height - 25) + ")")
    .call(xAxisLine);

var axisYLine = g.append("g")
    .attr("class", "y axis")
    .call(yAxisLine);

var axisYLineText = axisYLine.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 16)
    .attr("x", -12)
    .attr("fill", "#000");

var coinType = g.selectAll(".coin-type")
    .data(coinTypes)
    .enter().append("g")
    .attr("class", "coin-type")
    .attr("id", function(d) { return "coin-type-" + d.idxs });

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
    .data(coinTypes)
    .attr("class", "area")
    .attr("id", function(d) { return "area_" + d.idxs })
    .attr("d", function(d) {
        return area(d.values);
    });

var focus = g.append('g').style('display', 'none');
    focus.append('line')
        .attr('id', 'focusLineX')
        .attr('class', 'focusLine');
    focus.append('line')
        .attr('id', 'focusLineY')
        .attr('class', 'focusLine');

var dots = coinType.selectAll("circle")
    .data(function(d) { return d.values; })
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx",function(d) { return xLine(d.date); })
    .attr("r", function(d) { return d.quantity ? 4 : 0 })
    .on("mouseover", function(d) {
        piggySelection('on', d, d.idx);

        if ("no" !== config['cross'] && "undefined" !== config['cross']) {
            focus.style('display', null);

            // Vertical line
            focus.select('#focusLineX')
                .style('stroke', coinColors[d.idx])
                .attr('x1', xLine(d.date))
                .attr('x2', xLine(d.date))
                .attr('y1', height - 25)
                .attr('y2', "extended" === config['cross'] ? yLine(yLine.domain()[1]) : yLine(d.quantity));

            // Horizontal line
            focus.select('#focusLineY')
                .style('stroke', coinColors[d.idx])
                .attr('x1', 0)
                .attr('x2', "extended" === config['cross'] ? xLine(xLine.domain()[1]) : xLine(d.date))
                .attr('y1', yLine(d.quantity))
                .attr('y2', yLine(d.quantity));
        }
    })
    .on("mouseout", function(d) {
        piggySelection('off', null, d.idx);
        focus.style('display', 'none');
    });

/**
 * Re-render line chart
 * @param result
 */
function updateLine(result) {
    eb.send('find', {collection: 'piggy', matcher: {}}, function(reply) {
        coinTypes = generateCoinTypes(reply);

        xLine.domain(setDomain('date'));
        yLine.domain(setDomain('quantity'));

        linePath.data(coinTypes);
        g.selectAll(".coin-type").data(coinTypes).exit().remove().enter().append();

        line.x(function(d) { return xLine(d.date); })
            .y(function(d) { return yLine(d.quantity); })
            .curve("yes" === config["curved"] ? d3.curveMonotoneX : d3.curveLinear);

        if (config['area-lines'] === 'yes') {
            area.x(function(d) { return xLine(d.date); })
                .y0(height - 25)
                .y1(function(d) { return yLine(d.quantity); })
                .curve("yes" === config["curved"] ? d3.curveMonotoneX : d3.curveLinear);
            areaPath.data(coinTypes);
            areaPath.transition()
                .duration(transitionDuration)
                .ease(transitionEasing)
                .attr("opacity", .1)
                .attr("d", function(d) { return area(d.values); })
                .style("fill", function(d) { return coinColors[d.idxs] ? coinColors[d.idxs] : fallbackColor; });
        } else {
            areaPath.attr("opacity", 0);
        }

        linePath.transition()
            .duration(transitionDuration)
            .ease(transitionEasing)
            .style("stroke", function(d) { return coinColors[d.idxs] ? coinColors[d.idxs] : fallbackColor; })
            .attr("d", function(d) { return line(d.values); });

        coinType.data(coinTypes).enter().append().exit();
        dots.data(function(e) { /*console.log(e); */return e.values; }).enter().append()/*.exit()*/;

/*
        dots.exit().remove();
*/
        dots.transition()
            .duration(transitionDuration)
            .ease(transitionEasing)
            .attr("cx",function(d) { return xLine(d.date); })
            .attr("cy",function(d) { return yLine(d.quantity); })
            .attr("r", function(d) { return d.quantity ? 4 : 0 })
            .style("fill", function(d) { return coinColors[d.idx] ? coinColors[d.idx] : fallbackColor; });


        var timeFrame = parseInt(config['timeframe']);

        var tickAmount = 0;
        var tickFormat = "%d.%m";
        switch (true) {
            case timeFrame <= 7:
                tickAmount = timeFrame;
                break;
            case timeFrame > 7 && timeFrame <= 31:
                tickAmount = 7;
                break;
            case timeFrame > 31 && timeFrame <= 366:
                tickAmount = 6 * layout;
                break;
            case timeFrame > 366:
                tickAmount = Math.min(5, Math.ceil(timeFrame / 365));
                tickFormat = "%Y";
                break;
        }

        g.transition().select(".x.axis")
            .duration(transitionDuration)
            .ease(transitionEasing)
            .call(xAxisLine.ticks(tickAmount).tickFormat(d3.timeFormat(tickFormat)));

        g.transition().select(".y.axis")
            .duration(transitionDuration)
            .ease(transitionEasing)
            .call(yAxisLine);

        axisYLineText.text(config['calculation-base']);

        d3.selectAll('line').transition().duration(transitionDuration).style('stroke', colors.axis);
        d3.selectAll('.domain').transition().duration(transitionDuration).style('stroke', colors.axis);
        d3.select('#svg3').selectAll('text').transition().duration(transitionDuration).style('fill', colors.axis);
        d3.selectAll(".tick").selectAll("line").attr("opacity", 0.1);
    });
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

    for(var j = 0; j < dataBars.length; j++) {
        entriesByAmount.filter(function(d) { return d === parseInt(dataBars[j].amount)});

        var row                   = [];
        var quantity              = 0;
        var entriesFiltered       = crossfilter(entriesByAmount.top(Infinity));
        var entriesByAmountByDate = entriesFiltered.dimension(function(d) { return d.message_created_at; });

        if (parseInt(timeframe) === 0) {
            console.log('ss');
            console.log(entriesByAmountByDate.top(Infinity));
        }

        for(var i = 0; i <= timeframe; i++) {
            entriesByAmountByDate.filterRange([
                calculateDate(0, 0, 0 - timeframe + i, -getZero('hours'), -getZero('minutes'), -getZero('seconds')),
                calculateDate(0, 0, 0 - timeframe + i + 1, -getZero('hours'), -getZero('minutes'), -getZero('seconds') -1)
            ]);

            var amount = entriesByAmountByDate.top(Infinity).length;

            if (config['combine-lines'] === 'yes') {
                quantity = quantity + amount;
            } else {
                quantity = amount;
            }

            row.push({
                date: parseTime(calculateDate(0, 0, 0 - timeframe + i, -getZero('hours'), -getZero('minutes'), -getZero('seconds'))),
                orgDate: calculateDate(0, 0, 0 - timeframe + i, -getZero('hours'), -getZero('minutes'), -getZero('seconds')),
                quantity: quantity,
                sum: quantity,
                sumTotal: quantity * parseInt(dataBars[j].amount),
                amount: parseInt(dataBars[j].amount),
                idx: coinIndex[dataBars[j].amount]
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
            entriesByDate.filterRange([
                calculateDate(0, 0, 0 - timeframe + i, -getZero('hours'), -getZero('minutes'), -getZero('seconds')),
                calculateDate(0, 0, 0 - timeframe + i + 1, -getZero('hours'), -getZero('minutes'), -getZero('seconds') - 1)
            ]);
            var entriesByDateByAmount = entriesByDate.top(Infinity);
            entriesByDateByAmount.forEach(function(entry4) {
                qtyPerDay = qtyPerDay + entry4.quantity;
            });

            row2.push({
                date: parseTime(calculateDate(0, 0, 0 - timeframe + i, -getZero('hours'), -getZero('minutes'), -getZero('seconds'))),
                orgDate: calculateDate(0, 0, 0 - timeframe + i, -getZero('hours'), -getZero('minutes'), -getZero('seconds')),
                quantity: qtyPerDay,
                sum: quantity,
                sumTotal: 999,
                amount: 999
            });
        }

        coinTypes = [];
        coinTypes.push({
            id: "999",
            values: row2
        });
    }
    return coinTypes;
}