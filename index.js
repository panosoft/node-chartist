var co = require('co');
var jsdom = require('jsdom');
var matchMedia = require('matchmedia');
var fs = require('fs');
var path = require('path');

co(function * () {
  try {

    // Setup environment
    // this pollutes the global space for the entire node process!!!
    // this might require us to run reports in their own vm context ...
    var html = '';
    var window = yield new Promise((resolve, reject) =>
      jsdom.env({html, done: (error, window) => error ? reject(error) : resolve(window)})
    );
    if(!window.matchMedia) window.matchMedia = matchMedia;
    var document = window.document;
    if(!global.window) global.window = window;
    if(!global.document) global.document = document;
    if(!global.Node) global.Node = window.Node;
    if(!global.Element) global.Element = window.Element;

    // Now that env setup, we can require Chartist
    var Chartist = require('chartist');

    // Load external deps
    var css = fs.readFileSync(path.resolve(__dirname, 'node_modules/chartist/dist/chartist.min.css'), 'utf8');
    var style = `<style>${css}</style>`;

    // render (type, options, data)
    var options = {
      width: 300,
      height: 200,
      fullWidth: true, // adds vertical gridline on rightmost edge of chart
      chartPadding: {right: 40} // ensures that `Friday` label is not cutoff
    };
    var data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Friday'],
      series: [ [5, 2, 4, 2, 0] ]
    };

    var container = document.createElement('div');
    // type determines which Chartist chart is generated (line, bar, pie)
    var chart = new Chartist.Line(container, data, options);
    chart.on('created', () => {
      var html = container.innerHTML;
      console.log(`${style}${html}`);
    });

    // cleanup
    chart = chart.detach();
  }
  catch (error) { console.error(error.stack); }
});

module.exports = {
  template: 'Hello from chartist'
};
