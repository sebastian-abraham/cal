import React, { useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { handleSaveSnapshot } from "../../lib/snapUtils.js";

const HandLandmarkerComponent = ({filesetResolver}) => {
    const videoRef = useRef(null);
    const handLandmarkerRef = useRef(null);
    const [handCount, setHandCount] = useState(0);

    useEffect(() => {
        const initializeHandLandmarker = async () => {

            handLandmarkerRef.current = await HandLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: "src/models/hand_landmarker.task", 
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 3
            });
        };

        const startWebcam = async () => {
            const video = videoRef.current;
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = stream;
                video.play();
            }
        };

        initializeHandLandmarker();
        startWebcam();

        return () => {
            const video = videoRef.current;
            if (video && video.srcObject) {
                const tracks = video.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        const video = videoRef.current;

        const detectHands = async () => {
            if (handLandmarkerRef.current && video.readyState === 4) {
                const results = await handLandmarkerRef.current.detectForVideo(video, performance.now());

                if (results && results.landmarks) {
                    setHandCount(results.landmarks.length);
                } else {
                    setHandCount(0);
                }
            }

            requestAnimationFrame(detectHands);
        };

        detectHands();
    }, []);

    useEffect(() => {
        for(let i = 0; i<3; i++){
            if(handCount>2){
                handleSaveSnapshot({anomalyType: "more than 2 hands", video: videoRef.current});
            }
        }
    }, [handCount]); // Triggered whenever handCount changes
    

    return (
        <div>
            <h1>Number of Hands Detected: {handCount}</h1>
            <video ref={videoRef} style={{ display: "none" }} />
        </div>
    );
};

export default HandLandmarkerComponent;
