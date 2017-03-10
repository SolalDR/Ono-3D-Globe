
function CircleProgress(value, config){
  this.value = value;
  this.content = content;
  this.style = {};
  this.setConfig(config);
  this.gen();
}

CircleProgress.prototype.setConfig= function(config){

  this.style.width = config.width? config.width : 30;
  this.style.height = config.height? config.height : 30;
  this.style.weight = config.weight? config.weight : 5;
  this.style.color = config.color ? config.color : "#FFF";
  this.strokeBackDisplay = config.strokeBackDisplay? config.strokeBackDisplay : true;
  this.autoload = config.autoload? config.autoload : true;
  this.parent = config.parent? config.parent : null;
  this.displayCount = config.displayCount? config.displayCount : false;
  this.base = config.base? config.base : 100;
  this.animStrokeBack = config.animStrokeBack? config.animStrokeBack: false;

}

CircleProgress.prototype.gen = function(){
  this.el = document.createElement("div");
  this.el.className = "progress";
  this.el.setAttribute("style", "width:"+this.style.width+"px; height:"+this.style.height+"px;");

  if(this.displayCount){
    var count = document.createElement("span");
    count.innerHTML = this.base === 100? this.value+"%" : this.value;
    count.className = "countDisplay";
    count.setAttribute("style", "font-size:"+parseInt(this.style.width/4)+"px;");
    console.log(count.style);
    this.el.appendChild(count);
  }

  this.circleProgress = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  this.circleStrock = document.createElementNS("http://www.w3.org/2000/svg", "circle");

  var svgProgress = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var svgStrock = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgProgress.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
  svgStrock.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

  this.el.appendChild(svgProgress);
  this.el.appendChild(svgStrock);

  svgProgress.setAttribute("height", this.style.height);
  svgProgress.setAttribute("width", this.style.width);
  svgStrock.setAttribute("height", this.style.height);
  svgStrock.setAttribute("width", this.style.width);

  this.circleProgress.setAttribute("class", "bar");
  this.circleProgress.setAttribute("stroke-width", this.style.weight);
  this.circleProgress.setAttribute("cx", this.style.width/2);
  this.circleProgress.setAttribute("cy", this.style.height/2);
  this.circleProgress.setAttribute("r", this.style.height/2 - this.style.weight);
  this.circleProgress.setAttribute("stroke", this.style.color);
  this.circleProgress.setAttribute("fill", "none");

  this.circleStrock.setAttribute("stroke-width", this.style.weight);
  this.circleStrock.setAttribute("cx", this.style.width/2);
  this.circleStrock.setAttribute("cy", this.style.height/2);
  this.circleStrock.setAttribute("r", this.style.height/2 - this.style.weight);
  this.circleStrock.setAttribute("stroke", this.style.color);
  this.circleStrock.setAttribute("fill", "none");
  if(this.animStrokeBack){ this.circleStrock.setAttribute("class", "bar colorBack");}

  svgStrock.appendChild(this.circleStrock);
  svgProgress.appendChild(this.circleProgress);

  if(this.autoload && this.parent){
    this.setpercentage(0, this.circleProgress);

    if(this.animStrokeBack){
      this.setpercentage(0, this.circleStrock);
    }
    this.appendIn(this.parent);
  }
}

CircleProgress.prototype.appendIn = function(elDom){
  elDom.appendChild(this.el);
}

CircleProgress.prototype.active = function(){
  if(this.value){
    if(this.animStrokeBack){
      var self = this;
      self.setpercentage(this.base, this.circleStrock);
      setTimeout(function(){
        self.setpercentage(self.value, self.circleProgress);
      }, 200);
    } else {
      this.setpercentage(this.value, this.circleProgress);
    }
  }
}

CircleProgress.prototype.setpercentage = function(val, stroke){
  var base = parseInt(2*Math.PI*(this.style.height/2 - this.style.weight))+1;
  var final = Math.abs(val * base / 100 - base);
  stroke.style = "stroke-dashoffset: "+final+"px;  stroke-dasharray: "+base+";";
}
