const cheerio = require('cheerio');
const co = require('co');
const expect = require('chai')
  .use(require('chai-as-promised'))
  .use(require('sinon-chai'))
  .expect;
const fs = require('fs');
const generate = require('../lib');
const path = require('path');
const sinon = require('sinon');

var exists = path => new Promise((resolve, reject) => {
  fs.stat(path, (error) => {
    if (!error) resolve(true);
    else if (error.code === 'ENOENT') resolve(false);
    else reject(error);
  });
});

describe('build', () => {
  it('create dist/main.css', () => {
    var filename = path.resolve(__dirname, '../dist/main.css');
    return expect(exists(filename)).to.eventually.be.true;
  });
});
describe('install', () => {
  it('create node_modules/canvas.js', () => {
    var filename = path.resolve(__dirname, '../node_modules/canvas.js');
    return expect(exists(filename)).to.eventually.be.true;
  });
});
describe('generate', () => {
  describe('chart', () => {
    // bar
    it('bar', () => co(function * () {
      var chart = yield generate('bar', {}, {
        labels: ['a', 'b', 'c'],
        series: [[1, 2, 3]]
      });
      var $ = cheerio.load(chart);
      expect($('svg.ct-chart-bar').length).to.equal(1);
    }));
    it('line', () => co(function * () {
      var chart = yield generate('line', {}, {
        labels: ['a', 'b', 'c'],
        series: [[1, 2, 3]]
      });
      var $ = cheerio.load(chart);
      expect($('svg.ct-chart-line').length).to.equal(1);
    }));
    it('pie', () => co(function * () {
      var chart = yield generate('pie', {}, {
        series: [1, 2, 3]
      });
      var $ = cheerio.load(chart);
      expect($('svg.ct-chart-pie').length).to.equal(1);
    }));
    it('throw on unsupported type', () =>
      expect(generate('spider', {}, {})).to.eventually.be.rejectedWith(TypeError, /Unsupported chart type/)
    );
  });
    describe('options', () => {
        it('object', () => co(function * () {
            var chart = yield generate('bar', {}, {
                labels: ['a', 'b', 'c'],
                series: [[1, 2, 3]]
            });
            var $ = cheerio.load(chart);
            expect($('svg.ct-chart-bar').length).to.equal(1);
        }));
        it('function called with Chartist object', () => co(function * () {
            const options = sinon.stub().returns({});
            var chart = yield generate('bar', options, {
                labels: ['a', 'b', 'c'],
                series: [[1, 2, 3]]
            });
            expect(options).to.be.calledOnce
                .and.calledWith(sinon.match.has('AutoScaleAxis'));
        }));
        it('function must return object', () => {
            const options = (Chartist) => null;
            var chart = generate('bar', options, {
                labels: ['a', 'b', 'c'],
                series: [[1, 2, 3]]
            });
            return expect(chart).to.eventually.be.rejectedWith(TypeError);
        });
    });
  describe('axisTitle', () => {
    it('x axis', () => co(function * () {
      var title = 'X Axis (units)';
      var chart = yield generate('bar', {
        axisX: { title }
      }, {
        labels: ['a', 'b', 'c'],
        series: [[1, 2, 3]]
      });
      var $ = cheerio.load(chart);
      expect($('text.ct-axis-title').length).to.equal(1);
    }));
    it('y axis', () => co(function * () {
      var title = 'Y Axis (units)';
      var chart = yield generate('bar', {
        axisY: { title }
      }, {
        labels: ['a', 'b', 'c'],
        series: [[1, 2, 3]]
      });
      var $ = cheerio.load(chart);
      expect($('text.ct-axis-title').length).to.equal(1);
    }));
  });
  describe('legend', () => {
    it('enabled by default', () => co(function * () {
      var name = 'Y Axis (units)';
      var options = {};
      var chart = yield generate('bar', options, {
        labels: ['a', 'b', 'c'],
        series: [{ name, value: [1, 2, 3] }]
      });
      var $ = cheerio.load(chart);
      expect($('.ct-legend .ct-variable').length).to.equal(1);
    }));
    it('can be disabled', () => co(function * () {
      var name = 'Y Axis (units)';
      var options = { legend: false };
      var chart = yield generate('bar', options, {
        labels: ['a', 'b', 'c'],
        series: [{ name, value: [1, 2, 3] }]
      });
      var $ = cheerio.load(chart);
      expect($('.ct-legend').length).to.equal(0);
    }));
    it('variable excluded if nameless', () => co(function * () {
      var name = 'Y Axis (units)';
      var chart = yield generate('bar', {}, {
        labels: ['a', 'b', 'c'],
        series: [
          { name, value: [1, 2, 3] },
          [1, 2, 3],
          { name, value: [1, 2, 3] }
        ]
      });
      var $ = cheerio.load(chart);
      expect($('.ct-legend .ct-variable').length).to.equal(2);
    }));
  });
});

describe('rendered output', () => co(function * () {
  try {
    var options = {
      width: 400,
      height: 200,
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
    var css = fs.readFileSync(path.resolve(__dirname, '../dist/main.css'), 'utf8');
    var style = `<style>${css} .ct-chart { display: inline-block; margin: 2em; text-align: center; }</style>`;
    console.log(`${style}${bar}${line}${pie}`);
  }
  catch (error) { console.error(error.stack); }
}));
