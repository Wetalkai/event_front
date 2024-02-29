
var challengueDisabled = false;
var isStarted = false;
var umbralSilencio = -1;
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

var temporizador; // Variable para el temporizador
var MAX_TIEMPO = 10;
var tiempoRestante = MAX_TIEMPO; // 20 segundos para el desafío

function resetTemporizador() {
    if (challengueDisabled)
        return;
    clearInterval(temporizador);
    temporizador = null;
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


            clearInterval(temporizador);
            temporizador = null;
            disableChallengue();
            setTimeout(() => {
                document.getElementById('capture').click();
            }, 100)

            // Aquí puedes implementar lo que sucede cuando se completa el desafío
        }
    }, 1000);
}

function init() {



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

        isStarted = true;
        iniciarAnalisisAudio();
    });

    // Insertar el botón justo debajo del elemento con ID 'descriptionTest'
    var descriptionTestElement = document.getElementById('descriptionTest');
    if (descriptionTestElement) {
        descriptionTestElement.parentNode.insertBefore(startButton, descriptionTestElement.nextSibling);
    }

    function iniciarAnalisisAudio() {
        if (!isStarted)
            return;
        if (challengueDisabled) {
            disableChallengue();
            return;
        }
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(function (stream) {
                if (challengueDisabled) {
                    disableChallengue();
                    return;
                }
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                const microphone = audioContext.createMediaStreamSource(stream);
                const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

                microphone.connect(analyser);
                analyser.connect(scriptProcessor);
                scriptProcessor.connect(audioContext.destination);
                scriptProcessor.onaudioprocess = function (audioProcessingEvent) {
                    
                    const input = audioProcessingEvent.inputBuffer.getChannelData(0);
                    let sum = 0.0;
                    for (let i = 0; i < input.length; ++i) {
                        sum += input[i] * input[i];
                    }
                    let volumenInstantaneo = Math.sqrt(sum / input.length);
                    console.log(volumenInstantaneo)
                    if (umbralSilencio === -1) {
                        umbralSilencio = volumenInstantaneo;
                    }
                    if (volumenInstantaneo > umbralSilencio + 0.008) { // Ajustar umbral según necesidad
                       // document.getElementById('capture').disabled = false;
                       // document.getElementById('capture').style.opacity = 1;
                    } else {
                        resetTemporizador();
                       // document.getElementById('capture').disabled = true;
                       // document.getElementById('capture').style.opacity = 0.1;
                    }
                };
            })
            .catch(function (err) {
                console.error('Error al acceder al micrófono:', err);
            });
    }



    //iniciarTemporizador(); // Iniciar el temporizador cuando todo esté listo
}
init();