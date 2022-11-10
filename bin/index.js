#! /usr/bin/env node

const { program } = require('commander');

// console.log('testtest');
// program.option('-p, --port', 'set server port');

// 配置信息
let options = {
  '-p --port <dir>': {
    'description': 'init server port',
    'example': 'qs -p 3306',
  },
  '-d --directory <dir>': {
    'description': 'init server directory',
    'example': 'qs -d c:',
  },
};

function formatConfig(configs, cb) {
  Object.entries(configs).forEach(([key, val]) => {
    cb(key, val);
  });
}

formatConfig(options, (cmd, val) => {
  // console.log(cmd,val);
  program.option(cmd, val.description);
});

program.on('--help', () => {
  console.log("Examples: ''");
  formatConfig(options, (cmd, val) => {
    console.log(val.example);
  });
});

program.name('qinds-serve');

let version = require('../package.json').version;
program.version(version);


let cmdConfig = program.parse(process.argv)

let programOptions = program.opts()

// console.log(programOptions);

let Server = require('../main.js')
new Server(programOptions).start()
