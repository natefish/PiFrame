const http = require('http');
const fs = require('fs');
const path = require('path');

function startServer(ph) {

  http.createServer(function (req, res) {

    reqLogger(req);

    reqRouter(req, res);

  }).listen(process.env.ADMIN_PORT);
}
module.exports.startServer = startServer;

function reqLogger(req) {
  switch (req.url) {
    case '/inform':
      console.info("* New Requesta: '" + req.url + "'");
      break;
    default:
      console.info("\n\n*****************************");
      console.info("* New Request: '" + req.url + "'");
      console.info("*****************************");
      console.info(req.headers);
      console.info(req.url);
      console.info(req.method);
      console.info("*****************************\n\n");
  }

}

function reqRouter(req, res) {
  //POST,GET,PUT,PATCH,DELETE
  switch (req.method) {
    case 'GET':
      handleGET(req, res);
      break;
    case 'PUT':
      handlePUT(req, res);
      break;
    default:
      res.writeHead(500);
      res.end();
  }
}

function handleGET(req, res) {
  var filePath, contentType;

  if (req.url == '/') {
    filePath = '/www-admin/index.html';
  } else if (req.url == '/api/v1/settings') {
    filePath = '/settings.json';
  } else {
    filePath = '/www-admin' + req.url;
  }

  filePath = __dirname + filePath;

  //Get the extension to perform the switch on.
  switch (path.extname(filePath)) {
    case '.json':
      contentType = 'application/json';
      break;
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    default:
      contentType = 'text/html';
  }

  if (req.url == '/api/v1/settings') {
    data = JSON.stringify(global.pfEnvRaw.viewSettings);
    console.info("Sending settings: \n" + data);

    res.writeHead(200, { 'Content-Type': contentType });
    res.write(data);
    res.end();
  } else {
    //Serve content from a file
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
  }
}

function handlePUT(req, res) {
  var filePath = "";

  var body = "";
  req.on('data', function (data) {
    body += data.toString();

    console.info(body);

    // Too much POST data, kill the connection!
    // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
    if (body.length > 1e6)
      req.connection.destroy();
  });

  req.on('end', function () {

    console.info(JSON.parse(body));

    if (req.url == '/api/v1/settings') {
      var newSet = JSON.parse(body);

      filePath = __dirname + '/settings.json';

      fs.exists(filePath, function (exists) {
        if (exists) {
          fs.readFile(filePath, function (err, data) {
            var jsonDoc = JSON.parse(data);

            if (err) {
              console.error(filePath)
              res.writeHead(500);
              res.end();
            } else {
              if (jsonDoc.viewSettings.imgPath != null && newSet.imgPath != "") {
                console.info("Setting imgPath (" + jsonDoc.viewSettings.imgPath.value + ") to " + newSet.imgPath);
                jsonDoc.viewSettings.imgPath.value = newSet.imgPath;
              }
              if (jsonDoc.viewSettings.imgList != null && newSet.imgList != "") {
                console.info("Setting imgList (" + jsonDoc.viewSettings.imgList.value + ") to " + newSet.imgList);
                jsonDoc.viewSettings.imgList.value = newSet.imgList;
              }
              if (jsonDoc.viewSettings.slideDelay != null && newSet.slideDelay != "") {
                console.info("Setting slideDelay (" + jsonDoc.viewSettings.slideDelay.value + ") to " + newSet.slideDelay);
                jsonDoc.viewSettings.slideDelay.value = parseInt(newSet.slideDelay);
              }
              if (jsonDoc.viewSettings.randomize != null && newSet.randomize != "") {
                console.info("Setting radnomize (" + jsonDoc.viewSettings.randomize.value + ") to " + newSet.randomize);
                jsonDoc.viewSettings.randomize.value = newSet.randomize.toLowerCase() === 'true';
              }

              fs.writeFile(filePath, JSON.stringify(jsonDoc,null,4), 'utf8', function (err) {
                if (err) {
                  console.error(filePath)
                  res.writeHead(500);
                  res.end();
                } else {
                  res.writeHead(200, { 'Content-Type': 'text/json' });
                  res.write(JSON.stringify({ 'success': true }));
                  res.end();
                }
              });//fs.writeFile
            }
          });//fs.readFile
        } else {
          console.error(filePath)
          res.writeHead(404, { 'Content-Type': 'text/json' });
          res.write(JSON.stringify({ 'success': false }));
          res.end();
        }
      });
    }
  });
}

