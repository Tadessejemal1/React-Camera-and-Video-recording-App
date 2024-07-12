// src/Photos.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Photos = () => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await axios.get('http://localhost:5000/photos');
        setPhotos(res.data);
      } catch (err) {
        console.error('Error fetching photos:', err);
      }
    };

    fetchPhotos();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Uploaded Photos</h1>
      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <img key={index} src={`http://localhost:5000${photo}`} alt={`Uploaded ${index}`} className="rounded-lg border-2 border-gray-300" />
        ))}
      </div>
    </div>
  );
};

export default Photos;
