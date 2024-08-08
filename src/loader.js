
import path from 'node:path';

// eslint-disable-next-line import/no-extraneous-dependencies
import sass from 'sass';
import async from 'async';
import pify from 'pify';


const formatSassError = require("./formatSassError");
const webpackImporter = require("./webpackImporter");
const normalizeOptions = require("./normalizeOptions");

// This queue makes sure node-sass leaves one thread available for executing
// fs tasks when running the custom importer code.
// This can be removed as soon as node-sass implements a fix for this.
const threadPoolSize = process.env.UV_THREADPOOL_SIZE || 4;
const asyncSassJobQueue = async.queue((task, callback) => {
    const { data, ignoreKeywords, ...rest } = task;
    let processData = data;
    const replaceKeywords = ignoreKeywords.map((_, i) => `::key-word-${i}`);
    let isReplaceDirty = false;
    if (ignoreKeywords.length > 0) {
        // record the replace status
        processData = ignoreKeywords.reduce((acc, keyword, i) => acc.replace(new RegExp(keyword, 'g'), (v) => {
            isReplaceDirty = true;
            return `::key-word-${i}`;
        }), data)
    }
    sass.render({ ...rest, data: processData }, (err, result) => {
        if (err) {
            callback(err);
            return;
        }

        const css = result.css.toString();
        result.css = css;
        if (isReplaceDirty) {
            // replace the key-word back to the original keyword
            result.css = replaceKeywords.reduce((acc, keyword, i) => acc.replace(new RegExp(keyword, 'g'), ignoreKeywords[i]), css);
        }
        callback(null, result);
    })
    // sass.compileStringAsync(processData,{
    //     importer:{

    //     }
    // })

}, threadPoolSize - 1);

/**
 * The sass-loader makes node-sass available to webpack modules.
 *
 * @this {LoaderContext}
 * @param {string} content
 */
function sassLoader(content) {
    const callback = this.async();
    const isSync = typeof callback !== "function";
    const self = this;
    const { resourcePath } = this;

    function addNormalizedDependency(file) {
        // node-sass returns POSIX paths
        self.dependency(path.normalize(file));
    }

    if (isSync) {
        throw new Error("Synchronous compilation is not supported anymore. See https://github.com/webpack-contrib/sass-loader/issues/333");
    }

    this.cacheable();

    const options = normalizeOptions(this, content, webpackImporter(
        resourcePath,
        pify(this.resolve.bind(this)),
        addNormalizedDependency
    ));

    // Skip empty files, otherwise it will stop webpack, see issue #21
    if (options.data.trim() === "") {
        callback(null, "");

    }

    // start the actual rendering
    asyncSassJobQueue.push(options, (err, result) => {
        if (err) {
            formatSassError(err, this.resourcePath);
            if (err.file) {
                this.dependency(err.file);
            }
            callback(err);
            return;
        }

        if (result.map && result.map !== "{}") {
            result.map = JSON.parse(result.map);
            // result.map.file is an optional property that provides the output filename.
            // Since we don't know the final filename in the webpack build chain yet, it makes no sense to have it.
            delete result.map.file;
            // The first source is 'stdin' according to node-sass because we've used the data input.
            // Now let's override that value with the correct relative path.
            // Since we specified options.sourceMap = path.join(process.cwd(), "/sass.map"); in normalizeOptions,
            // we know that this path is relative to process.cwd(). This is how node-sass works.
            result.map.sources[0] = path.relative(process.cwd(), resourcePath);
            // node-sass returns POSIX paths, that's why we need to transform them back to native paths.
            // This fixes an error on windows where the source-map module cannot resolve the source maps.
            // @see https://github.com/webpack-contrib/sass-loader/issues/366#issuecomment-279460722
            result.map.sourceRoot = path.normalize(result.map.sourceRoot);
            result.map.sources = result.map.sources.map(path.normalize);
        } else {
            result.map = null;
        }

        result.stats.includedFiles.forEach(addNormalizedDependency);
        callback(null, result.css, result.map);
    });
}

module.exports = sassLoader;
