import gsap from "gsap";
import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import atmosphereVertexShader from "./shaders/atmosphereVertex.glsl";
import atmosphereFragmentShader from "./shaders/atmosphereFragment.glsl";
import atmosphereFragmentNightShader from "./shaders/atmosphereFragmentNight.glsl";

const hook = document.getElementsByTagName("earth")[0];
const canvas = document.createElement("canvas");
hook.appendChild(canvas);

const scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  75,
  hook.offsetWidth / hook.offsetHeight,
  0.1,
  1000
);

camera.position.set(0, 7, 10);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: canvas,
});
renderer.setSize(hook.offsetWidth, hook.offsetHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// create a sphere
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(10, 64, 32),
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      globeTexture: {
        value: new THREE.TextureLoader().load(
          toggled ? "./textures/nigthEarth.jpg" : "./textures/earth.jpg"
        ),
      },
    },
  })
);

// create atmosphere
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(8.7, 64, 32), // 8.7
  new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  })
);

atmosphere.scale.set(1.1, 1.1, 1.1);
scene.add(atmosphere);

// create clouds
const clouds = new THREE.Mesh(
  new THREE.SphereGeometry(10.02, 64, 32),
  new THREE.MeshLambertMaterial({
    emissive: 0xffffff,
    transparent: true,
    color: 0xffffff,
    map: new THREE.TextureLoader().load("./textures/clouds.png"),
  })
);

scene.add(clouds);

const group = new THREE.Group();
group.add(sphere);
scene.add(group);

// create stars
const radius = 5;

const r = radius,
  starsGeometry = [new THREE.BufferGeometry(), new THREE.BufferGeometry()];

const vertices1 = [];
const vertices2 = [];

const vertex = new THREE.Vector3();

for (let i = 0; i < 250; i++) {
  vertex.x = Math.random() * 2 - 1;
  vertex.y = Math.random() * 2 - 1;
  vertex.z = Math.random() * 2 - 1;
  vertex.multiplyScalar(r);

  vertices1.push(vertex.x, vertex.y, vertex.z);
}

for (let i = 0; i < 1500; i++) {
  vertex.x = Math.random() * 2 - 1;
  vertex.y = Math.random() * 2 - 1;
  vertex.z = Math.random() * 2 - 1;
  vertex.multiplyScalar(r);

  vertices2.push(vertex.x, vertex.y, vertex.z);
}

starsGeometry[0].setAttribute(
  "position",
  new THREE.Float32BufferAttribute(vertices1, 3)
);
starsGeometry[1].setAttribute(
  "position",
  new THREE.Float32BufferAttribute(vertices2, 3)
);

const starsMaterials = [
  new THREE.PointsMaterial({
    color: 0x555555,
    size: 2,
    sizeAttenuation: false,
  }),
  new THREE.PointsMaterial({
    color: 0x555555,
    size: 1,
    sizeAttenuation: false,
  }),
  new THREE.PointsMaterial({
    color: 0x333333,
    size: 2,
    sizeAttenuation: false,
  }),
  new THREE.PointsMaterial({
    color: 0x3a3a3a,
    size: 1,
    sizeAttenuation: false,
  }),
  new THREE.PointsMaterial({
    color: 0x1a1a1a,
    size: 2,
    sizeAttenuation: false,
  }),
  new THREE.PointsMaterial({
    color: 0x1a1a1a,
    size: 1,
    sizeAttenuation: false,
  }),
];

for (let i = 10; i < 30; i++) {
  const stars = new THREE.Points(starsGeometry[i % 2], starsMaterials[i % 6]);

  stars.rotation.x = Math.random() * 6;
  stars.rotation.y = Math.random() * 6;
  stars.rotation.z = Math.random() * 6;
  stars.scale.setScalar(i * 10);

  stars.matrixAutoUpdate = false;
  stars.updateMatrix();

  scene.add(stars);
}

// camera.position.z = 15;

sphere.rotation.y = -Math.PI / 2;

group.rotation.offset = {
  x: 0,
  y: 0,
};

const mouse = {
  x: undefined,
  y: undefined,
  down: false,
  xPrev: undefined,
  yPrev: undefined,
};

let mode = "white";
function setDarkMode() {
  mode = "dark";
  sphere.material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      globeTexture: {
        value: new THREE.TextureLoader().load("./textures/nigthEarth.jpg"),
      },
    },
  });
  atmosphere.geometry = new THREE.SphereGeometry(8.5, 64, 32);
  atmosphere.material = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentNightShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  });
  const status = document.getElementsByClassName("status")[0];
  status.style.setProperty("--status-color", "rgba(66, 66, 66, 0.86)");
  status.style.color = "#ffffff";
}

function setWhiteMode() {
  mode = "white";
  sphere.material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      globeTexture: {
        value: new THREE.TextureLoader().load("./textures/earth.jpg"),
      },
    },
  });

  atmosphere.geometry = new THREE.SphereGeometry(8.7, 64, 32);
  atmosphere.material = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  });
  const status = document.getElementsByClassName("status")[0];
  status.style.setProperty("--status-color", "rgba(255, 255, 255, 0.86)");
  status.style.color = "#212124";
}

function animate() {
  if (toggled && mode === "white") {
    setDarkMode();
  } else if (!toggled && mode === "dark") {
    setWhiteMode();
  }
  sphere.rotation.x += 0.00005;
  clouds.rotation.x += 0.00008;
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

hook.addEventListener("mousedown", ({ clientX, clientY }) => {
  mouse.down = true;
  mouse.xPrev = clientX;
  mouse.yPrev = clientY;
});

addEventListener("mousemove", (event) => {
  if (innerWidth >= 1280) {
    mouse.x = ((event.clientX - innerWidth / 2) / (innerWidth / 2)) * 2 - 1;
    mouse.y = -(event.clientY / innerHeight) * 2 + 1;
  } else {
    const offset = hook.getBoundingClientRect().top;
    mouse.x = (event.clientX / innerWidth) * 2 - 1;
    mouse.y = -((event.clientY - offset) / innerHeight) * 2 + 1;
  }

  if (mouse.down) {
    event.preventDefault();
    // console.log('turn the earth')
    const deltaX = event.clientX - mouse.xPrev;
    const deltaY = event.clientY - mouse.yPrev;

    group.rotation.offset.x += deltaY * 0.005;
    group.rotation.offset.y += deltaX * 0.005;

    gsap.to(group.rotation, {
      y: group.rotation.offset.y,
      x: group.rotation.offset.x,
      duration: 2,
    });
    mouse.xPrev = event.clientX;
    mouse.yPrev = event.clientY;
  }

  // console.log(mouse)
});

addEventListener("mouseup", (event) => {
  mouse.down = false;
});

addEventListener("resize", () => {
  renderer.setSize(hook.offsetWidth, hook.offsetHeight);
  // camera = new THREE.PerspectiveCamera(
  //   75,
  //   hook.offsetWidth / hook.offsetHeight,
  //   0.1,
  //   1000
  //   );
  camera.aspect = hook.offsetWidth / hook.offsetHeight;
  camera.updateProjectionMatrix();

  // camera.position.z = 8;
});

addEventListener("touchend", (event) => {
  mouse.down = false;
});
