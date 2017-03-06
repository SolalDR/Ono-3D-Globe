var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 10;

//scene.background = new THREE.Color( 0x404f71);

var coord = [
  {
    lat:51.5085300,
    lon: -0.1257400
  }
];


var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', render ); // remove when using animation loop
controls.enableZoom = true;
console.log(controls);

var light = new THREE.AmbientLight( 0x404040, 5); // soft white light
scene.add( light );

var geometry   = new THREE.SphereGeometry(3, 32, 32);
var material  = new THREE.MeshPhongMaterial();

material.map = THREE.ImageUtils.loadTexture('assets/earthnight.jpg')
material.bumpMap = THREE.ImageUtils.loadTexture('assets/earthbump1k.jpg')
material.bumpScale = 0.05
material.specularMap = THREE.ImageUtils.loadTexture('assets/earthspec1k.jpg')
material.specular  = new THREE.Color('grey')
// var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

var earthMesh = new THREE.Mesh(geometry, material);
scene.add(earthMesh);

var point   = new THREE.SphereGeometry(.1, 32, 32);
var materialPoint  = new THREE.MeshPhongMaterial();
var pointMesh = new THREE.Mesh(point, materialPoint);
pointMesh.position.x = 2.1;
pointMesh.position.y = 2.1;
earthMesh.add(pointMesh);

//add event on pointMesh
var raycaster, intersects;
var mouse, INTERSECTED;
var POINTMESH_SIZE = 0.2;

raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();

function onDocumentMouseMove( event ) {
				event.preventDefault();
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

document.addEventListener( 'mousemove', onDocumentMouseMove, false );
// create the geometry sphere
var bgGeometry  = new THREE.SphereGeometry(50, 32, 32);
// create the material, using a texture of startfield
var bgMaterial  = new THREE.MeshBasicMaterial();
bgMaterial.map   = THREE.ImageUtils.loadTexture('assets/starfield.png');
bgMaterial.side  = THREE.BackSide;
// create the mesh based on geometry and material
var bgMesh  = new THREE.Mesh(bgGeometry, bgMaterial);
scene.add(bgMesh);

camera.lookAt(earthMesh.position)

var render = function () {
    requestAnimationFrame(render);

    earthMesh.rotation.y += 0.001;
    bgMesh.rotation.y += 0.001;

    //set up the interaction with pointMesh
    raycaster.setFromCamera( mouse, camera );
		intersects = raycaster.intersectObject( pointMesh );
    pointMesh.scale.set(1,1,1);

    if ( intersects.length > 0 ) {
        pointMesh.scale.set(2,2,2);
		} else {
      pointMesh.scale.set(1,1,1);
		}


    renderer.render(scene, camera);
};


render();

//https://github.com/mrdoob/three.js/blob/master/examples/webgl_interactive_points.html
