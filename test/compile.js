const path = require("path");

const webpack = require("webpack");

function runWebpack(baseConfig) {
    // const context = path.resolve(__dirname);
    const webpackConfig = {
        ...baseConfig,
        context: path.resolve(__dirname),
   
        output: {
            path: path.join(__dirname, "output"),
            filename: "bundle.[name].[hash].js",
            libraryTarget: "commonjs2"
        }
    };

    return new Promise((resolve, reject) => {
        webpack(webpackConfig, (webpackErr, stats) => {
            const err = webpackErr ||
                (stats.hasErrors() && stats.compilation.errors[0]) ||
                (stats.hasWarnings() && stats.compilation.warnings[0]);
            if (!err) {
                resolve();
            } else {
                reject(err);
            }
        });
    })
}

exports.runWebpack = runWebpack