var types = dataBars.map(function (d) {
    if (d.amount >= 100) {
        return d.amount / 100 + '€';
    } else {
        return d.amount + "¢";
    }
});

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
    .enter()
    .append("rect")
    .attr("x", function(d, i) { return x(types[i]) - barWidth / 2; })
    .attr("width", barWidth)
    .attr("y", height - 25 )
    .attr("class", "bar")
    .attr("id", function(d) { return "bar_" + d.idx; })
    .attr("height", function(d) { return height - 25 - y(d.amount); })
    .attr("fill", function(d) { return coinColors[d.idx] ? coinColors[d.idx] : fallbackColor; })
    .on("mouseover", function(d) {
        piggySelection('on', d, d.idx);
    })
    .on("mouseout", function(d) {
        piggySelection('off', d, d.idx);
    });

var axisX = svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height - 25) + ")")
    .call(xAxis);

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


/**
 *
 * @type {{update: bars.update}}
 */
var bars = {
    init: function(result) {

    },
    update: function(result) {
        var newData = [];
        result.forEach(function (row) {
            if (row.type !== 'virtual') {
                row.idx = coinIndex[row.amount];
                newData.push(row);
            }
        });

        var realTypes = newData.map(function (d) {
            if (d.amount >= 100) {
                return d.amount / 100 + '€';
            } else {
                return d.amount + "¢";
            }
        });

        x.domain(realTypes);
        y.domain([0, d3.max(newData, function (d) { return d.calculatedTotal })]);

        bar.data(newData)
            .on("mouseover", function (d) {
                piggySelection('on', d, d.idx);
            })
            .on("mouseout", function (d) {
                piggySelection('off', d, d.idx);
            })
            .transition()
            .duration(transitionDuration)
            .ease(transitionEasing)
            .attr("id", function (d) { return "bar_" + d.idx; })
            .attr("class", "bar")
            .attr("x", function (d, i) { return x(realTypes[i]) - barWidth / 2; })
            .attr("y", function (d) { return y(d.calculatedTotal); })
            .attr("width", barWidth)
            .attr("height", function (d) { return height - y(d.calculatedTotal) - 25; })
            .attr("fill", function (d) { return coinColors[d.idx] ? coinColors[d.idx] : fallbackColor; });

        axisX.transition()
            .duration(transitionDuration)
            .ease(transitionEasing)
            .call(xAxis);

        axisY.transition()
            .duration(transitionDuration)
            .ease(transitionEasing)
            .call(yAxis);

        axisYText.text(config['calculation-base']);

        d3.selectAll('line').transition().duration(transitionDuration).style('stroke', colors.axis);
        d3.selectAll('.domain').transition().duration(transitionDuration).style('stroke', colors.axis);
        d3.select('#svg2').selectAll('text').transition().duration(transitionDuration).style('fill', colors.axis);
        d3.selectAll(".tick").selectAll("line").attr("opacity", 0.1);
    }
};
