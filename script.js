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
  return Math.PI * (deg) / 180;
}

function toDegre(rad){
  return rad*180/Math.PI;
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

var Bezier = {
  "ease":[.25,.1,.25,1],
  "linear":[0,0,1,1],
  "ease-in":[.42,0,1,1],
  "ease-out":[0,0,.58,1],
  "ease-in-out":[.42,0,.58,1]
}

function convertGeoCoord(coord, r){
  var lat, lon, xFact, yFact, y, x, z;
  lat = coord.lat;
  lon = coord.lon;

  xFact = lon>=-90 || lon<=90 ? 1 : -1;
  yFact = lat>=0 ? 1 : -1;
  zFact = lon>0 ? -1 : 1;

  y = Math.sin(toRadian(Math.abs(lat)))*r*yFact;
  newRr = Math.sqrt(Math.pow(r, 2) - Math.pow(y, 2));
  x = Math.cos(toRadian(Math.abs(lon)))*newRr*xFact;
  z = Math.sqrt(Math.pow(newRr, 2) - Math.pow(x, 2))*zFact;
  return [x, y, z];
}


var scene, camera, renderer,
controls, light, axes,
earthGeo, earthMaterial, earthMesh,
raycaster, intersects, mouse, activeMesh,
hasTarget = false,
bgMesh, bgGeometry, bgMaterial, earthRotation, skyRotation,
meshBorders, borderGeo, borderMaterial,
meshCoord, pointGeo, pointMaterial,
minRadius, maxRadius;


//CONFIGURATION
var POINT_SIZE = 0.08;
var EARTH_SIZE = 3;
var DISTANT_CAMERA = 7;
var DURATION_MOVE = 500;
var TIMING_FUNCTION = "ease-in-out";
earthRotation = false;
skyRotation = true;


//Initialisation
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = DISTANT_CAMERA;
renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


//Création du controls de la caméra
controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', render ); // remove when using animation loop
controls.enableZoom = true;

//Affichage des axes orthonormé
// axes = buildAxes( 3000 );

//Lumière ambiente
light = new THREE.AmbientLight( 0x404040, 6); // soft white light
scene.add( light );

//Lumière dirigée
var spotLight = new THREE.PointLight( 0xffffff, 0);
scene.add(spotLight);

//Création de la terre
earthGeo   = new THREE.SphereGeometry(EARTH_SIZE, 32, 32);
earthMaterial  = new THREE.MeshPhongMaterial({
  map: THREE.ImageUtils.loadTexture('assets/earthnight.jpg'),
  specularMap: THREE.ImageUtils.loadTexture('assets/earthspec1k.jpg'),
  specular: new THREE.Color('black')
});
earthMesh = new THREE.Mesh(earthGeo, earthMaterial);
scene.add(earthMesh);
camera.lookAt(earthMesh.position)

//Affichage des points
meshBorders = [];
borderGeo = new THREE.RingGeometry( 0.12, 0.13, 32);
borderMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
pointGeo = new THREE.CircleGeometry( POINT_SIZE, 32);
pointMaterial  = new THREE.MeshBasicMaterial( { color: 0xffffff,side: THREE.DoubleSide } );
for(i=0; i<coord.length; i++){
  meshBorders.push(new THREE.Mesh(pointGeo, pointMaterial));
  meshCoord = convertGeoCoord(coord[i], 3);
  meshBorders[i].position.set(meshCoord[0], meshCoord[1], meshCoord[2]);
  meshBorders[i].lookAt(new THREE.Vector3(0, 0, 0));
  meshBorders[i].add(new THREE.Mesh( borderGeo, borderMaterial ));
  meshBorders[i].rank = i;
  earthMesh.add(meshBorders[i]);
}
earthMesh.add(axes);

//Gestion des évenements
raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();
function onDocumentMouseMove( event ) {
	event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onDocumentMouseDown( event ) {
  event.preventDefault();
  var intersects = raycaster.intersectObjects( earthMesh.children );
  if ( intersects.length > 0) {
    moveTo(coord[intersects[0].object.rank], DURATION_MOVE, TIMING_FUNCTION);
  }
}
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );


//Gestion du fond étoilé
bgGeometry  = new THREE.SphereGeometry(50, 32, 32);
bgMaterial  = new THREE.MeshBasicMaterial({
  map: THREE.ImageUtils.loadTexture('assets/starfield.png'),
  side: THREE.BackSide
});
bgMesh  = new THREE.Mesh(bgGeometry, bgMaterial);
scene.add(bgMesh);


function getCameraCoordGeo(){
  var factYCamera = camera.position.y>0 ? 1 : -1;
  var factXCamera = camera.position.z>0 ? -1 : 1;
  var hyp = Math.sqrt(Math.pow(camera.position.x, 2) + Math.pow(camera.position.z, 2));
  var rep = {};
  rep.lat = toDegre(Math.asin(camera.position.y/DISTANT_CAMERA));
  rep.lon = factXCamera*toDegre(Math.acos(camera.position.x/hyp));
  rep.x = camera.position.x;
  rep.y = camera.position.y;
  rep.z = camera.position.z;
  return rep;
}

//Enclenche le déplacement vers un point
function moveTo(coord, duration, animation){
  var anim = Bezier[animation];
  hasTarget = true;
  target = {
    startMove : new Date().getTime(),
    targetCoord : coord,
    duration: duration,
    easing : BezierEasing(anim[0], anim[1], anim[2], anim[3]),
    origin : {},
    actual: {},
    distance: {}
  };
  target.origin = getCameraCoordGeo();
  var rotation = toDegre(earthMesh.rotation.y) + coord.lon;
  target.distance.lon = rotation - target.origin.lon;
  target.distance.lat = coord.lat - target.origin.lat;
}

//Si une direction est établie, on s'en rapproche
function approachTarget(){
  if(hasTarget != false){
    target.actual = getCameraCoordGeo(); //Coordonné à l'instant t de la caméra
    var t = new Date().getTime() - target.startMove; //Durée passé depuis le début de l'anim
    avancement = target.easing(t/target.duration); //Pourcentage de l'anim en fonction de bézier
    // Si l'animation est terminé, on supprime la cible
    if(t/target.duration>=1){
      hasTarget = false;
    } else {
      //Sinon on met à jour la position de la caméra
      var tmpCoord = convertGeoCoord({
        lat:avancement*target.distance.lat+target.origin.lat,
        lon:avancement*target.distance.lon+target.origin.lon
      }, DISTANT_CAMERA);
      camera.position.set(tmpCoord[0], tmpCoord[1], tmpCoord[2]);
      camera.lookAt(earthMesh.position);
    }
  }
}


var render = function () {
    requestAnimationFrame(render);

    if(skyRotation){
      bgMesh.rotation.y -= 0.0002;
    }
    if(!hasTarget){
      if(earthRotation){
        earthMesh.rotation.y += 0.001;
      }
    } else {
      approachTarget();
    }

    raycaster.setFromCamera( mouse, camera );

    //Lumière sur la terre
    intersectsEarth = raycaster.intersectObject(earthMesh);
    if ( intersectsEarth.length > 0 ) {
      spotLight.position.copy( intersectsEarth[0].point );
      spotLight.position.x *= 1.1;
      spotLight.position.y *= 1.1;
      spotLight.position.z *= 1.1;
      spotLight.intensity = 4;
      spotLight.lookAt(earthMesh.position);
		} else {
      spotLight.intensity = 0;
		}

    for(i=0; i<meshBorders.length;i++){
      minRadius = .01 + Math.sin(new Date().getTime() * .0015+i);
      maxRadius = .02 + Math.sin(new Date().getTime() * .0015+i);
      meshBorders[i].children[0].scale.set(minRadius, maxRadius, 32);
    }
    renderer.render(scene, camera);
};


render();

//https://github.com/mrdoob/three.js/blob/master/examples/webgl_interactive_points.html
