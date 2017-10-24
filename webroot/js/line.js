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
    .style("stroke-width", "2")
    .attr("d", function (d) {
        return line(d.values);
    })
    .style("stroke", function (d, i) {
        return color(i);
    })
    .on("mouseover", function(d, i) {
        piggySelection('on', d.values[d.values.length - 1], i);
    })
    .on("mouseout", function(d, i) {
        piggySelection('off', d.values[d.values.length - 1], i);
    });


/*
var lineText = city.append("text")
    .datum(function (d) {
        return {id: d.id, value: d.values[d.values.length - 1]};
    })
    .attr("transform", function (d) {
        return "translate(" + x(d.value.date) + "," + y(d.value.quantity) + ")";
    })
    .attr("x", 3)
    .attr("dy", "0.35em")
    .style("font", "10px sans-serif")
    .text(function (d) {
        return d.id;
});

*/

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

        linePath.data(cities);


        if (config['curved'] === 'yes') {
            line = d3.line()
                .curve(d3.curveBasis)
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.quantity); });
        } else {
            line = d3.line()
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.quantity); });
        }

        linePath.transition()
            .duration(1000)
            .ease(d3.easeElastic)
            .delay(function(d, i) { return 30 * i } )
            .style("stroke", function (d, i) {
                return color(i);
            })
            .attr("d", function (d) {
                return line(d.values);
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

        d3.selectAll('line').transition().duration(500).style('stroke', axisColor);
        d3.selectAll('.domain').transition().duration(500).style('stroke', axisColor);
        d3.select('#svg3').selectAll('text').transition().duration(500).style('fill', axisColor);

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

    return cities;
}