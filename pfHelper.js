const fs = require('fs');
const cproc = require('child_process');
const PI_SETTINGS = './settings.json';
var pfListeners = Array();

process.env.ADMIN_PORT = "8080";
process.env.ADMIN_SERVER = "true";
process.env.LOG_LEVEL = "warn";

global.pfEnv = {
    imgPath: "images/sample/",
    imgList: "images-example.xml",
    slideDelay: 30000,
    isRandom: true,
    startTime: 0,
    endTime: 0
}

global.pfImgsXML = null;
global.pfIsPaused = false;

global.registerPfListener = function (listener) {
    console.info("Registering listener");
    pfListeners.push(listener);
}

function loadViewSettings(jsonDoc) {
    //Load application variables
    if (jsonDoc.viewSettings.imgPath != null) {
        console.info("Setting imgPath (" + global.pfEnv.imgPath + ") to " + jsonDoc.viewSettings.imgPath.value);
        global.pfEnv.imgPath = jsonDoc.viewSettings.imgPath.value;
    }
    if (jsonDoc.viewSettings.imgList != null) {
        console.info("Setting imgList (" + global.pfEnv.imgList + ") to " + jsonDoc.viewSettings.imgList.value);
        global.pfEnv.imgList = jsonDoc.viewSettings.imgList.value;
    }
    if (jsonDoc.viewSettings.slideDelay != null) {
        console.info("Setting slideDelay (" + global.pfEnv.slideDelay + ") to " + jsonDoc.viewSettings.slideDelay.value);
        global.pfEnv.slideDelay = jsonDoc.viewSettings.slideDelay.value;
    }
    if (jsonDoc.viewSettings.randomize != null) {
        console.info("Setting randomize (" + global.pfEnv.isRandom + ") to " + jsonDoc.viewSettings.randomize.value);
        global.pfEnv.isRandom = jsonDoc.viewSettings.randomize.value;
    }
    if (jsonDoc.viewSettings.startTime != null) {
        console.info("Setting startTime (" + global.pfEnv.startTime + ") to " + jsonDoc.viewSettings.startTime.value);
        global.pfEnv.startTime = jsonDoc.viewSettings.startTime.value;
    }
    if (jsonDoc.viewSettings.endTime != null) {
        console.info("Setting endTime (" + global.pfEnv.endTime + ") to " + jsonDoc.viewSettings.endTime.value);
        global.pfEnv.endTime = jsonDoc.viewSettings.endTime.value;
    }

    autoManageDisplay();
}

async function initializeSettings() {
    console.info("Initializing settings");

    if (fs.existsSync(PI_SETTINGS)) {
        const jsonDoc = require(PI_SETTINGS);
        global.pfEnvRaw = jsonDoc;

        if (jsonDoc.serverSettings.ADMIN_LOG_LEVEL != null) {
            console.info("Setting ADMIN_LOG_LEVEL (" + process.env.LOG_LEVEL + ") to " + jsonDoc.serverSettings.ADMIN_LOG_LEVEL);
            process.env.LOG_LEVEL = jsonDoc.serverSettings.ADMIN_LOG_LEVEL;
        }

        watchFile(PI_SETTINGS);
        console.debug(PI_SETTINGS + ":");
        console.debug(jsonDoc);

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
        await loadViewSettings(jsonDoc);

        fs.readFile("www/" + global.pfEnv.imgList, 'utf8', function (err, data) {
            if (!err) {
                global.pfImgsXML = data;
            } else {
                console.warn("Unable to load file: " + "www/" + global.pfEnv.imgList);
            }
        });
        watchFile("www/" + global.pfEnv.imgList);



    } else {
        console.warn("Unable to locate settings file: " + PI_SETTINGS);
    }
}
module.exports.initializeSettings = initializeSettings;

function notifyListeners(event) {
    pfListeners.forEach(listener => {
        listener(event.toUpperCase());
    });
}

var isLocked = false;
function watchFile(file) {
    console.info("Watching: " + file);
    fs.watch(file, function (event, filename) {
        console.info("isLocked: " + isLocked);
        if (event == "change" && !isLocked) {
            isLocked = true;

            console.info(event + ":" + filename);
            switch (filename) {
                case global.pfEnv.imgList:
                    fs.readFile("www/" + global.pfEnv.imgList, 'utf8', function (err, data) {
                        if (!err) {
                            global.pfImgsXML = data;
                            notifyListeners("IMG_LIST_" + event.toUpperCase(), data);
                        } else {
                            console.warn("Unable to load file: " + "www/" + global.pfEnv.imgList);
                        }
                    });
                    break;
                case PI_SETTINGS.substr(PI_SETTINGS.lastIndexOf("/") + 1, PI_SETTINGS.length):
                    fs.readFile(PI_SETTINGS, 'utf8', async function (err, data) {
                        if (!err) {
                            global.pfEnvRaw = JSON.parse(data);
                            await loadViewSettings(JSON.parse(data));
                            notifyListeners("SETTINGS_" + event.toUpperCase(), null);
                        } else {
                            console.warn("Unable to load settings file!");
                        }
                    });
                    break;
                default:
                    console.warn("No action taken for: '" + filename + "'");
                    break;
            }

            setTimeout(function () {
                isLocked = false;
            }, 1000);
        }
    });
}


function execute(command, callback) {
    cproc.exec(command, (error, stdout, stderr) => {
        console.info("Error: " + error);
        console.info("Stdout: " + stdout);
        console.info("Stderr" + stderr);
        callback(stdout);
    });
};

// call the function
function displayOn() {
    global.pfIsPaused = false;
    notifyListeners("SLIDESHOW_PAUSED", global.pfIsPaused);

    console.log("Display On");

    execute('vcgencmd display_power 1', (output) => {
        console.log(output);
    });
}
module.exports.displayOn = displayOn;


function displayOff() {
    global.pfIsPaused = true;
    notifyListeners("SLIDESHOW_PAUSED", global.pfIsPaused);

    console.log("Display Off");

    execute('vcgencmd display_power 0', (output) => {
        console.log(output);
    });
}
module.exports.displayOff = displayOff;

var displayTimer;
function autoManageDisplay() {
    if (displayTimer != null) {
        clearInterval(displayTimer);
    }

    if (global.pfEnv.startTime != "00:00" || global.pfEnv.endTime != "00:00") {
        displayTimer = setInterval(() => {
            var now = new Date();
            var shm = global.pfEnv.startTime.split(":");
            var ehm = global.pfEnv.endTime.split(":");
            var start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), shm[0], shm[1]);
            var end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ehm[0], ehm[1]);

            var opts = { hour12: false, hour: "2-digit", minute: "2-digit" };
            /*
            console.info("Time (cur/start/end/isPaused):" +
             now.toLocaleTimeString('en-US',opts) + " / " + 
             start.toLocaleTimeString('en-US',opts) + " / " +
             end.toLocaleTimeString('en-US',opts) + " / " +
             global.pfIsPaused);

             console.log("Evaluating timer (" + (now >= start) + ", " + (now >= end) + ", " + global.pfIsPaused + ")");
            */
            if (now >= start && now <= end && global.pfIsPaused) {
                displayOn();
            } else if (now >= end && !global.pfIsPaused) {
                displayOff();
            }
        }, 5000);
    }
}
