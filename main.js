const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs').promises;
const { createReadStream } = require('fs');
const mime = require('mime');
const ejs = require('ejs');
const { promisify } = require('util');

// 默认配置
function mergeConfig(config) {
  return {
    port: 8889,
    directory: process.cwd(),
    ...config,
  };
}

class Server {
  constructor(config) {
    this.config = mergeConfig(config);
    console.log(this.config, 'this.config');
  }
  start() {
    console.log('start');
    let server = http.createServer(this.serverHandle.bind(this));
    server.listen(this.config.port, () => {
      console.log('server working');
    });
  }

  async serverHandle(req, res) {
    let { pathname } = url.parse(req.url);
    pathname = decodeURIComponent(pathname);
    let abspath = path.join(this.config.directory, pathname);

    try {
      let statObj = await fs.stat(abspath);
      if (statObj.isFile()) {
        this.fileHandle(req, res, abspath);
      } else {
        let dirs = await fs.readdir(abspath);
        dirs = dirs.map(item=>{
          return{
            path:path.join(pathname,item),
            dirs:item
          }
        })

        let renderFile = promisify(ejs.renderFile);

        let parentpath = path.dirname(pathname)
        let ret = await renderFile(path.resolve(__dirname, 'template.html'), {
          arr: dirs,
          parent: pathname === '/' ? false : true,
          parentpath:parentpath,
          title: path.basename(abspath)
        });
        res.end(ret);
        console.log(dirs);
      }
    } catch (error) {
      this.errorHandle(req, res, error);
    }
  }

  // 错误处理
  errorHandle(req, res, err) {
    console.log(err);
    res.statusCode = 404;
    res.setHeader('Content-type', 'text/html;charset=utf-8');
    res.end('Not Found');
  }

  // 文件处理
  fileHandle(req, res, abspath) {
    res.statusCode = 200;
    res.setHeader('Content-type', mime.getType(abspath) + ';charset=utf-8');
    createReadStream(abspath).pipe(res);
  }
}

module.exports = Server;
