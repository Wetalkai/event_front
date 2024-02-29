// URLs de los scripts a cargar
const urls = [
    'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
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

    const videoElement = document.getElementById('webcam');
    var button = document.getElementById('capture');
    button.disabled = true;
    button.style.opacity = 0.1;

    function onResults(results) {
        if (challengueDisabled) {
            disableChallengue()
            return;
        }
        let bocasAbiertas = 0; // Contador para las bocas abiertas

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 1) { // Asegurarse de que hay al menos 2 caras detectadas
            for (const landmarks of results.multiFaceLandmarks) {
                // Índices de landmarks para el labio superior e inferior
                const upperLipTop = landmarks[13];
                const lowerLipBottom = landmarks[14];

                // Índices de landmarks para los extremos izquierdo y derecho de la boca
                const mouthLeft = landmarks[61]; // Extremo izquierdo de la boca
                const mouthRight = landmarks[291]; // Extremo derecho de la boca

                // Calcular la distancia horizontal entre los extremos de la boca
                const horizontalDistance = Math.abs(mouthRight.x - mouthLeft.x);

                // Calcular la distancia vertical entre los landmarks del labio superior e inferior
                const verticalDistance = lowerLipBottom.y - upperLipTop.y;

               // console.log("verticalDistance ", verticalDistance)
                // Determinar si la boca está abierta
                if (verticalDistance > horizontalDistance*0.3) { // Este valor es un umbral y puede necesitar ajustes
                    console.log('Boca abierta');
                    bocasAbiertas += 1; // Incrementar el contador de bocas abiertas
                }
            }
            console.log(bocasAbiertas)

            // Verificar si hay dos bocas abiertas
            if (bocasAbiertas >= 2) {
                console.log('Dos bocas abiertas detectadas');
                button.disabled = false;
                button.style.opacity = 1;
            } else {
                button.disabled = true;
                button.style.opacity = 0.1;
            }
        } else {
            console.log("sólo una cara")
            // Si no hay suficientes caras, deshabilitar el botón
            button.disabled = true;
            button.style.opacity = 0.1;
        }
    }


    const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
        maxNumFaces: 2,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputFaceBlendshapes: true
    });

    faceMesh.onResults(onResults);
    const rect = videoElement.getBoundingClientRect();
    new Camera(videoElement, {
        onFrame: async () => {
            await faceMesh.send({ image: videoElement });
        },
        width: 1280,
        height: 1280
    }).start();
}
