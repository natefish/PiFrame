const rm = require('electron').remote;
var curInrvl;

function getFile(filePath) {
    console.info("Loading file: " + filePath);

    return new Promise(function (resolve, reject) {
        const xhttp = new XMLHttpRequest();

        xhttp.open("GET", filePath, true);
        xhttp.onload = function () {
            resolve(this);
        };
        xhttp.onerror = function () {
            reject(new Error("Unabled to load " + filePath));
        };
        xhttp.send();
    });
}

async function initializeSettings() {
    console.info("Initializing settings");
    console.info("imgPath: " + rm.getGlobal('pfEnv').imgPath);
    console.info("imgList: " + rm.getGlobal('pfEnv').imgList);
    console.info("slideDelay: " + rm.getGlobal('pfEnv').slideDelay);
    console.info("isRandom: " + rm.getGlobal('pfEnv').isRandom);
    rm.getGlobal('registerPfListener')(changeListener);
    startSlideshow();
}


async function startSlideshow() {
    var res = rm.getGlobal('pfImgsXML');
    console.info("IMG XML: " + res);
    if (res != null) {
        stageSlides(new DOMParser().parseFromString(res,"text/xml"));
    } else {
        document.getElementById("photoDisplay").innerHTML = "Unable to find '" + rm.getGlobal('pfEnv').imgList + "'";
    }
}

function loadImage(imgIndex, imgURLs) {

    var imgURL = rm.getGlobal('pfEnv').imgPath + imgURLs[imgIndex];

    console.info("Loading img: " + imgURL);

    var newImg = new Image();
    newImg.src = imgURL;
    newImg.onload = function () {
        document.getElementById("photoDisplay").innerHTML = "";
        document.getElementById("photoDisplay").style.backgroundImage = "url('" + imgURL + "')";
        document.getElementById("bgFill").style.backgroundImage = "url('" + imgURL + "')";
    }
    newImg.onerror = function () {
        document.getElementById("photoDisplay").innerHTML = "<span class='message'>Unable to find '" + imgURL + "'</span>";
        document.getElementById("photoDisplay").style.backgroundImage = "url('')";
        document.getElementById("bgFill").style.backgroundImage = "url('')";
    }
}

function stageSlides(xmlDoc) {
    var imgNodes = xmlDoc.getElementsByTagName("img");
    var imgIndex = 0;
    var imgUrls = new Array();

    for (var i = 0; i < imgNodes.length; i++) {
        imgUrls.push(imgNodes[i].childNodes[0].nodeValue);
    }
    if (rm.getGlobal('pfEnv').isRandom) {
        imgUrls.sort(function (a, b) { return 0.5 - Math.random() });
    }

    console.info("imgUrls: " + imgUrls);

    loadImage(imgIndex, imgUrls);

    curInrvl = setInterval(function () {
        //TODO if change in image list or settings, reload
        imgIndex++;
        if (imgIndex >= imgUrls.length) {
            imgIndex = 0;
            if (rm.getGlobal('pfEnv').isRandom) {
                imgUrls.sort(function (a, b) { return 0.5 - Math.random() });
            }
        }

        loadImage(imgIndex, imgUrls);
    }, rm.getGlobal('pfEnv').slideDelay);
}

function changeListener(event) {
    console.info("Event fired: " + event);
    clearInterval(curInrvl);
    switch (event) {
        case "IMG_LIST_CHANGE":
            startSlideshow();
            break;
        case "SETTINGS_CHANGE":
            startSlideshow();
            break;
        default:
            startSlideshow();
            break;
    }
}