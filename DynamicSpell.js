
function DynamicSpell(config){
  if(config.el){
    this.el = config.el;
    this.pas = config.pas ? config.pas : "\s";
    this.textSplit = this.el.innerHTML.split(this.pas);
    this.el.innerHTML = "";
    this.keys = config.keys ? config.keys : null;
    for(i=0; i<this.textSplit.length; i++){
      this.el.innerHTML += "<span class=\"hide\">"+this.textSplit[i]+" </span>";
    }
    this.textSplit = this.el.getElementsByTagName("span");
    this.duration = config.duration ? config.duration : 2000;
  }
}

DynamicSpell.prototype.stopInterval = function(interval){
  clearInterval(this.interval);
}

DynamicSpell.prototype.startInterval = function(interval){
  var self = this;
  if(this.interval){
    clearInterval(this.interval);
  }
  this.interval = setInterval(function(){
    self.textSplit[self.rank].className = self.textSplit[self.rank].className.replace("hide", "display");
    self.rank++;

    //Si des clés existe et qu'on a atteint la limite de cette clé (Le nombre de mot final de la clé est égale au nombre de mots actuellement traité)
    if(self.currentKey>=0 && self.keys[self.currentKey][1]==self.rank){
      self.currentKey++
      //Si la clé calculé n'existe pas, on calcule par rapport à la fin de la vidéo
      if(self.currentKey == self.keys.length){
        self.startInterval(parseInt(( self.duration - self.keys[self.currentKey-1][0] )/( self.textSplit.length - self.keys[self.currentKey-1][1] )));
      } else {
        // Sinon on calcule par rapport à la clé précédente
        self.startInterval(parseInt(( self.keys[self.currentKey][0] - self.keys[self.currentKey-1][0] )/( self.keys[self.currentKey][1] - self.keys[self.currentKey-1][1] )));
      }
    }
    if(self.rank === self.textSplit.length){
      clearInterval(self.interval);
    }
  }, interval)
}

DynamicSpell.prototype.run = function(){
  this.start = new Date().getTime();
  var self = this;
  this.rank = 0;
  if(this.keys){
    this.currentKey = 0;
    this.startInterval(parseInt(this.keys[this.currentKey][0]/this.keys[this.currentKey][1]));
  } else {
    this.startInterval(parseInt(this.duration/this.textSplit.length));
  }
}
