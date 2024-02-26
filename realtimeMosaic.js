
var domainHttp = ""

// Detecta el dominio actual automáticamente
const hostname = window.location.hostname;
const port = window.location.port; // Extrae el puerto
var extraDomain = "";

if (hostname === "localhost" || hostname.startsWith("127.") || hostname.startsWith("192.")) {
    // Si se está ejecutando en localhost o en una red local
    //domainHttp = `http://${hostname}:${port || '3008'}`;
    domainHttp = `http://${hostname}:3008`;
} else {
    // Si se está ejecutando en el servidor de producción
    domainHttp = 'https://evento-silvia-bd9532c26bae.herokuapp.com';
    extraDomain = "/event_front";
}


let lastCount = -1;



function updateModelViewer() {

    const modelViewer = document.getElementById('modelViewer');
    modelViewer.setAttribute("src", domainHttp + "/baseGltf/modified_cube.gltf?time=" + new Date().getTime()); //;
    const newModelViewer = modelViewer.cloneNode(true);
    newModelViewer.setAttribute('auto-rotate', '');
    newModelViewer.setAttribute('camera-controls', '');
    newModelViewer.setAttribute('ar', '');
    newModelViewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
    newModelViewer.setAttribute('shadow-intensity', '1');

    modelViewer.parentNode.replaceChild(newModelViewer, modelViewer);

}

function checkForUpdates() {
    const url = domainHttp + "/getCount";
    console.log("checkForUpdates, ", url)
    fetch(domainHttp + "/getCount")
        .then(response => response.json())
        .then(data => {
            if (data.ok && data.count > lastCount) {
                const test = getNextTest(data.count)
                showNextChallengueQR(test)
                console.log("updating cube count to")
                document.getElementById('cubeCountId').innerText = "Cube count: " + data.count;
                lastCount = data.count;
                updateModelViewer();
            }
        })
        .catch(console.error);
}

function showMainQR() {
    var url = "http://" + hostname + ":" + port + extraDomain + "/realTimeMosaic.html";

    console.log("show modal " + url);

    document.getElementById("qrcode").innerHTML = '';

    var qrcode = new QRCode(document.getElementById("qrcode"), {
        width: 100,
        height: 100
    });
    qrcode.clear();
    qrcode.makeCode(url);
}

const testsArray = Object.entries(window.tests);

function getNextTest(currentIndex) {
    // Verifica si el currentIndex está dentro del rango del array
    if (currentIndex < testsArray.length) {
        // Obtiene la entrada actual basada en currentIndex
        const entry = testsArray[currentIndex];
        // Incrementa el contador para la próxima llamada
        currentIndex++;

        // Retorna el objeto de test actual
        return {
            key: entry[0], // La clave del objeto (nombre del test)
            value: entry[1], // El objeto que contiene los detalles del test
        };
    } else {
        // Si ya no hay más elementos, podría retornar null o reiniciar el contador
        return null; // O puedes reiniciar el contador si deseas ciclar los tests: currentIndex = 0;
    }
}

function showNextChallengueQR(test) {
    console.log(test)
    
    var url = "http://" + hostname + ":" + port + extraDomain + "/"+test.value.baseIndex+"?tipoPrueba=" + test.key;

    console.log("show modal " + url);

    document.getElementById("qrcodeNextChallengue").innerHTML = '';

    var qrcode = new QRCode(document.getElementById("qrcodeNextChallengue"), {
        width: 100,
        height: 100
    });
    qrcode.clear();
    qrcode.makeCode(url);
}



if (!isMobileDevice()) {
    showMainQR();
    //showNextChallengueQR();
} else {
    document.getElementById("qrcode").style.display = 'none';
    document.getElementById("qrcodeNextChallengue").style.display = 'none';
}

// Iniciar el sondeo
setInterval(checkForUpdates, 5000); // Consulta cada 5 segundos
checkForUpdates(); // Consulta inicial
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}