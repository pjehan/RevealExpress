const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: {
        index: './src/index.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                options: { presets: ['@babel/preset-env'] }
            },
            {
                test: /\.less$/,
                use: [
                    {loader: 'style-loader'},
                    {loader: 'css-loader'},
                    {loader: 'less-loader'}
                ]
            },
            {
                test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: '../public/fonts/',
                        publicPath: 'fonts/'
                    }
                }]
            },
            {
                test: /\.css$/,
                use: [
                    'css-loader'
                ]
            }
        ]
    },
    resolve: { extensions: ['*', '.js', '.jsx'] },
    output: {
        path: path.resolve(__dirname, "public/"),
        publicPath: "/public/",
        filename: "bundle.js"
    },
    watch: true,
    mode: 'development'
};
