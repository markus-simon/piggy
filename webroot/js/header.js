var svgHeader = d3.select('#header')
    .append("svg")
    .attr("id", "svgHeader")
    .attr("width", ((width * 2)))
    .attr("height", headerHeight)
    .style("background", headerColor);

var piggyLabel = svgHeader.append("text")
    .attr("transform", "translate(20," + 70 +")")
    .attr("class","header-text")
    .style("fill", headerColor)
    .style("font-size", headerFontSize)
    .text('Piggy');

var sumTotalLabel = svgHeader.append("text")
    .attr("id","total-sum-pie")
    .attr("class","header-text")
    .attr("transform", "translate(" + (width * 2 - 20) + "," + 70 +")")
    .attr("text-anchor", "end")
    .style("fill", headerColor)
    .style("font-size", headerFontSize);

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
    piggyLabel.transition().duration(500).style('fill', headerFontColor);
    sumTotalLabel.transition().duration(500).style('fill', headerFontColor);
    sumTotalLabel.text(sumValue);
}