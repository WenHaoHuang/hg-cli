const { createServer } = require('vite')
const vuePlugin = require('@vitejs/plugin-vue')
const markdown = require('vite-plugin-md').default
const vueJsx = require('@vitejs/plugin-vue-jsx')
const mdPlugin = require('./plugins/plugins')

const preview = async (name) => {
  const config = {
    configFile: false,
    root: "./preview",
    plugins: [
      vuePlugin({
        include: [/\.vue$/, /\.md$/],
      }),
      vueJsx(),
      markdown({
        markdownItSetup(md) {
          mdPlugin(md)
        },
        wrapperClasses: 'wrapper-preview',
      }),
    ],
    server: {
      port: 8080,
    },
  }
  const server = await createServer(config);
  if (!server.httpServer) {
      throw new Error('HTTP server not available');
  }
  await server.listen();
  const info = server.config.logger.info;
  info(`\n  vite v${require('vite/package.json').version}` +
      ` dev server running at:\n`, {
      clear: !server.config.logger.hasWarned
  });
  server.printUrls();
}

module.exports = (...args) => {
  return preview(...args).catch((err) => {
    console.log(err)
    process.exit(1)
  })
}
