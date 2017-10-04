// error handling
window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
    if (errorMsg.indexOf('INVALID_STATE_ERR') > -1) {
        showNotice('error', 'Server down!'); // uhm ... reload!?
    }
};

var serverState = 1;

function checkServer() {
    $.ajax({
        url: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '?' + new Date().getTime(),
        success: function () {
            if (serverState === 0) {
                serverState = 1;
                location.reload();
            }
        },
        error: function (jqXHR, exception) {
            if (jqXHR.status !== 200) {
                showNotice('error', 'Server down! Retry in 10s');
                serverState = 0;
            }
        },
        complete: function () {
            setTimeout(checkServer, 10000);
        }
    });
}

setTimeout(checkServer, 10000);


var showNotice = function (type, text) {
    $('#notice').removeClass().addClass(type);
    $('#notice').animate({top: 20, opacity: 1, visibility: 'visible'}, 750).delay(2000).animate({
        top: 300,
        opacity: 0,
        visibility: 'hidden'
    }, 750);
    $('#notice-content').html(text);
};
