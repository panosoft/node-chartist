var R = require('ramda');
var Ru = require('@panosoft/ramda-utils');

var configDefaults = { // TODO merge not default
  class: 'ct-axis-title ct-label',
  textAnchor: 'middle'
};
var getXConfig = (chart) => {
  var x =
    chart.options.chartPadding.left +
    (chart.options.axisY.position === 'start' ? chart.options.axisY.offset : 0) +
    (chart.axisX.axisLength / 2);
  var y =
    chart.options.chartPadding.top +
    (chart.options.axisX.position === 'start' ? 0 : chart.axisY.axisLength + chart.options.axisX.offset);
  var dominantBaseline = chart.options.axisX.position === 'start' ? 'hanging' : 'text-after-edge';
  return {
    class: configDefaults.class,
    text: chart.options.axisX.title,
    attr: { x, y, 'dominant-baseline': dominantBaseline, 'text-anchor': configDefaults.textAnchor }
  };
};
var getYConfig = (chart) => {
  var x =
    chart.options.chartPadding.left +
    (chart.options.axisY.position === 'start' ? 0 : chart.axisX.axisLength + chart.options.axisY.offset);
  var y =
    chart.options.chartPadding.top +
    (chart.options.axisX.position === 'start' ? chart.options.axisX.offset : 0) +
    (chart.axisY.axisLength / 2);
  var transform = `rotate(${chart.options.axisY.position === 'start' ? -90 : 90}, ${x}, ${y})`;
  var dominantBaseline = chart.options.axisY.position === 'start' ? 'hanging' : 'text-after-edge';
  return {
    class: configDefaults.class,
    text: chart.options.axisY.title,
    attr: { x, y, transform, 'dominant-baseline': dominantBaseline, 'text-anchor': configDefaults.textAnchor }
  };
};
var createText = (Chartist, config) => {
  var text = new Chartist.Svg("text");
  text.addClass(config.class);
  text.text(config.text);
  text.attr(config.attr);
  return text;
};

var render = function(Chartist, chart) {
  if (chart.axisX && chart.options.axisX.title) {
    var xConfig = getXConfig(chart);
    var xTitle = createText(Chartist, xConfig);
    chart.svg.append(xTitle, true);
  }
  if (chart.axisY && chart.options.axisY.title) {
    var yConfig = getYConfig(chart);
    var yTitle = createText(Chartist, yConfig);
    chart.svg.append(yTitle, true);
  }
};

module.exports = render;
