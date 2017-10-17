var svg = d3.select('#group3')
    .append("svg")
    .attr("id", "svg3")
    .attr("width", width * 2 - 25)
    .attr("height", height);

g = svg.append("g").attr("transform", "translate(40, 0)");

// Sat Oct 01 2011 00:00:00 GMT+0200 (CEST)
var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height - 25, 0]);
var z = color;

var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.quantity); });

var xAxisLine = d3.axisBottom(x);
var yAxisLine = d3.axisLeft(y);

var cities = generateCities([]);

g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height - 25) + ")")
    .call(xAxisLine);

g.append("g")
    .attr("class", "y axis")
    .call(yAxisLine)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("fill", "#000")
    .text('Menge');

var dates = cities[0].values.map(function (c) {
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

var city = g.selectAll(".city")
    .data(cities)
    .enter().append("g")
    .attr("class", "city");

var linePath = city.append("path")
    .attr("class", "line")
    .style("fill", "none")
    .attr("d", function (d) {
        return line(d.values);
    })
    .style("stroke", function (d, i) {
        return color(i);
    });


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

        d3.selectAll('line').transition().duration(500).style('stroke', axisColor);
        d3.selectAll('.domain').transition().duration(500).style('stroke', axisColor);
        d3.select('#svg3').selectAll('text').transition().duration(500).style('fill', axisColor);

    });
}

/**
 * Generate array of objects, for each coin type and given timeframe.
 * @param reply
 * @returns {Array}
 */
function generateCities(reply) {

    var timeframe = config.timeframe ? config.timeframe : 14;
    var entries         = crossfilter(reply);
    var entriesByAmount = entries.dimension(function(d) { return d.amount; });

    var cities = [];

    for(var j = 0; j < dataBars.length; j++) {

        entriesByAmount.filter(function(d) { return d === parseInt(dataBars[j].amount)});

        var row = [];

        var entriesFiltered       = crossfilter(entriesByAmount.top(Infinity));
        var entriesByAmountByDate = entriesFiltered.dimension(function(d) { return d.message_created_at; });
        for(var i = 0; i < timeframe; i++) {

            entriesByAmountByDate.filterRange([
                calculateDate(0, 0, 0 - timeframe + i, -getZero('hours'), -getZero('minutes'), -getZero('seconds')),
                calculateDate(0, 0, 0 - timeframe + i + 1, -getZero('hours'), -getZero('minutes'), -getZero('seconds') -1)
            ]);

            row.push({
                date: parseTime(calculateDate(0, 0, 0 - timeframe + i, -getZero('hours'), -getZero('minutes'), -getZero('seconds'))),
                quantity: entriesByAmountByDate.top(Infinity).length
            });
        }

        cities.push({
            id:     dataBars[j].amount,
            values: row
        });
    }

    return cities;
}