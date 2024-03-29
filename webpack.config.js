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
                test: /\.s[ac]ss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader']
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
        publicPath: "/",
        filename: "bundle.js"
    },
    watch: true,
    mode: 'development'
};
