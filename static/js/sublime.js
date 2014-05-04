body = $('body');
menu_edge = $('menu-edge');
mousedown = false;
untitled_id = create_random_id(20);
files = {'untitled': {'id': untitled_id,'data':'','mode':'untitled'}};
current_tab = 'untitled';
close_window_next_escape = false;
$('ul#tabs li').attr('id',untitled_id);

document.getElementById('editor').style.fontSize='15px';

modes = {
    'gitignore': 'ace/mode/text',
    'untitled': 'ace/mode/text',
    'js': 'ace/mode/javascript',
    'css': 'ace/mode/css',
    'html': 'ace/mode/html',
    'eot': 'img',
    'svg': 'img',
    'ttf': 'img',
    'woff': 'img',
    'png': 'img',
    'gif': 'img',
    'jpg': 'img',
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

    if (close_window_next_escape)
        window.close();

    tab = get_current_tab();
    siblings = [];
    tabs_left = 0;

    if (tab) {
        siblings = tab.siblings();
        tabs_left = siblings.length;
        tab.remove();
        delete files[current_tab];
        current_tab = false;
    }

    if (tabs_left > 0) {
        tab = $('#' + siblings[tabs_left - 1].id);
        current_tab = tab.html();
        editor.setValue(files[current_tab]['data']);
        editor.gotoLine(1);
        tab.addClass('active');
    } else {
        editor.setValue('');
    }

    if (!tab)
        close_window_next_escape = true;
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

    var last = name.lastIndexOf('.');
    last = last + 1;
    var length = name.length;

    if (last > 0)
        name = name.substr(last, length - last);

    return name;
}

function create_active_tab(file_name) {

    var id = create_random_id(20);
    var new_tab = '<li id="' + id + '" class="active">' + file_name + '</li>';
    $('#tabs').append(new_tab);
    var created = $('#' + id);
    created.on('mouseup', on_click_tab);
    files[file_name] = {'id': id}
    return id;
}

function id_format(name) {

    if (!name)
        return console.warn('No name given to id_format');

    var name = name.replace('_','-');
    var last = name.lastIndexOf('.');

    if (last > 0)
        name = name.substr(0, last);

    var name = name.replace('.','');

    return name;
}

function save_current_file() {

    if (current_tab && files[current_tab]) {
        var extension = get_file_extension(current_tab);
        files[current_tab]['data'] = editor.getValue();
        files[current_tab]['mode'] = modes[extension];
        return true;
    }

    return false;
}

function close_current_tab() {

    if (!current_tab)
        return false;

    tab = $('#tab-' + id_format(current_tab));
    tab.sibling()
}

function show_image(image_url) {
    $('#image-editor').css('background-image','url("'+image_url+'")');
    $('#image-editor').addClass('active');
}

function refresh_open_tab(data) {

    var extension = get_file_extension(current_tab);
    var mode = modes[extension];
    console.log('using mode: ' + mode);

    var tab = get_current_tab();

    if (tab) {
        tab.addClass('active');

        if (mode == 'img') {
            console.log('showing image')
            editor.setValue('');
            show_image(files[current_tab]['url'])
        } else {
            editor.setValue(data);
            editor.gotoLine(1);
            editor.getSession().setMode(mode);
            $('#image-editor').removeClass('active');
        }
        return tab;
    } else {
        return console.warn('Error refreshing current tab.');
    }
}

function get_current_tab() {

    if (!current_tab || !files[current_tab])
        return current_tab;

    return $('#' + files[current_tab]['id']);
}

function loaded_file(file_name, url, data) {

    var tab = null;
    var tab = get_current_tab();

    if (file_name == current_tab)
        return true;

    save_current_file()

    if (tab)
        tab.removeClass('active');

    current_tab = file_name;

    if (!files[file_name])
        files[file_name] = {'id': create_active_tab(file_name)}

    files[file_name]['url'] = url;

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
    var first = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";

    text += first.charAt(Math.floor(Math.random() * first.length));

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

editor.commands.addCommand({
    name: 'closeTab',
    bindKey: {win: 'Ctrl-Esc',  mac: 'Command-Esc'},
    exec: function(editor) {
        close_tab_or_exit();
    },
    readOnly: false
});

editor.commands.addCommand({
    name: 'toggleMenu',
    bindKey: {win: 'Ctrl-K',  mac: 'Command-K'},
    exec: function(editor) {
        toggle_menu();
    },
    readOnly: false
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

    if (!event.target.id)
        event.target.id = create_random_id(20);

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

function on_click_tab(event){

    if (event.currentTarget != event.target){
        return false;
    }

    var id = event.target.id;
    var element = $('#' + id);
    var file_name = element.html();

    if (current_tab != file_name) {
        var url = files[file_name]['url'];
        var data = files[file_name]['data'];
        loaded_file(file_name, url, data);
    }
};

$('#' + untitled_id).on('mouseup', on_click_tab);
