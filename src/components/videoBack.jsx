import React from 'react';
import video from '../assets/videoBg.mp4';

const ViewB = () => {
  return (
    <div >
      <video
        src={video}
        autoPlay
        muted
        loop
        playsInline
        style={
            {
                position: "absolute",
                width: "100%",
                height:"100%",
                left: "50%" ,
                top: "50%",
                objectFit:"cover",
                transform: "translate(-50%, -50%)",
               zIndex: "-1",
            }
        }
      />
      
      
    </div>
  );
};

export default ViewB;