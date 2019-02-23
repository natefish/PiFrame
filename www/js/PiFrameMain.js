var slideDelay = 30000;
var imgPath = "images/sample/";
var imgList = "images-example.xml";
var isRandom = true;

function getFile(filePath) {
    console.info("Loading file: " + filePath);

    return new Promise(function (resolve, reject) {
        var xhttp = new XMLHttpRequest();

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

    var res = await getFile("settings.txt");

    if (res.status == 200) {
        var jsonDoc = JSON.parse(res.responseText);

        if (jsonDoc.slideDelay != null) {
            console.info("Setting slideDelay (" + slideDelay + ") to " + jsonDoc.slideDelay);
            slideDelay = jsonDoc.slideDelay;
        }
        if (jsonDoc.imgPath != null) {
            console.info("Setting imgPath (" + imgPath + ") to " + jsonDoc.imgPath);
            imgPath = jsonDoc.imgPath;
        }
        if (jsonDoc.imgList != null) {
            console.info("Setting imgList (" + imgList + ") to " + jsonDoc.imgList);
            imgList = jsonDoc.imgList;
        }
        if (jsonDoc.randomize != null) {
            console.info("Setting randomize (" + isRandom + ") to " + jsonDoc.randomize);
            isRandom = jsonDoc.randomize;
        }
    }

    startSlideshow();
}

async function startSlideshow() {
    var res = await getFile(imgList);
    if (res.status == 200) {
        stageSlides(res.responseXML);
    } else {
        document.getElementById("photoDisplay").innerHTML = "Unable to find '" + imgList + "'";
    }
}

function preloadNextImage(imgIndex, imgNodes) {
    imgIndex++;
    if (imgIndex >= imgNodes.length) { imgIndex = 0 }

    imgURL = imgPath + imgNodes[imgIndex].childNodes[0].nodeValue;

    //Pre-load the image
    var nextImg = new Image();
    nextImg.src = imgURL;
}

function loadImage(imgIndex, imgNodes) {
    var imgURL = "";

    imgURL = imgPath + imgNodes[imgIndex]//.childNodes[0].nodeValue;

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

    //preloadNextImage(imgIndex, imgNodes);

}

function stageSlides(xmlDoc) {
    var imgNodes = xmlDoc.getElementsByTagName("img");
    var imgIndex = 0;
    var imgUrls = new Array();

    for (var i = 0; i < imgNodes.length; i++) {
        imgUrls.push(imgNodes[i].childNodes[0].nodeValue);
    }
    if (isRandom) {
        imgUrls.sort(function (a, b) { return 0.5 - Math.random() });
    }

    //TODO: Randomize picture selection by default, maybe use session storage

    loadImage(imgIndex, imgUrls);

    setInterval(function () {
        imgIndex++;
        if (imgIndex >= imgUrls.length) {
            imgIndex = 0;
            if (isRandom) {
                imgUrls.sort(function (a, b) { return 0.5 - Math.random() });
            }
        }

        loadImage(imgIndex, imgUrls);

    }, slideDelay);
}

function openNav() {
    document.getElementById("mySidenav").style.width = "200px";
    document.getElementById("main").style.marginLeft = "200px";
    document.getElementById("myMenuBtn").style.fontSize = "0px";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.getElementById("myMenuBtn").style.fontSize = "30px";
    document.body.style.backgroundColor = "black";
}
