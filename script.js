const localDomain = 'http://localhost:3008';
const remoteDomain = 'https://evento-silvia-bd9532c26bae.herokuapp.com';
var domain = remoteDomain;
document.getElementById('capture').addEventListener('click', function () {
    const canvas = document.getElementById('canvas');
    const video = document.getElementById('webcam');
    const photoControls = document.getElementById('photoControls');
    const capturedPhoto = document.getElementById('capturedPhoto');

    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoURL = canvas.toDataURL('image/png');
    capturedPhoto.src = photoURL;

    // Mostrar los controles de la foto y ocultar la webcam
    photoControls.style.display = 'block';
    video.style.display = 'none';
    this.style.display = 'none'; // Ocultar botón de captura
});


// Botón cerrar: Oculta la imagen capturada y muestra la webcam de nuevo
document.getElementById('closeBtnPhoto').addEventListener('click', function () {
    const video = document.getElementById('webcam');
    const photoControls = document.getElementById('photoControls');
    const captureButton = document.getElementById('capture');

    photoControls.style.display = 'none';
    video.style.display = 'block';
    captureButton.style.display = 'block';
});

document.addEventListener('DOMContentLoaded', function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const tipoPrueba = urlParams.get('tipoPrueba');
    console.log(tipoPrueba);
    document.getElementById('titleTest').innerHTML = tests[tipoPrueba].title;
    document.getElementById('descriptionTest').innerHTML = tests[tipoPrueba].description;

})

// Botón enviar: Envía la foto al servidor y oculta los controles
document.getElementById('send').addEventListener('click', function () {
    const canvas = document.getElementById('canvas');
    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('image', blob, 'foto.jpg');

        // Captura el parámetro 'tipoPrueba' de la URL
        const searchParams = new URLSearchParams(window.location.search);
        var tipoPrueba = searchParams.has('tipoPrueba') ? searchParams.get('tipoPrueba') : "namePruebaUndefined";

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
                    const photoControls = document.getElementById('photoControls');
                    photoControls.style.display = 'none';

                    document.getElementById('descriptionTest').innerHTML = "Gracias! Tu prueba ha sido enviada. Consulta el progreso para saber cuánto falta para conseguir el premio!";
                    document.getElementById('loadModel').style.display = 'block';
                    this.style.display = 'none'; // Ocultar botón de captura

                } else {
                    console.log("data", data)
                    alert('Error al enviar la foto, ', data.error)
                }
                // Opcional: Acciones posteriores al envío exitoso
            })
            .catch(data => {

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


var tests = {
    ZapatosIguales: {
        title: "Zapatos Iguales",
        description: "Hazte una foto con alguien que tenga los zapatos del mismo color que tú",
    }
}