
var types   = dataBars.map(function(d) { if (d.type !== 'virtual') { return d.amount; }});
var sum = dataBars.map(function(d) { return d.sum; });

var x = d3.scalePoint()
    .domain(types)
    .range([40, width - 40]).padding(0.9);

var y = d3.scaleLinear()
    .domain([0, d3.max(sum, function(d) { return d; })])
    .range([height - 25, 25]);

var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

var svg2 = d3.select('#group2')
    .append("svg")
    .attr("id", "svg2")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(0,0)");

var bar = svg2.selectAll(".rect")
    .data(dataBars)
    .enter().append("g");

bar.append("rect")
    .attr("x", function(d) { return x(d.amount) - barWidth / 2; })
    .attr("width", barWidth)
    .attr("y", function(d) { return y(d.sum); })
    .attr("class","bar")
    .attr("height", function(d) { return height - 25 - y(d.amount); })
    .style("fill", function(d, i) { return color(i); })
    .on("mouseover", function() {
        d3.selectAll(".bar").style("opacity", "0.3");
        d3.select(this).style("opacity", "1");
    })
    .on("mouseout", function() {
        d3.selectAll(".bar").style("opacity", "1");
    });

svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height - 25) + ")")
    .call(xAxis)
    .append("text")
    .attr("x", width - margin.right - 80)
    .attr("dy", "-5px")
    .attr("fill", "#000")
    .text("Type");


svg2.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(40, 0)")
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

    var x = d3.scalePoint()
        .domain(realTypes)
        .range([40, width - 40]).padding(0.9);

    var xAxis = d3.axisBottom(x);

    var y = d3.scaleLinear()
        .domain([0, d3.max(newData, function(d) { return d.sum })])
        .range([height - 25, 25]);


    var yAxis = d3.axisLeft(y);

    var chart = d3.select('#group2').select("g");

    chart.selectAll("rect")
        .data(newData)
        .transition()
        .duration(1000)
        .ease(d3.easeElastic)
        .attr("x", function(d) { return x(d.amount) - barWidth / 2; })
        .attr("y", function(d) { return y(d.sum); })
        .attr("height", function(d) { return height - y(d.sum) - 25; })
        .style("fill", function(d, i) { return color(i); });

    chart.transition().select(".x.axis")
        .duration(1000)
        .ease(d3.easeElastic)
        .call(xAxis);

    chart.transition().select(".y.axis")
        .duration(1000)
        .ease(d3.easeElastic)
        .call(yAxis);

    chart.selectAll('.domain').transition().duration(500).style('stroke', axisColor);
    chart.selectAll('line').transition().duration(500).style('stroke', axisColor);
    chart.selectAll('text').transition().duration(500).style('fill', axisColor);
}
