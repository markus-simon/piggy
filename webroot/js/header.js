var svgHeader = d3.select('#header')
    .append("svg")
    .attr("id", "svgHeader")
    .attr("width", (window.innerWidth))
    .attr("height", headerHeight)
    .style("background", headerColor);

var piggyLabel = svgHeader.append("text")
    .attr("transform", "translate(110," + ($('#header').outerHeight() / 1.5) + ")")
    .attr("class","header-text")
    .style("fill", headerColor)
    .style("font-size", headerFontSize)
    .text('Piggy');

var sumTotalLabel = svgHeader.append("text")
    .attr("id","total-sum-pie")
    .attr("class","header-text")
    .attr("transform", "translate(" + (window.innerWidth - 20) + "," + ($('#header').outerHeight() / 1.5) + ")")
    .attr("text-anchor", "end")
    .style("fill", headerColor)
    .style("font-size", headerFontSize);

function updateHeader(result) {
    var sumTotal = 0;

    console.log(result);
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
    piggyLabel.transition().duration(500).style('fill', headerFontColor);
    sumTotalLabel.transition().duration(500).style('fill', headerFontColor);
    svgHeader.transition().duration(500).style("background", headerColor);
}