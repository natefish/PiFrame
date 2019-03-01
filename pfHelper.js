const fs = require('fs');
const piSettings = './settings.json';

process.env.ADMIN_PORT = "8080";
process.env.ADMIN_SERVER = "true";
process.env.LOG_LEVEL = "debug";

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

        console.debug(piSettings + ":\n" + jsonDoc);

        //Load environmental variables
        if (jsonDoc.serverSettings.ADMIN_PORT != null) {
            console.info("Setting ADMIN_SERVER (" + process.env.ADMIN_SERVER + ") to " + jsonDoc.serverSettings.ADMIN_SERVER);
            process.env.ADMIN_SERVER = jsonDoc.serverSettings.ADMIN_SERVER;
        }
        if (jsonDoc.serverSettings.ADMIN_PORT != null) {
            console.info("Setting ADMIN_PORT (" + process.env.ADMIN_PORT + ") to " + jsonDoc.serverSettings.ADMIN_PORT);
            process.env.ADMIN_PORT = jsonDoc.serverSettings.ADMIN_PORT;
        }

        //Load application variables
        if (jsonDoc.viewSettings.imgPath != null) {
            console.info("Setting imgPath (" + global.pfEnv.imgPath + ") to " + jsonDoc.viewSettings.imgPath);
            global.pfEnv.imgPath = jsonDoc.viewSettings.imgPath;
        }
        if (jsonDoc.viewSettings.imgList != null) {
            console.info("Setting imgList (" + global.pfEnv.imgList + ") to " + jsonDoc.viewSettings.imgList);
            global.pfEnv.imgList = jsonDoc.viewSettings.imgList;
        }
        if (jsonDoc.viewSettings.slideDelay != null) {
            console.info("Setting slideDelay (" + global.pfEnv.slideDelay + ") to " + jsonDoc.viewSettings.slideDelay);
            global.pfEnv.slideDelay = jsonDoc.viewSettings.slideDelay;
        }
        if (jsonDoc.viewSettings.randomize != null) {
            console.info("Setting imgPath (" + global.pfEnv.isRandom + ") to " + jsonDoc.viewSettings.randomize);
            global.pfEnv.isRandom = jsonDoc.viewSettings.randomize;
        }
    } else {
        console.warn("Unabled to locate settings file: " + piSettings);
    }
}
module.exports.initializeSettings = initializeSettings;
