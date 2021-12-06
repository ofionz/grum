module.exports = {
    publicPath: './',
    integrity: true,
    runtimeCompiler: true,
    transpileDependencies: ['vuetify'],
    configureWebpack: {
        optimization: {
            splitChunks: false,
        },
        output: {
            filename: "js/[name].js",
            chunkFilename: "js/c-[name].js",
        },
    },
    css: {
        extract: {
            ignoreOrder: true,
            filename: "css/[name].css",
            chunkFilename: "css/c-[name].css",
        },
    },
}
