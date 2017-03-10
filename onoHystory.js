PopinThree = {
  els:{},
  display:function(){
    var self = this;
    self.el.className = self.el.className.replace("hidden", "hidding");
    setTimeout(function(){
      self.el.className = self.el.className.replace("hidding", "visible");
    }, 50);
    setTimeout(function(){
      self.displayData();
    },1000);
  },
  displayData:function(){
    var self = this;
    var rank;
    for(i=0; i<this.els.data.length; i++){
      (function(){
        el = self.els.data[i];
        setTimeout(function(){
          el.active();
        }, 100*i)
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

PopinThree.init();
