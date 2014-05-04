body = $('body');
menu_edge = $('menu-edge');
mousedown = false;
files = {};
current_tab = 'untitled';

modes = {
    'js': 'ace/mode/javascript',
    'css': 'ace/mode/css',
    'html': 'ace/mode/html',
    'eot': 'ace/mode/text',
    'svg': 'ace/mode/text',
    'ttf': 'ace/mode/text',
    'woff': 'ace/mode/text',
    'md': 'ace/mode/markdown'
}

function Tab(name) {

  this.name = name;
  this.el   = $('<li class="active">' + name + '</li>');

  this.el.on('click',function() { this.focus(); });
}

Tab.prototype.focus = function() {
  $('#tabs').children().removeClass('active');
  this.el.addClass('active');
}

Tab.prototype.blur = function() {
  this.el.removeClass('active');
}

function ContentArea() {

}

function Menu() {

}

Menu.prototype.createItem = function(name,isFolder) {

  var el = false;
  var folder = isFolder || false;

  if (folder) {
    el = $('<li class="folder">' + name + '<ul></ul></li>');
  } else {
    el = $('<li class="file">' + name + '</li>');
  }

  var item = new MenuItem(el,folder);
}

function MenuItem(id,el,isFolder) {
  // console.log('creating MenuItem');
  this.id       = id;
  this.el       = el;
  this.isFolder = isFolder;
  that          = this;
  this.el.on('click',that.toggle);
}

var my = false;

MenuItem.prototype.toggle = function(element) {

  console.log(this.id);
  console.log(this.isFolder);

  if (!this.isFolder) return;

  if (this.el.hasClass('folder')) {
    this.el.addClass('folder-open');
    this.el.removeClass('folder');
  } else {
    this.el.addClass('folder');
    this.el.removeClass('folder-open');
  }
}

MenuItem.prototype.delete = function() {
  this.el.delete();
}

var folders = $('#menu li.folder,#menu li.folder-open');
var files = $('#menu li.file');

var menuItems = [];

// for(var i = 0; i < files.length; i++) {
//   item = files.get(i);
//   item.id = 'file-' + i;
//   item = $('#file-' + i);
//   item = new MenuItem(item,false);
// }

var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/javascript");

var dragging = false;

$('menu-edge').on('mousedown',function() {
  dragging = true;
});

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

function get_files() {

    files = [];

    return true;
}

function update_menu() {
    for(var i = 0; i < folders.length; i++) {
        var item = folders.get(i);
        var id = 'folder-' + i;
        item.id = id;
        var el = $('#' + id);
        var menuItem = new MenuItem(id,el,true);
        menuItems.push(menuItem);
    }
}

body.on('keydown', function(event) {

    console.log('keydown');
    console.log(event);
    event.defaultPrevented = true;

    if (event.metaKey) {
        switch(event.keyCode) {
            case 75:
                toggle_menu();
                break;
            case 87:
                close_current_tab();
                break;
            default:
                console.log()
                break;
        }
    }
});

function close_tab_or_exit() {
    if (current_tab) {
        tab = files.indexOf(current_tab);
        files.splice(tab, 1);
    }

    if (files.length() > 0) {

    }
}

window.onbeforeunload = close_tab_or_exit;


function drag_menu_width(ev) {
    console.log(ev);
}

menu_edge.on('mousedown', function(ev) {
    mousedown = true;
    console.log('dragging menu edge');
    drag_menu_width(ev);
});

body.on('mouseup', function(ev) {
    mousedown = false;
});

function folder_clicked(folder) {

    var ul = folder.children('ul');

    if (ul.hasClass('open'))
        return ul.removeClass('open');
    else
        return ul.addClass('open');
}

function get_file_url(file_name) {

    var file = $('#' + prefix_id('file', file_name));
    var parents = file.parents('li.folder');
    var length = parents['length'];
    var url = '';

    for (var i = length - 1; i >= 0; i--) {
        url += '/' + parents[i].id.replace('-folder','');;
    }

    return url + '/' + file_name;
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
    var url = get_file_url(file_name);

    load_file(file_name, url);

    return true;
}

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

    var id = event.target.id;
    var element = $('#' + id);

    if (element.hasClass('file'))
        return file_clicked(element);
    else
        return false;
});
