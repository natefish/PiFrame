var pfSet;

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

async function populateSettings() {
    pfSet = JSON.parse((await getFile('settings.json')).responseText);

    Object.keys(pfSet).forEach(function (i) {
        console.info(i + " - " + pfSet[i]);

        var doc = document.getElementById("settings").innerHTML;
        var psDiv =
            "<div class='row'> \
            <div class='col-25'> \
                <label for=" + i + ">" + i + "</label> \
            </div> \
            <div class='col-75'> \
                <input type='text' id=" + i + " name=" + i + " value=" + pfSet[i] + "> \
            </div> \
        </div>"

        document.getElementById("settings").innerHTML = doc + psDiv;
    });
}

function submitForm() {
    console.info("Saving changes");

    var url = "/api/v1/settings";

    var data = {};
    var elements = document.getElementById("setForm").elements;
    for (var i = 0; i < elements.length; i++) {
        var item = elements.item(i);
        if (item.name != "")
            data[item.name] = item.value;
    }

    var json = JSON.stringify(data);
    console.info(data);
    console.info(json.substring(1,json.length-1));

    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    xhr.onload = function () {
        var users = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
            console.table(users);
        } else {
            console.error(users);
        }
    }
    xhr.send(json);
}

function clearChanges() {
    console.info("Oh wait, nevermind");
}
