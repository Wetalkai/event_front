
var domainHttp = ""

// Detecta el dominio actual automáticamente
const hostname = window.location.hostname;
const port = window.location.port; // Extrae el puerto
var extraDomain = "";
var lastCameraTarget, lastCameraOrbit, lastFieldOfView, lastInterpolationDecay;
var maxRowCubes = 6;
var scaleCube = 0.5;
var gameFinished = false;
var totalCubos = 21;
var currentRow = 0;
let incX = 0;
let incY = 0;
let newPhotos = 0;
if (hostname === "localhost" || hostname.startsWith("127.") || hostname.startsWith("192.")) {
    // Si se está ejecutando en localhost o en una red local
    //domainHttp = `http://${hostname}:${port || '3008'}`;
    domainHttp = `http://${hostname}:3008`;
} else {
    // Si se está ejecutando en el servidor de producción
    domainHttp = 'https://evento-silvia-bd9532c26bae.herokuapp.com';
    extraDomain = "/event_front";
}

let isShowingNewPhotos = false;

let lastCount = 0;
let isFullScreen = false;
/*
particlesJS.load('particles-js', 'particles.json', function () {
    console.log('callback - particles.js config loaded');
});
*/
document.getElementById('goFullScreen').addEventListener('click', function () {
    // Verificar si estamos actualmente en pantalla completa; si es así, salir de pantalla completa
    if (document.fullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen(); // Método estándar
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari y Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
    } else { // Entrar en pantalla completa
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen(); // Método estándar
        } else if (document.documentElement.mozRequestFullScreen) { /* Firefox */
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) { /* Chrome, Safari y Opera */
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { /* IE/Edge */
            document.documentElement.msRequestFullscreen();
        }
    }
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
        //document.getElementById("hotSpotButton").style.transform = "scale(1)"
    } else {
        alert("SI")
        document.getElementById("qrContainer").style.display = 'block';
        document.getElementById("qrContainerNextChallengue").style.display = 'none';
        // document.getElementById("hotSpotButton").style.transform = "scale(0)"
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
    console.log("getting translation from ", lastCount)
    var countPos = lastCount + inc;
    if (countPos >= 1 && countPos <= 5) {
        incX += 2.1 * scaleCube
        if (countPos == 5) {
            incX = 2.1 * scaleCube * 0.5;
            incY = 2 * scaleCube;
        }
    } else if (countPos >= 6 && countPos <= 9) {
        incX += 2.1 * scaleCube
        if (countPos == 9) {
            incX = 2.1 * scaleCube * 0.5 * 2;
            incY = 4 * scaleCube;
        }

    } else if (countPos >= 10 && countPos <= 12) {
        incX += 2.1 * scaleCube
        if (countPos == 12) {
            incX = 2.1 * scaleCube * 0.5 * 3;
            incY = 6 * scaleCube;
        }

    } else if (countPos >= 13 && countPos <= 14) {
        incX += 2.1 * scaleCube
        if (countPos == 14) {
            incX = 2.1 * scaleCube * 0.5 * 4;
            incY = 8 * scaleCube;
        }

    } else if (countPos == 15) {
        incX = 0;
        incY = 10 * scaleCube;

    }

    const translation = [incX, incY, 0];
    return translation;
    /*
    const fila = Math.floor((lastCount + inc) / maxRowCubes); // Determina la fila actual basada en cuántos cubos se han generado
    const posicionEnFila = (lastCount + inc) % maxRowCubes; // Determina la posición del cubo dentro de la fila (0-4)
    const translation = [posicionEnFila * scaleCube * 2.1, fila * scaleCube * 2, 0];
    return translation;
    */

}

function createPreview(uris, index) {
    if (index >= uris.length) {
        isShowingNewPhotos = false;
        document.getElementById('modelViewer').classList.remove('blur-on-hard');
        document.getElementById('modelViewer').classList.add('blur-off-hard');
        document.getElementById('imageBackground').classList.remove('blur-on');
        document.getElementById('imageBackground').classList.add('blur-off');
        // document.getElementById('overlay').style.opacity = '0';
        return; // Termina la ejecución si ya no hay más imágenes para mostrar
    }

    // Definir las variables fuera de los bloques condicionales para ampliar su alcance
    let imgLeft, imgRight, imgContainer;

    // Crear y mostrar la imagen de la izquierda si hay imágenes disponibles
    if (index < uris.length) {
        const uriLeft = uris[index];
        imgLeft = new Image(); // Ahora imgLeft está definida en el alcance superior
        imgLeft.src = uriLeft;
        imgLeft.style.width = "100%";
        imgLeft.style.height = "70%";
        imgLeft.style.position = "relative";
        imgLeft.style.opacity = 1;


        imgContainer = document.createElement('div');
        setupImage(imgContainer, 'right');
        imgContainer.appendChild(imgLeft);
        document.body.appendChild(imgContainer);
    }

    // Crear y mostrar la imagen de la derecha si hay otra imagen disponible
    if (index + 1 < uris.length) {
        const uriRight = uris[index + 1];
        imgRight = new Image(); // Ahora imgRight está definida en el alcance superior
        imgRight.src = uriRight;
        imgRight.style.width = "100%";
        imgRight.style.height = "30%";
        imgRight.style.position = "relative";
        imgRight.style.opacity = 1;
        //   setupImage(imgRight, 'left');
        imgContainer.appendChild(imgRight);
    }


    // Esperar 2 segundos antes de mostrar las siguientes imágenes
    setTimeout(() => {
        if (imgContainer && document.body.contains(imgContainer)) {
            document.body.removeChild(imgContainer); // Asegurar que imgLeft esté definida antes de intentar removerla
        }

        createPreview(uris, index + 2); // Incrementar el índice en 2 para las siguientes dos imágenes
    }, 4200);
}

function setupImage(img, side) {
    img.style.width = "50%";
    img.style.height = "100%";
    img.style.position = "fixed";
    img.style.padding = "30px"
    img.style.opacity = 0;
    //img.style.top = 0
    img.style.backgroundColor = "white";
    img.style.display = "flex";
    img.style.flexDirection = "column";
    img.style.flexWrap = "nowrap";
    img.style.justifyContent = "center";
    img.style.alignItems = "stretch";
    img.style.flexWrap = "nowrap";
    img.style.boxShadow = "9px 14px 18px rgba(0, 0, 0, 1)";
    img.style.borderRadius = "1%";

    // img.style.left = side === 'left' ? "50%" : "auto"; // Ajustar según el lado
    // img.style.right = side === 'right' ? "50%" : "auto"; // Ajustar según el lado
    img.style.zIndex = "9999999999999";
    //img.style.paddingLeft = "50%";
    //img.style.transform = "translateX(100%)"; // Asegura que la imagen comience centrada horizontalmente


    // Aplicar la animación correspondiente
    if (side === 'right') {
        img.style.animation = "slideFromTop 4s ease-in-out";
    } else { // side === 'right'
        // img.style.animation = "slideFromBottom 4s ease-in-out";
    }
}





function onModelLoaded() {
    document.getElementById('modelViewer').removeEventListener('load', onModelLoaded);
    const modelViewer = document.getElementById('modelViewer');
    const newPhotoUris = [];

    for (let i = modelViewer.model.materials.length - newPhotos * 2; i < modelViewer.model.materials.length; i++) {
        const newPhotoUri = modelViewer.model.materials[i].pbrMetallicRoughness['baseColorTexture'].texture.source.uri;
        console.log("New photo to show ", modelViewer.model.materials[i].pbrMetallicRoughness['baseColorTexture']);
        newPhotoUris.push(domainHttp + "/baseGltf/" + newPhotoUri);
    }

    if (newPhotoUris.length > 0) {
        createPreview(newPhotoUris, 0);
    } else {
        document.getElementById('overlay').style.opacity = '0'; // Ocultar overlay si no hay nuevas fotos
    }
}

function updateModelViewer(data) {

    console.log("setting camera to spot")
    isShowingNewPhotos = true;
    const modelViewer = document.getElementById('modelViewer');
    const imageBackground = document.getElementById('imageBackground');
    if (modelViewer.classList.contains('blur-off-hard')) {
        modelViewer.classList.remove('blur-off-hard');
    }
    if (imageBackground.classList.contains('blur-off')) {
        imageBackground.classList.remove('blur-off');
    }

    setTimeout(() => {
        modelViewer.classList.add('blur-on-hard');
        imageBackground.classList.add('blur-on');
    }, 10)


    // setCameraToHotspot(document.getElementById('modelViewer'))
    setTimeout(() => {
        console.log("loading model viewer")


        modelViewer.setAttribute("src", domainHttp + "/baseGltf/modified_cube.gltf?time=" + new Date().getTime()); //;
        const newModelViewer = modelViewer.cloneNode(true);
        //newModelViewer.removeAttribute('auto-rotate');
        console.log("newModelViewer ", newModelViewer)
        newModelViewer.setAttribute("interaction-prompt", "none");
        newModelViewer.setAttribute('auto-rotate', true);

        newModelViewer.setAttribute('camera-controls', true);
        newModelViewer.setAttribute('ar', '');
        newModelViewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
        newModelViewer.setAttribute('shadow-intensity', '2');

        newModelViewer.addEventListener('load', onModelLoaded);

        modelViewer.parentNode.replaceChild(newModelViewer, modelViewer);

        // var translation = getTranslation(0);
        // newModelViewer.updateHotspot({ name: "hotspot-visor", position: translation.join(' '), normal: "0 0 1" })
        /*
        setTimeout(() => {
            restoreGeneralView(document.getElementById('modelViewer'))
        }, 2000)
        */

    }, 200)

}

function checkForUpdates() {
    if (isShowingNewPhotos)
        return;
    const url = domainHttp + "/getCount";
    //console.log("checkForUpdates, ", url)
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            if (data.ok && data.count == 0) {
                //document.getElementById('modelViewer').src = ""
                lastCount = 0;
                // document.getElementById('modelViewer').updateHotspot({ name: "hotspot-visor", position: "0 0 0", normal: "0 0 1" })
                //const test = getNextTest(data.count)
                showNextChallengueQR({
                    key: testsArray[0][0], // La clave del objeto (nombre del test)
                    value: testsArray[0][1], // El objeto que contiene los detalles del test
                })

            } else if (data.ok && data.count > lastCount) {
                //console.log(data.count, ", ", testsArray.length)

                console.log("tipo prueba ", data.lastTipoPrueba)
                const test = getNextTest(data.lastTipoPrueba)
                if (test)
                    showNextChallengueQR(test)

                newPhotos = data.count - lastCount;
                console.log("newPhotos ", newPhotos)
                lastCount = data.count;
                console.log("updating cube count to")
                //document.getElementById('cubeCountId').innerText = "Cube count: " + data.count;

                scaleCube = data.scaleCube;
                maxRowCubes = data.maxRowCubes;
                totalCubos = data.totalCubos;
                currentRow = data.currentRow;
                updateModelViewer(data);
                /*
                if (data.count >= testsArray.length) {
                    console.log("no scaleCube")
                    if (!gameFinished) {
                        gameFinished = true;
                        particlesJS.load('particles-js', 'particlesSnow.json', function () {
                            console.log('callback - particles.js config loaded');
                        });
                        document.getElementById("qrContainer").style.display = 'block';
                        document.getElementById("qrContainerNextChallengue").style.display = 'none';
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
                    totalCubos = data.totalCubos;
                    currentRow = data.currentRow;
                    updateModelViewer(data);
                }
                */
            }
        })
        .catch(console.error);
}

function getAllItems() {
    const modelViewer = document.getElementById('modelViewer');
    fetch(modelViewer.src)
        .then(response => response.json())
        .then(gltf => {
            const nodes = gltf.nodes; // Obtener los nodos del GLTF
            const lastNode = nodes[nodes.length - 1]; // Acceder al último nodo
        })
        .catch(error => console.error('Error al cargar el GLTF:', error));
}

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
                modelViewer.updateHotspot({ name: "hotspot-visor", position: translation.join(' '), normal: "0 0 1" })
            } else {
                console.log('El último nodo no tiene propiedad de translation.');
            }
        })
        .catch(error => console.error('Error al cargar el GLTF:', error));

}

function showMainQR() {
    var url = "http://wetalkai.github.io/event_front/finalModel.html";

    console.log("show modal " + url);

    document.getElementById("qrcode").innerHTML = '';

    var qrcode = new QRCode(document.getElementById("qrcode"), {
        width: 150,
        height: 150
    });
    qrcode.clear();
    qrcode.makeCode(url);
    document.getElementById("qrContainer").style.display = 'block!important';
}

const testsArray = Object.entries(window.tests);

function getNextTest(lastTipoPrueba) {
    const ultimaPruebaDelServidor = lastTipoPrueba;
    console.log(testsArray)

    // Encuentra el índice del subarray cuyo primer elemento coincide con el searchString
    const index = testsArray.findIndex(item => item[0] === ultimaPruebaDelServidor);

    // Verifica si se encontró una coincidencia
    if (index !== -1) {
        // Verifica si el elemento encontrado es el último en el array
        if (index === testsArray.length - 1) {
            console.log('Es el último elemento');

            return {
                key: testsArray[testsArray.length - 1][0], // La clave del objeto (nombre del test)
                value: testsArray[testsArray.length - 1][1], // El objeto que contiene los detalles del test
            };
        } else {
            // Si no es el último, muestra el siguiente elemento
            console.log(testsArray[index + 1]);
            return {
                key: testsArray[index + 1][0], // La clave del objeto (nombre del test)
                value: testsArray[index + 1][1], // El objeto que contiene los detalles del test
            };
        }
    } else {
        console.log('No se encontró el elemento buscado');
    }
    return
    // Verifica si el currentIndex está dentro del rango del array
    console.log("getting next test ", currentIndex, ", ", testsArray.length, "lastCount", lastCount)
    console.log(testsArray[currentIndex])

    const proximoQrPrueba = testsArray[currentIndex];
    console.log("proximoQrPrueba ", proximoQrPrueba)
    //const ultimaPruebaDelServidor = lastTipoPrueba;
    console.log("ultimaPruebaDelServidor ", ultimaPruebaDelServidor)

    if (ultimaPruebaDelServidor == testsArray[currentIndex][0]) {
        console.log("la prueba ya fue mostrada, se muestra la siguiente")
        if (currentIndex < testsArray.length - 1) {
            // Obtiene la entrada actual basada en currentIndex
            currentIndex++;
            const entry = testsArray[currentIndex];
            // Incrementa el contador para la próxima llamada

            console.log("next ", entry)
            // Retorna el objeto de test actual
            return {
                key: entry[0], // La clave del objeto (nombre del test)
                value: entry[1], // El objeto que contiene los detalles del test
            };
        } else {
            return null;
        }
    }

}

function showNextChallengueQR(test) {
    console.log(test)

    var url = "https://wetalkai.github.io/event_front/" + test.value.baseIndex + "?tipoPrueba=" + test.key;

    console.log("show next qr " + url);

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