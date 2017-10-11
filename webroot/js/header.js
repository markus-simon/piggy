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

var weightTotalLabel = svgHeader.append("text")
    .attr("id","total-weight")
    .attr("class","header-text")
    .attr("transform", "translate(" + (window.innerWidth - 310) + "," + ($('#header').outerHeight() / 1.5) + ")")
    .attr("text-anchor", "end")
    .style("fill", headerColor)
    .style("font-size", headerFontSize);

svgHeader.append("text")
    .text('kg')
    .attr("id","kg")
    .attr("transform", "translate(" + (window.innerWidth - 280) + "," + ($('#header').outerHeight() / 1.5) + ")")
    .attr("text-anchor", "end")
    .style("fill", headerFontColor)
    .style("font-size", '24px');

var sumTotalLabel = svgHeader.append("text")
    .attr("id","total-sum-pie")
    .attr("class","header-text")
    .attr("transform", "translate(" + (window.innerWidth - 30) + "," + ($('#header').outerHeight() / 1.5) + ")")
    .attr("text-anchor", "end")
    .style("fill", headerColor)
    .style("font-size", headerFontSize);

svgHeader.append("text")
    .html('&euro;')
    .attr("id","currency")
    .attr("transform", "translate(" + (window.innerWidth - 10) + "," + ($('#header').outerHeight() / 1.5) + ")")
    .attr("text-anchor", "end")
    .style("fill", headerFontColor)
    .style("font-size", '24px');


function updateHeader(result) {

    var sumTotal    = 0;
    var weightTotal = 0;

    result.forEach(function(row) {
        sumTotal += row.sumTotal;
        weightTotal += calculateWeight(row);
    });

    var calculatedTotalSum = sumTotal / 100;
    var calculatedTotalWeight = weightTotal;

    piggyLocal.set(sumTotalLabel, calculatedTotalSum);
    piggyLocal.set(weightTotalLabel, calculatedTotalWeight);

    var sumValue = calculatedTotalSum.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        style: 'currency',
        currency: 'EUR'
    });

    sumTotalLabel.text(formatCurrency(calculatedTotalSum));
    weightTotalLabel.text(formatWeight(calculatedTotalWeight));

    piggyLabel.transition().duration(500).style('fill', headerFontColor);
    sumTotalLabel.transition().duration(500).style('fill', headerFontColor);
    weightTotalLabel.transition().duration(500).style('fill', headerFontColor);
    svgHeader.transition().duration(500).style("background", headerColor);
}