var app = document.getElementById('app');

var open = function (page_name, details) {
  return function (context) {  
    var element = document.createElement(page_name);
    context.element = element;
    while (app.firstChild) app.removeChild(app.firstChild);
    app.appendChild(element);
    setTimeout(function () {
      element.details = details;    
    }, 10);
  };
};

var start = function () {
  page('/', open('page-about'));
  page('/about', open('page-about'));
  page('/alumni', open('page-alumni'));
  page('/courses/javascript', open('page-course', { course: 'javascript' }));
  page('/courses/threejs', open('page-course', { course: 'threejs' }));
  page('/courses', open('page-courses'));
  page('/home', open('page-home'));
  page('/membership', open('page-membership'));
  page('/projects', open('page-projects'));
  page('*', open('page-about'));
  page();

  page.show(location.pathname);

  console.log('Welcome to CVDLAB!');
};

start();