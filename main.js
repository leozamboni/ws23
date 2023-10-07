import gsap from "gsap";
import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import atmosphereVertexShader from "./shaders/atmosphereVertex.glsl";
import atmosphereFragmentShader from "./shaders/atmosphereFragment.glsl";
import atmosphereFragmentNightShader from "./shaders/atmosphereFragmentNight.glsl";

window.onload = function get_body() {
  const body = document.getElementsByTagName("body")[0];
  body.style.filter = "blur(0px)";
};

// load textures
const nigthEarth = new THREE.TextureLoader().load("./textures/nigthEarth.jpg");
const earth = new THREE.TextureLoader().load("./textures/earth.jpg");

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

// create stars
const radius = 5;
const r = radius,
  starsGeometry = [new THREE.BufferGeometry(), new THREE.BufferGeometry()];

const vertices1 = [];
const vertices2 = [];

const vertex = new THREE.Vector3();

for (let i = 0; i < 2000; i++) {
  vertex.x = Math.random() * 2 - 1;
  vertex.y = Math.random() * 2 - 1;
  vertex.z = Math.random() * 2 - 1;
  vertex.multiplyScalar(r);

  vertices1.push(vertex.x, vertex.y, vertex.z);
}

for (let i = 0; i < 2000; i++) {
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

const color = "#757575";
function getRandomColor() {
  var p = 1,
    temp,
    random = Math.random(),
    result = "#";

  while (p < color.length) {
    temp = parseInt(color.slice(p, (p += 2)), 16);
    temp += Math.floor((255 - temp) * random);
    result += temp.toString(16).padStart(2, "0");
  }
  return result;
}

let _stars = [];
for (let i = 10; i < 30; i++) {
  const stars = new THREE.Points(
    starsGeometry[i % 2],
    new THREE.PointsMaterial({
      color: getRandomColor(),
      size: Math.random(),
      sizeAttenuation: false,
    })
  );

  _stars.push(stars);

  stars.rotation.x = Math.random() * 6;
  stars.rotation.y = Math.random() * 6;
  stars.rotation.z = Math.random() * 6;
  stars.scale.setScalar(i * 10);

  stars.matrixAutoUpdate = false;
  stars.updateMatrix();

  scene.add(stars);
}

// create a sphere
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(10, 64, 32),
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      globeTexture: {
        value: toggled ? nigthEarth : earth,
      },
    },
  })
);

// create atmosphere
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(9, 64, 32), // 8.7
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
        value: nigthEarth,
      },
    },
  });
  atmosphere.geometry = new THREE.SphereGeometry(8.7, 64, 32);
  atmosphere.material = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentNightShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  });
}

function setWhiteMode() {
  mode = "white";
  sphere.material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      globeTexture: {
        value: earth,
      },
    },
  });

  atmosphere.geometry = new THREE.SphereGeometry(9, 64, 32);
  atmosphere.material = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  });
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

async function shine_stars() {
  const star = _stars[Math.floor(Math.random() * _stars.length - 1) + 1];
  star.visible = false;
  await new Promise((r) => setTimeout(r, 1000));
  star.visible = true;
  shine_stars();
}
shine_stars();

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
});

addEventListener("mouseup", (event) => {
  mouse.down = false;
});

addEventListener("resize", () => {
  renderer.setSize(hook.offsetWidth, hook.offsetHeight);
  camera.aspect = hook.offsetWidth / hook.offsetHeight;
  camera.updateProjectionMatrix();
});

addEventListener("touchend", (event) => {
  mouse.down = false;
});
