
var types   = dataBars.map(function(d) { if (d.type !== 'virtual') { return d.amount; }});

var x = d3.scalePoint()
    .domain(types)
    .range([40, width - 40]).padding(0.9);

var y = d3.scaleLinear()
    .domain([0,0])
    .range([height - 25, 25]);

var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y).ticks(10, ",f").tickSizeInner(-width  + 65);

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
    .attr("y", function(d) { return y(d.sumTotal  / 100 ); })
    .attr("class","bar")
    .attr("id", function(d, i) { return "bar_" + i })
    .attr("height", function(d) { return height - 25 - y(d.amount); })
    .style("fill", function(d, i) { return color(i); })
    .on("mouseover", function(d, i) {
        piggySelection('on', d, i);
    })
    .on("mouseout", function(d, i) {
        piggySelection('off', d, i);
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

var axisY = svg2.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(40, 0)")
    .call(yAxis);

var axisYText = axisY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("x", -15)
    .attr("dy", "0.71em")
    .attr("fill", "#000");

function updateBars(result) {
    var newData = [];
    result.forEach(function (row) {
        if (row.type !== 'virtual') {
            newData.push(row);
        }
    });

    var realTypes = newData.map(function (d) {
        return d.amount;
    });

    var x = d3.scalePoint()
        .domain(realTypes)
        .range([40, width - 40]).padding(0.9);

    y.domain([0, d3.max(newData, function (d) {
        return d.calculatedTotal
    })]);

    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y).ticks(10, ",f").tickSizeInner(-width + 65);

    var chart = d3.select('#group2').select("g");

    chart.selectAll("rect")
        .data(newData)
        .transition()
        .duration(transitionDuration)
        .ease(transitionEasing)
        .delay(function (d, i) {
            return 30 * i
        })
        .attr("x", function (d) {
            return x(d.amount) - barWidth / 2;
        })
        .attr("y", function (d) {
            return y(d.calculatedTotal);
        })
        .attr("height", function (d) {
            return height - y(d.calculatedTotal) - 25;
        })
        .style("fill", function (d, i) {
            return color(i);
        });

    chart.transition().select(".x.axis")
        .duration(transitionDuration)
        .ease(transitionEasing)
        .call(xAxis);

    chart.transition().select(".y.axis")
        .duration(transitionDuration)
        .ease(transitionEasing)
        .call(yAxis);

    axisYText.text(config['calculation-base']);

    chart.selectAll('.domain').transition().duration(transitionDuration).style('stroke', colors.axis);
    chart.selectAll('line').transition().duration(transitionDuration).style('stroke', colors.axis);
    chart.selectAll('text').transition().duration(transitionDuration).style('fill', colors.axis);
}