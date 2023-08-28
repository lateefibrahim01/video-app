import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'peerjs';

const VideoChat = () => {
  const socketRef = useRef();
  const userVideoRef = useRef();
  const partnerVideoRef = useRef();
  const peerRef = useRef();
  const peerIdRef = useRef();

  useEffect(() => {
    // Connect to the Socket.io server
    socketRef.current = io.connect('http://localhost:5000');

    // Get the user's video stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        userVideoRef.current.srcObject = stream;
        
        // Initialize the Peer connection
        peerRef.current = new Peer(undefined, {
          host: '/',
          port: '5001',
        });

        peerRef.current.on('open', (id) => {
          // Save the Peer ID in the state and send it to the server
          peerIdRef.current = id;
          socketRef.current.emit('join-room', roomId, id);
        });

        // Receive the partner's stream
        socketRef.current.on('user-connected', userId => {
          connectToUser(userId, stream);
        });
      })
      .catch(error => console.error('Error accessing media devices: ', error));
  }, []);

  const connectToUser = (userId, stream) => {
    const call = peerRef.current.call(userId, stream);
    call.on('stream', partnerStream => {
      partnerVideoRef.current.srcObject = partnerStream;
    });
  };

  return (
    <div>
      <video ref={userVideoRef} autoPlay muted></video>
      <video ref={partnerVideoRef} autoPlay></video>
    </div>
  );
};

export default VideoChat;
