var svg4 = d3.select('#group4')
    .append("svg")
    .attr("id", "svg4")
    .attr("width", ((width * 2) - 300))
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(0," + (($("#header")[0].clientHeight)/2) + ")");

var sumTotalLabel = svg4.append("text")
    .attr("id","total-sum-pie")
    .attr("alignment-baseline", "central")
    .style("font-size", "7vh");

function updateSum(result) {
    var sumTotal = 0;

    // TODO sumTotal weiter nach "vorne" verschieben ...
    result.forEach(function(row) {
        sumTotal += row.sumTotal;
    });

    var calculatedTotalSum = sumTotal / 100;
    var sumValue = calculatedTotalSum.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        style: 'currency',
        currency: 'EUR'
    });

    sumTotalLabel.text(sumValue); // axisColor
    sumTotalLabel.style("fill", '#fff');
}