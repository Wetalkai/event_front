
var domainHttp = ""

// Detecta el dominio actual automáticamente
const hostname = window.location.hostname;
const port = window.location.port; // Extrae el puerto
var extraDomain = "";
var lastCameraTarget, lastCameraOrbit, lastFieldOfView, lastInterpolationDecay;
var maxRowCubes = 5;
var scaleCube = 0.5;
var gameFinished = false;
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

particlesJS.load('particles-js', 'particles.json', function () {
    console.log('callback - particles.js config loaded');
});
function setCameraToHotspot(modelViewer) {
    //modelViewer.setAttribute("interaction-prompt", "none");
    //modelViewer.removeAttribute('auto-rotate');
    modelViewer.setAttribute("rotation-per-second", "0deg")
    setTimeout(() => {
        var translation = getTranslation(0);
        lastCameraTarget = modelViewer.cameraTarget;
        lastCameraOrbit = modelViewer.cameraOrbit;
        lastFieldOfView = modelViewer.fieldOfView;
        lastInterpolationDecay = modelViewer.interpolationDecay;

        modelViewer.cameraTarget = translation.join('m ');
        modelViewer.cameraOrbit = "90deg 0deg 0m";
        //  modelViewer.fieldOfView = '10deg';
        //  modelViewer.interpolationDecay = 100
        document.getElementById("hotSpotButton").style.transform = "scale(30.5)"

        document.querySelector("span").style.opacity = "0";
        document.getElementById('overlay').style.opacity = '1';
    }, 500)
}

function restoreGeneralView(modelViewer) {
    console.log("restoring general view")
    modelViewer.cameraTarget = lastCameraTarget;
    modelViewer.cameraOrbit = lastCameraOrbit;
    modelViewer.fieldOfView = lastFieldOfView;
    modelViewer.interpolationDecay = lastInterpolationDecay;
    if (!gameFinished) {
        document.getElementById("hotSpotButton").style.transform = "scale(1)"
    } else {
        document.getElementById("qrContainer").style.display = 'block';
        document.getElementById("qrContainerNextChallengue").style.display = 'none';
        document.getElementById("hotSpotButton").style.transform = "scale(0)"
        particlesJS.load('particles-js', 'particlesSnow.json', function () {
            console.log('callback - particles.js config loaded');
        });
    }
    document.querySelector("span").style.opacity = "1";
    modelViewer.setAttribute("rotation-per-second", "10deg")
    document.getElementById('overlay').style.opacity = '0';
    //modelViewer.autoRotate = true;
}

function getTranslation(inc = 0) {
    /*
    for(let i = totalCubos; i > 0; i -= maxRowCubes) {
        for(let j = 0; j < maxRowCubes; j++) { // Itera sobre el número de cubos en la fila actual
            let centroFila = (maxRowCubes - 1) * scaleCube; // Calcula el centro de la fila
            let posX = (j - centroFila / 2) * 2.1 * scaleCube; // Ajusta 'x' para centrar los cubos en la fila
            translation =  [posX, currentRow * 2 * scaleCube, 0]
        }

    }
    */
    const fila = Math.floor((lastCount + inc) / maxRowCubes); // Determina la fila actual basada en cuántos cubos se han generado
    const posicionEnFila = (lastCount + inc) % maxRowCubes; // Determina la posición del cubo dentro de la fila (0-4)
    const translation = [posicionEnFila * scaleCube * 2.1, fila * scaleCube * 2, 0];
    return translation;
}
function updateModelViewer(data) {

    console.log("setting camera to spot")
    setCameraToHotspot(document.getElementById('modelViewer'))
    setTimeout(() => {
        console.log("loading model viewer")
        const modelViewer = document.getElementById('modelViewer');

        modelViewer.setAttribute("src", domainHttp + "/baseGltf/modified_cube.gltf?time=" + new Date().getTime()); //;
        const newModelViewer = modelViewer.cloneNode(true);
        //newModelViewer.removeAttribute('auto-rotate');

        newModelViewer.setAttribute("interaction-prompt", "none");
        newModelViewer.setAttribute('auto-rotate', true);

        newModelViewer.setAttribute('camera-controls', true);
        newModelViewer.setAttribute('ar', '');
        newModelViewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
        newModelViewer.setAttribute('shadow-intensity', '2');

        modelViewer.parentNode.replaceChild(newModelViewer, modelViewer);

        var translation = getTranslation();
        newModelViewer.updateHotspot({ name: "hotspot-visor", position: translation.join(' '), normal: "0 0 1" })
        setTimeout(() => {
            restoreGeneralView(document.getElementById('modelViewer'))
        }, 2000)
    }, 2500)

    //newModelViewer.fieldOfView = '45deg';



}

function checkForUpdates() {
    const url = domainHttp + "/getCount";
    //console.log("checkForUpdates, ", url)
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            if (data.ok && data.count == 0) {
                //document.getElementById('modelViewer').src = ""
                lastCount = 0;
                document.getElementById('modelViewer').updateHotspot({ name: "hotspot-visor", position: "0 0 0", normal: "0 0 1" })
                const test = getNextTest(data.count)
                showNextChallengueQR(test)

            } else if (data.ok && data.count > lastCount) {

                if (data.count >= testsArray.length) {
                    console.log("no scaleCube")
                    if (!gameFinished) {
                        gameFinished = true;
                        updateModelViewer(data);
                        //document.getElementById('hotSpotButton').style.display = 'none';
                    }

                } else {
                    const test = getNextTest(data.count)
                    showNextChallengueQR(test)
                    console.log("updating cube count to")
                    //document.getElementById('cubeCountId').innerText = "Cube count: " + data.count;
                    lastCount = data.count;
                    scaleCube = data.scaleCube;
                    maxRowCubes = data.maxRowCubes;
                    updateModelViewer(data);
                }

            }
        })
        .catch(console.error);
}
/*
function loadModel(src, data) {
    fetch(src)
        .then(response => response.json())
        .then(gltf => {
            const nodes = gltf.nodes; // Obtener los nodos del GLTF
            const lastNode = nodes[nodes.length - 1]; // Acceder al último nodo
            const translation = lastNode.translation; // Obtener la propiedad de translation
            if (translation) {
                const modelViewer = document.getElementById('modelViewer');
                
                const fila = Math.floor(lastCount / data.maxRowCubes); // Determina la fila actual basada en cuántos cubos se han generado
                const posicionEnFila = lastCount % data.maxRowCubes; // Determina la posición del cubo dentro de la fila (0-4)
                modelViewer.updateHotspot({name:"hotspot-visor", position:translation.join(' '), normal:"0 0 1"})
            } else {
                console.log('El último nodo no tiene propiedad de translation.');
            }
        })
        .catch(error => console.error('Error al cargar el GLTF:', error));

}
*/
function showMainQR() {
    var url = "http://wetalkai.github.io/event_front/realTimeMosaic.html";

    console.log("show modal " + url);

    document.getElementById("qrcode").innerHTML = '';

    var qrcode = new QRCode(document.getElementById("qrcode"), {
        width: 150,
        height: 150
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

    var url = "https://wetalkai.github.io/event_front/" + test.value.baseIndex + "?tipoPrueba=" + test.key;

    console.log("show modal " + url);

    document.getElementById("qrcodeNextChallengue").innerHTML = '';
    console.log("show modal ", document.getElementById("qrcodeNextChallengue"));

    var qrcode = new QRCode(document.getElementById("qrcodeNextChallengue"), {
        width: 150,
        height: 150
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