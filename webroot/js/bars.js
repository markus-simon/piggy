
var types   = dataBars.map(function(d) { return d.type; });
var amounts = dataBars.map(function(d) { return d.amount; });

var x = d3.scalePoint()
    .domain(types)
    .range([40, width - 40]).padding(0.9);

var y = d3.scaleLinear()
    .domain([0, d3.max(amounts, function(d) { return d; })])
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



/*

var defs = d3.select("body").append("defs");

var filter = defs.append("filter")
    .attr("id", "dropshadow");

filter.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 4)
    .attr("result", "blur");
filter.append("feOffset")
    .attr("in", "blur")
    .attr("dx", 2)
    .attr("dy", 2)
    .attr("result", "offsetBlur");

var feMerge = filter.append("feMerge");

feMerge.append("feMergeNode")
    .attr("in", "offsetBlur");
feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");



*/

var defs = d3.select("#svg2").append("defs");

var filter = defs.append("filter")
    .attr("id", "dropshadow");

filter.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 4)
    .attr("result", "blur");
filter.append("feOffset")
    .attr("in", "blur")
    .attr("dx", 2)
    .attr("dy", 2)
    .attr("result", "offsetBlur");

var feMerge = filter.append("feMerge");

feMerge.append("feMergeNode")
    .attr("in", "offsetBlur");
feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");



svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(40," + (height - 50) + ")")
    .attr("filter", "url(#dropshadow)")
    .call(xAxis)
    .append("text")
    .attr("x", width - margin.right)
    .attr("dy", "-5px")
    .attr("fill", "#000")
    .text("Type");


svg2.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(80, 0)")
    .attr("filter", "url(#dropshadow)")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("x", -15)
    .attr("dy", "0.71em")
    .attr("fill", "#000")
    .text("Menge");


var bar = svg2.selectAll(".rect")
    .data(dataBars)
    .enter().append("g");

bar.append("rect")
    .attr("x", function(d) { return x(d.type) + 15; })
    .attr("width", 50)
    .attr("y", function(d) { return y(d.amount); })
    .attr("height", function(d) { return height - 50 - y(d.amount); })
    .attr("filter", "url(#dropshadow)")
    .style("fill", function(d, i) { return color(i); });






function updateBars(data) {

    var height = window.innerHeight / 2;

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.amount })])
        .range([height - 50, 25]);


    var yAxis = d3.axisLeft(y);

    var chart = d3.select('#group2').select("g");

    chart.selectAll("rect")
        .data(data)
        .transition()
        .duration(750)
        .attr("y", function(d) { return y(d.amount); })
        .attr("height", function(d) { return height - y(d.amount) -50; });

    chart.transition().select(".y.axis")
        .duration(750)
        .call(yAxis);
}
