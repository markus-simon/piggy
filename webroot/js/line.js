var svg = d3.select('#group3')
    .append("svg")
    .attr("id", "svg3")
    .attr("width", width * layout - 25)
    .attr("height", height);

g = svg.append("g").attr("transform", "translate(40, 0)");

// Sat Oct 01 2011 00:00:00 GMT+0200 (CEST)
var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");


var cities = generateCities([]);


var dates = cities[0].values.map(function (c) {
    return c.date;
});

var x = d3.scaleTime()
    .domain(d3.extent(dates, function (d) {
        return d;
    }))
    .range([0, width * layout - 80]);

var y = d3.scaleLinear()
    .domain([
        d3.min(cities, function (c) {
            return d3.min(c.values, function (d) {
                return d.quantity;
            });
        }),
        d3.max(cities, function (c) {
            return d3.max(c.values, function (d) {
                return d.quantity;
            });
        })
    ])
    .range([height - 25, 25]);

var z = color;

var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.quantity); });


var xAxisLine = d3.axisBottom(x).tickSizeInner(-height);
var yAxisLine = d3.axisLeft(y).ticks(10, ",f").tickSizeInner((-width * 2) + 20);

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

var city = g.selectAll(".city")
    .data(cities)
    .enter().append("g")
    .attr("class", "city");

var linePath = city.append("path")
    .attr("class", "line")
    .attr("id", function(d, i) { return "line_" + i })
    .style("fill", "none")
    .style("stroke-width", "1")
    .attr("d", function (d) {
        return line(d.values);
    })
    .style("stroke", function (d, i) {
        return color(i);
    })
    .on("mouseover", function(d, i) {
        if (config['calculation-base'] === 'quantity') {
            d.values[d.values.length - 1].calculatedTotal = d.values[d.values.length - 1].sum;
        } else if (config['calculation-base'] === 'value') {
            d.values[d.values.length - 1].calculatedTotal = d.values[d.values.length - 1].sumTotal / 100;
        }
        piggySelection('on', d.values[d.values.length - 1], i);
    })
    .on("mouseout", function(d, i) {
        piggySelection('off', d.values[d.values.length - 1], i);
    });

    var area = d3.area()
        .x(function (d) { return x(d.date); })
        .y0(height - 25)
        .y1(function (d) { return y(d.quantity); });

    var areaPath = city.append("path")
        .data(cities)
        .attr("class", "area")
        .attr("id", function(d, i) { return "area_" + i })
        .attr("d", function (d) {
            return area(d.values);
        })

        // TODO crap ... forget it!
    .on("mouseover", function(d, i) {
        if (config['calculation-base'] === 'quantity') {
            d.values[d.values.length - 1].calculatedTotal = d.values[d.values.length - 1].sum;
        } else if (config['calculation-base'] === 'value') {
            d.values[d.values.length - 1].calculatedTotal = d.values[d.values.length - 1].sumTotal / 100;
        }
        piggySelection('on', d.values[d.values.length - 1], i);
    })
    .on("mouseout", function(d, i) {
        piggySelection('off', d.values[d.values.length - 1], i);
    });

    var dotGroup = city.append('g')
        .attr("id", function(d, i) { return "dots_" + i })
        .on("mouseover", function(d, i) {
            if (config['calculation-base'] === 'quantity') {
                d.values[d.values.length - 1].calculatedTotal = d.values[d.values.length - 1].sum;
            } else if (config['calculation-base'] === 'value') {
                d.values[d.values.length - 1].calculatedTotal = d.values[d.values.length - 1].sumTotal / 100;
            }
            piggySelection('on', d.values[d.values.length - 1], i);
        })
        .on("mouseout", function(d, i) {
            piggySelection('off', d.values[d.values.length - 1], i);
        });

/**
 * Re-render line chart
 * @param result
 */
function updateLine(result) {
    eb.send('find', {collection: 'piggy', matcher: {}}, function (reply) {

        cities = generateCities(reply);

        dates = cities[0].values.map(function (c) {
            return c.date;
        });

        x.domain(d3.extent(dates, function (d) {
            return d;
        }));

        y.domain([
            d3.min(cities, function (c) {
                return d3.min(c.values, function (d) {
                    return d.quantity;
                });
            }),
            d3.max(cities, function (c) {
                return d3.max(c.values, function (d) {
                    return d.quantity;
                });
            })
        ]);


        // TODO crap
        linePath.data(cities)
            .enter().append().exit();

/*
        linePath.data(cities);
*/

        if (config['curved'] === 'yes') {
            line = d3.line()
                .curve(d3.curveBasis)
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.quantity); });
            if (config['area-lines'] === 'yes') {
                area = d3.area()
                    .curve(d3.curveBasis)
                    .x(function (d) { return x(d.date); })
                    .y0(height - 25)
                    .y1(function (d) { return y(d.quantity); });
            }
        } else {
            line = d3.line()
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.quantity); });
            if (config['area-lines'] === 'yes') {
                area = d3.area()
                    .x(function(d) { return x(d.date); })
                    .y0(height - 25)
                    .y1(function(d) { return y(d.quantity); });
            }
        }

        if (config['area-lines'] === 'yes') {
            areaPath.data(cities);
            areaPath.transition()
                .duration(1000)
                .ease(d3.easeElastic)
                .attr("opacity", 0.1)
                .style("fill", function (d, i) { return color(i); })
                .attr("d", function (d) { return area(d.values); });
        } else {
            areaPath.attr("opacity", 0)
        }

        linePath.transition()
            .duration(1000)
            .ease(d3.easeElastic)
            .delay(function(d, i) { return 30 * i } )
            .style("stroke", function (d, i) { return color(i); })
            .attr("d", function (d) { return line(d.values); });

        // Add dots
        /**
         * @todo: bugs: config change, curved
         */
        $.each(dates, function(dk, dv) {
            dotGroup.data(cities).append('circle')
                .attr('class', 'dot')
                .transition()
                .duration(1000)
                .delay(function(d, i) { return 30 * i } )
                .attr("r", function(d) { return (0 !== d.values[dk].quantity || dk % 2 !== 1) ? 4 : 0; })
                .attr("cx", function(d){ return x(d.values[dk].date); })
                .attr("cy", function(d){ return y(d.values[dk].quantity); })
                .style("fill", function (d, i) { return color(i); })
                .style("stroke", function (d, i) { return color(i); });
       });

        g.transition().select(".x.axis")
            .duration(1000)
            .ease(d3.easeElastic)
            .call(xAxisLine);

        g.transition().select(".y.axis")
            .duration(1000)
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
function generateCities(reply) {
    var timeframe       = config.timeframe ? config.timeframe : 14;
    var entries         = crossfilter(reply);
    var entriesByAmount = entries.dimension(function(d) { return d.amount; });

    var cities = [];

    for(var j = 0; j < dataBars.length; j++) {

        entriesByAmount.filter(function(d) { return d === parseInt(dataBars[j].amount)});

        var row = [];

        var quantity = 0;
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
            row.forEach(function (entry) {
                entry.quantity = entry.quantity * parseInt(dataBars[j].amount) / 100;
                entry.sumTotal = entry.quantity * 100;
            });
        }

        cities.push({
            id:     dataBars[j].amount,
            values: row
        });
    }


    // TODO shame on me
    if (config['combine-all-lines'] === 'yes') {

        var all = [];
        cities.forEach(function (entry2) {
            entry2.values.forEach(function (entry3) {
                all.push(entry3);
            })
        });

        var allEntries = crossfilter(all);
        var entriesByDate = allEntries.dimension(function (d) {
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
            entriesByDateByAmount.forEach(function (entry4) {
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
        var cities = [];

        cities.push({
            id: "999",
            values: row2
        });
    }

    return cities;
}