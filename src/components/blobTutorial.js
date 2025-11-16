// BLOB TUTORIAL CODE USED: https://www.youtube.com/watch?v=6YJ-2MvDqhc&t=2s

import React, { useMemo, useRef } from "react";
import vertexShader from "./vertexShader";
import fragmentShader from "./fragmentShader";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";


const Blob = (props) => {
  const mesh = useRef();
  const hover = useRef(false);
  const uniforms = useMemo(() => {
    return {
      u_time: { value: 0 },
      u_intensity: { value: 0.3 },
      moca_score: {value: ((props.score) / 30)}
    };
  });

  useFrame((state) => {
    const { clock } = state;
    if (mesh.current) {
      mesh.current.material.uniforms.u_time.value = 0.4 * clock.getElapsedTime();
      const targetIntensity = ((props.score) / 30) * 1.5; // map score to something between 0-1.5
      mesh.current.material.uniforms.u_intensity.value = MathUtils.lerp(
        mesh.current.material.uniforms.u_intensity.value,
        targetIntensity,
        0.02
      );
    }
  });

  return (
    <mesh
      ref={mesh}
      scale={1.5}
      position={[0, 0, 0]}
      onPointerOver={() => (hover.current = true)}
      onPointerOut={() => (hover.current = false)}
    >
      <icosahedronGeometry args={[2, 20]} />  
      <shaderMaterial
        vertexShader={vertexShader}  /* allows us to alter the geometry */
        fragmentShader={fragmentShader} /* allows us to set the color of each geometry*/
        uniforms={uniforms}
      />
    </mesh>
  );
};

export default Blob;