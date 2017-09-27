// JSDOM variables
const jsdom = 	require('jsdom');
const {JSDOM} = jsdom;
const dom = 		new JSDOM();
const { document } = 	(dom).window;

// Constants
const styleBlockBegin = '<![CDATA[';
const styleBlockEnd = ']]>';

/**
 * Simple wrapper around jsdom to handle the dom actions
 * @type {constructor}
 */
module.exports = class {

	/**
	 * Wrapper around jsdom
	 * @param  {String} data String to parse
	 * @return {Class}
	 */
	constructor(data) {
		this.frag = JSDOM.fragment(data);
		this.svg = this.getSvgElement();
	}

	/**
	 * Retrieves the root svg element
	 * Currently a workaround, because querySelector doesn't work
	 * Bug report: https://github.com/tmpvar/jsdom/issues/1986
	 * @return {HTMLElement} `<svg>` element
	 */
	getSvgElement() {
		var svgEl;
		for (var i = 0; i < this.frag.childNodes.length; i++) {
			if(this.frag.childNodes[i].tagName == 'svg') {
				svgEl = this.frag.childNodes[i];
				return svgEl;
			}
		}
		if(!svgEl) throw new Error('SVG element not found');
	}

	/**
	 * Adds a css string to the DOM
	 * @param {String} content String to insert
	 */
	addStyleBlock(content) {
		// Create a style block for later use
		var styleEl = document.createElement('style');
		styleEl.type = 'text/css';
		styleEl.innerHTML = styleBlockBegin + content + styleBlockEnd;
		// append style block to svg element
		this.svg.appendChild(styleEl);
	}

	/**
	 * Returns the whole SVG element
	 * @return {String} String representing the DOM
	 */
	toString() {
		return this.svg.outerHTML;
	}
};