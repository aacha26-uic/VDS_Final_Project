// RESOURCES USED: https://github.com/uic-evl/CS529ThreeJsHW/
import React, { useEffect, useRef, useMemo, useState, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

//helper function to  wait for window resize
function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

export default function Blob(props) {

  //this is a generic component for plotting a d3 plot
  const container = useRef(null);
  const [screensize] = useWindowSize();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [scene, setScene] = useState(null);

  //get the size of the convas
  useEffect(() => {
    //wait for mounting to calculate parent container size
    if (!container.current) {return;}
    var w = container.current.clientWidth;
    var h = container.current.clientHeight;

    setHeight(h);
    setWidth(w);
    
  }, [container.current, screensize]);

  //set up camera with light
  const camera = useMemo(() => {
      //setup camera
      if(width <= 0 || height <= 0){ return; }

      //how big the head is relative to the scene 2 is normal;
      var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      
      // Add a directional light to show off the objects
      var light = new THREE.DirectionalLight(0xffffff, 1);
      
      // Position the light out from the scene, pointing at the origin
      light.position.set(2, 2, 5);
      light.lookAt(0,0,0);

      camera.add(light);

      return camera
  },[height, width]);


  //set up the renderer
  var renderer = useMemo(()=>{
    if(width <= 0 || height <= 0){ return; }
    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    //background color
    // renderer.setClearColor(0xFFFFFF, 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height)
    if(container.current.children[0]){
        container.current.removeChild(container.current.children[0]);
    }
    container.current.appendChild(renderer.domElement);
    return renderer;
  },[width,height]);

  //set up orbit controls
  const controls = useMemo(()=>{
    if(camera === undefined | renderer === undefined){ return }
    var controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 5000;
    camera.position.set(2,2,12);
    controls.enablePan = false;
    camera.lookAt(0,0,0);
    controls.enablePan = false;
    controls.update();

    return controls
  },[renderer,camera]);

  // This is where the 3d blob will be created
  useEffect(() => {
    if (!camera) return;
    const s = new THREE.Scene();

    // icosahedron
    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // const cube = new THREE.Mesh(geometry, material);
    // s.add(cube);
    const geometry = new THREE.IcosahedronGeometry();
    const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    const blob = new THREE.Mesh( geometry, material );
    s.add(blob);

    // edges
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
    s.add(line);

    camera.position.z = 5;
    setScene({ scene: s, blob, edges: line }); 

  }, [camera]);

  //main anime loop
  useEffect(() => {
    if(!renderer || !scene || !camera){ 
      return; 
    }
    const { scene: s, blob, edges } = scene;

    const animate = function () {
      requestAnimationFrame(animate);
      renderer.clear();
      if (blob) {
        blob.rotation.x += 0.01;
        blob.rotation.y += 0.01;
        edges.rotation.x += 0.01;
        edges.rotation.y += 0.01;
      }
      if(controls){
        controls.update()
      }
      renderer.render(s, camera);
    };

    animate();
  }, [renderer, scene, camera, controls]);

  //cleanup function, more useful if you are changing scenes dynamically
  useEffect(() => {
      return () => {
          if(!renderer){return;}
          renderer.forceContextLoss();
      }
  },[renderer]);

  return <div ref={container} style={{ width: '100%', height: '100%' }} />;
}
