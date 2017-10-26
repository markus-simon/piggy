var svgHeader = d3.select('#header')
    .append("svg")
    .attr("id", "svgHeader")
    .attr("width", (window.innerWidth))
    .attr("height", headerHeight)
    .style("background", headerColor);

var bla = headerHeight / 2;


var g = svgHeader.append('g')
    .attr('height', headerHeight)
    .attr('transform', 'translate(0, ' + bla + ')');

var begin = window.innerWidth - 40;

var euro = g.append("text")
    .html('&euro;')
    .attr("id","currency")
    .attr("x", begin )
    .attr('alignment-baseline', 'mathematical')
    .style("fill", headerFontColor)
    .style("font-size", headerFontSize / 1.4);

var sumTotalLabel = g.append("text")
    .attr("id","total-sum-pie")
    .attr("class","header-text")
    .attr('x', parseInt(euro._groups[0][0].getBBox().x) - headerFontSize / 4)
    .attr("text-anchor", "end")
    .attr('alignment-baseline', 'central')

.style("fill", headerColor)
    .style("font-size", headerFontSize);

var kgLabel = g.append("text")
    .text('kg')
    .attr("id","kg")
    .attr("text-anchor", "end")
    .attr('alignment-baseline', 'mathematical')
    .style("fill", headerFontColor)
    .style("font-size", '24px')
    .style("font-size", headerFontSize / 1.4);

var weightTotalLabel = g.append("text")
    .attr("id","total-weight")
    .attr("class","header-text")
    .attr("text-anchor", "end")
    .attr('alignment-baseline', 'central')
    .style("fill", headerColor)
    .style("font-size", headerFontSize);

var quantityTotalLabel = g.append("text")
    .attr("id","total-quantity")
    .attr("class","header-text")
    .attr("text-anchor", "end")
    .attr('alignment-baseline', 'central')
    .style("fill", headerColor)
    .style("font-size", headerFontSize);







function updateHeader(result) {

    var quantityTotal = 0;
    var sumTotal      = 0;
    var weightTotal   = 0;

    result.forEach(function(row) {
        quantityTotal += row.sum;
        sumTotal += row.sumTotal;
        weightTotal += calculateWeight(row);
    });

    var calculatedTotalSum = sumTotal / 100;
    var calculatedTotalWeight = weightTotal;

    piggyLocal.set(quantityTotalLabel, quantityTotal);
    piggyLocal.set(sumTotalLabel, calculatedTotalSum);
    piggyLocal.set(weightTotalLabel, calculatedTotalWeight);

    quantityTotalLabel.text(formatQuantity(quantityTotal));
    sumTotalLabel.text(formatCurrency(calculatedTotalSum));
    weightTotalLabel.text(formatWeight(calculatedTotalWeight));


    kgLabel.attr('x', parseInt(sumTotalLabel._groups[0][0].getBBox().x) - headerFontSize / 4 * 3);
    weightTotalLabel.attr('x', parseInt(kgLabel._groups[0][0].getBBox().x) - headerFontSize / 4);
    quantityTotalLabel.attr('x', parseInt(weightTotalLabel._groups[0][0].getBBox().x) - headerFontSize / 4 * 3);

    quantityTotalLabel.transition().duration(500).style('fill', headerFontColor);
    sumTotalLabel.transition().duration(500).style('fill', headerFontColor);
    weightTotalLabel.transition().duration(500).style('fill', headerFontColor);
    svgHeader.transition().duration(500).style("background-color", headerColor);

    d3.selectAll('#menu').transition().duration(500).style('background-color', headerColor);
}