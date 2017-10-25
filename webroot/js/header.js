var svgHeader = d3.select('#header')
    .append("svg")
    .attr("id", "svgHeader")
    .attr("width", (window.innerWidth))
    .attr("height", headerHeight)
    .style("background", colors.header);

var quantityTotalLabel = svgHeader.append("text")
    .attr("id","total-quantity")
    .attr("class","header-text")
    .attr('x', (window.outerWidth - 510))
    .attr('y', ($('#header').outerHeight() / 1.4))
    .attr("text-anchor", "end")
    .style("fill", colors.header)
    .style("font-size", headerFontSize);


var weightTotalLabel = svgHeader.append("text")
    .attr("id","total-weight")
    .attr("class","header-text")
    .attr('x', (window.outerWidth - 310))
    .attr('y', ($('#header').outerHeight() / 1.4))
    .attr("text-anchor", "end")
    .style("fill", colors.header)
    .style("font-size", headerFontSize);

var kgLabel = svgHeader.append("text")
    .text('kg')
    .attr("id","kg")
    .attr('x', (window.outerWidth - 280))
    .attr('y', ($('#header').outerHeight() / 1.4))
    .attr("text-anchor", "end")
    .style("fill", colors.headerFont)
    .style("font-size", '24px');

var sumTotalLabel = svgHeader.append("text")
    .attr("id","total-sum-pie")
    .attr("class","header-text")
    .attr('x', (window.outerWidth - 30))
    .attr('y', ($('#header').outerHeight() / 1.4))
    .attr("text-anchor", "end")
    .style("fill", colors.header)
    .style("font-size", headerFontSize);

svgHeader.append("text")
    .html('&euro;')
    .attr("id","currency")
    .attr("transform", "translate(" + (window.outerWidth - 10) + "," + ($('#header').outerHeight() / 1.4) + ")")
    .attr("text-anchor", "end")
    .style("fill", colors.headerFont)
    .style("font-size", '24px');


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

    // Move kilogram if sum label gets longer
    var newX = parseInt(sumTotalLabel._groups[0][0].getBBox().x);
    weightTotalLabel.attr('x', (newX - 80)).transition().duration();
    kgLabel.attr('x', (newX - 50)).transition().duration();

    // Move qty if kilogram label gets longer
    var newXQty = parseInt(weightTotalLabel._groups[0][0].getBBox().x);
    quantityTotalLabel.attr('x', (newXQty- 80)).transition().duration();

    quantityTotalLabel.transition().duration(500).style('fill',  colors.headerFont);
    sumTotalLabel.transition().duration(500).style('fill', colors.headerFont);
    weightTotalLabel.transition().duration(500).style('fill', colors.headerFont);
    svgHeader.transition().duration(500).style("background-color", colors.header);

    d3.selectAll('#menu').transition().duration(500).style('background-color', colors.header);
}