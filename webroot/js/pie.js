var pie1 = d3.pie()
    .value(function(d) { return d.sum; })
    .sort(null);

var arc1 = d3.arc()
    .innerRadius(radius - 20)
    .outerRadius(radius - 40)
    .cornerRadius(4);

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
    .x(function(d) { return arc1.centroid(d)[0]; })
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
    .duration(transitionDuration)
    .ease(transitionEasing)
    .style("stroke-opacity", 1)
    .attrTween("stroke-dasharray", function() {
        var len = this.getTotalLength();
        return function(t) { return (d3.interpolateString("0," + len, len + ",0"))(t) };
    });

var path1 = svg1.datum(dataBars).append("g").attr("id","gpie").selectAll("path")
    .data(pie1)
    .enter().append("path")
    .attr("id", function(d) { return "path_" + d.data.idx })
    .attr("class", "pie-parts")
    .on("mouseover", function(d) {
        piggySelection('on', d.data, d.data.idx);
    })
    .on("mouseout", function(d) {
        piggySelection('off', d.data, d.data.idx);
    })
    .attr("fill", function(d) { return coinColors[d.data.idx] ? coinColors[d.data.idx] : fallbackColor; })
    .attr("stroke-width", 4)
    .attr("stroke", colors.background)
    .attr("d", arc1)
    .each(function(d) { this._current = d; });

svg1.append("text")
    .attr("id","percent")
    .attr("transform", "translate(0,10)")
    .attr("text-anchor", "middle")
    .style("fill", colors.headerFont)
    .style("font-size", '8vh')
    .style("opacity", 0);


/**
 *
 * @param result
 */
function updatePie(result) {
    var newData = [];
    result.forEach(function(row) {
        if (row.type !== 'virtual') {
            row.idx = coinIndex[row.amount];
            newData.push(row);
        }
    });

    var data = newData.map(function(d) { return d; }); // ??????

    svg1.datum(data).select("#gpie").selectAll("path").data(pie1);
    pie1.value(function(d) { return d.calculatedTotal; });

    path1.data(pie1)
        .transition()
        .duration(transitionDuration)
        .ease(transitionEasing)
        .attr("id", function(d) { return "path_" + d.data.idx })
        .attr("fill", function(d) { return coinColors[d.data.idx] ? coinColors[d.data.idx] : fallbackColor; })
        .style('stroke',  colors.background)
        .attrTween("d", arcTween);
}

/**
 *
 * @param a
 * @returns {Function}
 */
function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
        return arc1(i(t));
    };
}

