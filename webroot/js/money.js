var margin = {top: 5, right: 5, bottom: 5, left: 0};
var width  = window.innerWidth / 2;
var height = window.innerHeight / 2;

var color = d3.scaleOrdinal(["#ffacf6", "#d052d0", "#ff5fb8", "#ff00a5", "#6b486b", "#6b215c", "#3c1231"]);

var radius   = Math.min(width, height) / 2;



/*
var amounts = dataBars.map(function(d) { return d.amount; });
*/


var data = [300,25,88,12,56,19,99,112];




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
    .attr("transform", "translate(" + radius + "," + radius + ")");

var path1 = svg1.datum(data).selectAll("path")
    .data(pie1)
    .enter().append("path")
    .attr("id", function(d, i) { return "path_" + i })
    .attr("class", "pieces")
    .attr("fill", function(d, i) { return color(i); })
    .attr("stroke-width", 4)
    .attr("stroke", "#ffdddc")
    .attr("d", arc1)
    .each(function(d) { this._current = d; });














    // BARS #############################################

    var types   = dataBars.map(function(d) { return d.type; });
    var amounts = dataBars.map(function(d) { return d.amount; });

    var x = d3.scalePoint()
        .domain(types)
        .range([40, width - 40]).padding(0.9);

    var y = d3.scaleLinear()
        .domain([0, d3.max(amounts, function(d) { return d; })])
        .range([height - 50, 25]);

    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y);

    var svg2 = d3.select('#group2')
        .append("svg")
        .attr("id", "svg2")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(0,0)");

    svg2.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(40," + (height - 50) + ")")
        .call(xAxis)
        .append("text")
        .attr("x", width - margin.right)
        .attr("dy", "-5px")
        .attr("fill", "#000")
        .text("Type");

    svg2.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(80, 0)")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("x", -15)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("Menge");


    var bar = svg2.selectAll(".rect")
        .data(dataBars)
        .enter().append("g");

    bar.append("rect")
        .attr("x", function(d) { return x(d.type) + 15; })
        .attr("width", 50)
        .attr("y", function(d) { return y(d.amount); })
        .attr("height", function(d) { return height - 50 - y(d.amount); })
        .style("fill", function(d, i) { console.log(d);console.log(i);console.log(color(i));return color(i); });






    var deta = [
        { message_created_at: new Date(2014, 0, 2), amount: 0       },
        { message_created_at: new Date(2015, 0, 2), amount: 1623.27 },
        { message_created_at: new Date(2016, 0, 2), amount: 1268     },
        { message_created_at: new Date(2017, 0, 2), amount: 4587.55 },
        { message_created_at: new Date(2018, 0, 2), amount: 7587.55 },
        { message_created_at: new Date(2019, 0, 2), amount: 84587.55 },
        { message_created_at: new Date(2020, 0, 2), amount: 9587.55 },
        { message_created_at: new Date(2021, 0, 2), amount: 11587.55 },
        { message_created_at: new Date(2022, 0, 2), amount: 14587.55 }
    ];


    var xLine = d3.scaleTime()
        .domain([new Date(2014, 0, 2), new Date(2022, 1, 1)])
        .range([80, width * 2 - 50]);

    var yLine = d3.scaleLinear()
        .domain([d3.min(deta, function(d) { return d.amount; }), d3.max(deta, function(d) { return d.amount; })])
        .range([height - 75, 25]);


    var xAxisLine = d3.axisBottom(xLine);
    var yAxisLine = d3.axisLeft(yLine);


    var valueline = d3.line().curve(d3.curveMonotoneX)
        .x(function(d) { return xLine(d.message_created_at); })
        .y(function(d) { return yLine(d.amount); });

    var svg3 = d3.select('#group3')
        .append("svg")
        .attr("id", "svg3")
        .attr("width", width * 2)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(0,0)");

    svg3.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - 75) + ")")
        .call(xAxisLine)
        .append("text")
        .attr("x", (width - margin.right - 50) * 2)
        .attr("dy", "-5px")
        .attr("fill", "black")
        .text("Datum");

    svg3.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(80, 0)")
        .call(yAxisLine)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("x", -15)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("Menge");

    svg3.append("path")
        .data(deta)
        .attr("class", "line")
        .attr("x", "80")
        .attr("d", valueline(deta))
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .style("fill", "none");


function updateBars(data) {

    var height = window.innerHeight / 2;

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.amount })])
        .range([height - 50, 25]);


    var yAxis = d3.axisLeft(y);

    var chart = d3.select('#group2').select("g");

    chart.selectAll("rect")
        .data(data)
        .transition()
        .duration(750)
        .attr("y", function(d) { return y(d.amount); })
        .attr("height", function(d) { return height - y(d.amount) -50; });

    chart.transition().select(".y.axis")
        .duration(750)
        .call(yAxis);
}


function updatePie(data) {
    var data = data.map(function(d) { return d.amount; });

    svg1.datum(data).selectAll("path").data(pie1);
    pie1.value(function(d) { return d; });
    path1.data(pie1)
        .transition()
        .duration(750)
        .attrTween("d", arcTween);

}


function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
        return arc1(i(t));
    };
}
