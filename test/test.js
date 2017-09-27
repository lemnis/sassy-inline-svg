/* eslint-env mocha */
/* eslint-disable quotes */

const fs = require('fs');
const path = require('path');

const assert = require('assert');
const rewire = require('rewire');

const sass = 		require('node-sass');

const sassFunctions = rewire('../src/index.js');

function getRelativeFile(filePath) {
	var file = path.join(__dirname, filePath);
	return fs.readFileSync(file, 'utf8');
}

var basicSVG = getRelativeFile('./basic.svg');
var simpleSVG = getRelativeFile('./simple.svg');
var complexSVG = getRelativeFile('./complex.svg');

describe('convert to data: string', () => {
	describe('optimized encoded URI', () => {
		var saveSVGDataUri = sassFunctions.__get__('saveSVGDataUri');

		it('Basic svg', () => {
			assert.equal(
				saveSVGDataUri(basicSVG),
				"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E"
			);
		});
		it('Simple svg', () => {
			assert.equal(
				saveSVGDataUri(simpleSVG),
				"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E "+
				"%3Crect x='0' y='0' style='fill: red;' width='100%25' height='100%25' /%3E %3C/svg%3E"
			);
		});
		it('Complex svg', () => {
			assert.equal(
				saveSVGDataUri(complexSVG),
				"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E"+
				"%3Cpath d='M10,10 H90 L50,70'/%3E"+
				"%3Ctext y='90'%3E' ' %23 %25 %26amp; %C2%BF %F0%9F%94%A3%3C/text%3E%3C/svg%3E"
			);
		});
	});

	describe('base64', () => {
		var base64SVGDataUri = sassFunctions.__get__('base64SVGDataUri');

		it('Basic svg', () => {
			assert.equal(
				base64SVGDataUri(basicSVG),
				'data:image/svg+xml;base64,' + new Buffer(basicSVG).toString('base64')
			);
		});
		it('Simple svg', () => {
			assert.equal(
				base64SVGDataUri(simpleSVG),
				'data:image/svg+xml;base64,' + new Buffer(simpleSVG).toString('base64')
			);
		});
	});
});

describe('API', () => {
	var functionName = 'inline-svg($svgPath, $styles: null, $options: null)';

	describe('inline-svg', () => {
		var saveSVGDataUri = sassFunctions.__get__('saveSVGDataUri');

		it('String of styles', (done) => {
			var styleString = 'svg{background:red}';

			sassFunctions[functionName].bind({ options: { file: __filename } })(
				new sass.types.String('./basic.svg'),
				new sass.types.String(styleString),
				null,
				(string) => {
					assert.equal(
						string.getValue(),
						'"'+ saveSVGDataUri('<svg xmlns="http://www.w3.org/2000/svg"><style>'+ styleString +'</style></svg>') + '"'
					);
					done();
				}
			);
		});

		it('External stylesheet', (done) => {
			var externalStylePath = './test.scss';
			var styleData = getRelativeFile(externalStylePath);

			sassFunctions[functionName].bind({ options: { file: __filename } })(
				new sass.types.String('./basic.svg'),
				new sass.types.String(externalStylePath),
				null,
				(string) => {
					assert.equal(
						string.getValue(),
						'"'+ saveSVGDataUri('<svg xmlns="http://www.w3.org/2000/svg"><style>'+ styleData +'</style></svg>') + '"'
					);
					done();
				}
			);
		});

		describe('No styles', () => {
			it('Basic svg', (done) => {
				sassFunctions[functionName].bind({ options: { file: __filename } })(
					new sass.types.String('./basic.svg'),
					sass.types.Null(),
					null,
					(string) => {
						assert.equal(string.getValue(), `"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"`);
						done();
					}
				);
			});
			it('Simple svg', (done) => {
				sassFunctions[functionName].bind({ options: { file: __filename } })(
					new sass.types.String('./simple.svg'),
					sass.types.Null(),
					null,
					(string) => {
						assert.equal(
							string.getValue(),
							`"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E`+
							`%3Crect width='100%25' height='100%25' fill='red'/%3E%3C/svg%3E"`
						);
						done();
					}
				);
			});
			it('Complex svg', (done) => {
				sassFunctions[functionName].bind({ options: { file: __filename } })(
					new sass.types.String('./complex.svg'),
					sass.types.Null(),
					null,
					(string) => {
						assert.equal(
							string.getValue(),
							`"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E`+
							`%3Cpath d='M10 10h80L50 70'/%3E%3Ctext y='90'%3E%26quot; %26apos; %23 %25 %26amp; %C2%BF %F0%9F%94%A3`+
							`%3C/text%3E%3C/svg%3E"`
						);
						done();
					}
				);
			});
		});
	});
});