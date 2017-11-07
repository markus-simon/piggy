// GENERAL #############################################
var margin       = {top: 5, right: 5, bottom: 5, left: 0};
var headerHeight = window.innerHeight /10;
var width, height, layout;

if (window.innerWidth < 800) {
    layout = 1;
    width  = window.innerWidth - 1;
    height = window.innerHeight - headerHeight;
} else {
    layout = 2;
    width  = window.innerWidth / 2 - 1;
    height = (window.innerHeight / 2) - (headerHeight);
}

var radius   = Math.min(width, height) / 2;
var barWidth = window.innerWidth / 30;
var formats  = {
    "percent": d3.format(",.1%"),
    "quantity": d3.format(",.0f"),
    "currency": d3.format(",.2f"),
    "weight": d3.format(",.3f"),
    "formatCurrency": d3.format("$,.2f")
};

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

var keyMapping = {
    87: 'wishes',
    69: 'erm',
    72: 'piggy',
    75: 'checkout',
    84: 'theme',
    85: 'upgrade'
};

d3.formatDefaultLocale(locale);

var piggyLocal = d3.local();

var easing = {
    easeElastic: d3.easeElastic,
    easeBounce:  d3.easeBounce,
    easeLinear:  d3.easeLinear,
    easeSin:     d3.easeLinear,
    easeQuad:    d3.easeQuad,
    easeCubic:   d3.easeCubic,
    easePoly:    d3.easePoly,
    easeCircle:  d3.easeCircle,
    easeExp:     d3.easeExp,
    easeBack:    d3.easeBack
};

var transitionDuration = 500;
var transitionEasing   = d3.easeExp;