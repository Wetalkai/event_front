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
var isStarted = false;
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

var temporizador; // Variable para el temporizador
var MAX_TIEMPO = 20;
var tiempoRestante = MAX_TIEMPO; // 20 segundos para el desafío

function resetTemporizador() {
    if (challengueDisabled)
        return;
    clearInterval(temporizador);
    tiempoRestante = MAX_TIEMPO; // Resetear a 20 segundos
    actualizarUI();
    iniciarTemporizador();
}

function actualizarUI() {
    // Actualizar el elemento UI con el tiempo restante
    document.getElementById('temporizador').innerText = ` ${tiempoRestante}s`;
}

function iniciarTemporizador() {
    temporizador = setInterval(() => {
        if (challengueDisabled)
            return;
        tiempoRestante--;
        actualizarUI();
        if (tiempoRestante <= 0) {
            challengueDisabled = true;
            console.log('¡Desafío completado!');
            var videoPlayer = document.getElementById('videoSusto');
            videoPlayer.currentTime = 0;
            videoPlayer.muted = false
            videoPlayer.play(); // Reproducir el video
            setTimeout(() => {
                videoPlayer.style.left = 0;
            }, 200);
            
            
            clearInterval(temporizador);
            temporizador = null;
            disableChallengue();
            setTimeout(() => {
                document.getElementById('capture').click();
            }, 1000)
            setTimeout(() => {
                videoPlayer.style.opacity = 0; // Mostrar el videoPlayer
                videoPlayer.pause(); // Reproducir el video
            }, 2000)
            // Aquí puedes implementar lo que sucede cuando se completa el desafío
        }
    }, 1000);
}

function init() {

    document.getElementById('toggleCamera').style.left = "200%";

    const videoElement = document.getElementById('webcam');
    var button = document.getElementById('capture');
    button.disabled = true;
    button.style.opacity = 0.1;

    // Crear el elemento del temporizador y añadirlo al DOM
    var temporizadorElement = document.createElement('div');
    temporizadorElement.id = 'temporizador'; // Asignar ID
    temporizadorElement.innerText = '' + MAX_TIEMPO + "s"; // Texto inicial
    document.getElementById("containerOfCamera").appendChild(temporizadorElement); // Añadir el temporizador al final del body

    // Crear el botón COMENZAR
    var startButton = document.createElement('button');
    startButton.textContent = 'COMENZAR'; // Texto del botón
    startButton.className = 'btn btn-primary'; // Clases para estilos Bootstrap
    startButton.style.width = '100%'; // Ancho del 100%
    // Función para manejar el clic en el botón
    startButton.addEventListener('click', function () {
        iniciarTemporizador(); // Asumiendo que esta función ya está definida y maneja el inicio del temporizador
        startButton.style.display = 'none'; // Ocultar el botón después de hacer clic
        var videoPlayer = document.getElementById('videoSusto');
        videoPlayer.play()
        setTimeout(() => {
            videoPlayer.pause()
        }, 2000);
        isStarted = true;
    });

    // Insertar el botón justo debajo del elemento con ID 'descriptionTest'
    var descriptionTestElement = document.getElementById('descriptionTest');
    if (descriptionTestElement) {
        descriptionTestElement.parentNode.insertBefore(startButton, descriptionTestElement.nextSibling);
    }

    var videoPlayer = document.createElement('video');
    videoPlayer.id = "videoSusto"
    videoPlayer.src = 'susto.mp4'; // Asegúrate de que este archivo exista en la ubicación correcta
    videoPlayer.style.position = 'fixed'; // Posición fija para cubrir toda la pantalla
    videoPlayer.style.width = '100vw'; // 100% del ancho de la ventana
    videoPlayer.style.height = '100vh'; // 100% del alto de la ventana
    videoPlayer.style.top = '0'; // Alineado arriba
    videoPlayer.style.left = "2000px"; // Alineado a la izquierda
    videoPlayer.style.zIndex = 9999999999; // Inicialmente detrás de otros elementos
    videoPlayer.style.display = "block"; // Inicialmente detrás de otros elementos
    videoPlayer.setAttribute('playsinline', true);
    videoPlayer.removeAttribute('controls');
    videoPlayer.style.pointerEvents = 'none'; // No permitir interacciones
    videoPlayer.muted = true;
    //videoPlayer.style.objectFit = 'cover';
     

     //videoPlayer.style.opacity = 0; // Oculto inicialmente

    

    document.body.appendChild(videoPlayer); // Añadir el videoPlayer al final del body

    function onResults(results) {
        if (!isStarted)
            return;
        if (challengueDisabled) {
            disableChallengue();
            return;
        }

        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length !== 2) {
            console.log("Se requieren exactamente dos caras en pantalla, reiniciando temporizador...");
            resetTemporizador();
            return;
        }

        let pestaneoDetectado = false; // Flag para detectar si alguna de las caras parpadea

        for (const landmarks of results.multiFaceLandmarks) {
            // Índices de landmarks para el ojo izquierdo
            const upperEyelid = landmarks[159];
            const lowerEyelid = landmarks[145];
            const eyeLeftCorner = landmarks[130];
            const eyeRightCorner = landmarks[243];
    
            // Calcular la distancia vertical entre los párpados
            const verticalDistance = Math.abs(upperEyelid.y - lowerEyelid.y);
    
            // Calcular la distancia horizontal entre las esquinas del ojo
            const horizontalDistance = Math.abs(eyeRightCorner.x - eyeLeftCorner.x);
    
            // Verificar si la distancia vertical es menor que el 20% de la distancia horizontal
            if (verticalDistance < (horizontalDistance * 0.2)) {
                pestaneoDetectado = true; // Se detecta pestañeo en al menos una cara
                break; // No es necesario continuar si ya se detectó un pestañeo
            }
        }
    
        // Si se detecta un pestañeo en alguna de las caras, reiniciar el temporizador
        if (pestaneoDetectado) {
            console.log("Pestañeo detectado, reiniciando temporizador...");
            resetTemporizador();
        }
    }

    const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
        maxNumFaces: 2, // Centrarse en una cara para este desafío
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

    //iniciarTemporizador(); // Iniciar el temporizador cuando todo esté listo
}
