const path = require("path");

const { runWebpack } = require("./compile");


it("should compile a simple scss file", async () => {
    try {
        await runWebpack({
            entry: path.join(__dirname, "entry.js"),
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

it("should compile sourceMap", async () => {
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
                                    sourceMap: true
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