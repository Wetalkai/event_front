// URLs de los scripts a cargar
const urls = [
    'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
    'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils'
];

// Llamar a cargarScripts y usar then para saber cuando todos los scripts estén cargados
cargarScripts(urls).then((resultados) => {
    console.log('Todos los scripts han sido cargados:', resultados);
    init();
}).catch((error) => {
    console.error('Hubo un error al cargar los scripts:', error);
});

var challengueDisabled = false;
function disableChallengue() {
    var button = document.getElementById('capture');
    button.disabled = false;
    button.style.opacity = 1;
}

(function listendisableChallengue() {
    // Seleccionar el elemento label por su ID
    var label = document.getElementById('titleTest');

    // Añadir un event listener para el evento 'dblclick'
    label.addEventListener('dblclick', function () {
        // Mostrar un alerta cuando se detecte un doble clic
        challengueDisabled = true;
        disableChallengue();
    });
})();

function cargarScripts(urls) {
    // Función para cargar un script individual y devolver una promesa
    const cargarScript = (url) => new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve(`Script cargado: ${url}`);
        script.onerror = () => reject(new Error(`Error al cargar el script: ${url}`));
        document.head.appendChild(script);
    });

    // Crear un array de promesas usando el array de URLs de los scripts
    const promesas = urls.map(url => cargarScript(url));

    // Usar Promise.all para esperar a que todas las promesas se resuelvan
    return Promise.all(promesas);
}

function init() {
    const videoElement = document.getElementById('webcam');
    var button = document.getElementById('capture');
    button.disabled = true;
    button.style.opacity = 0.1;

    function onResults(results) {
        if (challengueDisabled) {
            disableChallengue();
            return;
        }

        // Verificar si hay 4 o más caras detectadas
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length >= 4) {
            console.log('4 o más caras detectadas');
            button.disabled = false;
            button.style.opacity = 1;
        } else {
            console.log("Menos de 4 caras detectadas");
            // Si no hay suficientes caras, deshabilitar el botón
            button.disabled = true;
            button.style.opacity = 0.1;
        }
    }

    const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
        maxNumFaces: 4, // Ajustar para permitir la detección de hasta 4 caras o más si es necesario
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResults);

    new Camera(videoElement, {
        onFrame: async () => {
            await faceMesh.send({ image: videoElement });
        },
        width: 1280,
        height: 1280
    }).start();
}
