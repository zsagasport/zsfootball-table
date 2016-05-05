'use strict';

var metal = require('gulp-metal');

metal.registerTasks({
	bundleCssFileName: 'zsFootballTable.css',
	bundleFileName: 'ZsFootballTable.js',
	moduleName: 'zsfootball-table',
	testNodeSrc: [
		'env/test/node.js',
		'test/**/*.js'
	]
});
