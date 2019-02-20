var xhttp = new XMLHttpRequest();

xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        stageSlides(this.responseXML);
    }
};
xhttp.open("GET", "images.xml", true);
xhttp.send();

function preloadNextImage(imgIndex, imgNodes) {
    imgIndex++;
    if (imgIndex >= imgNodes.length) { imgIndex = 0 }

    imgURL = imgNodes[imgIndex].childNodes[0].nodeValue;

    //Pre-load the image
    var nextImg = new Image();
    nextImg.src = imgURL;
}

function stageSlides(xmlDoc) {
    var imgNodes = xmlDoc.getElementsByTagName("img");
    var imgIndex = imgNodes.length;
    var imgURL = "";

    if (imgIndex >= imgNodes.length) { imgIndex = 0 }

    imgURL = imgNodes[imgIndex].childNodes[0].nodeValue;

    document.getElementById("photoDisplay").style.backgroundImage = "url('" + imgURL + "')";
    document.getElementById("bgFill").style.backgroundImage = "url('" + imgURL + "')";

    preloadNextImage(imgIndex, imgNodes);

    setInterval(function () {
        imgIndex++;
        if (imgIndex >= imgNodes.length) { imgIndex = 0 }

        imgURL = imgNodes[imgIndex].childNodes[0].nodeValue;

        document.getElementById("photoDisplay").style.backgroundImage = "url('" + imgURL + "')";
        document.getElementById("bgFill").style.backgroundImage = "url('" + imgURL + "')";

        preloadNextImage(imgIndex, imgNodes);
    }, 30000);
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
