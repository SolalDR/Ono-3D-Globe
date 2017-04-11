
function loadFont() {
  var loader = new THREE.FontLoader();
  loader.load( 'fonts/' + fontName + '_' + fontWeight + '.typeface.json', function ( response ) {
    font = response;
    refreshText();
  });
}

var test = true;
function manageTitleCity(marker){
  console.log(marker);
  if(marker != null){
    var position = marker.object.position;
    // cityMarker = new THREE.TextGeometry( coord[marker.object.rank].content.name, {
    //   size: 2
    // } );
    var material = material = new THREE.MultiMaterial( [
      new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // front
			new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // side
		]);
    var textGeo = new THREE.TextGeometry( "ONO", {
      font: font,
      size: 1,
      height: 1,
      material: 0,
      extrudeMaterial: 1
    });

    if(test){
      cityMarker = new THREE.Mesh( textGeo, material );
      cityMarker.position = {
        x : position.x*1.5,
        y : position.y*1.5,
        z : position.z*1.5
      }
      earthMesh.add(cityMarker);
      test = false;
    }
    cityMarker.lookAt(camera.position)

  }
}
function loadFont() {
  var loader = new THREE.FontLoader();
  loader.load( 'assets/Roboto/Roboto_Regular.json', function ( response ) {
    font = response;
  } );
}
loadFont();



function render(){
  intersectMarker = raycaster.intersectObjects(earthMesh.children);
  if(intersectMarker.length > 0) {
    var marker = intersectMarker[0];
    manageTitleCity(marker);
  } else {
    manageTitleCity(null);
  }
}
