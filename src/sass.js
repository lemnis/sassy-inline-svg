const sass = require('node-sass');
var sassOptions = {};

/**
 * Converts sass values to their native equivalence
 * @param  {Object} val sass value to Converts
 * @return {*}     JS type equivalence
 */
function toNativeType(val) {
	var result;

	if(val instanceof sass.types.Number) {
		return val.getValue() + val.getUnit();
	} else if(val instanceof sass.types.Color) {
		return 'rgb(' + val.getR() + ',' + val.getG() + ',' + val.getB() + ')';
	} else if(val instanceof sass.types.String || val.constructor.name == sass.types.Boolean.name) {
		// String or Boolean
		return val.getValue();
	} else if(val instanceof sass.types.List) {
		result = [];
		for (var i = 0; i < val.getLength(); i++) {
			result.push(toNativeType(val.getValue(i)));
		}
	} else if(val instanceof sass.types.Map) {
		result = {};
		for (var j = 0; j < val.getLength(); j++) {
			result[val.getKey(j).getValue()] = toNativeType(val.getValue(j));
		}
	} else if(val instanceof sass.types.Null) {
		return null;
	}

	if(result === null){
		throw new Error(`Couldn't convert ${val} to native equivalence`);
	}

	return result;
}

/**
 * Extracts the necessary options from the options of the sass instance
 * @param {Object} options the options object of the sass instance
 */
function setOptions(options){
	sassOptions = {
		importer: options.importer,
		functions: options.functions,
		indentedSyntax: options.indentedSyntax,
		indentType: options.indentType,
		indentWidth: options.indentWidth,
		linefeed: options.linefeed,
		outputStyle: options.outputStyle,
		precision: options.precision,
		sourceComments: options.sourceComments
	};
}

/**
 * get the sass options
 * @return {Object} Sass options
 */
function getOptions(){
	return sassOptions;
}

/**
 * Adds the file property to the sass options
 * @param {String} file Path to the file
 */
function addFileToOptions(file){
	sassOptions.file = file;
}

module.exports = {
	toNativeType,
	setOptions,
	getOptions,
	addFileToOptions
};