body = $('body');
menu_edge = $('menu-edge');
mousedown = false;
files = {};
current_tab = 'untitled';
document.getElementById('editor').style.fontSize='15px';

modes = {
    'untitled': 'ace/mode/text',
    'js': 'ace/mode/javascript',
    'css': 'ace/mode/css',
    'html': 'ace/mode/html',
    'eot': 'ace/mode/text',
    'svg': 'ace/mode/text',
    'ttf': 'ace/mode/text',
    'woff': 'ace/mode/text',
    'md': 'ace/mode/markdown'
}

var menuItems = [];
var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/javascript");

var dragging = false;

function toggle_menu() {

    if (body.hasClass('menu-open'))
        body.removeClass('menu-open');
    else
        body.addClass('menu-open');

    return true;
}

function toggle_menu_folder(folder) {
    folder = $(folder);

    if (!folder.hasClass('folder'))
        console.log('This is not a folder.');

    if (folder.hasClass('folder-open'))
        folder.removeClass('folder-open');
    else
        folder.addClass('folder-open');

    return true;
}

function close_tab_or_exit() {
    tab = get_current_tab();
    siblings = [];
    tabs_left = 0;

    if (tab) {
        siblings = tab.siblings();
        tab.remove();
        delete files[current_tab];
        tabs_left = siblings.length;
    }

    if (current_tab) {
        console.log(tabs_left);
    } else {
        console.log('should close window')
    }
}


function drag_menu_width(ev) {
    console.log(ev);
}

function folder_clicked(folder) {

    var ul = folder.children('ul');

    if (ul.hasClass('open'))
        return ul.removeClass('open');
    else
        return ul.addClass('open');
}

function get_file_extension(name) {

    console.log('get_file_extension');
    console.log(name);
    var last = name.lastIndexOf('.');
    last = last + 1;
    var length = name.length;

    if (last > 0)
        name = name.substr(last, length - last);

    return name;
}

function create_active_tab(file_name) {

    var id = prefix_id('tab', file_name);
    var new_tab = '<li id="' + id + '" class="active">' + file_name + '</li>';
    var created = $('#tabs').append(new_tab);
    return created;
}

function prefix_id(prefix, name) {

    return prefix + '-' + id_format(name);
}

function id_format(name) {

    if (!name)
        return console.warn('No name given to id_format');

    var name = name.replace('_','-');
    var last = name.lastIndexOf('.');

    if (last > 0)
        name = name.substr(0, last);

    return name;
}

function save_current_file() {
    return true;
}

function close_current_tab() {

    if (!current_tab)
        return false;

    tab = $('#tab-' + id_format(current_tab));
    tab.sibling()
}

function refresh_open_tab(data) {

    var extension = get_file_extension(current_tab);
    var mode = modes[extension];
    console.log('using mode: ' + mode);

    var tab = get_current_tab();

    if (tab) {
        tab.addClass('active');
        editor.setValue(data);
        editor.getSession().setMode(mode);
        return tab;
    } else {
        return console.warn('Error refreshing current tab.');
    }
}

function get_current_tab() {

    if (!current_tab)
        return current_tab;

    return $('#tab-' + id_format(current_tab));
}

function loaded_file(file_name, url, data) {

    var tab = null;
    var tab = get_current_tab();

    if (file_name == current_tab)
        return refresh_open_tab(data);

    if(current_tab != 'untitled') {
        if (!save_current_file())
            return console.warn('Could not save current file: ' + current_tab);

        if (tab)
            tab.removeClass('active');
    }

    current_tab = file_name;

    if (!files[file_name])
        create_active_tab(file_name);

    files[file_name] = url;
    return refresh_open_tab(data);
}

function fail_ajax(xhr, status, error) {
    console.error(status + ": " + error);
}

function load_file(file_name, url) {

    function successfully_loaded(data) {
        loaded_file(file_name, url, data);
    }

    $.ajax({
        'url': url,
        'success': successfully_loaded,
        'error': fail_ajax
    });
}

function file_clicked(file) {

    var file_name = file.html();
    var url = file.data('url');

    load_file(file_name, url);

    return true;
}

function create_random_id(length) {

    if (length < 5)
        length = 5;

    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

body.on('keydown', function(event) {

    // console.log('keydown');
    // console.log(event);
    event.defaultPrevented = true;

    if (event.metaKey && !event.altKey) {
        switch(event.keyCode) {
            case 27:
                close_tab_or_exit();
                break;
            case 75:
                toggle_menu();
                break;
            case 87:
                close_current_tab();
                break;
            default:
                console.log('key: ' + event.keyCode);
                break;
        }
    }
});

menu_edge.on('mousedown', function(ev) {
    dragging = true;
    mousedown = true;
    console.log('dragging menu edge');
    drag_menu_width(ev);
});

body.on('mouseup', function(ev) {
    mousedown = false;
});

$('.folder').on('mouseup', function(event){

    if (event.currentTarget != event.target)
        return false;

    var id = event.target.id;
    var element = $('#' + id);

    if (element.hasClass('folder'))
        return folder_clicked(element);
    else
        return false;
});

$('.file').on('mouseup', function(event){

    if (event.currentTarget != event.target)
        return false;

    if (!event.target.id)
        event.target.id = create_random_id(20);

    var id = event.target.id;
    var element = $('#' + id);

    if (element.hasClass('file'))
        return file_clicked(element);
    else
        return false;
});
