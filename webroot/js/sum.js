var svg4 = d3.select('#group4')
    .append("svg")
    .attr("id", "svg4")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(120," + (height / 2) + ")");

var sumTotalLabel = svg4.append("text")
    .attr("id","total-sum-pie")
    .style("font-size", "80px");

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

    sumTotalLabel.text(sumValue);
    sumTotalLabel.style("fill", axisColor);
}