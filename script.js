function toRadian(deg){
  return Math.PI * (deg) / 180
}


function convertGeoCoord(coord, r){
  var lat = coord.lat;
  var lon = coord.lon;

  if(lon<0){ lon += 360; }
  if(lat<0){ lat += 360; }
  console.log("Coordonnées géographique : ", lat, lon);

  var y = Math.sin(toRadian(lat))*r;
  if(lon<90 || lon>270){
    xFact = 1;
  } else {
    xFact = -1;
  }
  if(lon>180){
    lon = 360 - lon;
  }
  console.log(lon);
  var x = Math.cos(toRadian(lon))*r;
  // var x = Math.sqrt(Math.pow(r, 2) - Math.pow(y, 2))*xFact;
  var z = Math.sqrt(Math.abs(Math.pow(r, 2) - Math.pow(x, 2) - Math.pow(y, 2)));

  return [x, y, z];
}


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 10;

//scene.background = new THREE.Color( 0x404f71);

var coord = [
  {
    lat:51.5085300,
    lon: -0.1257400
  },
  {
    lat:40.7142700,
    lon: -74.0059700
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

//my point's border
var border = new THREE.RingGeometry( 0.09, 0.1, 32);
var materialBorder = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
var meshBorder = new THREE.Mesh( border, materialBorder );
var meshCoord = convertGeoCoord(coord[1], 3);

meshBorder.position.set(meshCoord[0], meshCoord[1], meshCoord[2]);
meshBorder.lookAt(new THREE.Vector3(0, 0, 0));

earthMesh.add(meshBorder);

//my point
var point = new THREE.CircleGeometry( 0.05, 32);
var materialPoint  = new THREE.MeshBasicMaterial( { color: 0xffffff,side: THREE.DoubleSide } );
var pointMesh = new THREE.Mesh(point, materialPoint);
meshBorder.add(pointMesh);

//add event on pointMesh
var raycaster, intersects;
var mouse, INTERSECTED;
var POINTMESH_SIZE = 0.2;


raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();
intersects = raycaster.intersectObject( pointMesh );
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
    bgMesh.rotation.y -= 0.0002;

    //set up the interaction with pointMesh
    raycaster.setFromCamera( mouse, camera );
    pointMesh.scale.set(1,1,1);

    if ( intersects.length > 0 ) {
        pointMesh.scale.set(2,2,2);
		} else {
      pointMesh.scale.set(1,1,1);
		}

    var minRadius = 0.001 + Math.sin(new Date().getTime() * .0025);
    var maxRadius = 0.002 + Math.sin(new Date().getTime() * .0025);
    meshBorder.scale.set(minRadius, maxRadius, 32);
    renderer.render(scene, camera);
};


render();

//https://github.com/mrdoob/three.js/blob/master/examples/webgl_interactive_points.html
