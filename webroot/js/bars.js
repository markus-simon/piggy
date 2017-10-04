
var types   = dataBars.map(function(d) { if (d.type !== 'virtual') { return d.amount; }});
var sum = dataBars.map(function(d) { return d.sum; });

var x = d3.scalePoint()
    .domain(types)
    .range([40, width - 40]).padding(0.9);

var y = d3.scaleLinear()
    .domain([0, d3.max(sum, function(d) { return d; })])
    .range([height - 50, 25]);

var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

var svg2 = d3.select('#group2')
    .append("svg")
    .attr("id", "svg2")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(0,0)");


var defs = d3.select("#svg2").append("defs");



var filter = defs.append("filter")
    .attr("id", "glow");

filter.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 2.5)
    .attr("result", "coloredBlur");
filter.append("feOffset")
    .attr("in", "coloredBlur")
    .attr("dx", 2)
    .attr("dy", 2)
    .attr("result", "offsetBlur");

var feMerge = filter.append("feMerge");

feMerge.append("feMergeNode")
    .attr("in", "coloredBlur");
feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");


var bar = svg2.selectAll(".rect")
    .data(dataBars)
    .enter().append("g");

bar.append("rect")
    .attr("x", function(d) { return x(d.amount) + 15; })
    .attr("width", 50)
    .attr("y", function(d) { return y(d.sum); })
    .attr("height", function(d) { return height - 50 - y(d.amount); })
    .attr("filter", "url(#glow)")
    .style("fill", function(d, i) { return color(i); });

svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(40," + (height - 50) + ")")
    .call(xAxis)
    .append("text")
    .attr("x", width - margin.right - 80)
    .attr("dy", "-5px")
    .attr("fill", "#000")
    .text("Type");


svg2.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(80, 0)")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("x", -15)
    .attr("dy", "0.71em")
    .attr("fill", "#000")
    .text("Menge");




function updateBars(result) {
    var newData = [];
    result.forEach(function(row) {
        if (row.type !== 'virtual') {
            newData.push(row);
        }
    });

    var realTypes = newData.map(function(d) { return d.amount; });
    var height = window.innerHeight / 2;


    var x = d3.scalePoint()
        .domain(realTypes)
        .range([40, width - 40]).padding(0.9);

    var xAxis = d3.axisBottom(x);

    var y = d3.scaleLinear()
        .domain([0, d3.max(newData, function(d) { return d.sum })])
        .range([height - 50, 25]);


    var yAxis = d3.axisLeft(y);

    var chart = d3.select('#group2').select("g");

    chart.selectAll("rect")
        .data(newData)
        .transition()
        .duration(750)
        .attr("x", function(d) { return x(d.amount) + 15; })
        .attr("y", function(d) { return y(d.sum); })
        .attr("height", function(d) { return height - y(d.sum) -50; })
        .style("fill", function(d, i) { return color(i); });

    chart.transition().select(".x.axis")
        .duration(750)
        .call(xAxis);

    chart.transition().select(".y.axis")
        .duration(750)
        .call(yAxis);

    chart.selectAll('.domain').transition().duration(750).style('stroke', axisColor);
    chart.selectAll('line').transition().duration(750).style('stroke', axisColor);
    chart.selectAll('text').transition().duration(750).style('fill', axisColor);
}
