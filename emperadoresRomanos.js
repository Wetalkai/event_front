// URLs de los scripts a cargar
const urls = [
    'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
    'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils'
];

// Llamar a cargarScripts y usar then para saber cuando todos los scripts estén cargados
cargarScripts(urls).then((resultados) => {
    console.log('Todos los scripts han sido cargados:', resultados);
    init()
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
})()

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


    var button = document.getElementById('capture');
    button.disabled = true;
    button.style.opacity = 0.1;
    const videoElement = document.getElementById('webcam');

    function onResults(results) {

        if (challengueDisabled) {
            disableChallengue()
            return;
        }
        let thumbUpDetected = false;
        let thumbDownDetected = false;

        if (results.multiHandLandmarks && results.multiHandLandmarks.length === 2) {
            for (const landmarks of results.multiHandLandmarks) {
                const thumbTip = landmarks[4];
                const thumbIP = landmarks[3];
                const indexFingerMCP = landmarks[5];

                // Detectar pulgar hacia arriba
                if (thumbTip.y < thumbIP.y && thumbTip.y < indexFingerMCP.y) {
                    thumbUpDetected = true;
                }

                // Detectar pulgar hacia abajo
                if (thumbTip.y > thumbIP.y && thumbTip.y > indexFingerMCP.y) {
                    thumbDownDetected = true;
                }

            }

            // Verificar si una mano está haciendo pulgar arriba y la otra pulgar abajo
            if (thumbUpDetected && thumbDownDetected) {
                button.disabled = false;
                button.style.opacity = 1;
                console.log('Una mano con pulgar hacia arriba y otra con pulgar hacia abajo detectadas');
            } else {
                button.disabled = true;
                button.style.opacity = 0.1;
            }
        } else {
            button.disabled = true;
            button.style.opacity = 0.1;
        }
    }

    const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);

    console.log('Iniciando cámara', videoElement);
    const rect = videoElement.getBoundingClientRect();
    
    new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        },
        width: 1280,
        height: 1280
    }).start();

}