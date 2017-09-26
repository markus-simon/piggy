var radius   = Math.min(width, height) / 2;

var pie1 = d3.pie()
    .value(function(d) { return d; })
    .sort(null);

var arc1 = d3.arc()
    .innerRadius(radius - 100)
    .outerRadius(radius - 20)
    .cornerRadius(8);

var svg1 = d3.select("#group1")
    .append("svg")
    .attr("id", "svg1")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + (width/2) + "," + radius + ")");

var lineGenerator = d3.line().curve(d3.curveCardinal);

var pathData = lineGenerator([
    [0,0] ,
    [50, 150],
    [200, 200]
]);

/*var line1 = svg1.datum(dataBars).selectAll("line")
    .data(pie1)
    .enter().append("line")
    .attr("x1", function(d) { return arc1.centroid(d)[0]; })
    .attr("y1", function(d) { return arc1.centroid(d)[1]; })
    .attr("x2", height)
    .attr("y2", function(d, i) { return (i * 40 - 110)})
    .attr("class","line")
    .attr("stroke", function(d, i) { return color(i); })
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0);*/

var valueline1 = d3.line().curve(d3.curveCatmullRom)
    .x(function(d) { console.log(d); return arc1.centroid(d)[0]; })
    .y(function(d) { return arc1.centroid(d)[1]; });

var path2 = svg1.datum(dataBars).append("g").attr("id","glabel").selectAll("path")
    .data(pie1)
    .enter().append("path")
    .attr('d', function(d) { return valueline1(d) })
    .attr("stroke", "red")
    .attr("stroke-width", 1)
    .attr("fill", "none")
    .style("stroke-opacity", 0)
    .transition()
    .duration(750)
    .ease(d3.easeSin)
    .style("stroke-opacity", 1)
    .attrTween("stroke-dasharray", function() {
        var len = this.getTotalLength();
        return function(t) { return (d3.interpolateString("0," + len, len + ",0"))(t) };
    });



var path1 = svg1.datum(dataBars).append("g").attr("id","gpie").selectAll("path")
    .data(pie1)
    .enter().append("path")
    .attr("id", function(d, i) { return "path_" + i })
    .attr("fill", function(d, i) { return color(i); })
    .attr("stroke-width", 4)
    .attr("stroke", "#ffdddc")
    .attr("d", arc1)
    .each(function(d) { this._current = d; });



var sumTotalLabel = svg1.append("text")
    .attr("id","total-sum-pie")
    .attr("x",0)
    .attr("y",0)
    .style("font-size", "80px")
    .style("text-anchor", "middle")
    .style("alignment-baseline", "central");






function updatePie(result) {
    var data = result.map(function(d) { return d.amount; });

    svg1.datum(data).select("#gpie").selectAll("path").data(pie1);
    pie1.value(function(d) { return d; });
    path1.data(pie1)
        .transition()
        .duration(750)
        .attrTween("d", arcTween);

    var totalSum = 0;
    result.forEach(function(row) {
        totalSum += row.amount * row.type;
    });

    sumTotalLabel.text(totalSum);

    /*    line1.data(pie1)
            .transition()
            .duration(750)
            .attr("x1", function(d) { return arc1.centroid(d)[0]; })
            .attr("y1", function(d) { return arc1.centroid(d)[1]; })
            .attr("stroke-opacity", 1);*/

}


function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
        return arc1(i(t));
    };
}

