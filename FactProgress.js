function FactProgress(config){
  this.lib = config.lib;
  this.factPerSecond = config.factPerSecond;
  this.el = config.el;
  this.pas = config.interval;
  this.elLib = this.el.getElementsByClassName("lib")[0];
  this.elCount = this.el.getElementsByClassName("count")[0];
}

FactProgress.prototype.run = function(){
  var self = this;
  this.start = new Date().getTime();
  self.value = 0;
  this.interval = setInterval(function(){
    var currentTime = new Date().getTime() - self.start;
    self.value = (currentTime*self.factPerSecond)/1000;
    if(self.display){
      self.elCount.innerHTML = Math.floor(self.value);
    }
  }, this.pas)
}

FactProgress.prototype.display = function(){
  this.display = true;
  this.elLib.innerHTML = this.lib;
}

FactProgress.prototype.stop = function(){
  this.display = false;
  clearInterval(this.interval);
}
