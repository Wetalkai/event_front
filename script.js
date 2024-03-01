//const localDomain = 'http://localhost:3008';
//const localDomainMobile = 'http://192.168.5.157:3008';
//const remoteDomain = 'https://evento-silvia-bd9532c26bae.herokuapp.com';


var domain = ""

// Detecta el dominio actual automáticamente
const hostname = window.location.hostname;
const port = window.location.port; // Extrae el puerto
var tipoPrueba
if (hostname === "localhost" || hostname.startsWith("127.") || hostname.startsWith("192.")) {
    // Si se está ejecutando en localhost o en una red local
    //domainHttp = `http://${hostname}:${port || '3008'}`;
    domain = `http://${hostname}:3008`;

} else {
    // Si se está ejecutando en el servidor de producción
    domain = 'https://evento-silvia-bd9532c26bae.herokuapp.com';
}
var messageBlob = null;

document.getElementById('capture').addEventListener('click', function () {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvasPhoto');
    const photoControls = document.getElementById('photoControls');
    const capturedPhoto = document.getElementById('capturedPhoto');

    if (tipoPrueba == "generica") {
        document.getElementById('messageTextarea').style.display = 'block';
    }

    // Determinar las dimensiones para el recorte centrado
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const size = Math.min(videoWidth, videoHeight); // El lado más corto para el cuadrado

    // Ajustar el canvas al tamaño cuadrado necesario
    canvas.width = size;
    canvas.height = size;

    // Calcular el inicio del recorte para centrarlo
    const startX = (videoWidth - size) / 2;
    const startY = (videoHeight - size) / 2;

    // Obtener el contexto y recortar la imagen del video centrada en el canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, startX, startY, size, size, 0, 0, canvas.width, canvas.height);

    // Crear un gradiente radial para el efecto de iluminación
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.max(canvas.width, canvas.height) / 2; // El radio debe ser suficiente para cubrir el centro

    const gradient = context.createRadialGradient(centerX, centerY, radius / 10, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 100, 0.2)'); // Color amarillo claro y más sutil en el centro
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Transparencia hacia los bordes

    // Aplicar el gradiente sobre la imagen
    context.globalCompositeOperation = 'lighter'; // Modo de mezcla que ilumina los colores
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    // Convertir a imagen y mostrar
    const photoURL = canvas.toDataURL('image/png');
    capturedPhoto.src = photoURL;

    // Mostrar los controles de la foto y ocultar la webcam y el botón de captura
    photoControls.style.display = 'block';
    video.style.display = 'none';
    this.style.display = 'none';
    document.getElementById('toggleCamera').style.display = 'none';
});



// Botón cerrar: Oculta la imagen capturada y muestra la webcam de nuevo
document.getElementById('closeBtnPhoto').addEventListener('click', function () {
    const video = document.getElementById('webcam');
    const photoControls = document.getElementById('photoControls');
    const captureButton = document.getElementById('capture');
    const toggleCamera = document.getElementById('toggleCamera');

    photoControls.style.display = 'none';
    video.style.display = 'block';
    captureButton.style.display = 'block';
    toggleCamera.style.display = 'block';
});

document.addEventListener('DOMContentLoaded', function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    tipoPrueba = urlParams.has('tipoPrueba') ? urlParams.get('tipoPrueba') : "generica";
    
    if (!(tipoPrueba in window.tests)) {
        tipoPrueba = "generica";
    }
    document.getElementById('titleTest').innerHTML = window.tests[tipoPrueba].title;
    if (tipoPrueba != "generica")
        createTextImageAndConvertToBlob(window.tests[tipoPrueba].title);

    document.getElementById('descriptionTest').innerHTML = window.tests[tipoPrueba].description;
    if (tipoPrueba == "emojis") {
        document.getElementById('descriptionTest').style.fontSize = "100px";
    }

    if (window.tests[tipoPrueba].helper) {
        const script = document.createElement('script');
        script.src = window.tests[tipoPrueba].helper;
        script.onload = () => console.log(`Script cargado: ${window.tests[tipoPrueba].helper}`);
        script.onerror = () => console.error(`Error al cargar el script: ${window.tests[tipoPrueba].helper}`);
        document.head.appendChild(script);
    }

})

// Botón enviar: Envía la foto al servidor y oculta los controles
document.getElementById('send').addEventListener('click', function () {
    document.getElementById("loadingContainer").style.left = "0px";
    //alert("I")
    if (tipoPrueba == "generica") {
        const messageText = document.getElementById('messageTextarea').value;
        createTextImageAndConvertToBlob(messageText);
    }
    const canvas = document.getElementById('canvasPhoto');
    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('image', blob, 'foto.jpg');

        // Suponiendo que messageBlob es tu blob generado a partir del canvas de mensaje
        // Asegúrate de que messageBlob esté disponible en este ámbito
        formData.append('messageImage', messageBlob, 'mensaje.jpg');

        // Captura el parámetro 'tipoPrueba' de la URL


        formData.append('tipoPrueba', tipoPrueba);
        console.log('tipoPrueba', tipoPrueba);
        // Asume que el servidor está corriendo en localhost:3000 y acepta POST en /upload
        fetch(domain + '/upload', { // Asegúrate de usar el puerto correcto que estés escuchando
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.ok) {
                    document.getElementById("loadingContainer").style.left = "200%";
                    const photoControls = document.getElementById('photoControls');
                    photoControls.style.display = 'none';

                    document.getElementById('descriptionTest').innerHTML = "Gracias! Tu foto ha sido enviada. Consulta la pantalla para ver el resultado.";
                    //document.getElementById('loadModel').style.display = 'block';
                    // this.style.display = 'none'; // Ocultar botón de captura
                    document.getElementById('capture').style.display = 'none';
                    document.getElementById('toggleCamera').style.display = 'none';

                    if (tipoPrueba == "emojis") {
                        document.getElementById('descriptionTest').style.fontSize = "20px";
                    }
                } else {
                    console.log("data", data)
                    alert('Error al enviar la foto, ', data.error)
                    document.getElementById("loadingContainer").style.left = "200%";
                }
                // Opcional: Acciones posteriores al envío exitoso
            })
            .catch(data => {
                document.getElementById("loadingContainer").style.left = "200%";
                alert('Hubo un problema, intentalo más tarde')

            });
    }, 'image/jpeg', 0.85);
});


// Iniciar la webcam
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        document.getElementById('webcam').srcObject = stream;
    })
    .catch(console.error);

document.getElementById('loadModel').addEventListener('click', function () {
    // Crea el contenedor para el model-viewer si no existe

    modelViewerContainer = document.createElement('div');
    modelViewerContainer.id = 'modelViewerContainer';
    modelViewerContainer.style.position = 'fixed';
    modelViewerContainer.style.top = '10%';
    modelViewerContainer.style.left = '0';
    modelViewerContainer.style.width = '100vw';
    modelViewerContainer.style.height = '80%';
    modelViewerContainer.style.zIndex = '1000';
    modelViewerContainer.style.display = 'flex';
    modelViewerContainer.style.justifyContent = 'center';
    modelViewerContainer.style.alignItems = 'center';
    modelViewerContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';

    // Crea el botón de cierre
    const closeButton = document.createElement('button');
    closeButton.innerText = 'X';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.left = '20px';
    closeButton.style.zIndex = '1001';
    closeButton.style.width = '50px';
    closeButton.style.height = '50px';

    // Evento para cerrar el model-viewer
    closeButton.addEventListener('click', function () {
        modelViewerContainer.remove();
    });

    // Crea el model-viewer
    const modelViewer = document.createElement('model-viewer');
    modelViewer.style.width = '100%';
    modelViewer.style.height = '100%';
    modelViewer.setAttribute('src', domain + '/baseGltf/modified_cube.gltf');
    modelViewer.setAttribute('auto-rotate', '');
    modelViewer.setAttribute('camera-controls', '');
    modelViewer.setAttribute('ar', '');
    modelViewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
    modelViewer.setAttribute('shadow-intensity', '1');


    // Crea el botón para la realidad aumentada
    const arButton = document.createElement('button');
    arButton.setAttribute('slot', 'ar-button'); // Asigna el slot 'ar-button'
    arButton.id = 'ar-button';
    arButton.textContent = 'View in your space';

    // Crea el contenedor para la imagen de 'hand' que indica cómo usar la realidad aumentada
    const arPrompt = document.createElement('div');
    arPrompt.id = 'ar-prompt';

    // Crea la imagen y la añade al contenedor de ar-prompt
    const handImage = document.createElement('img');
    handImage.src = 'https://modelviewer.dev/shared-assets/icons/hand.png';
    arPrompt.appendChild(handImage);

    // Añade el botón de AR y el contenedor ar-prompt al model-viewer
    modelViewer.appendChild(arButton);
    modelViewer.appendChild(arPrompt);

    // Añade el botón de cierre y el model-viewer al contenedor
    modelViewerContainer.appendChild(closeButton);
    modelViewerContainer.appendChild(modelViewer);

    // Añade el contenedor al body del documento
    document.body.appendChild(modelViewerContainer);

});

function toggleCamera() {
    useFrontCamera = !useFrontCamera; // Alternar entre true y false
    getCameraStream().then(stream => {
        currentStream = stream;
        const videoElement = document.getElementById('webcam');
        videoElement.srcObject = stream;
    }).catch(error => {
        console.error("Error al obtener acceso a la cámara: ", error);
    });
}

function createTextImageAndConvertToBlob(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // Establece el color de fondo del canvas
    ctx.fillStyle = 'white'; // Fondo blanco
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Configura la fuente inicial y el tamaño máximo para comenzar las pruebas
    let fontSize = 100; // Comenzamos con un tamaño de fuente grande y lo ajustaremos hacia abajo
    ctx.font = `${fontSize}px Indie Flower`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black'; // Texto en negro

    // Verifica si el texto necesita ser dividido en dos líneas
    let lines = [];
    if (ctx.measureText(text).width > canvas.width) {
        let middle = text.length / 2;
        let before = text.lastIndexOf(' ', middle);
        let after = text.indexOf(' ', middle + 1);

        let splitIndex = (after - middle) < (middle - before) ? after : before;
        lines.push(text.substring(0, splitIndex));
        lines.push(text.substring(splitIndex + 1));
    } else {
        lines.push(text);
    }

    // Ajusta el tamaño de la fuente para que el texto más largo se ajuste al canvas
    let longestLine = lines.reduce((a, b) => a.length > b.length ? a : b, "");
    while (ctx.measureText(longestLine).width > canvas.width && fontSize > 10) {
        fontSize -= 1;
        ctx.font = `${fontSize}px Indie Flower`;
    }

    // Dibuja las líneas de texto en el canvas
    const lineHeight = fontSize * 1.2;
    const totalHeight = lineHeight * lines.length;
    let startY = (canvas.height - totalHeight) / 2 + fontSize / 2;
    lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, startY + (i * lineHeight));
    });

    // Mostrar el canvas en la página
    //document.body.appendChild(canvas);

    // Convertir el canvas a blob y enviarlo
    canvas.toBlob(function (blob) {
        // Aquí puedes enviar el blob a un servidor o hacer lo que necesites con él
        // Mostrar la imagen en pantalla como prueba
        messageBlob = blob;
       /* const img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
        document.body.appendChild(img);*/
    }, 'image/jpeg');
}


/*
var tests = {
    ZapatosIguales: {
        title: "Zapatos Iguales",
        description: "Hazte una foto con alguien que tenga los zapatos del mismo color que tú",
        url: "https://wetalkai.github.io/event_front?tipoPrueba=ZapatosIguales"
    },
    NoConocidoLugarDeOrigen: {
        title: "Lugar de origen",
        description: "Hazte una foto con alguien que no conozcas pero que haya nacido en el mismo mes que tú",
        url: "https://wetalkai.github.io/event_front?tipoPrueba=NoConocidoLugarDeOrigen"
    },
    MismaAficion: {
        title: "Misma afición",
        description: "Hazte una foto con alguien que tenga la misma afición que tú (en la foto haced un gesto que lo demuestre)",
        url: "https://wetalkai.github.io/event_front?tipoPrueba=MismaAficion"
    },
    MuchasCaras: {
        title: "Muchas caras!",
        description: "Haz una foto que aparezcáis 5 personas diferentes",
        url: "https://wetalkai.github.io/event_front?tipoPrueba=MuchasCaras"
    }
}
*/