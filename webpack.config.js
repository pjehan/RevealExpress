const path = require("path");
const webpack = require("webpack");

module.exports = (env, argv) => {
    const mode = argv.mode || 'development';

    return {
        entry: {
            index: './src/index.js'
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            // JSX dev runtime must match the React build selected by the webpack mode
                            ['@babel/preset-react', { development: mode === 'development' }]
                        ]
                    }
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: ['style-loader', 'css-loader', 'sass-loader']
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                }
            ]
        },
        resolve: { extensions: ['*', '.js', '.jsx'] },
        output: {
            path: path.resolve(__dirname, "public/"),
            publicPath: "/",
            filename: "bundle.js",
            clean: true
        },
        performance: { hints: false }, // Bundle is served on the local network
        mode: mode
    };
};
