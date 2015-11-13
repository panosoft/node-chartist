var R = require('ramda');

var mapIndexed = R.addIndex(R.map);

var labels = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o'];
var variable = (label, name) => `
  <div class="ct-variable ct-label ct-series-${label}">
    <span class="ct-swatch"></span>${name}
  </div>
`;
var legend = (variables) => `
  <div class="ct-legend">
    ${variables}
  </div>
`;
var generate = (data) => {
  var series = data.series;
  var variables = R.pipe(
    R.map(R.prop('name')),
    mapIndexed((name, index) => name ? variable(labels[index], name) : null),
    R.reject(R.isNil),
    R.join('')
  )(series);
  return legend(variables);
};

module.exports = generate;
