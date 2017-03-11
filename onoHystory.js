OnoHystoryPopin = {
  els:{},
  display:function(){
    var self = this, baseDuration = 1000;
    self.el.className = self.el.className.replace("hidden", "hidding");
    setTimeout(function(){
      self.el.className = self.el.className.replace("hidding", "visible");
    }, 50);
    setTimeout(function(){
      self.textSpell.run();
    },baseDuration);
    setTimeout(function(){
      self.displayData();
    },baseDuration+this.textSpell.duration);
  },
  displayData:function(){
    var self = this;
    for(i=0; i<this.els.data.length; i++){
      (function(){
        var rank=i;
        var el = self.els.data[rank];
        setTimeout(function(){
          el.active();
        }, 800*rank)
      })();

    }
  },
  hide:function(){
    var self = this;
    self.el.className = self.el.className.replace("visible", "hidding");
    setTimeout(function(){
      self.el.className = self.el.className.replace("hidding", "hidden");
    }, 1200)
  },
  isDisplay:function(){
    return this.el.className.match("visible") ? true : false;
  },
  initEvents:function(){
    var self = this;
    window.onresize = function(){
      var size = (window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight)*2;
      self.el.style.height = size+"px";
      self.el.style.width = size+"px";
    }
  },
  updateContent:function(content){
    this.els.dataContainer.innerHTML = "";
    this.els.data = [];
    this.els.title.innerHTML = content.name;
    this.els.content.innerHTML = content.text;
    this.textSpell = new DynamicSpell({
      el: this.els.content,
      pas: /\s/,
      duration: 2000
    });

    for(i=0; i<content.data.length; i++){
      this.els.data.push(new CircleProgress(content.data[i].count, {
        content: content.data[i].text,
        width: 60,
        height: 60,
        weight: 5,
        parent: this.els.dataContainer,
        displayCount : true,
        animStrokeBack : true
      }));
    }

  },
  init:function(){
    this.el = document.getElementById("onoStoriesPopin");
    this.els.title = this.el.getElementsByClassName("title")[0];
    this.els.content = this.el.getElementsByClassName("content")[0];
    this.els.dataContainer = this.el.getElementsByClassName("data-visualisation")[0];
    this.els.datas= [];

    var size = (window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight)*2;
    this.el.style.height = size+"px";
    this.el.style.width = size+"px";
    this.initEvents();
  }
}

OnoHystoryPopin.init();


function DynamicSpell(config){
  if(config.el){
    this.el = config.el;
    this.pas = config.pas ? config.pas : "\s";
    this.textSplit = this.el.innerHTML.split(this.pas);
    this.el.innerHTML = "";
    for(i=0; i<this.textSplit.length; i++){
      // this.textSplit = "<span class=\"hide\">"+this.textSplit[i]+" </span>";
      this.el.innerHTML += "<span class=\"hide\">"+this.textSplit[i]+" </span>";
    }
    this.textSplit = this.el.getElementsByTagName("span");
    this.duration = config.duration ? config.duration : 2000;
  }
}

DynamicSpell.prototype.run = function(){
  this.start = new Date().getTime();
  var self = this;
  var rank = 0;
  this.interval = setInterval(function(){
    self.textSplit[rank].className = self.textSplit[rank].className.replace("hide", "display");
    rank++;
    if(rank === self.textSplit.length){
      clearInterval(self.interval);
    }
  }, parseInt(this.duration/this.textSplit.length))
}
