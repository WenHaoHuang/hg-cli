#!/usr/bin/env node

const chalk = require('chalk')
const semver = require('semver')
const didYouMean = require('didyoumean')
const commander = require('commander')
const package = require('./../package.json')
const requiredVersion = package.engines.node

didYouMean.threshold = 0.6

function checkNodeVersion(wanted, id) {
  if (!semver.satisfies(process.version, wanted)) {
    console.log(chalk.red(`You are using Node ${process.version}, but this version of ${id} requires Node ${wanted}.\nPlease upgrade your Node version.`))
    process.exit(1)
  }
}

checkNodeVersion(requiredVersion, '@hg-ui/hg-cli')

commander.version(package.version, '-v, --version').description(`组件市场开发脚手架 @${package.version}`).usage('<command> [options]')

commander
  .command('create <project-name>')
  .description('创建一个组件')
  .action((name) => {
    require('../lib/create')(name)
  })

commander.parse(process.argv)
