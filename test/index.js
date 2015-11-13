var co = require('co');
var generate = require('../lib');
var fs = require('fs');
var path = require('path');

co(function * () {
  try {
    var options = {
      width: 400,
      height: 200,
      // fullWidth: true, // adds vertical gridline on rightmost edge of chart
      // chartPadding: { right: 40 }, // ensures that `Friday` label is not cutoff
      axisX: {
        // position: 'start',
        title: 'X Axis (units)',
        offset: 40
      },
      axisY: {
        // position: 'end',
        title: 'Y Axis (units)',
        offset: 50
      }
    };
    var data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Friday'],
      series: [
        {name: 'Test', value: [50, 20, 40, 20, 10]},
        [4,1,2,6,7],
        {name: 'Test 3', value: [20, 60, 10, 80, 40]}
      ]
    };

    console.time('bar');
    var bar = yield generate('bar', options, data);
    console.timeEnd('bar');
    console.time('line');
    var line = yield generate('line', options, data);
    console.timeEnd('line');
    console.time('pie');
    var pieOptions = {width: 200, height: 200};
    var pieData = {series: [{name: 'Test 1', value: 50}, 10, {name: 'Test 3', value: 20}]};
    var pie = yield generate('pie', pieOptions, pieData);
    console.timeEnd('pie');

    // Load external deps
    var chartistCss = fs.readFileSync(path.resolve(__dirname, '../node_modules/chartist/dist/chartist.min.css'), 'utf8');
    var extendedCss = fs.readFileSync(path.resolve(__dirname, '../lib/main.css'), 'utf8');
    var style = `<style>${chartistCss}${extendedCss} .ct-chart { display: inline-block; margin: 2em; text-align: center; }</style>`;
    console.log(`${style}${bar}${line}${pie}`);
  }
  catch (error) { console.error(error.stack); }
});
