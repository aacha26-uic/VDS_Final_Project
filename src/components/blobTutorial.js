// Note: The below code is used for the blob. This file takes in data from props and adjusts the shape/color of the blob accordingly
// The following code tutorial was used to make this: https://www.youtube.com/watch?v=6YJ-2MvDqhc&t=2s

import React, {useEffect, useRef } from "react";
import vertexShader from "./vertexShader";
import fragmentShader from "./fragmentShader";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";

// This allows us to send in data into component
// Default values for everything execept moca_score is provided
const Blob = (props) => {
  const mesh = useRef(); // making an empty reference for mesh
  const uniforms = useRef({
        u_time: { value: 0 },
        u_intensity: { value: 0.3 },
        moca_score: { value: props.score / 30 } // making an empty reference for uniform values
  });


  // This function will change blob every time prop values change
  useEffect(() => {
    if (mesh.current) {
      const targetIntensity = (props.score / 30) * 1.5; // map the moca_score to something between 0-1.5 (anything more will make blob too violent)
      mesh.current.material.uniforms.u_intensity.value = MathUtils.lerp(
        mesh.current.material.uniforms.u_intensity.value,
        targetIntensity,
        0.1
      ); // Makes the blob smoothly transition to its new state 
      uniforms.current.moca_score.value = props.score / 30; // update the moca_score with new props data each frame
    } 

  }, [props.score]);

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