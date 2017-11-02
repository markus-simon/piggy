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

var xLine = d3.scaleTime()
    .domain(setDomain('date'))
    .range([0, width * layout - 80]);

var yLine = d3.scaleLinear()
    .domain(setDomain('quantity'))
    .range([height - 25, 25]);

var line = d3.line()
    .x(function(d) { return xLine(d.date); })
    .y(function(d) { return yLine(d.quantity); });

var xAxisLine = d3.axisBottom(xLine).tickSizeInner(-height);
var yAxisLine = d3.axisLeft(yLine).ticks(10, ",f").tickSizeInner((-width * 2) + 20);

g.append("g")
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
    .attr("id", function(d, i) { return "coin-type-" + i });

var linePath = coinType.append("path")
    .attr("class", "lines")
    .attr("id", function(d, i) { return "line_" + i })
    .style("fill", "none")
    .style("stroke-width", "1")
    .attr("d", function(d) {
        return line(d.values);
    })
    .style("stroke", function(d, i) {
        return color(i);
    })
/*    .on("mouseover", function(d, i) {
        changeCalculationBase(d, i);
        piggySelection('on', d.values[d.values.length - 1], i);
    })
    .on("mouseout", function(d, i) {
        piggySelection('off', d.values[d.values.length - 1], i);
    });*/

var area = d3.area()
    .x(function(d) { return xLine(d.date); })
    .y0(height - 25)
    .y1(function(d) { return yLine(d.quantity); });

var areaPath = coinType.append("path")
    .data(coinTypes)
    .attr("class", "area")
    .attr("id", function(d, i) { return "area_" + i })
    .attr("d", function(d) {
        return area(d.values);
    });
        /*
    // TODO crap ... forget it!
    .on("mouseover", function(d, i) {
        changeCalculationBase(d, i);
        piggySelection('on', d.values[d.values.length - 1], i);
    })
    .on("mouseout", function(d, i) {
        piggySelection('off', d.values[d.values.length - 1], i);
    });*/

/*var dotGroup = coinType.append('g')
    .attr("id", function(d, i) { return "dots_" + i })*/
/*    .on("mouseover", function(d, i) {
        changeCalculationBase(d, i);
        piggySelection('on', d.values[d.values.length - 1], i);
    })
    .on("mouseout", function(d, i) {
        piggySelection('off', d.values[d.values.length - 1], i);
    });*/

var changeCalculationBase = function(d, i) {
    if (config['calculation-base'] === 'quantity') {
        d.values[d.values.length - 1].calculatedTotal = d.values[d.values.length - 1].sum;
    } else if (config['calculation-base'] === 'value') {
        d.values[d.values.length - 1].calculatedTotal = d.values[d.values.length - 1].sumTotal / 100;
    }
};

var dots = coinType.selectAll("circle")
    .data(function(d) { return d.values; })
    .enter()
    .append("circle")
    .style("fill", function() { var realI = d3.select(this)._groups[0][0].parentElement.id.substr((d3.select(this)._groups[0][0].parentElement.id.lastIndexOf('-') + 1)).toLowerCase(); return color(realI) })
    .attr("cx",function(d) { return xLine(d.date); })
    .attr("r", function(d) { return d.quantity ? 4 : 0 });

/**
 * Re-render line chart
 * @param result
 */
function updateLine(result) {
    eb.send('find', {collection: 'piggy', matcher: {}}, function(reply) {
        coinTypes = generateCoinTypes(reply);

        xLine.domain(setDomain('date'));
        yLine.domain(setDomain('quantity'));

        linePath.data(coinTypes).enter().append().exit();

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
                .duration(500)
                .ease(d3.easeElastic)
                .attr("opacity", 0.1)
                .attr("d", function(d) { return area(d.values); })
                .style("fill", function(d, i) { return color(i); });
        } else {
            areaPath.attr("opacity", 0);
        }

        linePath.transition()
            .duration(500)
            .ease(d3.easeElastic)
            .style("stroke", function(d, i) { return color(i); })
            .attr("d", function(d) { return line(d.values); });

        coinType.data(coinTypes).enter().append().exit();
        dots.data(function(e) { return e.values; }).enter().append().exit();

        dots.exit().remove();
        dots.transition()
            .duration(500)
            .ease(d3.easeElastic)
            .attr("cx",function(d) { return xLine(d.date); })
            .attr("cy",function(d) { return yLine(d.quantity); })
            .attr("r", function(d) { return d.quantity ? 4 : 0 })
            .style("fill", function() { var realI = d3.select(this)._groups[0][0].parentElement.id.substr((d3.select(this)._groups[0][0].parentElement.id.lastIndexOf('-') + 1)).toLowerCase(); return color(realI) })

        g.transition().select(".x.axis")
            .duration(500)
            .ease(d3.easeElastic)
            .call(xAxisLine);

        g.transition().select(".y.axis")
            .duration(500)
            .ease(d3.easeElastic)
            .call(yAxisLine);

        axisYLineText.text(config['calculation-base']);

        d3.selectAll('line').transition().duration(500).style('stroke', colors.axis);
        d3.selectAll('.domain').transition().duration(500).style('stroke', colors.axis);
        d3.select('#svg3').selectAll('text').transition().duration(500).style('fill', colors.axis);
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
                amount: parseInt(dataBars[j].amount)
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
            values: row
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

        var coinTypes = [];
        coinTypes.push({
            id: "999",
            values: row2
        });
    }
    return coinTypes;
}