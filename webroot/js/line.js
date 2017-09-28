




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
random = d3.randomNormal(0, .2);
deta = d3.range(n).map(random);


/*var xAxisLine = d3.scaleTime()
    .domain([new Date(2014, 0, 2), new Date(2022, 1, 1)])
    .range([80, width * 2 - 50]);

var yAxisLine = d3.scaleLinear()
    .domain([d3.min(deta, function(d) { return d.amount; }), d3.max(deta, function(d) { return d.amount; })])
    .range([height - 75, 25]);*/

/*var xAxisLine = d3.axisBottom(xLine);
var yAxisLine = d3.axisLeft(yLine);*/

var x = d3.scaleLinear()
    .domain([0, n - 1])
    .range([0, width * 2 - 60]);
var y = d3.scaleLinear()
    .domain([0, 1])
    .range([height - 75, 0]);


var line = d3.line().curve(d3.curveBasis)
    .x(function(d, i) { return x(i); })
    .y(function(d, i) { return y(d); });

var svg3 = d3.select('#group3')
    .append("svg")
    .attr("id", "svg3")
    .attr("width", width * 2 - 100)
    .attr("height", height - 100)
    .append("g")
    .attr("transform", "translate(0,-100)");

svg3.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + (height - 100) + ")")
    .call(d3.axisBottom(x))
    .append("text")
    .attr("x", (width - margin.right - 100) * 2)
    .attr("dy", "-25px")
    .attr("fill", "black")
    .text("Datum");

svg3.append("g")
    .attr("class", "axis axis--y")
    .attr("transform", "translate(80, 99)")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("x", -15)
    .attr("dy", "0.71em")
    .attr("fill", "#000")
    .text("Menge");

svg3.append("g").append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width * 2)
    .attr("height", height);

svg3.append("g")
    .attr("clip-path", "url(#clip)")
    .append("path")
    .datum(deta)
    .attr("class", "line")
    .style("stroke","#000")
    .style("stroke-width","1px")
    .style("fill","none")
    .transition()
    .duration(500)
    .ease(d3.easeLinear)
    .on("start", tick);


function tick() {
    // Push a new data point onto the back.
    deta.push(random());
    // Redraw the line.
    d3.select(this)
        .attr("d", line)
        .attr("transform", null);
    // Slide it to the left.
    d3.active(this)
        .attr("transform", "translate(" + x(-1) + ",0)")
        .transition()
        .on("start", tick);
    // Pop the old data point off the front.
    deta.shift();
}