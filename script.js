function buildAxis( src, dst, colorHex, dashed ) {
  var geom = new THREE.Geometry(), mat;
  if(dashed) {
    mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
  } else {
    mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
  }
  geom.vertices.push( src.clone() );
  geom.vertices.push( dst.clone() );
  geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines
  var axis = new THREE.Line( geom, mat, THREE.LinePieces );
  return axis;
}
function buildAxes( length ) {
  var axes = new THREE.Object3D();
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z
  return axes;
}

//Convertit les degré en radian
function toRadian(deg){
  return Math.PI * (deg) / 180
}

var coord = [
  {
    name: "London",
    lat: 51.5085,
    lon: -0.1257
  },
  {
    name: "New York",
    lat:40.7142700,
    lon: -74.0059700
  },
  {
    name: "Brasilia",
    lat: -15.7797200,
    lon: -47.9297200
  },
  {
    name: "Le Caire",
    lat: 30.0626300,
    lon: 31.2496700
  },
  {
    name: "Melbourne",
    lat: -37.8140000,
    lon: 144.9633200
  },
  {
    name: "Manchester",
    lat: 53.4809,
    lon: -2.2374
  },
  {
    name: "Tokyo",
    lat: 35.6895000,
    lon: 139.6917100
  }
];

function convertGeoCoord(coord, r){
  var lat, lon, xFact, yFact, y, x, z;
  lat = coord.lat;
  lon = coord.lon;

  xFact = lon>-90 || lon<90 ? 1 : -1;
  yFact = lat>0 ? 1 : -1;
  zFact = lon>0 ? -1 : 1;

  y = Math.sin(toRadian(Math.abs(lat)))*r*yFact;
  x = Math.cos(toRadian(Math.abs(lon)))*r*xFact;
  z = Math.sqrt(Math.abs(Math.pow(r, 2) - Math.pow(x, 2) - Math.pow(y, 2)))*zFact;
  return [x, y, z];
}


//Initialisation
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 10;
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var controls, light, axes,
earthGeo, earthMaterial, earthMesh,
raycaster, intersects, mouse, activeMesh,
bgMesh, bgGeometry, bgMaterial,
meshBorders, borderGeo, borderMaterial,
meshCoord, pointGeo, pointMaterial,
minRadius, maxRadius;

const POINTMESH_SIZE = 0.2;

//Création du controls de la caméra
controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', render ); // remove when using animation loop
controls.enableZoom = true;

//Affichage des axes orthonormé
axes = buildAxes( 1000 );

//Lumière ambiente
light = new THREE.AmbientLight( 0x404040, 5); // soft white light
scene.add( light );

//Création de la terre
earthGeo   = new THREE.SphereGeometry(3, 32, 32);
earthMaterial  = new THREE.MeshPhongMaterial({
  map: THREE.ImageUtils.loadTexture('assets/earthnight.jpg'),
  bumpMap: THREE.ImageUtils.loadTexture('assets/earthbump1k.jpg'),
  bumpScale : 0.05,
  specularMap: THREE.ImageUtils.loadTexture('assets/earthspec1k.jpg'),
  specular: new THREE.Color('grey')
});
earthMesh = new THREE.Mesh(earthGeo, earthMaterial);
scene.add(earthMesh);
camera.lookAt(earthMesh.position)

//Affichage des pointMesh
meshBorders = [];
borderGeo = new THREE.RingGeometry( 0.09, 0.1, 32);
borderMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
pointGeo = new THREE.CircleGeometry( 0.05, 32);
pointMaterial  = new THREE.MeshBasicMaterial( { color: 0xffffff,side: THREE.DoubleSide } );
for(i=0; i<coord.length; i++){
  meshBorders.push(new THREE.Mesh( borderGeo, borderMaterial ));
  meshCoord = convertGeoCoord(coord[i], 3);
  meshBorders[i].position.set(meshCoord[0], meshCoord[1], meshCoord[2]);
  meshBorders[i].lookAt(new THREE.Vector3(0, 0, 0));
  meshBorders[i].add(new THREE.Mesh(pointGeo, pointMaterial));
  earthMesh.add(meshBorders[i]);
}
earthMesh.add(axes);

//Gestion de l'évenement
raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();
intersects = raycaster.intersectObjects( earthMesh.children );
function onDocumentMouseMove( event ) {
	event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
document.addEventListener( 'mousemove', onDocumentMouseMove, false );


//Gestion du fond étoilé
bgGeometry  = new THREE.SphereGeometry(50, 32, 32);
bgMaterial  = new THREE.MeshBasicMaterial({
  map: THREE.ImageUtils.loadTexture('assets/starfield.png'),
  side: THREE.BackSide
});
bgMesh  = new THREE.Mesh(bgGeometry, bgMaterial);
scene.add(bgMesh);


var render = function () {
    requestAnimationFrame(render);

    earthMesh.rotation.y += 0.001;
    bgMesh.rotation.y -= 0.0002;

    raycaster.setFromCamera( mouse, camera );
    if ( intersects.length > 0 ) {
      alert("Bonjour");
      intersects[0].scale.set(2,2,2);
      activeMesh = intersects[0];
		} else {
      if(activeMesh != null){
        activeMesh.scale.set(1,1,1);
      }
      activeMesh = null;
		}

    for(i=0; i<meshBorders.length;i++){
      minRadius = 0.001 + Math.sin(new Date().getTime() * .0025+i);
      maxRadius = 0.002 + Math.sin(new Date().getTime() * .0025+i);
      meshBorders[i].scale.set(minRadius, maxRadius, 32);
    }
    renderer.render(scene, camera);
};


render();

//https://github.com/mrdoob/three.js/blob/master/examples/webgl_interactive_points.html
