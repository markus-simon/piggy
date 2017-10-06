// GENERAL #############################################

var margin = {top: 5, right: 5, bottom: 5, left: 0};

var width, height;

if (window.innerWidth < 600) {
    width  = window.innerWidth;
    height = (window.innerHeight) - 60;
} else {
    width  = window.innerWidth / 2;
    height = (window.innerHeight / 2) - 60;
}


var headerHeight    = "10vh";
/*var headerColor     = "#CB3577";
var headerFontColor = "#fff";
var headerFontSize  = "7vh";
var backgroundColor = "#ffdddc";
var color           = d3.scaleOrdinal(["#ffacf6", "#d052d0", "#ff5fb8", "#ff00a5", "#6b486b", "#6b215c", "#3c1231","#ff55d2"]);
var lineColor       = "#000";
var axisColor       = "#000";*/


var barWidth = 50;

var locale = {
    "decimal": ",",
    "thousands": ".",
    "grouping": [3],
    "currency": ["€", ""],
    "dateTime": "%a %b %e %X %Y",
    "date": "%d.%m.%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
    "shortDays": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    "months": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    "shortMonths": ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
};

d3.formatDefaultLocale(locale);

var format = d3.format("($.2f")(-3.5);

