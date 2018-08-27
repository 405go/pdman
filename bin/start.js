process.env.NODE_ENV = 'development';
var path = require('path');
var childProcess = require('child_process');
var webpack = require('webpack');
var config = require('../config/webpack.dev.config.js');

var WebpackDevServer = require('webpack-dev-server');
var formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

config.entry.index.unshift(`webpack-dev-server/client?http://localhost:3005/`);

var compiler = webpack(config);

compiler.plugin('invalid', function() {
    console.log('Compiling...');
});

compiler.plugin('done', function(stats) {
    var messages = formatWebpackMessages(stats.toJson({}, true));
    if (!messages.errors.length && !messages.warnings.length) {
        console.log('Compiled successfully!');
    }
    if (messages.errors.length) {
        console.log('Failed to compile.');
        return;
    }
    if (messages.warnings.length) {
        console.log('Compiled with warnings.');
        console.log('You may use special comments to disable some warnings.');
    }
});

var devServer = new WebpackDevServer(compiler, {
  contentBase: path.resolve(__dirname, '../public'),
});

devServer.listen(3005, 'localhost', () => {
  // 启动electron
  childProcess.spawn('npm', ['run', 'electron'], { shell: true, env: process.env, stdio: 'inherit' })
    .on('close', code => process.exit(code))
    .on('error', spawnError => console.error(spawnError));
});