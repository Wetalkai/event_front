
var domainHttp = ""
    
// Detecta el dominio actual automáticamente
const hostname = window.location.hostname;
const port = window.location.port; // Extrae el puerto

if (hostname === "localhost" || hostname.startsWith("127.") || hostname.startsWith("192.")) {
    // Si se está ejecutando en localhost o en una red local
    //domainHttp = `http://${hostname}:${port || '3008'}`;
    domainHttp = `http://${hostname}:3008`;
} else {
    // Si se está ejecutando en el servidor de producción
    domainHttp = 'https://evento-silvia-bd9532c26bae.herokuapp.com';
}


let lastCount = 0;
    

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
                console.log("updating cube count to")
                document.getElementById('cubeCountId').innerText = "Cube count: " + data.count;
                lastCount = data.count;
                updateModelViewer();
            }
        })
        .catch(console.error);
}

function showMainQR() {
    var url = "http://"+hostname+":"+port + "/realTimeMosaic.html";

    console.log("show modal " + url);

    document.getElementById("qrcode").innerHTML = '';

    var qrcode = new QRCode(document.getElementById("qrcode"), {
        width: 300,
        height: 300
    });
    qrcode.clear();
    qrcode.makeCode(url);
}

if (!isMobileDevice()) {
    showMainQR();
} else {
    document.getElementById("qrcode").style.display = 'none';
}

// Iniciar el sondeo
setInterval(checkForUpdates, 5000); // Consulta cada 5 segundos
checkForUpdates(); // Consulta inicial
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}