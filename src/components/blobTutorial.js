// Note: The below code is used for the blob. This file takes in data from props and adjusts the shape/color of the blob accordingly
// The following code tutorial was used to make this: https://www.youtube.com/watch?v=6YJ-2MvDqhc&t=2s

import React, {useEffect, useRef, useState } from "react";
import vertexShader from "./vertexShader";
import fragmentShader from "./fragmentShader";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";

// This allows us to send in data into component
// Default values for everything execept moca_score is provided
const Blob = ({ sliderValues, setSliderValues }) => {
  const mesh = useRef(); // making an empty reference for mesh
  const [blob_prediction, setBlob_prediction] = useState([]);
  const uniforms = useRef({
        u_time: { value: 0 },
        u_intensity: { value: 0.0 },
        moca_score: { value: 15 } // making an empty reference for uniform values
  });


  // This will fetch the blob's AD status prediction based on the current slider values
  useEffect(() => {
      if (!Object.keys(sliderValues).length) return;
  
      fetch("http://127.0.0.1:8000/blob_predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sliders: sliderValues })
      })
      .then(res => res.json())
      .then(data => setBlob_prediction(data["prediction_value"]))
      .catch(err => console.error("Error:", err));

      console.log("Fetched blob prediction:", blob_prediction);
  
  }, [sliderValues]);

  // This function will change blob every time prop values change
  useEffect(() => {
    if (mesh.current) {
      const targetIntensity = (blob_prediction/2) * 1.5; // map the blob_prediction value to something between 0-1.5 (anything more will make blob too violent)
      mesh.current.material.uniforms.u_intensity.value = targetIntensity;
      // console.log("Blob intensity set to:", mesh.current.material.uniforms.u_intensity.value);

      var new_blob_value = 0;
      if (blob_prediction == 0) {
        new_blob_value = 27; // Normal (Moca > 26)
      } else if (blob_prediction === 1) {
        new_blob_value = 13; // Prob AD - Probably AD? A mix of both Normal and MCI (Moca 0-30) 
      } else if (blob_prediction === 2) {
        new_blob_value = 5; // MCI - Moderate AD (Moca < 18)
      }

      console.log("Updated blob moca_score to:", new_blob_value);
      uniforms.current.moca_score.value = new_blob_value; // update the moca_score with new props data each update
    } 

  }, [blob_prediction]);

  return (
    // assigning 
    <mesh ref={mesh} scale={1.5} position={[0, 0, 0]}> 
      {/* Make a icosahedron with radius=2 and detail=20 */}
      <icosahedronGeometry args={[2, 20]} />  
      {/* Apply the shaders to alter the shape/color of icosahedron to look like a blob */}
      <shaderMaterial
        vertexShader={vertexShader}  /* allows us to alter the geometry */
        fragmentShader={fragmentShader} /* allows us to set the color of each geometry*/
        uniforms={uniforms.current} /*apply prop data to the blob*/
      />
    </mesh>
  );
};

export default Blob;