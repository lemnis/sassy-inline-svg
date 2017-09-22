## Usage with node-sass

Your config file:
```js
var sass = require("node-sass");

sass.render({
  functions: require("sassy-inline-svg"),
  ...
})
```
## Installation

This module only works with `node-sass`, e.g. `gulp-sass`.

## Using [Eyeglass](http://eyeglass.rocks/)

With eyeglass  set up, you can  add `@import "sassy-inline-svg";` in your `.scss` file;

## Basic usage

### `inline-svg($path, $styles)`

Arguments:
* `{String}` Path to the svg, relative to the root file (`options.file`)
* `{String}` Optional
  * Path to a `*.scss` file to embed inside the svg
  * or CSS as string

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

* add tests
* add to npmjs.com
* add to sache.in
* parse embedded sass file with main sass options
* add possibility to choose encoding
* add possibility to minify the svg with svgo
* add lint + .editorconfig files