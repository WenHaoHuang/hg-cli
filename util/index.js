/**
 * 代码千万行 注释第一行
 * 编码不规范 阅读两行泪
 *
 * @Author       : wenhao.huang
 * @Date         : 2020-06-09 16:43:19
 * @LastEditors  : wenhao.huang
 * @LastEditTime : 2020-06-09 16:55:39
 */

const process = require('process')
const chalk = require('chalk')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const request = require('request')
const ejs = require('ejs')
const package = require('./../package.json')

const log = (msg, color) => {
  let msgStr = msg instanceof Error ? msg.message : typeof msg == 'object' ? JSON.stringify(msg, null, 2) : msg
  if (color) {
    msgStr = (chalk[color] || chalk['white'])(msgStr)
  }
  console.log(msgStr)
}

const logRed = (msg) => {
  log(msg, 'red')
}

const logGreen = (msg) => {
  log(msg, 'green')
}

const confirm = (msg, backup = true) => {
  return inquirer
    .prompt([
      {
        name: 'yes',
        type: 'confirm',
        default: backup,
        message: msg
      }
    ])
    .then(({ yes }) => yes)
}

const quiz = (msg, backup) => {
  return inquirer
    .prompt([
      {
        name: 'input',
        type: 'input',
        default: backup,
        message: msg
      }
    ])
    .then(({ input }) => input)
}

const dirCheck = async (dir, { msg = '%s 已存在，确定要覆盖它么？', onlyCheck = false, defaultRemove = true } = {}) => {
  let exist = await fs.pathExists(dir)
  if (!exist) return 'na'
  if (onlyCheck) return 'keep'
  let shouldDelete = await confirm(msg.replace(/%s/g, dir), defaultRemove)
  if (!shouldDelete) return 'keep'
  await fs.remove(dir)
  return 'clear'
}

const projectDirCheck = async (projectDir) => {
  let status = await dirCheck(projectDir)
  switch (status) {
    case 'na':
      break
    case 'keep':
      process.exit()
    case 'clear':
      logGreen(`移除 ${projectDir} 成功.`)
  }
}

const generateProject = async (projectDir, tpl) => {
  let goon = await confirm(`准备创建项目,是否继续？`)
  if (!goon) process.exit()
  await fs.copy(tpl, projectDir, {
    filter: function(src) {
      return !/tpl(\\|\/)node_modules/.test(src)
    }
  })
}

async function fetchProject(project) {
  const uri = `https://registry.npmjs.org/${project}`
  return await new Promise((resolve, reject) => {
    request(
      {
        uri,
        method: 'GET',
        gzip: true
      },
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          const data = JSON.parse(body)
          const latest = data['dist-tags'].latest
          resolve(latest)
        }
        reject('1.0.0')
      }
    )
  })
}


async function renderEjs(files, context) {
  for (let tpl of files) {
    await render(tpl)
  }
  logGreen('\n项目初始化完成')
  async function render(tpl) {
    let content = await ejs.renderFile(tpl, context, { async: true })
    await fs.writeFile(tpl.replace('.ejs', ''), content, 'utf8')
    await fs.remove(tpl)
  }
}

async function pleaseAnswerMe(questions) {
  var answers = {}
  for (let key of Object.keys(questions)) {
    let question = questions[key]
    let answer
    while (!(question.pattern || /^.+$/).test((answer = await getAnswer(question)))) {
      logRed(question.message || `请按照格式规则填写！${String(question.pattern)}`)
    }
    answers[key] = answer
  }

  async function getAnswer(question) {
    let answer
    switch (question.type) {
      case 'confirm':
        answer = await confirm(question.desc, question.default)
        break
      default:
        answer = (await quiz(question.desc, question.default)).trim()
    }
    return answer
  }
  return answers
}

async function checkVersion() {
  const newVersion = await fetchProject('@hg-ui/hg-cli')
  if (newVersion !== package.version) {
    const msgStr = '\n\n\n您所使用的版本需要更新！\n\n> ' + chalk.cyan(`npm install -g @hg-ui/hg-cli@${newVersion}`) + '\n\n'
    console.log(msgStr)
    process.exit(1)
  }
  return true
}

module.exports = {
  log,
  logRed,
  logGreen,
  dirCheck,
  confirm,
  quiz,
  projectDirCheck,
  generateProject,
  fetchProject,
  pleaseAnswerMe,
  renderEjs,
  checkVersion
}
