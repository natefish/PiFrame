const http = require('http');
const fs = require('fs');
const path = require('path');

function startServer() {
  http.createServer(function (req, res) {
    var filePath, contentType;

    if (req.url == '/') {
      filePath = '/www-admin/index.html';
    } else {
      filePath = '/www-admin' + req.url;
    }

    filePath = __dirname + filePath;

    //Get the extension to perform the switch on.
    switch (path.extname(filePath)) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      default:
        contentType = 'text/html';
    }

    fs.exists(filePath, function (exists) {
      if (exists) {
        fs.readFile(filePath, function (err, data) {
          if (err) {
            console.error(filePath)
            res.writeHead(500);
            res.end();
          } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.write(data);
            res.end();
          }
        });
      } else {
        console.error(filePath)
        res.writeHead(404);
        res.end();
      }
    });
  }).listen(process.env.ADMIN_PORT);
}
module.exports.startServer = startServer;

