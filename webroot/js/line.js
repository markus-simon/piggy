var svg = d3.select('#group3')
    .append("svg")
    .attr("id", "svg3")
    .attr("width", width * 2 - 25)
    .attr("height", height);

var parseTime = d3.timeParse("%Y%m%d");

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.temperature); });


var data = [
    {date: 20111001},
    {date: 20111002},
    {date: 20111003},
    {date: 20111004},
    {date: 20111005},
    {date: 20111006},
    {date: 20111007},
    {date: 20111008},
    {date: 20111009},
    {date: 20111010},
    {date: 20111011},
    {date: 20111012},
    {date: 20111013},
    {date: 20111014},
    {date: 20111015},
    {date: 20111016},
    {date: 20111017},
    {date: 20111018},
    {date: 20111019},
    {date: 20111020},
    {date: 20111021},
    {date: 20111022},
    {date: 20111023},
    {date: 20111024},
    {date: 20111025},
    {date: 20111026},
    {date: 20111027},
    {date: 20111028},
    {date: 20111029},
    {date: 20111030},
    {date: 20111031},
    {date: 20111101},
    {date: 20111102},
    {date: 20111103},
    {date: 20111104},
    {date: 20111105},
    {date: 20111106},
    {date: 20111107},
    {date: 20111108},
    {date: 20111109},
    {date: 20111110},
    {date: 20111111},
    {date: 20111112},
    {date: 20111113},
    {date: 20111114},
    {date: 20111115},
    {date: 20111116},
    {date: 20111117},
    {date: 20111118},
    {date: 20111119},
    {date: 20111120}
];


/*var data = [];
for (var i = 0; i <= 30; i++) {
    data.push({
        'date': parseTime(20111001)
    });
}*/

console.log(data);



var cities = data.columns.map(function(id) {
    return {
        id: id,
        values: data.map(function(d) {
            return {date: d.date, temperature: d[id]};
        })
    };
});

x.domain(d3.extent(data, function(d) { return d.date; }));

y.domain([
    d3.min(cities, function(c) { return d3.min(c.values, function(d) { return d.temperature; }); }),
    d3.max(cities, function(c) { return d3.max(c.values, function(d) { return d.temperature; }); })
]);

z.domain(cities.map(function(c) { return c.id; }));

g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("fill", "#000")
    .text("Temperature, ºF");

var city = g.selectAll(".city")
    .data(cities)
    .enter().append("g")
    .attr("class", "city");

city.append("path")
    .attr("class", "line")
    .attr("d", function(d) { return line(d.values); })
    .style("stroke", function(d) { return z(d.id); });

city.append("text")
    .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
    .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
    .attr("x", 3)
    .attr("dy", "0.35em")
    .style("font", "10px sans-serif")
    .text(function(d) { return d.id; });

function type(d, _, columns) {
    d.date = parseTime(d.date);
    for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
    return d;
}




function updateLine(result) {
    sumTotal = 0;
    // TODO sumTotal weiter nach "vorne" verschieben ...
    result.forEach(function(row) {
        sumTotal += row.sumTotal;
    });

    y = d3.scaleLinear()
        .domain([0, sumTotal / 100])
        .range([height - 25, 25]);

    random = d3.randomUniform(1, sumTotal/100);

    axisY.transition()
        .duration(1000)
        .call(d3.axisLeft(y));

    d3.select('#clippath').style("stroke",lineColor);
    svg3.selectAll('.domain').transition().duration(500).style('stroke', axisColor);
    svg3.selectAll('line').transition().duration(500).style('stroke', axisColor);
    svg3.selectAll('text').transition().duration(500).style('fill', axisColor);
}