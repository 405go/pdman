var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ScriptExtHtmlPlugin = require('script-ext-html-webpack-plugin');


module.exports = {
    devtool: 'cheap-module-eval-source-map',
    entry: {
        index: [require.resolve('babel-polyfill'), path.resolve(__dirname, '../src/index')]
    },
    output: {
        path: path.resolve(__dirname, '../build'),
        filename: "[name].js",
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(__dirname, '../public/index.html'),
            filename: 'index.html',
            chunks: ['index']
        }),
        new ScriptExtHtmlPlugin({
            defaultAttribute: 'defer'
        }),
        new ExtractTextPlugin('style.css')
    ],
    node: {
      __dirname: true
    },
    module: {
        loaders: [
          { test: /\.xml$/, loader: 'xml-loader' },
          {
                test: /\.(js|tsx|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.json$/,
                exclude: /node_modules/,
                loader: 'json-loader'
            },
            {
                test: /\.(js|tsx|jsx)$/,
                exclude: /node_modules/,
                loader: "eslint-loader"
            },
          {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract({
              fallback: "style-loader",
              use: [ "css-loader",
                { loader: "postcss-loader", options: { plugins: () => [ require('autoprefixer')({
                      browsers: [
                        '>1%',
                        'last 4 versions',
                        'Firefox ESR',
                        'not ie < 9', // React doesn't support IE8 anyway
                      ]
                    }) ]}}
              ]
            })
          },
          {
            test: /\.less$/,
            loader: ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: ["css-loader", { loader: "postcss-loader", options: { plugins: () => [ require('autoprefixer')({
                    browsers: [
                      '>1%',
                      'last 4 versions',
                      'Firefox ESR',
                      'not ie < 9', // React doesn't support IE8 anyway
                    ]
                  }) ]}},
                { loader: 'less-loader' }]
            })
          },
            {
                test: /\.(png|jpg|svg|gif)$/,
                loader: 'url-loader',
                options: {
                  limit: 8192
                }
            },
        ]
    },
    target: 'electron-renderer'
}