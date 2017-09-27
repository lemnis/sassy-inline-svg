const SVGO = 		require('svgo');

var svgo = new SVGO();
var disabled = false;

module.exports = {
	get disabled() {
		disabled;
	},
	set disabled(val) {
		disabled = val;
	},
	updateInstance(options) {
		svgo = new SVGO(options);
	},
	optimize(string, callback) {
		svgo.optimize(string, (result) => {
			callback(result);
		});
	}
};