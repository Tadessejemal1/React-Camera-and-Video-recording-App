// src/Videos.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Videos = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get('http://localhost:5000/videos');
        setVideos(res.data);
      } catch (err) {
        console.error('Error fetching videos:', err);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Uploaded Videos</h1>
      <div className="grid grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <video key={index} src={`http://localhost:5000/video/${video.split('/').pop()}`} controls className="rounded-lg border-2 border-gray-300" />
        ))}
      </div>
    </div>
  );
};

export default Videos;
