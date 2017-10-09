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
    .attr("transform", "translate(" + (window.innerWidth - 300) + "," + ($('#header').outerHeight() / 1.5) + ")")
    .attr("text-anchor", "end")
    .style("fill", headerColor)
    .style("font-size", headerFontSize);

var sumTotalLabel = svgHeader.append("text")
    .attr("id","total-sum-pie")
    .attr("class","header-text")
    .attr("transform", "translate(" + (window.innerWidth - 20) + "," + ($('#header').outerHeight() / 1.5) + ")")
    .attr("text-anchor", "end")
    .style("fill", headerColor)
    .style("font-size", headerFontSize);

function updateHeader(result) {
    var sumTotal    = 0;
    var weightTotal = 0;

    // TODO sumTotal weiter nach "vorne" verschieben ...
    result.forEach(function(row) {
        sumTotal += row.sumTotal;
        switch (row.amount) {
            case 1:
                weightTotal += row.sum * 2.3;
                break;
            case 2:
                weightTotal += row.sum * 3.06;
                break;
            case 5:
                weightTotal += row.sum * 3.92;
                break;
            case 10:
                weightTotal += row.sum * 4.1;
                break;
            case 20:
                weightTotal += row.sum * 5.74;
                break;
            case 50:
                weightTotal += row.sum * 7.8;
                break;
            case 100:
                weightTotal += row.sum * 7.5;
                break;
            case 200:
                weightTotal += row.sum * 8.5;
                break;
        }
    });
    var calculatedTotalSum = sumTotal / 100;
    var sumValue = calculatedTotalSum.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        style: 'currency',
        currency: 'EUR'
    });
    sumTotalLabel.text(sumValue);

    var calculatedTotalWeight = weightTotal / 1000;
    weightTotalLabel.text(calculatedTotalWeight.toFixed(4) + ' kg');

    piggyLabel.transition().duration(500).style('fill', headerFontColor);
    sumTotalLabel.transition().duration(500).style('fill', headerFontColor);
    weightTotalLabel.transition().duration(500).style('fill', headerFontColor);
    svgHeader.transition().duration(500).style("background", headerColor);
}