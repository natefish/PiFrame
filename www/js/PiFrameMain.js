var slideDelay = 30000;
var imgPath = "images/sample/";
var Randomize

function getFile(filePath){
    console.info("Loading file: " + filePath);

    return new Promise(function(resolve, reject){
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

async function initializeSettings(){
    console.info("Initializing settings");

    var res = await getFile("settings.txt");

    if(res.status == 200){
        var jsonDoc = JSON.parse(res.responseText);

        if(jsonDoc.slideDelay != null){
            console.info("Setting slideDelay (" + slideDelay + ") to " + jsonDoc.slideDelay);
            slideDelay = jsonDoc.slideDelay;
        }
    }
}

async function startSlideshow(){
    var res = await getFile("images.xml");
    if(res.status == 200){
        stageSlides(res.responseXML);
    }else{
        stageSlides(getFile("images-example.xml").responseXML);
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

function loadImage(imgIndex,imgNodes){
    var imgURL = "";

    imgURL = imgPath + imgNodes[imgIndex].childNodes[0].nodeValue;

    document.getElementById("photoDisplay").style.backgroundImage = "url('" + imgURL + "')";
    document.getElementById("bgFill").style.backgroundImage = "url('" + imgURL + "')";

    preloadNextImage(imgIndex, imgNodes);

}

function stageSlides(xmlDoc) {
    var imgNodes = xmlDoc.getElementsByTagName("img");
    var imgIndex = 0;

    //TODO: Randomize picture selection by default, maybe use session storage

    loadImage(imgIndex, imgNodes);

    setInterval(function () {
        imgIndex++;
        if (imgIndex >= imgNodes.length) { imgIndex = 0 }

        loadImage(imgIndex, imgNodes);

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
