var render = function(data) {
    var margin = {top: 5, right: 5, bottom: 5, left: 0};
    var width  = window.innerWidth / 2;
    var height = window.innerHeight / 2;

/*
    var radius   = Math.min(width, height) / 2;

    /!*    var dataPie = [
            { goal:"Teddy",        done:75, todo:25  },
            { goal:"Führerschein", done:0,  todo:100 }
        ];*!/

    var data2 = [75,25];



    var pie = d3.pie()
        .sort(null)
        .value(function(d) { return d });

    var path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(-0);

    var svg1 = d3.select("#group1")
        .append("svg")
        .attr("id", "svg1")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");

    var arc = svg1.selectAll(".arc")
        .data(pie(data2))
        .enter().append("g")
        .attr("class", "arc")
        .style("fill", "steelblue");


    arc.append("path")
        .attr("d", path)
        .attr("stroke-width", 1)
        .attr("stroke", "#000");



*/










    // BARS #############################################

    var dataBars = data;

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
        .text("Amount");

    var bar = svg2.selectAll(".rect")
        .data(dataBars)
        .enter().append("g");


    bar.append("rect")
        .style("fill", "steelblue")
        .attr("x", function(d) { return x(d.type) + 15; })
        .attr("width", 50)
        .attr("y", function(d) { return y(d.amount); })
        .attr("height", function(d) { return height - 50 - y(d.amount); });









/*

    var dataLine = [
        { date: 0, amount: 0       },
        { date: 1, amount: 1623.27 },
        { date: 2, amount: 126     },
        { date: 3, amount: 4587.55 }
    ];

    var deta = [
        {date: 0, amount: 0}
    ];
    for (var i = 1; i < 10; i++) {
        deta.push({
            date: i,
            amount: Math.random() * 10 + i
        });
    }

    var xLine = d3.scaleLinear()
        .domain(d3.extent(deta, function(d) { return d.date; }))
        .range([40, width * 2 - 25]);

    var yLine = d3.scaleLinear()
        .domain([d3.min(deta, function(d) { return d.amount; }), d3.max(deta, function(d) { return d.amount; })])
        .range([height - 75, 25]);


    var xAxisLine = d3.axisBottom(xLine);
    var yAxisLine = d3.axisLeft(yLine);









    var valueline = d3.line().curve(d3.curveMonotoneX)
        .x(function(d) { return xLine(d.date); })
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
        .attr("transform", "translate(40, 0)")
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

    svg3.append("rect")
        .attr("id","scroller-container")
        .attr("x", 40)
        .attr("y", height - 30)
        .attr("width", xLine(d3.max(deta, function(d) { return d.date; })) - 40)
        .attr("height", 20)
        .attr("stroke", "black")
        .style("fill", "white");

    var scroller = svg3.append("rect")
        .attr("x", d3.select("#scroller-container").attr("x") + 4)
        .attr("y", height - 26)
        .attr("width", xLine(d3.max(deta, function(d) { return d.date; })) - 48)
        .attr("height", 12)
        .attr("stroke", "black")
        .style("fill", "steelblue")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    /!*
        var scrollerStart = svg3.append("rect")
            .attr("id", "scroller-start")
            .attr("x", d3.select("#scroller-container").attr("x") + 4)
            .attr("y", height - 26)
            .attr("width", 10)
            .attr("height", 12)
            .attr("stroke", "black")
            .style("fill", "black")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        var scrollerEnd = svg3.append("rect")
            .attr("id", "scroller-end")
            .attr("x", xLine(d3.max(deta, function(d) { return d.date; })) - 16)
            .attr("y", height - 26)
            .attr("width", 10)
            .attr("height", 12)
            .attr("stroke", "black")
            .style("fill", "black")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
    *!/

    function dragstarted(d) {
        d3.select(this).raise().classed("active", true);
    }

    function dragged(d) {
        if (checkBoundary(this.id, d3.event.x)) {

            d3.select(this)
                .attr("x", d3.event.x);
            if(this.id === "scroller-start") {
                scroller.attr("x", d3.event.x);
                scroller.attr("width", d3.select("#scroller-end").attr("x") - d3.event.x);

            } else if(this.id === "scroller-end") {
                scroller.attr("width", d3.event.x - d3.select("#scroller-start").attr("x"));
            }

            xLine.domain(d3.select("#scroller-start").attr("x"), d3.select("#scroller-end").attr("x") - d3.event.x);
            svg3.transition().select(".x.axis")
                .duration(750)
                .call(xAxisLine);
        }
    }

    function dragended(d) {
        d3.select(this).classed("active", false);
    }

    function checkBoundary(id, x) {
        /!*        if (id === "scroller-start") {
                    if (x < 44 || x > d3.select("#scroller-end").attr("x")) {
                        return false;
                    }
                }
                if (id === "scroller-end") {
                    if (x > 1084/!* || x < d3.select("#scroller-start").attr("x")*!/) {
                        return false;
                    }
                }*!/
        return true;
    }*/
};



var updateBars = function(data) {

    console.log(data);

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
};