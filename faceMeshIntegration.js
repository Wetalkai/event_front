// faceMeshIntegration.js
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvasFaceMesh');
const canvasCtx = canvasElement.getContext('2d');
const captureButton = document.getElementById('capture');

const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
});

faceMesh.setOptions({
    maxNumFaces: 2,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
});

faceMesh.onResults(onResults);

// Función para procesar resultados
function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiFaceLandmarks) {
        // Aquí puedes procesar los landmarks para detectar sonrisas y sorpresas
        // Esta es una simplificación. Necesitarás implementar la lógica específica
        // para identificar estas expresiones basadas en los landmarks faciales.
        
        // Ejemplo simplificado para habilitar el botón
        // if (sonrisaDetectada && sorpresaDetectada) {
        //     captureButton.disabled = false;
        // } else {
        //     captureButton.disabled = true;
        // }
    }
    canvasCtx.restore();
}

new Camera(videoElement, {
    onFrame: async () => {
        await faceMesh.send({ image: videoElement });
    },
    width: 1280,
    height: 720,
}).start();
