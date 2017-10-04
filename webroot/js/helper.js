var getHuePath = function () {
    var url = '';
    var lights = 6; // refactor ...
    if ($('.light-enabled').length === 0) {
        url = 'nope';
    } else if ($('.light-enabled').length === 1) {
        var id = $('.light-enabled')[0].id.substr(($('.light-enabled')[0].id.lastIndexOf('-') + 1)); // more complex please ..
        url = '/lights/' + id + '/state';
    } else if ($('.light-enabled').length === lights) { // lights is magic number ... burps
        url = '/groups/0/action';
    } else {
        url = 'group muss erstellt werden (?oder nicht!?)';
    }
    return url;
};

var formToJson = function(form) {
    var json = {};
    $.each(form, function(key, value) {
        $.each(value, function(key2, value2) {
            if(key2 === 'name' && value.value !== "") {
                if (isJson(value.value)) {
                    json[value2] = JSON.parse(value.value);
                } else {
                    json[value2] = value.value;
                }
            }
        });
    });
    return json;
};

function isJson(str) {
    try {
        var parsed = JSON.parse(str);
        if(typeof parsed ==='object') {
            return true;
        }
    } catch (e) {
        return false;
    }
}

var jsonToForm = function(form, data) {
    $.each(data, function(key, value) {
        key = key.replace(/_/g, '-');
        var ctrl = $('#erm-add-' + key);
        if (ctrl.is('select')) {
            $("option", ctrl).each(function() {
                if (this.value === value) {
                    this.selected=true;
                }
            });
        } else {
            switch (ctrl.prop("type")) {
                case "radio":
                case "checkbox":
                    if (value !== 'off') {
                        $('#erm-add-' + key).prop("checked", true);
                        $('.' + key).show();
                    } else {
                        $('#erm-add-' + key).prop("checked", false);
                        $('.' + key).hide();
                    }
                    break;
                default:
                    ctrl.val(value);
            }
        }
    });
};



var playSound = function(file) {
    var audioElement = document.createElement('audio');
    audioElement.setAttribute('src', file);
    audioElement.setAttribute('autoplay', 'autoplay');
    audioElement.addEventListener("load", function () {
        audioElement.play();
    }, true);
};
