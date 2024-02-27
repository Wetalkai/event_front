let useFrontCamera = true; // Comienza con la cámara trasera por defecto

// Función para obtener el stream de la cámara
function getCameraStream() {
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }

    const videoConstraints = {};
    if (useFrontCamera) {
        videoConstraints.facingMode = "user"; // Cámara frontal
    } else {
        videoConstraints.facingMode = { exact: "environment" }; // Cámara trasera
    }

    const constraints = {
        video: videoConstraints,
        audio: false
    };

    return navigator.mediaDevices.getUserMedia(constraints);
}
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('toggleCamera').addEventListener('click', function () {
        useFrontCamera = !useFrontCamera; // Alternar entre true y false
        getCameraStream().then(stream => {
            document.getElementById('webcam').srcObject = stream;
        }).catch(error => {
            console.error("Error al obtener acceso a la cámara: ", error);
        });
    });
});
