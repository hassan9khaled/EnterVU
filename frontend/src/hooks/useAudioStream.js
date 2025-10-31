import { useState, useEffect, useRef } from 'react';
import { sseEndpoints, sendToAgent } from '~/api/apiClient';

/* ----------------------- 🔊 AUDIO PLAYER ----------------------- */
async function startAudioPlayerWorklet() {
    const audioContext = new AudioContext({ sampleRate: 24000 });
    await audioContext.audioWorklet.addModule('/pcm-player-processor.js');
    const audioPlayerNode = new AudioWorkletNode(audioContext, 'pcm-player-processor');
    audioPlayerNode.connect(audioContext.destination);

    // ✅ Chrome autoplay policy fix
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    return [audioPlayerNode, audioContext];
}

/* ----------------------- 🎙️ AUDIO RECORDER ----------------------- */
async function startAudioRecorderWorklet(audioRecorderHandler) {
    const audioRecorderContext = new AudioContext({ sampleRate: 16000 });
    await audioRecorderContext.audioWorklet.addModule('/pcm-recorder-processor.js');

    const micStream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
    const source = audioRecorderContext.createMediaStreamSource(micStream);
    const audioRecorderNode = new AudioWorkletNode(audioRecorderContext, 'pcm-recorder-processor');

    source.connect(audioRecorderNode);
    audioRecorderNode.port.onmessage = (event) => {
        const pcmData = convertFloat32ToPCM(event.data);
        audioRecorderHandler(pcmData, event.data); // Pass both PCM and Float32 data for silence detection
    };

    return [audioRecorderNode, audioRecorderContext, micStream];
}

/* ----------------------- 🔧 HELPERS ----------------------- */
function stopMicrophone(micStream) {
    if (!micStream) return;
    micStream.getTracks().forEach((track) => track.stop());
}

function convertFloat32ToPCM(inputData) {
    const pcm16 = new Int16Array(inputData.length);
    for (let i = 0; i < inputData.length; i++) {
        pcm16[i] = inputData[i] * 0x7fff;
    }
    return pcm16.buffer;
}

/* ----------------------- ⚙️ MAIN HOOK ----------------------- */
export const useAudioStream = (userId, interviewId) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);

    const eventSourceRef = useRef(null);
    const audioPlayerNodeRef = useRef(null);
    const micStreamRef = useRef(null);
    const audioBufferRef = useRef([]);
    const float32BufferRef = useRef([]); // For silence detection
    const bufferTimerRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const progressiveTimerRef = useRef(null);
    const isRecordingRef = useRef(false);

    // Silence detection configuration
    const SILENCE_THRESHOLD = 0.015; // Adjust this value based on testing
    const INITIAL_SEND_DELAY = 500; // Send first chunk after 500ms
    const SILENCE_DURATION = 800; // Final silence detection after 800ms
    const PROGRESSIVE_SEND_INTERVAL = 2000; // Send every 2 seconds while talking

    const isBrowserCompatible = () =>
        !!(navigator.mediaDevices?.getUserMedia && window.AudioWorklet);

    const checkMicrophonePermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error("❌ Microphone permission denied:", error);
            return false;
        }
    };

    const detectSilence = (float32Data) => {
        if (!float32Data || float32Data.length === 0) return true;
        
        // Calculate RMS (Root Mean Square) of the audio data
        let sum = 0;
        for (let i = 0; i < float32Data.length; i++) {
            sum += float32Data[i] * float32Data[i];
        }
        const rms = Math.sqrt(sum / float32Data.length);
        
        return rms < SILENCE_THRESHOLD;
    };

    const handleAudioData = (pcmData, float32Data) => {
        // Store both PCM and Float32 data
        audioBufferRef.current.push(new Uint8Array(pcmData));
        float32BufferRef.current = float32BufferRef.current.concat(Array.from(float32Data));
        
        // Keep only recent data for silence detection (last 2 seconds worth)
        const maxSamples = 16000 * 2; // 2 seconds at 16kHz
        if (float32BufferRef.current.length > maxSamples) {
            float32BufferRef.current = float32BufferRef.current.slice(-maxSamples);
        }
        
        // Check for silence in the recent audio data
        const recentSamples = float32BufferRef.current.slice(-800); // Check last 800 samples (~50ms)
        const isSilent = detectSilence(recentSamples);
        
        if (isSilent) {
            // If we detect silence and we were recording, start the silence timer
            if (isRecordingRef.current && !silenceTimerRef.current) {
                silenceTimerRef.current = setTimeout(() => {
                    // After silence duration, send the final audio
                    sendBufferedAudioFinal();
                    isRecordingRef.current = false;
                    silenceTimerRef.current = null;
                }, SILENCE_DURATION);
            }
        } else {
            // Sound detected - clear silence timer
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
            }
            
            const justStartedRecording = !isRecordingRef.current;
            isRecordingRef.current = true;
            
            if (justStartedRecording) {
                // Send first audio chunk quickly for low latency
                setTimeout(() => {
                    if (isRecordingRef.current && audioBufferRef.current.length > 0) {
                        sendBufferedAudioProgressive(true); // Send but keep recording
                    }
                }, INITIAL_SEND_DELAY);
            }
            
            // Continue sending progressive updates while talking
            if (!progressiveTimerRef.current) {
                progressiveTimerRef.current = setInterval(() => {
                    if (isRecordingRef.current && audioBufferRef.current.length > 0) {
                        sendBufferedAudioProgressive(true);
                    }
                }, PROGRESSIVE_SEND_INTERVAL);
            }
        }
    };

    const sendBufferedAudioProgressive = async (isPartial = false) => {
        if (audioBufferRef.current.length === 0) return;
        
        const combinedBuffer = combineAudioChunks(audioBufferRef.current);
        
        try {
            await sendToAgent(userId, {
                mime_type: 'audio/pcm',
                data: arrayBufferToBase64(combinedBuffer.buffer),
                is_partial: isPartial // Let server know this is partial audio
            });
            console.log(`✅ Sent ${isPartial ? 'partial' : 'final'} audio chunk of`, combinedBuffer.length, "bytes");
            
            // If this is partial audio, keep the last 500ms for continuity
            if (isPartial) {
                keepRecentAudio(500); // Keep last 500ms of audio
            } else {
                // Final audio - clear everything
                audioBufferRef.current = [];
                float32BufferRef.current = [];
            }
            
        } catch (err) {
            console.error("❌ Failed to send audio chunk:", err);
        }
    };

    const sendBufferedAudioFinal = async () => {
        await sendBufferedAudioProgressive(false);
        
        // Clean up timers
        if (progressiveTimerRef.current) {
            clearInterval(progressiveTimerRef.current);
            progressiveTimerRef.current = null;
        }
        if (bufferTimerRef.current) {
            clearInterval(bufferTimerRef.current);
            bufferTimerRef.current = null;
        }
    };

    const keepRecentAudio = (msToKeep) => {
        const samplesToKeep = 16000 * (msToKeep / 1000);
        const bytesToKeep = samplesToKeep * 2; // 16-bit PCM (2 bytes per sample)
        
        if (audioBufferRef.current.length > 0) {
            const allAudio = combineAudioChunks(audioBufferRef.current);
            if (allAudio.length > bytesToKeep) {
                const recentAudio = allAudio.slice(-bytesToKeep);
                audioBufferRef.current = [new Uint8Array(recentAudio)];
                
                // Also trim the float32 buffer for consistency
                const floatSamplesToKeep = 16000 * (msToKeep / 1000);
                if (float32BufferRef.current.length > floatSamplesToKeep) {
                    float32BufferRef.current = float32BufferRef.current.slice(-floatSamplesToKeep);
                }
            }
        }
    };

    const combineAudioChunks = (chunks) => {
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
        }
        return combined;
    };

    const startStreaming = async () => {
        if (!isBrowserCompatible()) {
            console.error("Browser does not support required APIs for audio streaming.");
            return false;
        }

        if (!userId || !interviewId) {
            console.error("Missing userId or interviewId:", { userId, interviewId });
            return false;
        }

        const hasPermission = await checkMicrophonePermissions();
        if (!hasPermission) return false;

        try {
            console.log("🎯 Starting streaming with:", { userId, interviewId });

            // Prevent duplicate connections
            if (eventSourceRef.current) {
                console.warn("⚠️ SSE already active, skipping new connection.");
                return true;
            }

            // Reset recording state
            isRecordingRef.current = false;
            audioBufferRef.current = [];
            float32BufferRef.current = [];

            // Clear any existing timers
            if (progressiveTimerRef.current) {
                clearInterval(progressiveTimerRef.current);
                progressiveTimerRef.current = null;
            }
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
            }

            // 🎧 Setup audio player and recorder
            const [playerNode] = await startAudioPlayerWorklet();
            audioPlayerNodeRef.current = playerNode;

            const [, , micStream] = await startAudioRecorderWorklet(handleAudioData);
            micStreamRef.current = micStream;

            const url = sseEndpoints.events(userId, interviewId);
            console.log("🔗 Connecting to:", url);

            const eventSource = new EventSource(url);
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                console.log("✅ SSE connected");
                setIsConnected(true);
            };

            eventSource.onmessage = handleServerMessage;

            eventSource.onerror = (err) => {
                console.warn("⚠️ SSE connection lost:", err);
                cleanupEventSource();
                setIsConnected(false);
                // 🧠 Try reconnect after 2s
                if (!reconnectTimerRef.current) {
                    reconnectTimerRef.current = setTimeout(() => {
                        reconnectTimerRef.current = null;
                        startStreaming();
                    }, 2000);
                }
            };

            return true;
        } catch (error) {
            console.error("❌ Failed to start audio streaming:", error);
            return false;
        }
    };

    const stopStreaming = () => {
        console.log("🛑 Stopping streaming manually...");
        cleanupEventSource();
        if (micStreamRef.current) stopMicrophone(micStreamRef.current);
        
        // Clear all timers
        if (bufferTimerRef.current) clearInterval(bufferTimerRef.current);
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (progressiveTimerRef.current) clearInterval(progressiveTimerRef.current);

        // Reset states
        audioBufferRef.current = [];
        float32BufferRef.current = [];
        isRecordingRef.current = false;
        setIsConnected(false);
    };

    const cleanupEventSource = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
    };

    const handleServerMessage = (event) => {
        try {
            const serverMessage = JSON.parse(event.data);
            if (serverMessage.mime_type === 'audio/pcm' && audioPlayerNodeRef.current) {
                const audioData = base64ToArray(serverMessage.data);
                audioPlayerNodeRef.current.port.postMessage(audioData);
            } else if (serverMessage.mime_type === 'text/plain') {
                setMessages(prev => [...prev, { type: 'agent', text: serverMessage.data }]);
            }
        } catch (e) {
            console.error("Error parsing server message:", e, event.data);
        }
    };

    const base64ToArray = (base64) => {
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    useEffect(() => {
        return () => {
            stopStreaming(); // Cleanup on unmount
        };
    }, []);

    return { isConnected, messages, startStreaming, stopStreaming };
};