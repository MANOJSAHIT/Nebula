// index.js

function visualizeFloorplan(jsonData) {
    const data = JSON.parse(jsonData);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    scene.add(directionalLight);
    const floorGeometry = new THREE.PlaneGeometry(50, 50, 1, 1);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    scene.add(floor);
    function createWall(length, x, z, rotation = 0) {
      const wallGeometry = new THREE.BoxGeometry(length, 3, 0.2);
      const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(x, 1.5, z);
      wall.rotation.y = rotation;
      scene.add(wall);
    }
  
    function createRoom(length, width, x, z) {
      const roomGeometry = new THREE.BoxGeometry(length, 2.9, width);
      const roomMaterial = new THREE.MeshBasicMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.5 });
      const room = new THREE.Mesh(roomGeometry, roomMaterial);
      room.position.set(x, 1.45, z);
      scene.add(room);
    }
  
    function createDoorWindow(width, x, z) {
      const elementGeometry = new THREE.BoxGeometry(width, 2, 0.1);
      const elementMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
      const element = new THREE.Mesh(elementGeometry, elementMaterial);
      element.position.set(x, 1, z);
      scene.add(element);
    }
    createWall(data.wall_lengths["Exterior Wall 1"], 0, -10);
    const roomPositions = {
      "Owners' Suite": { x: 10, z: 10 },
      "WIC": { x: 5, z: 10 },
      "Utility": { x: -5, z: 10 },
      "Bath": { x: 10, z: 0 },
      "Kitchenette": { x: -5, z: 0 },
      "Living": { x: 0, z: 0 },
    };
  
    for (const roomName in data.room_dimensions) {
      const { length, width } = data.room_dimensions[roomName];
      const { x, z } = roomPositions[roomName];
      createRoom(length, width, x, z);
    }
  
    createDoorWindow(3, 8, 5); 

    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();
  }
