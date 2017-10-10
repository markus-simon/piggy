var pie1 = d3.pie()
    .value(function(d) { return d; })
    .sort(null);

var arc1 = d3.arc()
    .innerRadius(radius - 70)
    .outerRadius(radius - 100)
    .cornerRadius(1);

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
    .attr("class", "pie-parts")
    .on("mouseover", function(d, i) {
        d3.selectAll('.bar').transition().style('opacity', function() {
            return (this.id === 'bar_' + i) ? 1 : .1;
        });
        d3.select("#path_" + i)
            .transition()
            .duration(1000)
            .ease(d3.easeElastic)
            .attr("d", arc1.innerRadius(radius - 40).outerRadius(radius - 120).cornerRadius(8))
    })
    .on("mouseout", function(d, i) {
        d3.selectAll(".bar").transition().style("opacity", "1");
        d3.select("#path_" + i)
            .transition()
            .duration(1000)
            .ease(d3.easeElastic)
            .attr("d", arc1.innerRadius(radius - 70).outerRadius(radius - 100).cornerRadius(1));
    })

    .attr("fill", function(d, i) { return color(i); })
    .attr("stroke-width", 4)
    .attr("stroke", backgroundColor)
    .attr("d", arc1)
    .each(function(d) { this._current = d; });





function updatePie(result) {

    var newData = [];
    result.forEach(function(row) {
        if (row.type !== 'virtual') {
            newData.push(row);
        }
    });

    var data = newData.map(function(d) { return d.sum; });

    svg1.datum(data).select("#gpie").selectAll("path").data(pie1);
    pie1.value(function(d) { return d; });

    path1.data(pie1)
        .transition()
        .duration(1000)
        .ease(d3.easeElastic)
        .style("fill", function(d, i) { return color(i); })
        .style('stroke', backgroundColor)

/*    .on("mouseout", function() {
        arc1.innerRadius(radius - 100)
            .outerRadius(radius - 20);
    })*/
        .attrTween("d", arcTween);

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

