var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ScriptExtHtmlPlugin = require('script-ext-html-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
    devtool: 'cheap-module-source-map',
    entry: {
      index: [require.resolve('babel-polyfill'), path.resolve(__dirname, '../src/index')]
    },
    output: {
        path: path.resolve(__dirname, '../build'),
        filename: "[name].js"
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(__dirname, '../public/index.html'),
            filename: 'index.html',
            minify: {
              // 压缩html
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true
            },
            chunks: ['index']
        }),
        new ScriptExtHtmlPlugin({
          defaultAttribute: 'defer'
        }),
        new OptimizeCssAssetsPlugin({
          // 压缩css
          assetNameRegExp: /\.css$/g,
          cssProcessor: require('cssnano'),
          cssProcessorOptions: { discardComments: { removeAll: true } },
          canPrint: true
        }),
        new ExtractTextPlugin('style.css'),
        new webpack.optimize.UglifyJsPlugin({
          // 使用webpack自带的文件压缩插件
          compress: {
            // 去除console.log
            drop_console: true
          },
          // 如果启用了压缩无法生成map文件，需要在此处开启
          sourceMap: true,
        }),
        new CopyWebpackPlugin([
          {
            from: path.resolve(__dirname, '../public'),
            to: path.resolve(__dirname, '../build')
          },
          {
            from: path.resolve(__dirname, '../src/main.js'),
            to: path.resolve(__dirname, '../build')
          },
          /*{
            from: path.resolve(__dirname, '../node_modules/oracledb'),
            to: path.resolve(__dirname, '../build/oracledb')
          },*/
        ],{
          ignore: [path.resolve(__dirname, '../public/index.html')],
          copyUnmodified: true
        })
    ],
    externals: {
      jquery: 'jQuery'
    },
    module: {
        loaders: [
            { test: /\.xml$/, loader: 'xml-loader' },
            {
                test: /\.(js|tsx|jsx)$/,
                loader: 'babel-loader'
            },
            {
              test: /\.json$/,
              exclude: /node_modules/,
              loader: 'json-loader'
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