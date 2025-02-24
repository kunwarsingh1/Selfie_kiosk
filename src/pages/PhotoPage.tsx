import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Home, RefreshCcw, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const PhotoPage = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const navigate = useNavigate();

  

  // Request access to the webcam
  useEffect(() => {
    const startVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1080 },
            height: { ideal: 1920 },
            facingMode: "user",
            // Try to force portrait orientation
            aspectRatio: 9/16
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Add orientation change listener
          videoRef.current.addEventListener('loadedmetadata', () => {
            // Force vertical orientation if needed
            if (videoRef.current) {
              // videoRef.current.style.transform = 'rotate(90deg)';
            }
          });
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        toast.error('Failed to access webcam');
      }
    };
  
    startVideoStream();
  }, []);


  

  const startCountdown = () => {
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          capture();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  

  const capture = useCallback(() => {
    if (canvasRef.current && videoRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Determine orientation
        const isPortrait = window.innerHeight > window.innerWidth;
        
        if (isPortrait) {
          canvas.width = video.videoHeight;
          canvas.height = video.videoWidth;
          context.translate(canvas.width, 0);
          context.rotate(90 * Math.PI / 180);
        } else {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        const imageSrc = canvas.toDataURL('image/jpeg');
        setPhoto(imageSrc);
      }
    }
  }, []);


  const email = async (img: string | null, send_to: string) => {
    const body = { data: img, send_to: send_to };
    try {
      const response = await axios.post(`https://udaanapi.zetrance.com/email`, body);
      return response.status === 200;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  };

  const handleSendEmail = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const sent = await email(photo, userInfo.email);
    if (sent) {
      toast.success('Photo sent to ' + userInfo.email);
      navigate('/');
    } else {
      toast.error('Failed to send the photo. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center ">
      <Link to="/" className="flex items-center justify-center gap-2 py-8" >
      <img src="/images/logo.png" className='w-auto h-auto' />
    </Link>

      <div className="container mx-auto px-4 w-full h-full flex flex-col justify-center items-center">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 shadow-xl max-w-3xl w-full">
          {!photo ? (
            <div className="space-y-6 flex flex-col items-center justify-center " >
              <div className="relative w-full h-[70vh] flex items-center justify-center">
  <video
    ref={videoRef}
    autoPlay
    muted
    className="w-full rounded-lg absolute"
    style={{
      maxWidth: '100%',
      maxHeight: '70vh',
      objectFit: 'cover',
      transform: 'scaleX(1) rotate(0deg)',
      transformOrigin: 'center',
    }}
  />
  {countdown && (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="w-32 h-32 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
        <div className="text-6xl text-white font-bold animate-pulse">
          {countdown}
        </div>
      </div>
    </div>
  )}
</div>
              <div className="flex justify-center w-full">
                {!countdown && (
                  <button
                    onClick={startCountdown}
                    className="flex items-center gap-4 px-12 py-6 bg-white bg-opacity-20 rounded-lg text-white text-2xl font-semibold hover:bg-opacity-30 transition-all duration-300"
                  >
                    <Camera className="w-auto h-auto" />
                    Take Photo
                  </button>
                )}
              </div>
            </div>
          ) : (
<div className="space-y-6 flex flex-col items-center justify-center overflow-hidden">
  <div className='overflow-hidden'>
<img
    src={photo}
    alt="Captured"
    className="w-full max-w-3xl rounded-lg shadow-lg"
    style={{
      maxHeight: '70vh', // Ensures it doesn't exceed the viewport height
      objectFit: 'contain', // Maintains aspect ratio and fits within container
       transform: ' rotate(180deg)',// Rotates the image
      width: 'auto', // Ensures the width is adjusted automatically after rotation
      height: '100%', // Makes the height fit the container while maintaining aspect ratio
    }}
  />
  </div>
              <div className="flex justify-center gap-8">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-4 px-8 py-6 bg-white bg-opacity-20 rounded-lg text-white text-xl font-semibold hover:bg-opacity-30 transition-all duration-300"
                >
                  <Home className="w-6 h-6" />
                  
                </button>
                <button
                  onClick={() => {setPhoto(null);window.location.reload();}}
                  className="flex items-center gap-4 px-8 py-6 bg-white bg-opacity-20 rounded-lg text-white text-xl font-semibold hover:bg-opacity-30 transition-all duration-300"
                >
                  <RefreshCcw className="w-6 h-6" />
                  Retake
                </button>
                <button
                  onClick={handleSendEmail}
                  className="flex items-center gap-4 px-8 py-6 bg-white bg-opacity-20 rounded-lg text-white text-xl font-semibold hover:bg-opacity-30 transition-all duration-300"
                >
                  <Mail className="w-6 h-6" />
                  Send Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default PhotoPage;
