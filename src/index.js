'use strict';

// Global modules
const path =  	require('path');
const fs =    	require('fs');

// Dependencies
const sass = 		require('node-sass');

// Local files
const dom = require('./dom.js');
const sassHelpers = require('./sass.js');
const svgo = require('./svgo.js');

// Default settings
var encoding = 'optimized';

var functions = {
	'inline-svg($svgPath, $styles: null, $options: null)': function(svgPath, styles, options, done) {
		var startPath = path.dirname(this.options.file);
		var pathToSvg = path.join(startPath, svgPath.getValue());
		var svgoIsDisabled = false;

		// overwrite default settings where needed
		if(options instanceof sass.types.Map){
			for (var i = 0; i < options.getLength(); i++) {
				switch (options.getKey(i).getValue()) {
				case 'encoding':
					encoding = options.getValue(i).getValue();
					break;
				case 'svgo':
					var val = sassHelpers.toNativeType(options.getValue(i));
					if(val == false){
						svgoIsDisabled = true;
					} else {
						svgo.updateInstance({plugins: val});
					}
					break;
				}
			}
		}

		sassHelpers.setOptions(this.options);
		// end overwrite settings

		fs.readFile(pathToSvg, (err, svgData) => {
			if (err) throw err;

			// parse given svg file in virtual dom
			var svgDom = new dom(svgData);

			// No extra styles given, return the original svg
			if(styles == sass.types.Null()){
				return sendString(svgData, encoding, svgoIsDisabled, done);
			}

			// try to read given styles as path
			var possibeStylePath = path.join(startPath, styles.getValue());
			fs.stat(possibeStylePath, (err, stats) => {
				if (err || !stats.isFile()) { // not a file, but a style block
					// insert original string of styles argument to the styles block
					svgDom.addStyleBlock(styles.getValue());
					sendString(svgDom.toString(), encoding, svgoIsDisabled, done);
				} else { // is a file, so render its content
					renderSassData(possibeStylePath, (css) => {
						// insert parsed css to the styles block
						svgDom.addStyleBlock(css);
						sendString(svgDom.toString(), encoding, svgoIsDisabled, done);
					});
				}
			});
		});
	}
};

/**
 * Will parse a string of a Sass file and returns its compiled css
 * @param  {string}   data     content of a sass file
 * @param  {Function} callback called when a succesfull sass render happened
 */
function renderSassData(file, callback) {
	sassHelpers.addFileToOptions(file);

	sass.render(sassHelpers.getOptions(), function(err, result) {
		if(err) throw err;
		callback(result.css.toString());
	});
}

/**
 * Encodes given string and return it to sass
 * @param  {String} string The compiled svg
 * @return {sass.types.String} Sass string of data: url of the compiled svg
 */
function sendString(string, encoding, svgoIsDisabled, callback) {
	function send(string){
		switch (encoding) {
		case 'base64':
			string = base64SVGDataUri(string);
			break;
		default:
			string = saveSVGDataUri(string);
			break;
		}
		callback(new sass.types.String('"' + string + '"'));
	}

	if (svgoIsDisabled) {
		send(string);
	} else {
		svgo.optimize(string, (result) => {
			send(result.data);
		});
	}

}

/**
 * encodes a svg with only the needed characters
 * res: https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
 * @param  {String} svgString string containing a svg file
 * @return {String}           data: url of comiled svg
 */
function saveSVGDataUri(svgString){
	var uriPayload = encodeURIComponent(svgString) // encode URL-unsafe characters
		.replace(/(%0A|%0D|%09)/g, '') // remove newlines, tabs and returns
		.replace(/%20/g, ' ') // put spaces back in
		.replace(/%3B/g, ';')
		.replace(/%2F/g, '/') // ditto slashes
		.replace(/%3F/g, '?')
		.replace(/%3A/g, ':') // ditto colons
		.replace(/%40/g, '@')
		.replace(/%3D/g, '=') // ditto equals signs
		.replace(/%2B/g, '+')
		.replace(/%24/g, '$')
		.replace(/%2C/g, ',')
		// eslint-disable-next-line quotes
		.replace(/%22/g, "'"); // replace quotes with apostrophes (may break certain SVGs)

	return 'data:image/svg+xml,' + uriPayload;

	// Escaped:
	// delims		= < > # % "
	// unwise 	= { } \ ^ [ ] `

	// Not escaped:
	// reserved = ; / ? : @ = + $ ,
}

function base64SVGDataUri(svgString){
	return 'data:image/svg+xml;base64,' + Buffer.from(svgString).toString('base64');
}

module.exports = functions;