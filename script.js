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

var Bezier = {
  "ease":[.25,.1,.25,1],
  "linear":[0,0,1,1],
  "ease-in":[.42,0,1,1],
  "ease-out":[0,0,.58,1],
  "ease-in-out":[.42,0,.58,1],
  "cameraZoom": [0,.59,0,1]
}
// cubic-bezier(0,.59,0,1)
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

//d888888b  d8b   db  d888888b  d888888b  d888888b    .d8b.    db        d888888b   .d8888.   .d8b.   d888888b  d888888b   .d88b.    d8b   db
//  `88'    888o  88    `88'    `~~88~~'    `88'     d8' `8b   88          `88'     88'  YP  d8' `8b  `~~88~~'    `88'    .8P  Y8.   888o  88
//   88     88V8o 88     88        88        88      88ooo88   88           88      `8bo.    88ooo88     88        88     88    88   88V8o 88
//   88     88 V8o88     88        88        88      88~~~88   88           88        `Y8b.  88~~~88     88        88     88    88   88 V8o88
//  .88.    88  V888    .88.       88       .88.     88   88   88booo.     .88.     db   8D  88   88     88       .88.    `8b  d8'   88  V888
//Y888888P  VP   V8P  Y888888P     YP     Y888888P   YP   YP   Y88888P   Y888888P   `8888Y'  YP   YP     YP     Y888888P   `Y88P'    VP   V8P


var scene, camera, renderer,                                                              // Rendu
textureLoader, audioLoader,                                                               // Loader de texture
textureFlare, noMaterial,                                                                 // Texture
controls, axes,
light, alternateLight, earthlight = [], earthMaterialLight, containerLight, spotLight,    //Gestion des lumières
earthGeo, earthMaterial, earthMesh,                                                       // terre
font, groupTexts = [],                                                                    // textes
raycaster, intersects, mouse, activeMesh,                                                 // evenements
hasTarget = false,
bgMesh, bgGeometry, bgMaterial, earthRotation, skyRotation,                               // Fond étoilé
borderGeo, borderMaterial, meshBorders, meshCoord, pointGeo, pointMaterial, groupMarker,  // points
minRadius, maxRadius, distantCamera, needZoom = true, zoomAnim, start,                    // Zoom
soundVoice, soundVoices = [], soundBg, audioBg, analyser, analysers = [], listener;       // Gestion du son


const CODE_POPIN_OPEN = 1;
const CODE_LEFT_SIDE = 2;
const CODE_RIGHT_SIDE = 3;

//CONFIGURATION
var POINT_SIZE = 0.08;
var EARTH_SIZE = 3;
var DISTANT_CAMERA_NORMAL = 7;
var INITIAL_DISTANT_CAMERA_NORMAL = 1400;
var DURATION_MOVE = 2000;
var TIMING_FUNCTION = "ease-in-out";
var CAMERA_DECAL = .7;
var SUN_DISPLAY = true;
var onClickPoint = CODE_POPIN_OPEN;
earthRotation = false;
skyRotation = true;


//Initialisation
scene = new THREE.Scene();
textureLoader = new THREE.TextureLoader();
renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


// axes = buildAxes( 3000 );

// .o88b.    .d8b.   .88b  d88.   d88888b  d8888b.    .d8b.
// d8P  Y8  d8' `8b  88'YbdP`88   88'      88  `8D   d8' `8b
// 8P       88ooo88  88  88  88   88ooooo  88oobY'   88ooo88
// 8b       88~~~88  88  88  88   88~~~~~  88`8b     88~~~88
// Y8b  d8  88   88  88  88  88   88.      88 `88.   88   88
// `Y88P'   YP   YP  YP  YP  YP   Y88888P  88   YD   YP   YP


camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000 );
camera.position.z = INITIAL_DISTANT_CAMERA_NORMAL;
camera.position.x = 0;
camera.position.y = 0;



//Création du controls de la caméra
controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', render ); // remove when using animation loop
controls.enableZoom = false;
controls.enabled = false;


function calcDistantCamera(){
  var x, y, z, d;
  x = camera.position.x;
  y = camera.position.y;
  z = camera.position.z;
  d = Math.sqrt(Math.pow(y, 2)+Math.pow(x, 2)+Math.pow(z, 2));
  return d;
}


function getCameraCoordGeo(){
  var factYCamera = camera.position.y>0 ? 1 : -1;
  var factXCamera = camera.position.z>0 ? -1 : 1;
  var hyp = Math.sqrt(Math.pow(camera.position.x, 2) + Math.pow(camera.position.z, 2));
  var rep = {};
  rep.lat = toDegre(Math.asin(camera.position.y/DISTANT_CAMERA_NORMAL));
  rep.lon = factXCamera*toDegre(Math.acos(camera.position.x/hyp));
  rep.x = camera.position.x;
  rep.y = camera.position.y;
  rep.z = camera.position.z;
  return rep;
}


// db       db    db  .88b  d88.  d888888b  d88888b  d8888b.   d88888b  .d8888.
// 88       88    88  88'YbdP`88    `88'    88'      88  `8D   88'      88'  YP
// 88       88    88  88  88  88     88     88ooooo  88oobY'   88ooooo  `8bo.
// 88       88    88  88  88  88     88     88~~~~~  88`8b     88~~~~~    `Y8b.
// 88booo.  88b  d88  88  88  88    .88.    88.      88 `88.   88.      db   8D
// Y88888P  ~Y8888P'  YP  YP  YP  Y888888P  Y88888P  88   YD   Y88888P  `8888Y'


//Lumière ambiente
light = new THREE.AmbientLight( 0x404040, 6); // soft white light
scene.add( light );

//Lumière dirigée
spotLight = new THREE.PointLight( 0xffffff, 0);
scene.add(spotLight);


textures = {
  earthnight : textureLoader.load('assets/pictures/earthnight.jpg'),
  earthspec : textureLoader.load('assets/pictures/earthspec1k.jpg'),
  earthlight : textureLoader.load('assets/pictures/lightWhite.png'),
  starfield : textureLoader.load('assets/pictures/starfield.png')
}


//Création de la terre
earthGeo   = new THREE.SphereGeometry(EARTH_SIZE, 32, 32);
earthMaterial  = new THREE.MeshPhongMaterial({
  map: textures.earthnight,
  specularMap: textures.earthspec,
  specular: new THREE.Color('black')
});
earthMesh = new THREE.Mesh(earthGeo, earthMaterial);
scene.add(earthMesh);
camera.lookAt(earthMesh.position)

earthsLight = [];
earthMaterialLight;
noMaterial = new THREE.MeshLambertMaterial({
  transparent: true,
  opacity : 0
});
containerLight = new THREE.Object3D();
scene.add(containerLight);



//Sun with lenphare
if(SUN_DISPLAY){
  addLight( 0.55, 0.9, 0.5, 0, 0, -15 );
}
textureFlare = textureLoader.load( "lib/three.js-master/examples/textures/lensflare2.jpg" );

function addLight( h, s, l, x, y, z ) {
  var light = new THREE.PointLight( 0xffffff, 1.5, 2000 );
  light.color.setHSL( h, s, l );
  light.position.set( x, y, z );
  scene.add( light );
  var flareColor = new THREE.Color( 0xffffff );
  flareColor.setHSL( h, s, l + 0.5 );
  var lensFlare = new THREE.LensFlare( textureFlare, 400, 0.0, THREE.AdditiveBlending, flareColor );

  lensFlare.position.copy( light.position );
  scene.add( lensFlare );
}



// .o88b.    d888888b   d888888b   db    db      db        d888888b  d888b   db   db   d888888b
// d8P  Y8     `88'        88       8b  d8       88          `88'   88  Y8b  88   88      88
// 8P           88         88        8bd8        88           88    88       88ooo88      88
// 8b           88         88         88         88           88    88  ooo  88   88      88
// Y8b  d8     .88.        88         88         88booo.     .88.   88. ~8~  88   88      88
// `Y88P'    Y888888P      YP         YP         Y88888P   Y888888P  Y888P   YP   YP      YP



function genLight(){
  for(i=0; i<50; i++){
    var geoEarthLight = new THREE.SphereGeometry(EARTH_SIZE+i*0.02, 32, 32);
    earthsLight.push(new THREE.Mesh( geoEarthLight, new THREE.MeshLambertMaterial({
      map: textures.earthlight,
      transparent: true,
      opacity: 0
    })));
    containerLight.add(earthsLight[i]);
  }
}

function switchOn(interval){
  for(i=0; i<earthsLight.length; i++){
    (function(){
      var rank = i;
      setTimeout(function(){
        earthsLight[rank].material.opacity = 1;
      }, interval*rank)
    })();
  }
}

function switchOff(interval){
  for(i=0; i<earthsLight.length; i++){
    (function(){
      var rank = i;
      setTimeout(function(){
        earthsLight[rank].material.opacity = 0;
      }, interval*rank)
    })();
  }
}


function alternSwitch(){
  var isOn = false;
  alternateLight = setInterval(function(){
    if(isOn){
      switchOff(100);
    } else {
      switchOn(100);
    }
    isOn = isOn ? false : true;
  }, 100*earthsLight.length-1000)
}



// .d8b.    d88888b  d88888b  d888888b    .o88b.   db   db   .d8b.     d888b    d88888b      d8888b.    .d88b.   d888888b  d8b   db   d888888b
//d8' `8b   88'      88'        `88'     d8P  Y8   88   88  d8' `8b   88' Y8b   88'          88  `8D   .8P  Y8.    `88'    888o  88   `~~88~~'
//88ooo88   88ooo    88ooo       88      8P        88ooo88  88ooo88   88        88ooooo      88oodD'   88    88     88     88V8o 88      88
//88~~~88   88~~~    88~~~       88      8b        88~~~88  88~~~88   88  ooo   88~~~~~      88~~~     88    88     88     88 V8o88      88
//88   88   88       88         .88.     Y8b  d8   88   88  88   88   88. ~8~   88.          88        `8b  d8'    .88.    88  V888      88
//YP   YP   YP       YP       Y888888P    `Y88P'   YP   YP  YP   YP    Y888P    Y88888P      88         `Y88P'   Y888888P  VP   V8P      YP


//Affichage des points
meshBorders = [];
borderGeo = new THREE.RingGeometry( 0.12, 0.13, 32);
borderMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
pointGeo = new THREE.CircleGeometry( POINT_SIZE, 32);
pointMaterial  = new THREE.MeshBasicMaterial( { color: 0xffffff,side: THREE.DoubleSide } );
groupMarker = new THREE.Group();
for(i=0; i<coord.length; i++){
  meshBorders.push(new THREE.Mesh(pointGeo, pointMaterial));
  meshCoord = convertGeoCoord(coord[i], 3);
  meshBorders[i].position.set(meshCoord[0], meshCoord[1], meshCoord[2]);
  meshBorders[i].lookAt(new THREE.Vector3(0, 0, 0));
  meshBorders[i].add(new THREE.Mesh( borderGeo, borderMaterial ));
  meshBorders[i].rank = i;
  groupMarker.add(meshBorders[i])

}
earthMesh.add(groupMarker);



//  d88888b  .d88b.   d8b   db  d888888b
//  88'     .8P  Y8.  888o  88  `~~88~~'
//  88ooo   88    88  88V8o 88     88
//  88~~~   88    88  88 V8o88     88
//  88      `8b  d8'  88  V888     88
//  YP       `Y88P'   VP   V8P     YP

function loadFont() {
  var loader = new THREE.FontLoader();
  loader.load( 'assets/Roboto/Roboto_Regular.json', function ( response ) {
    font = response;
    createTexts();
  });
}


function createTexts(){
  for(i=0; i<meshBorders.length; i++){
    manageTitleCity(meshBorders[i], coord[i].content.name)
  }
}

function manageTitleCity(marker, title){
  if(marker != null){
    var position = marker.position;
    var material = material = new THREE.MultiMaterial( [
      new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // front
			new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // side
		]);
    var textGeo = new THREE.TextGeometry( title.toUpperCase(), {
      font: font,
      size: .07,
      height: .01,
      material: 0,
      extrudeMaterial: 1
    });

    cityMarker = new THREE.Mesh( textGeo, material );
    var center = cityMarker.geometry.center();
    cityMarker.geometry.translate(center.x/2, center.y/2, center.z/2 );
    cityMarker.position.set(position.x*1.1, position.y*1.1, position.z*1.1)

    groupTexts.push(cityMarker);
    earthMesh.add(cityMarker);
    cityMarker.lookAt(camera.position)

  }
}

loadFont();



// d88888b   db    db   d88888b  d8b   db  d88888b  .88b  d88.   d88888b   d8b   db  d888888b  .d8888.
// 88'       88    88   88'      888o  88  88'      88'YbdP`88   88'       888o  88  `~~88~~'  88'  YP
// 88ooooo   Y8    8P   88ooooo  88V8o 88  88ooooo  88  88  88   88ooooo   88V8o 88     88     `8bo.
// 88~~~~~   `8b  d8'   88~~~~~  88 V8o88  88~~~~~  88  88  88   88~~~~~   88 V8o88     88       `Y8b.
// 88.        `8bd8'    88.      88  V888  88.      88  88  88   88.       88  V888     88     db   8D
// Y88888P      YP      Y88888P  VP   V8P  Y88888P  YP  YP  YP   Y88888P   VP   V8P     YP     `8888Y'


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
  var intersects = raycaster.intersectObjects( groupMarker.children );
  if(recenter.isNeed){
    var anim = Bezier[TIMING_FUNCTION];
    recenter.init(BezierEasing(anim[0], anim[1], anim[2], anim[3]));
    if(intersects.length > 0){
      recenter.callBack.exec = moveTo;
      recenter.callBack.params.push(coord[intersects[0].object.rank], DURATION_MOVE, TIMING_FUNCTION);
    }
  } else if ( intersects.length > 0) {
    moveTo(coord[intersects[0].object.rank], DURATION_MOVE, TIMING_FUNCTION, intersects[0].object.rank);
  }
  if(OnoHystoryPopin.isDisplay()){
    switchOff(30);
    clearInterval(alternateLight);
    OnoHystoryPopin.hide();
    soundVoice.stop();
    analyser = null;
    soundVoice = null;
  }
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize, false );
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );


//Gestion du fond étoilé
bgGeometry  = new THREE.SphereGeometry(50, 32, 32);
bgMaterial  = new THREE.MeshBasicMaterial({
  map: textures.starfield,
  side: THREE.BackSide
});
bgMesh  = new THREE.Mesh(bgGeometry, bgMaterial);
scene.add(bgMesh);


// .o88b.     .d8b.    .88b  d88.  d88888b   d8888b.    .d8b.       .88b  d88.    .d88b.   db    db  d88888b
// d8P  Y8   d8' `8b   88'YbdP`88  88'       88  `8D   d8' `8b      88'YbdP`88   .8P  Y8.  88    88  88'
// 8P        88ooo88   88  88  88  88ooooo   88oobY'   88ooo88      88  88  88   88    88  Y8    8P  88ooooo
// 8b        88~~~88   88  88  88  88~~~~~   88`8b     88~~~88      88  88  88   88    88  `8b  d8'  88~~~~~
// Y8b  d8   88   88   88  88  88  88.       88 `88.   88   88      88  88  88   `8b  d8'   `8bd8'   88.
// `Y88P'    YP   YP   YP  YP  YP  Y88888P   88   YD   YP   YP      YP  YP  YP    `Y88P'      YP     Y88888P


//Enclenche le déplacement vers un point en définissant une cible et une action quand le déplacement sera terminé
function moveTo(coord, duration, animation, rank){
  var anim = Bezier[animation];
  hasTarget = true;
  soundVoice = soundVoices[rank]
  analyser = analysers[rank]
  target = {
    rank : rank,
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
  switch (onClickPoint) {
    case CODE_LEFT_SIDE:
      target.distance.lon = rotation - target.origin.lon + 20;
      target.distance.lat = 0 - target.origin.lat;
      target.cameraDecal = CAMERA_DECAL;
      onClickPoint = CODE_RIGHT_SIDE;
      break;
    case CODE_RIGHT_SIDE:
      target.distance.lon = rotation - target.origin.lon - 20;
      target.distance.lat = 0 - target.origin.lat;
      target.cameraDecal = -CAMERA_DECAL;
      onClickPoint = CODE_LEFT_SIDE;
      break;
    case CODE_POPIN_OPEN:
      target.distance.lon = rotation - target.origin.lon;
      target.distance.lat = coord.lat - target.origin.lat;
      break;
    default:

  }
  console.log("Camera init : ", camera.rotation.y);

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
      if(onClickPoint === CODE_POPIN_OPEN){
        OnoHystoryPopin.display();
        setTimeout(function(){
          // alternSwitch();
          soundVoice.play();
        }, 400)
      } else {
        recenter.isNeed = true;
        recenter.decal = -1*target.cameraDecal;
        controls.enabled = false;
      }
    } else {
      //Sinon on met à jour la position de la caméra
      var tmpCoord = convertGeoCoord({
        lat:avancement*target.distance.lat+target.origin.lat,
        lon:avancement*target.distance.lon+target.origin.lon
      }, DISTANT_CAMERA_NORMAL);
      camera.position.set(tmpCoord[0], tmpCoord[1], tmpCoord[2]);
      camera.lookAt(earthMesh.position);
      if(target.cameraDecal){
        camera.rotation.y+= avancement*target.cameraDecal;
      }
    }
  }
}

var recenter = {
  callBack : {params:[]},
  approach:function(){
    this.current = new Date().getTime();
    var t = this.current - this.start;
    avancement = this.ease(t/DURATION_MOVE);
    console.log(avancement);

    if(this.decal){
      camera.rotation.y = this.initialRotate+avancement*this.decal;
    }
    //Quand l'avancement est complet, on réactive le control
    if(t/DURATION_MOVE>=1){
      controls.enabled = true;
      this.isMoving = false;
      if(this.callBack.exec != null){
        this.callBack.exec(this.callBack.params[0], this.callBack.params[1], this.callBack.params[2])
        this.callBack.exec = null;
        this.callBack.params= [];
      }
    }
  },
  init:function(ease) {
    this.start = new Date().getTime();
    this.isMoving = true;
    this.ease = ease;
    this.isNeed = false;
    this.initialRotate = camera.rotation.y;
  }
}

// d88888D   .d88b.    .d88b.   .88b  d88.
// YP  d8'  .8P  Y8.  .8P  Y8.  88'YbdP`88
//    d8'   88    88  88    88  88  88  88
//   d8'    88    88  88    88  88  88  88
//  d8' db  `8b  d8'  `8b  d8'  88  88  88
// d88888P   `Y88P'    `Y88P'   YP  YP  YP


zoomAnim = BezierEasing(Bezier["cameraZoom"][0], Bezier["cameraZoom"][1], Bezier["cameraZoom"][2], Bezier["cameraZoom"][3]);
start = null;
function zoom(){
  var d = new Date().getTime();
  var t = zoomAnim((d - start)/4000);
  var diff = INITIAL_DISTANT_CAMERA_NORMAL - DISTANT_CAMERA_NORMAL;
  camera.position.z = INITIAL_DISTANT_CAMERA_NORMAL - t*diff;

  if(d-start >= 4000){
    controls.enabled = true;
    needZoom = false;
  }
}


// .d8b.     db    db  d8888b.   d888888b   .d88b.
// d8' `8b   88    88  88  `8D     `88'    .8P  Y8.
// 88ooo88   88    88  88   88      88     88    88
// 88~~~88   88    88  88   88      88     88    88
// 88   88   88b  d88  88  .8D     .88.    `8b  d8'
// YP   YP    ~Y8888P'  Y8888D'   Y888888P   `Y88P'


//Create an AudioListener and add it to the camera
listener = new THREE.AudioListener();
camera.add( listener );

// create an Audio source
soundBg = new THREE.Audio( listener );
audioBg = new THREE.AudioLoader();

//Load a soundBg and set it as the Audio object's buffer
audioBg.load( 'assets/audio/ambient.wav', function( buffer ) {
	soundBg.setBuffer( buffer );
	soundBg.setLoop(true);
	soundBg.setVolume(0.2);
	soundBg.play();
});


audioLoader = new THREE.AudioLoader();
for(i=0; i<coord.length; i++){
  soundVoices.push(new THREE.Audio( listener ));
  analysers.push(new THREE.AudioAnalyser( soundVoices[i], 128 ));
  (function(){
    var r = i;
    if(coord[r].content.voice){
      audioLoader.load( 'assets/audio/'+coord[r].content.voice.fileName, function( buffer ) {
        soundVoices[r].setBuffer( buffer );
        soundVoices[r].setLoop(false);
        soundVoices[r].setVolume(3);
      });
      soundVoices[r].onEnded = function() {
        this.stop();
        analyser.fftSize = 0
      }
    }
  })();
}





//Create an AudioAnalyser, passing in the soundBg and desired fftSize
analyser = analysers[0];

//Get the average frequency of the sound
function initSoundAnalyse() {
  var canvas = document.getElementById("soundCanvas");
  canvas.style.opacity = 0.7;
  var dataLine = canvas.getContext("2d");
  var time = 0;
  var color = "#ffffff";
  var factor;
  setInterval(function(){
    if(analyser){
      time = time + 0.1
      dataLine.clearRect(0, 0, canvas.width, canvas.height);
      dataLine.beginPath();
      if(soundVoice && soundVoice.isPlaying) {
        factor = (analyser.getAverageFrequency()-7)
      } else {
        factor = 0;
      }
      var nextFactor;
      var midWidth = Math.floor(canvas.width/2);
      for(cnt = 0; cnt <= canvas.width; cnt++) {
        nextFactor = cnt<=midWidth ? cnt/midWidth : 1-(cnt-midWidth)/midWidth;
        dataLine.lineTo(cnt, canvas.height * 0.5 - (2 + Math.cos(time + cnt * 0.05) *(factor*nextFactor*0.7)));
      }
      dataLine.lineWidth = 2-1/(analyser.getAverageFrequency()/3);
      dataLine.strokeStyle = color;
      dataLine.stroke();

      dataLine.beginPath();
      for(cnt = -1; cnt <= canvas.width; cnt++) {
        nextFactor = cnt<=midWidth ? cnt/midWidth : 1-(cnt-midWidth)/midWidth;
        dataLine.lineTo(cnt, canvas.height * 0.5 - (2 + Math.cos(time + cnt * 0.05) * (factor*nextFactor*0.6)));
      }
      dataLine.lineWidth = 1*(2-1/analyser.getAverageFrequency());
      dataLine.strokeStyle = color;
      dataLine.stroke();
    }
  }, 10);
}

initSoundAnalyse();

// d8888b.  d88888b  d8b   db   d8888b.  d88888b   d8888b.
// 88  `8D  88'      888o  88   88  `8D  88'       88  `8D
// 88oobY'  88ooooo  88V8o 88   88   88  88ooooo   88oobY'
// 88`8b    88~~~~~  88 V8o88   88   88  88~~~~~   88`8b
// 88 `88.  88.      88  V888   88  .8D  88.       88 `88.
// 88   YD  Y88888P  VP   V8P   Y8888D'  Y88888P   88   YD



var render = function () {
    requestAnimationFrame(render);
    // console.log(camera.position);
    if(skyRotation){
      bgMesh.rotation.y -= 0.0002;
    }

    if(needZoom){
      if(start===null){
        start = new Date().getTime();
      }
      zoom();
    }

    for(i=0; i<groupTexts.length; i++){
      groupTexts[i].lookAt(camera.position);
    }

    if(!hasTarget || recenter.isMoving){
      if(earthRotation){
        earthMesh.rotation.y += 0.001;
      }
      if(recenter.isMoving){
        recenter.approach();
      }
    } else {
      //Si on est en train de recentrer
      approachTarget();
    }

    raycaster.setFromCamera( mouse, camera );

    //Lumière sur la terre
    intersectsEarth = raycaster.intersectObject(groupMarker);
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


window.onload = function(){
  setTimeout(function(){
    OnoHystoryPopin.init();
    genLight();
    render();
    OnoHystoryLoader.loadCallBack();
  }, 2000)
}

//https://github.com/mrdoob/three.js/blob/master/examples/webgl_interactive_points.html
