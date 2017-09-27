## Installation

This module only with `node-sass`, e.g. `gulp-sass`.

```
npm install --save-dev https://github.com/lemnis/sassy-inline-svg.git
```

## Using [Eyeglass](https://github.com/sass-eyeglass/eyeglass)

With eyeglass  set up, you can  add `@import "sassy-inline-svg";` in your `.scss` file;

## Usage with node-sass

Your config file:
```js
var sass = require("node-sass");

sass.render({
  functions: require("sassy-inline-svg"),
  ...
})
```

## Basic usage

### `inline-svg($path, [$styles], [$options])`

Arguments:
* `{String}` Path to the svg, relative to the root file (`options.file`)
* `{String}` Optional
  * Path to a `*.scss` file to embed inside the svg
  * or CSS as string
* `{Map}` Optional
	* encoding: `base64` or `optimized` (default: `optimized`)
	* svgo: `{Map|Boolean}`
    * Set to `false` will disable svgo functionality
    * To set custom plugin settings using lists, e.g.
      ```scss
      svgo:
        (removeDoctype: false)
        (
          cleanupNumericValues: (
            floatPrecision: 2
          )
        )
      ```
      **removeXMLNS** set to `true` will prevent the rendering of the SVGs in IE and Edge.

#### Examples

##### Inline styles
```scss
.foo {
  background: url(inline-svg('../icons/icon.svg', 'rect { fill: #{$color-red} }'));
}
```

##### External stylesheet
```scss
.foo {
  background: url(inline-svg('../icons/icon.svg', 'icons.scss'));
}
```

## To do

* add to npmjs.com
* add to sache.in
* add selenium tests
* add possibility to inline the css