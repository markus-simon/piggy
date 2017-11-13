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
 * @type {{updatePie: (function(*))}}
 */
var pie = {
    update: function(result) {
        var newData = [];
        result.forEach(function(row) {
            if (row.type !== 'virtual') {
                row.idx = coinIndex[row.amount];
                newData.push(row);
            }
        });

        svg1.datum(newData).select("#gpie").selectAll("path").data(pie1);
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
};

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

