




/*var deta = [
    { message_created_at: new Date(2014, 0, 2), amount: 0       },
    { message_created_at: new Date(2015, 0, 2), amount: 1623.27 },
    { message_created_at: new Date(2016, 0, 2), amount: 1268     },
    { message_created_at: new Date(2017, 0, 2), amount: 4587.55 },
    { message_created_at: new Date(2018, 0, 2), amount: 7587.55 },
    { message_created_at: new Date(2019, 0, 2), amount: 84587.55 },
    { message_created_at: new Date(2020, 0, 2), amount: 9587.55 },
    { message_created_at: new Date(2021, 0, 2), amount: 11587.55 },
    { message_created_at: new Date(2022, 0, 2), amount: 14587.55 }
];*/

n = 40;
//var random = d3.randomNormal(0, .2);
var random = d3.randomUniform(0, 0);
var deta = d3.range(n).map(random);

var duration = 500;
var now = new Date(Date.now() - duration);

var x = d3.scaleLinear()
    .domain([0, n - 1])
    .range([0, width + 20]);

var xAxis = d3.scaleTime()
    .domain([now - (n - 2) * duration, now - duration])
    .range([0, width]);

var y = d3.scaleLinear()
    .domain([0, 0])
    .range([height, 0]);

var line = d3.line().curve(d3.curveBasis)
    .x(function(d, i) { return x(i); })
    .y(function(d) { return y(d); });

var svg3 = d3.select('#group3')
    .append("svg")
    .attr("id", "svg3")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(0,0)");

var axisX = svg3.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(50," + (height - 30) + ")")
    .call(d3.axisBottom(xAxis));

axisX.append("text")
    .attr("x", (width - margin.right))
    .attr("dy", "-25px")
    .text("Datum");

var axisY = svg3.append("g")
    .attr("class", "axis axis--y")
    .attr("transform", "translate(50, 45)")
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
    .attr("transform", "translate(50,0)")
    .attr("width", width)
    .attr("height", height + 50);

svg3.append("g")
    .attr("id", "clippath")
    .attr("clip-path", "url(#clip)")
    .attr("transform", "translate(0,46)")
    .style("stroke", lineColor)
    .append("path")
    .datum(deta)
    .attr("class", "line")
    .style("stroke-width","1px")
    .style("fill","none")
    .transition()
    .duration(500)
    .ease(d3.easeLinear)
    .on("start", tick);

var sumTotal = 0;
function tick() {
    deta.push(sumTotal/100);
    d3.select(this)
        .attr("d", line)
        .attr("transform", null);
    d3.active(this)
        .attr("transform", "translate(" + x(-1) + ",0)")
        .transition()
        .duration(500)
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
        .range([height - 75, 0]);

    //random = d3.randomNormal(0, sumTotal/400 );
    random = d3.randomUniform(1, sumTotal/100);

    axisY.transition()
        .duration(500)
        .call(d3.axisLeft(y));

    d3.select('#clippath').style("stroke",lineColor);
    svg3.selectAll('.domain').transition().duration(500).style('stroke', axisColor);
    svg3.selectAll('line').transition().duration(500).style('stroke', axisColor);
    svg3.selectAll('text').transition().duration(500).style('fill', axisColor);
}