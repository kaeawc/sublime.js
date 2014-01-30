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

function MenuItem(name,isFolder) {
  this.name     = name;
  this.isFolder = isFolder || false;
  this.el       = false;

  if (isFolder) {
    this.el = $('<li class="folder">' + name + '<ul></ul></li>');
  } else {
    this.el = $('<li class="file">' + name + '</li>');
  }
}

MenuItem.prototype.toggle = function() {

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

var menuItems = $('#menu li');

for(item in menuItems) {
  item = $(item);
  var name = item.attr('data-name');
  item = new MenuItem(name,item.children().length);
}

var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/javascript");