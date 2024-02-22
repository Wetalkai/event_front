// mediapipeIntegration.js
import {Hands, drawConnectors, drawLandmarks, HAND_CONNECTIONS} from 'https://cdn.jsdelivr.net/npm/@mediapipe/hands';
import {Camera} from 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils';

const videoElement = document.getElementById('webcam');
const canvasElement = document.createElement('canvas');
const canvasCtx = canvasElement.getContext('2d');
document.body.appendChild(canvasElement); // Asumiendo que quieres añadir el canvas al cuerpo del documento

canvasElement.width = 1280; // Ajusta según tus necesidades
canvasElement.height = 720;
canvasElement.style.position = "absolute"; // Para superponer el canvas sobre el vídeo
canvasElement.style.top = "0";
canvasElement.style.left = "0";
canvasElement.style.zIndex = "100"; // Asegúrate de que el canvas esté sobre otros elementos

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    let thumbUpDetected = false;
    let thumbDownDetected = false;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length === 2) {
        for (const landmarks of results.multiHandLandmarks) {
            // Lógica para detectar pulgar arriba y abajo
            // Tu código existente aquí
        }
        // Logica para verificar gestos
    }
    canvasCtx.restore();
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

new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({image: videoElement});
    },
    width: 1280,
    height: 720
}).start();
