OnoHystoryPopin = {
  els:{},
  display:function(){
    this.updateContent(target.targetCoord.content);

    var self = this, baseDuration = 1000;
    self.el.className = self.el.className.replace("hidden", "hidding");
    //On affiche le pop-in
    setTimeout(function(){
      self.el.className = self.el.className.replace("hidding", "visible");
    }, 50);

    //On lance le text
    setTimeout(function(){
      self.textSpell.run();
      self.els.title.className = self.els.title.className.replace("hidden", "visible");
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
      self.els.title.className = self.els.title.className.replace("visible", "hidden");
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


OnoHystoryLoader = {
  factPerSecond : [
    {
      count : 116666,
      lib : "snaps envoyés sur Snapchat"
    },
    {
      count : 6.66,
      lib : "heures de vidéos téléchargées sur YouTube"
    },
    {
      count : 5833,
      lib : "tweets sur Twitter"
    },
    {
      count : 3.6,
      lib : "millions de photos aimées sur Facebook"
    },
    {
      count : 1833,
      lib : "appels sur Skype"
    },
    {
      count : 58333,
      lib : "textos envoyés aux états-unis"
    },

  ],
  loadCallBack : function(){
    this.el.className = this.el.className.replace("visible", "hidden");
    var self = this;
    console.log("Bonjour");
    self.fact.stop();
    setTimeout(function(){
      self.el.style.display = "none";
    }, 1000);

  },
  init:function(){
    var random = this.factPerSecond[Math.floor(this.factPerSecond.length*Math.random())];
    this.el = document.getElementById("loader");
    this.fact = new FactProgress({
      lib : random.lib,
      interval : 10,
      factPerSecond : random.count,
      el : this.el
    });
    this.fact.run();
    this.fact.display();
    console.log("Display");

  }
}
OnoHystoryLoader.init();





function DynamicSpell(config){
  if(config.el){
    this.el = config.el;
    this.pas = config.pas ? config.pas : "\s";
    this.textSplit = this.el.innerHTML.split(this.pas);
    this.el.innerHTML = "";
    for(i=0; i<this.textSplit.length; i++){
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
