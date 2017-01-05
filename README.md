# node-chartist

> SVG Charts on the server.

[![Travis](https://img.shields.io/travis/panosoft/node-chartist.svg)](https://travis-ci.org/panosoft/node-chartist)

Node Chartist is a functional server-side wrapper for the popular [Chartist](http://gionkunz.github.io/chartist-js/index.html) library. It generates static svg charts and adds support for a few useful features such as axis titles and chart legends.

# Installation

```sh
npm install node-chartist
```

The accompanying CSS can be found at `dist/main.css` after installation.

# Usage

```js
const co = require('co');
const generate = require('node-chartist');

co(function * () {

  // options object
  const options = {width: 400, height: 200};
  const data = {
    labels: ['a','b','c','d','e'],
    series: [
      [1, 2, 3, 4, 5],
      [3, 4, 5, 6, 7]
    ]
  };
  const bar = yield generate('bar', options, data); //=> chart HTML


  // options function
  const options = (Chartist) => ({width: 400, height: 200, axisY: { type: Chartist.FixedScaleAxis } });
  const data = {
    labels: ['a','b','c','d','e'],
    series: [
      [1, 2, 3, 4, 5],
      [3, 4, 5, 6, 7]
    ]
  };
  const bar = yield generate('bar', options, data); //=> chart HTML

});
```

# API

## generate ( type , options , data )

A curried function that generates a static svg chart.

Returns a `Promise` that is fulfilled with the static chart HTML.

__Arguments__

- `type` - A string used to determine what type of chart to generate. Supported values are:

  - `bar`
  - `line`
  - `pie`


- `options` - An object or a function that returns an object of chart options. If a function is used, it will be called with the `Chartist` object.

    Options are dependent on the chart `type`. All options in the [Chartist Api Documentation](http://gionkunz.github.io/chartist-js/api-documentation.html) are supported. In addition to those, the following options are supported by node-chartist:

  - `axisX.title` - A string to use as the x axis title.

  - `axisY.title` - A string to use as the y axis title.

  - `legend` - A boolean used to determine whether a legend should be generated. Defaults to `true`.


- `data` - An object containing data used to generate the chart. The structure of this object depends on chart `type`. Please refer to the [Chartist Api Documentation](http://gionkunz.github.io/chartist-js/api-documentation.html) for complete details.

  For bar and line charts, this object contains the following properties

  - `labels` - An array of string labels to apply to each value.

  - `series` - An array of arrays or objects containing the values to plot. If objects are used, the following properties are supported:

    - `name` - A string specifying the name of the series. The name will be used in the legend and will be set as the ct:series-name attribute on the series group.

    - `value` - An array of values for the series.

    - `className` - A string to override the CSS class name for the series group.

    - `meta` - Meta data is serialized and written to a ct:meta attribute on the series group.

    Examples:

    ```js
    const data = {
      labels: ['a', 'b', 'c', 'd', 'e'],
      series: [
        [1, 2, 3, 4, 5],
        [3, 4, 5, 6, 7]
      ]
    };
    ```

    ```js
    const data = {
      labels: ['a', 'b', 'c', 'd', 'e'],
      series: [
        {name: 'Series 1', value: [1, 2, 3, 4, 5]},
        {name: 'Series 2', value: [3, 4, 5, 6, 7]}
      ]
    };
    ```

  For pie charts, this object contains the following properties:

  - `series` - An array of values or objects containing values to plot. If objects are used, the following properties are supported:

    - `name` - A string specifying the name of the series. The name will be used in the legend and will be set as the ct:series-name attribute on the series group.

    - `value` - An array of values for the series.

    - `className` - A string to override the CSS class name for the series group.

    - `meta` - Meta data is serialized and written to a ct:meta attribute on the series group.

    Examples:

    ```js
    const data = {
      series: [ 15, 25 ]
    };
    ```

    ```js
    const data = {
      series: [
        {name: 'Series 1', value: 15 },
        {name: 'Series 2', value: 25 }
      ]
    };
    ```

__Examples__

Bar:

```js
co(function * () {
  const options = {
    width: 400,
    height: 200,
    axisX: { title: 'X Axis (units)' },
    axisY: { title: 'Y Axis (units)' }
  };

  const bar = yield generate('bar', options, {
    labels: ['a', 'b', 'c', 'd', 'e'],
    series: [
      {name: 'Series 1', value: [1, 2, 3, 4, 5]},
      {name: 'Series 2', value: [3, 4, 5, 6, 7]}
    ]
  });
})
```

Line:

```js
co(function * () {
  const options = {
    width: 400,
    height: 200,
    axisX: { title: 'X Axis (units)' },
    axisY: { title: 'Y Axis (units)' }
  };

  const line = yield generate('line', options, {
    labels: ['a', 'b', 'c', 'd', 'e'],
    series: [
      {name: 'Series 1', value: [1, 2, 3, 4, 5]},
      {name: 'Series 2', value: [3, 4, 5, 6, 7]}
    ]
  });
})
```

Pie:

```js
co(function * () {
  const options = { width: 400, height: 200 };

  const pie2 = yield generate('pie', options, {
    series: [
      {name: 'Series 1', value: 15 },
      {name: 'Series 2', value: 25 }
    ]
  });
})
```
