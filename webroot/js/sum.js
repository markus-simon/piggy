
var svg4 = d3.select('#group4')
    .append("svg")
    .attr("id", "svg4")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(120," + (height / 2) + ")");

var sumTotalLabel = svg4.append("text")
    .attr("id","total-sum-pie")
    .style("font-size", "80px")
/*    .style("text-anchor", "middle")
    .style("alignment-baseline", "central");*/


function updateSum(result) {
    var totalSum = 0;
    result.forEach(function(row) {
        totalSum += row.amount * row.type;
    });

    var calculatedTotalSum = totalSum / 100;
    var value = calculatedTotalSum.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        style: 'currency',
        currency: 'EUR'
    });

    sumTotalLabel.text(value);
}