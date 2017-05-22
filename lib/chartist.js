const co = require('co');
const fs = require('fs');
const jsdom = require('jsdom');
const matchMedia = require('matchmedia');
const path = require('path');
const R = require('ramda');
const vm = require('vm');


var chartistSource;
try {
	// NPM 2: nested dependency resolution
	chartistSource = fs.readFileSync(path.resolve(__dirname, '../node_modules/chartist/dist/chartist.js'));
} catch (error) {
	try {
		// NPM 3+: flat dependency resolution
		chartistSource = fs.readFileSync(path.resolve(__dirname, '../../chartist/dist/chartist.js'));
	} catch (error) {
		throw error; // Chartist module not found!
	}
}


const createWindow = co.wrap(function * () {
	const window = yield new Promise((resolve, reject) => {
		jsdom.env({
			html: "",
			done: function (error, window) { error ? reject(error) : resolve(window) }
		})
	});
	// matchMedia: required polyfill
	if (!window.matchMedia) window.matchMedia = matchMedia;
	// Array: must be overriden so that Chartist can use `instanceof Array`
	// within its context to check whether arguments created in this context
	// are Array's.
	window.Array = Array;
	return window;
});
const loadChartist = window => {
    vm.runInNewContext(chartistSource, window);
	const Chartist = window.Chartist;
	// Disable foreignObject and animations (incompatible with PrinceXML)
	const isSupported = Chartist.Svg.isSupported;
	Chartist.Svg.isSupported = feature =>
		R.contains(feature, ['Extensibility', 'AnimationEventsAttribute']) ? false : isSupported(feature);
    return Chartist;
};
const initialize = co.wrap(function * () {
	const window = yield createWindow();
    const Chartist = loadChartist(window);
	return { window, Chartist };
});

module.exports = { initialize };
