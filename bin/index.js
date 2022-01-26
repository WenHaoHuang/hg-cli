#!/usr/bin/env node

const chalk = require('chalk')
const semver = require('semver')
const didYouMean = require('didyoumean')
const { program } = require('commander')
const PKG = require('./../package.json')
const requiredVersion = PKG.engines.node

didYouMean.threshold = 0.6

function checkNodeVersion(wanted, id) {
  if (!semver.satisfies(process.version, wanted)) {
    console.log(chalk.red(`You are using Node ${process.version}, but this version of ${id} requires Node ${wanted}.\nPlease upgrade your Node version.`))
    process.exit(1)
  }
}

checkNodeVersion(requiredVersion, '@hg-ui/hg-cli')

program
  .version(PKG.version, '-v, --version')
  .description(`组件市场开发脚手架 @${PKG.version}`)
  .usage('<command> [options]')

program
  .command('create <project-name>')
  .option('-d, --default', '创建一个可发布的组件')
  .option('-p, --project', '创建一个项目')
  .description('创建一个项目')
  .action((name, options = { default: true }) => {
    if (options.project) {
      require('../lib/create-project')(name)
    } else {
      require('../lib/create-component')(name)
    }
  })

program
  .command('preview')
  .description('预览当前组件')
  .action((name, cmd) => {
    require('../cli-preview/index')(name, cmd)
  })

program
  .command('build')
  .description('打包当前组件')
  .action((name, cmd) => {
    require('../cli-preview/build')(name, cmd)
  })

program.parse(process.argv)
