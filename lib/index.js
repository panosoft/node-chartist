var co = require('co');
var generateChart = require('./chart').generate;
var generateLegend = require('./legend');
var R = require('ramda');
var Ru = require('@panosoft/ramda-utils');

/**
 * Generate Chart HTML
 *
 * @param {String} type
 *        bar, line, pie
 * @param {Object} options
 *        Chartist options + axis*.title
 * @param {Object} data
 *        Chartist data object
 *
 * @return {Promise{String}} svg
 */
var generate = R.curryN(3, co.wrap(function * (type, options, data) {
  options = Ru.defaults({ legend: true }, options);
  var chart = yield generateChart(type, options, data);
  var legend = options.legend ? generateLegend(data) : '';
  return `<div class="ct-chart">${chart}${legend}</div>`;
}));

module.exports = generate;
