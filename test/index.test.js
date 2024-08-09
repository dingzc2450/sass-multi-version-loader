const path = require("path");
const fs = require("fs");

const testLoader = require("./tools/testLoader");

const pathToSassLoader = require.resolve("../dist/loader.js");

const { runWebpack } = require("./compile");

describe('simple', () => {

    it("should compile a simple scss file", async () => {
        try {
            await runWebpack({
                entry: path.join(__dirname,  "simply.scss"),
                module: {
                    rules: [
                        {
                            test: /\.scss$/,
                            use: [
                                {
                                    loader: path.resolve(__dirname, "../dist/loader.js"),
                                    options: {
                                        // implementation: require("sass")
                                    }
                                }
                            ]
                        }
                    ]
                }
            })
        } catch (error) {
            expect(error.message).toMatch(/underscore-dir-1-index/);
            return Promise.resolve()
        }
        return Promise.reject()
    });


    it("should compile a vue2.x scss deep", async () => {
        try {
            await runWebpack({
                entry: path.join(__dirname, "entry2.js"),
                module: {
                    rules: [
                        {
                            test: /\.scss$/,
                            use: [
                                {
                                    loader: path.resolve(__dirname, "../dist/loader.js"),
                                    options: {
                                        ignoreKeywords: ["/deep/"],
                                    }
                                }
                            ]
                        }
                    ]
                }
            })
        } catch (error) {
            expect(error.message).toMatch(/\/deep\//);
            return Promise.resolve()
        }
        return Promise.reject()
    });
})



describe("source maps", () => {
    function buildWithSourceMaps() {
        return runWebpack({
            entry: path.join(__dirname, "scss", "imports.scss"),
            output: {
                filename: "bundle.source-maps.js"
            },
            devtool: "source-map",
            module: {
                rules: [{
                    test: /\.scss$/,
                    use: [
                        { loader: testLoader.filename },
                        {
                            loader: pathToSassLoader, options: {
                                sourceMap: true
                            }
                        }
                    ]
                }]
            }
        });
    }

    it("should compile without errors", () => buildWithSourceMaps());
    // it("should produce a valid source map", () => {
    //     const cwdGetter = process.cwd;
    //     const fakeCwd = path.join(__dirname, "scss");

    //     process.cwd = function () {
    //         return fakeCwd;
    //     };

    //     return buildWithSourceMaps()
    //         .then(() => {
    //             const {sourceMap} = testLoader;

    //             sourceMap.should.not.have.property("file");
    //             sourceMap.should.have.property("sourceRoot", fakeCwd);
    //             // This number needs to be updated if imports.scss or any dependency of that changes
    //             sourceMap.sources.should.have.length(8);
    //             sourceMap.sources.forEach(sourcePath =>
    //                 fs.existsSync(path.resolve(sourceMap.sourceRoot, sourcePath))
    //             );

    //             process.cwd = cwdGetter;
    //         });
    // });
});