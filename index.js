"use strict";

const sass = 	require('node-sass');

const path =  require("path");
const fs =    require("fs");
const jsdom = require("jsdom");

const {JSDOM} 			= jsdom;
const dom 					= new JSDOM();
const { document } 	= (dom).window;

var styleBlockBegin = '<![CDATA[';
var styleBlockEnd = ']]>';

var functions = {
	'inline-svg($svgPath: null, $styles: null)': function(svgPath, styles, done) {
		var startPath = path.dirname(this.options.file);
		var pathToSvg = path.join(startPath, svgPath.getValue());

		fs.readFile(pathToSvg, 'utf8', (err, svgData) => {
			if (err) throw err;

			// parse given svg file in virtual dom
			const svgFrag = JSDOM.fragment(svgData);

			var svgEl;
			// get svg element
			// workaround, bug report: https://github.com/tmpvar/jsdom/issues/1986
			for (var i = 0; i < svgFrag.childNodes.length; i++) {
				if(svgFrag.childNodes[i].tagName == "svg") {
					svgEl = svgFrag.childNodes[i];
				}
			}
			if(!svgEl) throw new Error("SVG element not found");

			// Create a style block for later use
			var styleEl = document.createElement("style");
			styleEl.type = "text/css";
			// append style block to svg element
			svgEl.appendChild(styleEl);

			// No extra styles given, return the original svg
			if(styles == sass.types.Null()){
				return sendString(svgData, done);
			}

			// try to read given styles as path
			var possibeStylePath = path.join(startPath, styles.getValue());
			fs.readFile(possibeStylePath, 'utf8', (err, styleData) => {
				if (err) { // not a file, but a style block
					// insert original string of styles argument to the styles block
					styleEl.innerHTML = styleBlockBegin + styles.getValue() + styleBlockEnd;
					sendString(svgEl.outerHTML, done);
				} else { // is a file, so render its content
					renderSassData(styleData, (css) => {
						// insert parsed css to the styles block
						styleEl.innerHTML = styleBlockBegin + css + styleBlockEnd;
						sendString(svgEl.outerHTML, done);
					});
				}
			});
		});
	}
}

/**
 * Will parse a string of a Sass file and returns its compiled css
 * @param  {string}   data     content of a sass file
 * @param  {Function} callback called when a succesfull sass render happened
 */
function renderSassData(data, callback) {
	sass.render({ data }, function(err, result) {
		if(err) throw err;

		callback(result.css.toString());
	});
}

/**
 * Encodes given string and return it to sass
 * @param  {String} string The compiled svg
 * @return {sass.types.String} Sass string of data: url of the compiled svg
 */
function sendString(string, callback) {
	var str = encodeOptimizedSVGDataUri(string);
	callback(new sass.types.String("'" + str + "'"));
}

/**
 * encodes a svg with only the needed characters
 * res: https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
 * @param  {String} svgString string containing a svg file
 * @return {String}           data: url of comiled svg
 */
function encodeOptimizedSVGDataUri(svgString) {
  var uriPayload = encodeURIComponent(svgString) // encode URL-unsafe characters
    .replace(/%0A/g, '') // remove newlines
    .replace(/%20/g, ' ') // put spaces back in
    .replace(/%3D/g, '=') // ditto equals signs
    .replace(/%3A/g, ':') // ditto colons
    .replace(/%2F/g, '/') // ditto slashes
    .replace(/%22/g, "'"); // replace quotes with apostrophes (may break certain SVGs)

  return 'data:image/svg+xml,' + uriPayload;
}

module.exports = functions;