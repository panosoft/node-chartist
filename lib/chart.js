var capitalize = require('underscore.string/capitalize');
var co = require('co');
var fs = require('fs');
var jsdom = require('jsdom');
var matchMedia = require('matchmedia');
var path = require('path');
var R = require('ramda');
var renderAxisTitles = require('./axis-title');
var vm = require('vm');

var initialized;
var window;
var Chartist;
var chartistSource;
try {
    // NPM 2: nested dependency resolution
    chartistSource = fs.readFileSync(path.resolve(__dirname, '../node_modules/chartist/dist/chartist.js'));
} catch (error) {
    try {
        // NPM 3+: flat dependency resolution
        chartistSource = fs.readFileSync(path.resolve(__dirname, '../../chartist/dist/chartist.js'));
    } catch (error) {
        // Chartist module not found!
        throw error;
    }
}
var createWindow = co.wrap(function * () {
  var window = yield new Promise((resolve, reject) =>
    jsdom.env({ html: '', done: (error, window) => error ? reject(error) : resolve(window) })
  );
  // matchMedia: required polyfill
  if(!window.matchMedia) window.matchMedia = matchMedia;
  // Array: must be overriden so that Chartist can use `instanceof Array`
  // within its context to check whether arguments created in this context
  // are Array's.
  window.Array = Array;
  return window;
});
var initialize = co.wrap(function * () {
  if (initialized) throw new Error("Already initialized.");
  window = yield createWindow();
  vm.runInNewContext(chartistSource, window);
  Chartist = window.Chartist;
  // Disable foreignObject and animations (incompatible with PrinceXML)
  var isSupported = Chartist.Svg.isSupported;
  Chartist.Svg.isSupported = feature =>
    R.contains(feature, ['Extensibility', 'AnimationEventsAttribute']) ? false : isSupported(feature);
  initialized = true;
});
/**
 * Generate Chart HTML
 * @param  {String} type
 *         bar, line, pie
 * @return {Promise{String}} html
 */
var generate = co.wrap(function * (type, options, data) {
  if (!initialized) yield initialize();
  type = capitalize(type);
  if (!Chartist[type]) throw new TypeError(`Unsupported chart type: ${type}`);
  var container = window.document.createElement('div');
  var chart = new Chartist[type](container, data, options);
  var event = yield new Promise(resolve => chart.on('created', resolve));
  chart.axisX = event.axisX;
  chart.axisY = event.axisY;
  renderAxisTitles(Chartist, chart);
  chart = chart.detach();
  return container.innerHTML;
});

var ChartistCo = co.wrap(function * () {
  if (!initialized) yield initialize();
  return Chartist;
});

module.exports.generate = generate;
module.exports.Chartist = ChartistCo;
