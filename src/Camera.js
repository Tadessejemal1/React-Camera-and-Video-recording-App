import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Camera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [notification, setNotification] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    getUserMedia();
  }, []);

  const takePhoto = () => {
    if (!canvasRef.current) {
      return;
    }

    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    const imageData = canvasRef.current.toDataURL('image/png');
    setPhoto(imageData);
  };

  const uploadPhoto = async () => {
    if (!photo) return;

    const blob = await fetch(photo).then(res => res.blob());
    const file = new File([blob], 'photo.png', { type: 'image/png' });
    const formData = new FormData();
    formData.append('image', file);

    try {
      setNotification('Uploading photo...');
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setNotification('Photo uploaded successfully!');
      console.log('Photo uploaded:', res.data);
    } catch (err) {
      setNotification('Error uploading photo. Please try again.');
      console.error('Error uploading photo:', err);
    }

    // Clear the notification after a few seconds
    setTimeout(() => {
      setNotification('');
    }, 3000);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    const stream = videoRef.current.srcObject;
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => prev.concat(event.data));
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'recorded-video.webm';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    };

    recorder.start();
    setMediaRecorder(recorder);

    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prevTime => prevTime + 1);
    }, 1000);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    mediaRecorder.stop();
    clearInterval(recordingIntervalRef.current);

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const file = new File([blob], 'video.webm', { type: 'video/webm' });
    const formData = new FormData();
    formData.append('video', file);

    try {
      setNotification('Uploading video...');
      const res = await axios.post('http://localhost:5000/upload-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setNotification('Video uploaded successfully!');
      console.log('Video uploaded:', res.data);
      setRecordedChunks([]); // Clear recorded chunks after uploading
    } catch (err) {
      setNotification('Error uploading video. Please try again.');
      console.error('Error uploading video:', err);
    }

    // Clear the notification after a few seconds
    setTimeout(() => {
      setNotification('');
    }, 3000);
  };

  const goToPhotosPage = () => {
    navigate('/photos');
  };

  const goToVideosPage = () => {
    navigate('/videos');
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 relative">
      {notification && (
        <div className="absolute top-4 right-4">
          <p className="bg-green-100 border-t-4 border-green-500 rounded-b text-green-900 shadow-md p-4 font-bold animate-slide-in">
            {notification}
          </p>
        </div>
      )}
      <div className="bg-white shadow-md rounded-lg p-6 mt-12">
        <video ref={videoRef} autoPlay className="rounded-lg border-2 border-gray-300" />
        <div className="mt-4">
          <button
            onClick={takePhoto}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Take Photo
          </button>
          {photo && (
            <div className="mt-4">
              <img src={photo} alt="Captured" className="rounded-lg border-2 border-gray-300" />
              <button
                onClick={uploadPhoto}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Upload Photo
              </button>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
        <div className="mt-4">
          {isRecording ? (
            <>
              <button
                onClick={stopRecording}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Stop Recording
              </button>
              <div className="mt-2 text-lg font-bold">
                Recording Time: {formatTime(recordingTime)}
              </div>
            </>
          ) : (
            <button
              onClick={startRecording}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Start Recording
            </button>
          )}
        </div>
        <div className="mt-4">
          <button
            onClick={goToPhotosPage}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            See All Photos
          </button>
          <button
            onClick={goToVideosPage}
            className="ml-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            See All Videos
          </button>
        </div>
      </div>
    </div>
  );
};

export default Camera;
