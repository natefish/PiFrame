const fs = require('fs');
const piSettings = './settings.json';

process.env.ADMIN_PORT = 8080;
process.env.ADMIN_SERVER = true;

global.pfEnv = {
    imgPath: "images/sample/",
    imgList: "images-example.xml",
    slideDelay: 30000,
    isRandom: true
}

async function initializeSettings() {
    console.info("Initializing settings");

    if (fs.existsSync(piSettings)) {
        const jsonDoc = require(piSettings);

        //Load environmental variables
        if (jsonDoc.ADMIN_PORT != null) {
            console.info("Setting ADMIN_SERVER (" + process.env.ADMIN_SERVER + ") to " + jsonDoc.ADMIN_SERVER);
            process.env.ADMIN_SERVER = jsonDoc.ADMIN_SERVER;
        }
        if (jsonDoc.ADMIN_PORT != null) {
            console.info("Setting ADMIN_PORT (" + process.env.ADMIN_PORT + ") to " + jsonDoc.ADMIN_PORT);
            process.env.ADMIN_PORT = jsonDoc.ADMIN_PORT;
        }

        //Load application variables
        if (jsonDoc.imgPath != null) {
            console.info("Setting imgPath (" + global.pfEnv.imgPath + ") to " + jsonDoc.imgPath);
            pfEnv.imgPath = jsonDoc.imgPath;
        }
        if (jsonDoc.imgList != null) {
            console.info("Setting imgList (" + global.pfEnv.imgList + ") to " + jsonDoc.imgList);
            pfEnv.imgList = jsonDoc.imgList;
        }
        if (jsonDoc.slideDelay != null) {
            console.info("Setting slideDelay (" + global.pfEnv.slideDelay + ") to " + jsonDoc.slideDelay);
            pfEnv.slideDelay = jsonDoc.slideDelay;
        }
        if (jsonDoc.randomize != null) {
            console.info("Setting imgPath (" + global.pfEnv.isRandom + ") to " + jsonDoc.randomize);
            pfEnv.isRandom = jsonDoc.randomize;
        }
    } else {
        console.warn("Unabled to locate settings file: " + piSettings);
    }
}
module.exports.initializeSettings = initializeSettings;
