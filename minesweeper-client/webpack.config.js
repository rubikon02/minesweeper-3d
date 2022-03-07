const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: './src/index.js',
    output: {
        filename: '[name].js', // bundle.js to wynik kompilacji projektu przez webpacka
        path: path.resolve(__dirname, '../minesweeper-server/src/main/resources/public'),
        clean: true,
    },
    devtool: 'source-map',
    mode: 'development', // none, development, production
    devServer: {
        port: 8080
    },
    plugins: [
        new HtmlWebpackPlugin({
            // hash: true,
            filename: 'index.html', //relative to root of the application
            title: "THREEJS webpack project",
            template: './src/index.html',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(mtl)$/i,
                use: 'mtl-loader',
                // type: 'asset/resource',
            },
            {
                test: /\.(obj)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|jp(e*)g|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 8000, // Convert images < 8kb to base64 strings
                        name: 'images/[name].[ext]'
                    }
                }]
            },
            {
                test: /\.ico$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 1,
                        name: 'images/[name].[ext]'
                    }
                }]
            }
        ]
    },
};