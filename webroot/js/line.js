var n = 40;
var random = d3.randomUniform(0, 0);
var deta = d3.range(n).map(random);

var duration = 1000;
var now = new Date(Date.now() - duration);

var x = d3.scaleLinear()
    .domain([0, n - 1])
    .range([0, width * 2 - 25]);

var xTime = d3.scaleTime()
    .domain([now - (n - 2) * duration, now - duration])
    .range([0, width * 2 - 75]);

var xAxis = d3.axisBottom(xTime)
    .ticks((width + 2) / (height + 2) * 10)
    .tickSize(height)
    .tickPadding(8 - height);

var y = d3.scaleLinear()
    .domain([0, 0])
    .range([height, 25]);

var line = d3.line().curve(d3.curveBasis)
    .x(function(d, i) { return x(i); })
    .y(function(d) { return y(d); });

var zoom = d3.zoom()
    .scaleExtent([1, 40])
    .translateExtent([[-100, -100], [width + 90, height + 100]])
    .on("zoom", zoomed);

function zoomed() {
    axisX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
}

var svg3 = d3.select('#group3')
    .append("svg")
    .attr("id", "svg3")
    .attr("width", width * 2 - 25)
    .attr("height", height)
/*    .append("g")
    .attr("transform", "translate(0,0)");*/

svg3.call(zoom);

var axisX = svg3.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(25," + (height - 25) + ")")
    .call(d3.axisBottom(xTime));

axisX.append("text")
    .attr("x", (width * 2))
    .attr("dy", "-25px")
    .text("Datum");

var axisY = svg3.append("g")
    .attr("class", "axis axis--y")
    .attr("transform", "translate(25, 0)")
    .call(d3.axisLeft(y));

axisY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("x", -15)
    .attr("dy", "0.71em")
    .text("Menge");

svg3.append("g").append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("transform", "translate(25,0)")
    .attr("width", width * 2 - 25)
    .attr("height", height - 25);

svg3.append("g")
    .attr("id", "clippath")
    .attr("clip-path", "url(#clip)")
    .style("stroke", lineColor)
    .append("path")
    .datum(deta)
    .attr("class", "line")
    .style("stroke-width","1px")
    .style("fill","none")
    .transition()
    .duration(1000)
    .ease(d3.easeLinear)
    .on("start", tick);


var sumTotal = 0;
function tick() {
    deta.push(sumTotal/100);
    d3.select(this)
        .attr("d", line)
        .attr("transform", null);

    now = new Date(Date.now() - duration);
    xTime.domain([now - (n - 2) * duration, now - duration]);
    axisX.transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .call(d3.axisBottom(xTime));

    d3.active(this)
        .attr("transform", "translate(" + x(-1) + ",0)")
        .transition()
        .duration(1000)
        .on("start", tick);
    deta.shift();
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