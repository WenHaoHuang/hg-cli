const { build: viteBuild } = require('vite')
const { resolve } = require('path')
const dts = require('vite-plugin-dts')
const vue = require('@vitejs/plugin-vue')
const helper = require('components-helper')
const { readFileSync, writeFileSync } = require('fs')

const proRoot = process.cwd()

const pathResolve = (dir) => {
  return resolve(proRoot, '.', dir)
}

const buildLib = async () => {
  const config = {
    configFile: false,
    resolve: {
      alias: {
        '@': pathResolve('src'),
      },
    },
    plugins: [
      dts({
        insertTypesEntry: true,
        outputDir: 'dist/types',
        staticImport: false,
        logDiagnostics: true,
        cleanVueFileName: false,
        clearPureImport: true,
        copyDtsFiles: false,
        noEmitOnError: false,
        beforeWriteFile: (filePath) => {
          return {
            filePath: filePath.replace('types\\src', 'types'),
          }
        },
      }),
      vue(),
    ],
    build: {
      outDir: 'dist/lib',
      lib: {
        entry: pathResolve('src/index.ts'),
        name: 'HgUi',
        formats: ['umd'],
        fileName: () => 'index.js',
      },
      emptyOutDir: true,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1024,
      rollupOptions: {
        external: ['vue'],
        output: {
          exports: 'named',
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
  }
  await viteBuild(config)
}

const buildHelper = async () => {
  await helper({
    name: '@hg-ui/h-frame',
    outDir: 'dist',
    version: '0.1.0',
    entry: './preview/README.md',
    props: 'Attributes',
    propsName: 'Attribute',
    propsOptions: 'Accepted Values',
    eventsName: 'Event Name',
    tableRegExp: '#+\\s+(.*\\s*Attributes|.*\\s*Events|.*\\s*Slots|.*\\s*Directives)\\s*\\n+(\\|?.+\\|.+)\\n\\|?\\s*:?-+:?\\s*\\|.+((\\n\\|?.+\\|.+)+)',
  })
}
const buildReadme = async () => {
  const fileContent = await readFileSync(pathResolve('./preview/README.md'), 'utf-8')
  const content = fileContent.replace(new RegExp(`:::demo\\n(.*\\s*)\\n:::`, 'g'), ($2, $1) => {
    const compContent = readFileSync(pathResolve(`./preview/examples/${$1}.vue`), 'utf-8')
    let content = '```\n'
    content += compContent
    content += '\n```'
    return content
  })
  await writeFileSync(pathResolve('dist/README.md'), content)
  await writeFileSync(pathResolve('./README.md'), content)
}

const buildDoc = async () => {
  await buildHelper()
  await buildReadme()
}

const build = async () => {
  await buildLib()
  await buildDoc()
}

module.exports = (...args) => {
  return build(...args).catch((err) => {
    console.log(err)
    process.exit(1)
  })
}
