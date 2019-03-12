var pfSet,pfSrvSet;

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
    pfSrvSet = JSON.parse((await getFile('settings.json')).responseText);

    if( sessionStorage.getItem("pfSet") == null){
        console.info("No sessionStorage for pfSet");
        //Create an immutible copy of the settings
        pfSet = JSON.parse(JSON.stringify(pfSrvSet));
    }else{
        console.info("Loading previous sessionStorage for pfSet");
        pfSet = JSON.parse(sessionStorage.getItem("pfSet"));
        console.info(pfSet);
    }

    Object.keys(pfSet).forEach(function (i) {
        console.debug(i + " - " + pfSet[i].label + ": " + pfSet[i].value);

        var doc = document.getElementById("settings").innerHTML;
        var psDiv =
            "<div class='row'> \
            <div class='col-25'> \
                <label for=" + i + ">" + pfSet[i].label + "</label> \
            </div> \
            <div class='col-75'> \
                <input type='text' id=" + i + " name=" + i + " value=" + pfSet[i].value + " onKeyUp='changeListener()'> \
            </div> \
        </div>"

        document.getElementById("settings").innerHTML = doc + psDiv;
    });

    changeListener();
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

    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    xhr.onload = function () {
        var users = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
            document.getElementById("bSave").disabled = true;
            document.getElementById("bCancel").disabled = true;

            console.table(users);
        } else {
            console.error(users);
        }
    }
    xhr.send(json);
}

function clearChanges() {
    console.info("Oh wait, nevermind");
    Object.keys(pfSrvSet).forEach(function (i) {
        console.info(i + " - " + pfSrvSet[i].value);

        document.getElementById(i).value = pfSrvSet[i].value;
    });

    document.getElementById("bSave").disabled = true;
    document.getElementById("bCancel").disabled = true;
}

function changeListener() {
    var isChanged = false;

    Object.keys(pfSrvSet).forEach(function (i) {
        console.info(i + " - " + document.getElementById(i).value + "::" + pfSrvSet[i].value);

        if ((document.getElementById(i).value).toString() != (pfSrvSet[i].value).toString()) {
            console.info(i + " has changed values!");
            console.info("Form value type: " + typeof (document.getElementById(i).value));
            console.info("Setting value tyep: " + typeof (pfSrvSet[i].value));
            pfSet[i].value = document.getElementById(i).value;
            isChanged = true;
        }
    });

    if (isChanged) {
        document.getElementById("bSave").disabled = false;
        document.getElementById("bCancel").disabled = false;
        sessionStorage.setItem("pfSet", JSON.stringify(pfSet));
    } else {
        console.info("Nothing has changed")
        document.getElementById("bSave").disabled = true;
        document.getElementById("bCancel").disabled = true;
        sessionStorage.removeItem("pfSet");
        console.info(sessionStorage.getItem("pfSet"));
    }
}