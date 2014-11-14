// google analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-54437653-1', 'auto');

// app boot
window.logFlags = window.logFlags || {};
var host_re = /^[www\.]?cvdlab\.org/;
var domain = 'cvdlba.org';
var hostname = location.hostname;
var host_query = host_re.exec(hostname);
var env = host_query && host_query[0] === 'domain' ? 'production' : 'develop';
var production = function () { return env === 'production'; };

var app = document.getElementById('app');

var open = function (page_name, details) {
  return function (context) {
    var params = context.params;
    var property;
    var element = document.createElement(page_name);
    for (property in params) {
      if (isNaN(property)) {
        element.setAttribute(property, params[property]);
      }
    }
    context.element = element;
    while (app.firstChild) app.removeChild(app.firstChild);
    app.appendChild(element);
    element.details = details;
    scroll(0,0);
  };
};

var onchange = function (event) {
  var url = event.detail;
  page.show(url);
  if (production()) {
    ga('send', 'pageview', url);
  }
};

app.addEventListener('click link', onchange);

var start = function () {
  page('/', open('page-about'));
  page('/about', open('page-about'));
  page('/alumni', open('page-alumni'));
  page('/courses/:corse', open('page-course'));
  page('/courses', open('page-courses'));
  page('/home', open('page-home'));
  page('/membership', open('page-membership'));
  page('/projects', open('page-projects'));
  page('/policy', open('page-policy'));
  page('*', open('page-about'));
  page();

  console.log('Welcome to CVDLAB!');
};

start();
