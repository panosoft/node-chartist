const co = require('co');
const chartist = require('./chartist');
const generateChart = require('./chart');
const generateLegend = require('./legend');
const is = require('is_js');
const R = require('ramda');
const Ru = require('@panosoft/ramda-utils');

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
const generate = R.curryN(3, co.wrap(function * (type, options, data) {
    const environment = yield chartist.initialize();
    const window = environment.window;
    const Chartist = environment.Chartist;
    // process options
    options = is.function(options) ? options(Chartist) : options;
    if (is.not.json(options)) throw new TypeError('options must be an object or a function that returns an object.');
    options = Ru.defaults({ legend: true }, options);
    // create chart
    const chart = yield generateChart(Chartist, window, type, options, data);
    const legend = options.legend ? generateLegend(data) : '';
    return `<div class="ct-chart">${chart}${legend}</div>`;
}));

module.exports = generate;
