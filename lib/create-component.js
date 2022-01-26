/**
 * 代码千万行 注释第一行
 * 编码不规范 阅读两行泪
 *
 * @Author       : wenhao.huang
 * @Date         : 2020-06-09 16:43:14
 * @LastEditors  : wenhao.huang
 * @LastEditTime : 2020-06-09 16:55:23
 */

const process = require('process')
const path = require('path')
const glob = require('glob')
const ora = require('ora')
const util = require('../util/index.js')
const uppercamelcase = require('uppercamelcase')

async function create(name) {
  await util.checkVersion()
  // 开发平台
  // const platform = os.platform()
  const CWD = process.cwd()
  const PROJECT_DIR = path.resolve(CWD, name)

  await util.projectDirCheck(PROJECT_DIR)

  let questions = {
    description: {
      desc: '请输入项目描述',
      default: '项目描述',
    },
    authorName: {
      desc: '请输入您的姓名',
      default: '姓名',
    },
    authorNumber: {
      desc: '请填写您的邮箱',
      default: 'xxxx@xx.com',
      message: '请输入邮箱地址'
    },
    version: {
      type: 'select',
      desc: '请选择Vue版本',
      default: 2,
      message: '请选择Vue版本'
    }
  }
  let answer = await util.pleaseAnswerMe(questions)
  answer.name = name
  // 复制模板文件
  const { version = 3 } = answer
  const TPL_DIR = path.resolve(__dirname, '../', 'tpl', `vue-${version}.x`)
  await util.generateProject(PROJECT_DIR, TPL_DIR)
  // 转换组件名称
  const componentName = uppercamelcase(name)
  answer.componentName = `${componentName}`
  // 拼接作者信息
  answer.author = `${answer.authorName}(${answer.authorNumber})`

  const spinner = ora('更新项目所需依赖版本').start()
  answer.designVersion = await util.fetchProject('element-ui')

  spinner.text = '更新完成.'
  spinner.stop()

  const PROJECT_EJS = glob.sync('**/*.ejs', { cwd: PROJECT_DIR, absolute: true, dot: true })
  await util.renderEjs(PROJECT_EJS, answer)

  // tips
  util.logGreen('\n项目')
  util.log(`cd ${name}`)

  util.logGreen('\n开发')
  util.log('yarn || npm install\nyarn start || npm run start')

  util.logGreen('\n发布')
  util.log('yarn build || npm run build')
}
module.exports = (...args) => {
  return create(...args).catch((err) => {
    console.log(err)
    process.exit(1)
  })
}
