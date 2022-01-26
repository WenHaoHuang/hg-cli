const mdContainer = require('markdown-it-container')

const mdPlugin = (md) => {
  md.use(mdContainer, 'demo', {
    validate(params) {
      return !!params.trim().match(/^demo\s*(.*)$/)
    },
    render(tokens, idx) {
      if (tokens[idx].nesting === 1 /* means the tag is opening */) {
        const sourceFileToken = tokens[idx + 2]
        const sourceFile = sourceFileToken?.content ?? ''
        return `<DemoBlock path="${sourceFile}" key="${idx}">`
      } else {
        return '</DemoBlock>'
      }
    },
  })
}

module.exports = mdPlugin
