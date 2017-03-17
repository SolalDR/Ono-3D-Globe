
THREE.ControlPanel = function(config){
  this.scene = config.scene;
  this.els = [];
  this.panel= {
    categories : [
      {
        name: "Camera",
        herited : ["Camera", "OrthographicCamera", "PerspectiveCamera"]
      },
      {
        name: "Object3D",
        herited : ["Camera", "CubeCamera", ]
      },
      {
        name: "Object3D",
      },
      {
        name: "Object3D",
      },
      {
        name: "Object3D",
      },
    ];
  };
}

THREE.ControlPanel.prototype.genHtml = function(){
  var body = document.getElementsByTagName("body")[0];
  this.panel.el = document.createElement("div");
  this.panel.el.id = "controlPanel-THREE-JS"
  body.appendChild(this.panel.el);

  this.panel.el.innerHTML = "<p class=\"title\">Panneau de contrôle</p><div id=\"controlContainer-THREE-JS\"></div>"
  this.panel.title = this.panel.el.getElementsByClassName("title")[0];
  this.panel.container = document.getElementById("controlContainer-THREE-JS");
}

THREE.ControlPanel.prototype.add = function(object){

}

THREE.ControlPanel.prototype.addCategory = function(object){
  for(i=0;)
}
