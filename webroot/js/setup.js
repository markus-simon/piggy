// GENERAL #############################################

var margin = {top: 5, right: 5, bottom: 5, left: 0};

var width, height, layout;

var headerHeight    = window.innerHeight /10;

if (window.innerWidth < 800) {
    layout = 1;
    width  = window.innerWidth;
    height = window.innerHeight - headerHeight;
} else {
    layout = 2;
    width  = window.innerWidth / 2;
    height = (window.innerHeight / 2) - (headerHeight);
}

var radius   = Math.min(width, height) / 2;

var barWidth = window.innerWidth / 30;

var formatPercent  = d3.format(",.1%");
var formatQuantity = d3.format(",.0f");
var formatCurrency = d3.format(",.2f");
var formatWeight   = d3.format(",.3f");

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

var piggyLocal = d3.local();
/*
var format = d3.format("($.2f")(-3.5);
*/