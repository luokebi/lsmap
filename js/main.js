var contentUrl = "http://222.195.158.169/datamanager/Content/";
             var qdmap = null;
             var initflag = true;
			 
			 
			 
			 
			 /****************************************************************
    定义全局对象
    */
       
            var oldBaseLayer = null;
            var searchresultPanel = null; 
            var initflag = true;
            var buildingPopup = null;
            var navPopup = null;
            var busPopup = null;
            var buildingPopupMarker = null; 
            var treePopup = null;
            var personPopup = null;
            var markerLayer = null;
            var bsstore = {};
            var campus = '崂山校区';
            var shortcampus = function(cam){
                var c = "l";
                if(cam ==  "鱼山校区"){ c = "y";}
                if(cam == "浮山校区"){ c = "f";}
                return c;
            };
            var myStyles = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                    fillColor: "#ffcc66",
                    strokeColor: "#ff9933",
                    strokeWidth: 1,
                    fillOpacity: 0,
                    strokeOpacity: 0
                }),
                "select": new OpenLayers.Style({
                    fillColor: "#ffcc66",
                    strokeColor: "#ff9933",
                    strokeWidth: 1,
                    fillOpacity: 0.25,
                    strokeOpacity: 0.75,
                    cursor: "pointer"
                })
            });
			
            
             var roadStyles = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                    fillColor: "#ffcc66",
                    strokeColor: "#ff9933",
                    strokeWidth: 1,
                    fillOpacity: 0,
                    strokeOpacity: 0
                }),
                "select": new OpenLayers.Style({
                    fillColor: "#d1d9d7",
                    strokeColor: "#d1d9d7",
                    strokeWidth: 1,
                    fillOpacity: 0.35,
                    strokeOpacity: 0.85,
                    cursor: "pointer"
                })
            });
 
            //marker设置
            var size = new OpenLayers.Size(21, 25);
            var calculateOffset = function(size) {
                return new OpenLayers.Pixel(-(size.w / 2), -size.h);
            };
           
            var icon = new OpenLayers.Icon('img/marker-gold.png', size, null, calculateOffset);
            /*var nametip = new Ext.ToolTip({
                anchor: 'top',
                trackMouse: true,
                width: 120,
                height: 30,
                hideDelay: 0,
                showDelay: 0,
                renderTo: document.body
            });*/
/*
全局对象结束
***********************************/
		

             function get_map_url(bounds) {
                 var res = this.map.getResolution();
                 var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
                 var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));

                 var z = this.map.getZoom()+1;
                 var path = "zoom" + z + "/" + z + "_" + y + "_" + x + "." + this.type;
                 if (x < 0 || y < 0)
                     path = "transparent.png";
                 var url = this.url;
                 if (url instanceof Array) {
                     url = this.selectUrl(path, url);
                 }
                 return url + path;
             }
			 
			 function get_lsmap_url(bounds) {
            this.maxExtent = new OpenLayers.Bounds(-512, -384, 512, 384);
            var res = this.map.getResolution(); //分辨率 = 实际距离/像素数
            //x,y相当于行列
            var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w)); //(res * this.tileSize.w) = 单一瓦片代表的距离 
            var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
 
            var z = this.map.getZoom() + 1; //z相当于缩放级别
            var path = "zoom" + z + "/" + z + "_" + y + "_" + x + "." + this.type;
            if (x < 0 || y < 0)
                path = "transparent.png";
            var url = this.url;
            if (url instanceof Array) {
                url = this.selectUrl(path, url);
            }
            return url + path;
        }
 
        function get_ysmap_url(bounds) {
            this.maxExtent = new OpenLayers.Bounds(-256, -256, 256, 256);
            var res = this.map.getResolution(); //分辨率 = 实际距离/像素数
            //x,y相当于行列
            var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w)); //(res * this.tileSize.w) = 单一瓦片代表的距离 
            var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
 
            var z = this.map.getZoom() + 1; //z相当于缩放级别
            var path = "zoom" + z + "/" + z + "_" + y + "_" + x + "." + this.type;
            if (x < 0 || y < 0)
                path = "transparent.png";
            var url = this.url;
            if (url instanceof Array) {
                url = this.selectUrl(path, url);
            }
            return url + path;
        }
 
        function get_fsmap_url(bounds) {
            this.maxExtent = new OpenLayers.Bounds(-256, -256, 256, 256);
            var res = this.map.getResolution(); //分辨率 = 实际距离/像素数
            //x,y相当于行列
            var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w)); //(res * this.tileSize.w) = 单一瓦片代表的距离 
            var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
 
            var z = this.map.getZoom() + 1; //z相当于缩放级别
            var path = "zoom" + z + "/" + z + "_" + y + "_" + x + "." + this.type;
            if (x < 0 || y < 0)
                path = "transparent.png";
            var url = this.url;
            if (url instanceof Array) {
                url = this.selectUrl(path, url);
            }
            return url + path;
        }
 
 

            
			 
			 //this.touchhandler = new TouchHandler( qdmap, 4 );
			  
			  
			  
			 /******************************************************************
                定义地图
                */
                var buildingLayerReload = function(resp) {
                    this.destroyFeatures();
                    var features = resp.features;
                    if (features && features.length > 0) {
                        var remote = this.projection;
                        var local = this.map.getProjectionObject();
                        if (!local.equals(remote)) {
                            var geom;
                            for (var i = 0, len = features.length; i < len; ++i) {
                                geom = features[i].geometry;
                                if (geom) {
                                    geom.transform(remote, local);
                                }
                            }
                        }
                        this.addFeatures(features);
                    }
                    this.events.triggerEvent("loadend");

                };
                
                var roadLayerReload = function(resp){
                   this.destroyFeatures();
                    var features = resp.features;
                    if (features && features.length > 0) {
                        var remote = this.projection;
                        var local = this.map.getProjectionObject();
                        if (!local.equals(remote)) {
                            var geom;
                            for (var i = 0, len = features.length; i < len; ++i) {
                                geom = features[i].geometry;
                                if (geom) {
                                    geom.transform(remote, local);
                                }
                            }
                        }
                        this.addFeatures(features);
                    }
                    this.events.triggerEvent("loadend");
                };

//cover
                qdMap = new OpenLayers.Map("map",
					{
						maxExtent: new OpenLayers.Bounds(-256, -256, 256, 256), //999.5, -1199.5, 3999.5, 1200.5),
						numZoomLevels: 4,
						maxResolution: 1,
						controls: [
						new OpenLayers.Control.LLayerSwitcher({ baseLayerTitle: '校 区',  overLayerTitle: '标 识', otherData: '鱼山校区', activeColor: '#d0d0d0' }),
						//new OpenLayers.Control.PanZoomBar(),
						//new OpenLayers.Control.MouseDefaults()
						new OpenLayers.Control.TouchNavigation({ dragPanOptions: { enableKinetic: true} }),
						//new OpenLayers.Control.Zoom()		
					]
					});   
					
					
//cover									                                 
                                    
               /* 
                qdMap.events.register("zoomend", qdMap, function() {
                    var z = qdMap.getZoom();
//                    var ll = null;
                    if(z > 1){
                       vrLayer.setVisibility(true);
                    }
                    else{
                       vrLayer.setVisibility(false);
                    }                   

                });*/
//                qdMap.events.register("click", null, function() { 
//                    
//                   NavPersonShow();      });


                qdMap.events.register("changebaselayer", qdMap, function() {
                    if (!initflag) {
					    
						
						
						//markerLayer.clearMarkers();
                        //navigationLayer.clearMarkers();
                        dietmarkerLayer.clearMarkers();
                        classroommarkerLayer.clearMarkers();
                        livemarkerLayer.clearMarkers();
                        officemarkerLayer.clearMarkers();
                        libmarkerLayer.clearMarkers();
                        sportmarkerLayer.clearMarkers();
                        commarkerLayer.clearMarkers();
                        testmarkerLayer.clearMarkers();
                        //bustmarkerLayer.clearMarkers();
                        //vrLayer.clearMarkers();
                        roadmarkerLayer.clearMarkers();
                      // var officemarkerLayer = new OpenLayers.Layer.Markers("行政办公", { displayInLayerSwitcher: true, visibility: true  });
//				//var officemarkerLayer = new OpenLayers.Layer.Markers("行政办公", { displayInLayerSwitcher: true, visibility: false  });
//				var dietmarkerLayer = new OpenLayers.Layer.Markers("食堂", { displayInLayerSwitcher: true, visibility: true });
//                var classroommarkerLayer = new OpenLayers.Layer.Markers("教室", { displayInLayerSwitcher: true, visibility: false });
//                var livemarkerLayer = new OpenLayers.Layer.Markers("宿舍", { displayInLayerSwitcher: true, visibility: false });
//               
//                var testmarkerLayer = new OpenLayers.Layer.Markers("科研实验", { displayInLayerSwitcher: true, visibility: false  });
//                var libmarkerLayer = new OpenLayers.Layer.Markers("图书馆", { displayInLayerSwitcher: true, visibility: false });
//                var sportmarkerLayer = new OpenLayers.Layer.Markers("体育场所", { displayInLayerSwitcher: true, visibility: false });
//                var commarkerLayer = new OpenLayers.Layer.Markers("综合", { displayInLayerSwitcher: true, visibility: false });
//                var bustmarkerLayer = new OpenLayers.Layer.Markers("公交班车", { displayInLayerSwitcher: true, visibility: false });
//                //var navigationLayer = new OpenLayers.Layer.Markers("流程导航", { displayInLayerSwitcher: false });
//               // var vrLayer = new OpenLayers.Layer.Markers("校园全景", { displayInLayerSwitcher: true,visibility:true });
//                var roadmarkerLayer = new OpenLa
//						
						
                  
						
                        if (this.baseLayer.name == "鱼山校区") {
                            qdMap.setCenter(new OpenLayers.LonLat(0, 0), 2);
                            buildingLayer.protocol.read({
                                url: "/Home/GmlBuilding?ouc=y",
                                callback: buildingLayerReload,
                                scope: buildingLayer
                            });
                            roadLayer.protocol.read({
                                url: "/Home/GmlRoad?ouc=y",
                                callback: roadLayerReload,
                                scope: roadLayer
                            });
                            //LoadBusMarker("鱼山校区");
                            //LoadVrMarker("鱼山校区");
                            //LoadPanoMarker("鱼山校区");
                            //LoadTreeType("y");
                            campus = "鱼山校区";
                           //document.getElementById("dircon").style.backgroundImage = "url(../Content/Images/compassy.gif)";
                        }
                        if (this.baseLayer.name == "浮山校区") {
                            qdMap.setCenter(new OpenLayers.LonLat(-60, 140), 2);
                            buildingLayer.protocol.read({
                                url: "/Home/GmlBuilding?ouc=f",
                                callback: buildingLayerReload,
                                scope: buildingLayer
                            });
                            roadLayer.protocol.read({
                                url: "/Home/GmlRoad?ouc=f",
                                callback: roadLayerReload,
                                scope: roadLayer
                            });
                            //LoadBusMarker("浮山校区");
                            //LoadVrMarker("浮山校区");
                            //LoadPanoMarker("浮山校区");
                            //LoadTreeType("f");
                            campus = "浮山校区";
                           //document.getElementById("dircon").style.backgroundImage = "url(../Content/Images/compassf.gif)";
                        }
                        if (this.baseLayer.name == "崂山校区") {
                            qdMap.setCenter(new OpenLayers.LonLat(-60, 140), 2);
                            buildingLayer.protocol.read({
                                url: "/Home/GmlBuilding?ouc=l",
                                callback: buildingLayerReload,
                                scope: buildingLayer
                            });
                            roadLayer.protocol.read({
                                url: "/Home/GmlRoad?ouc=l",
                                callback: roadLayerReload,
                                scope: roadLayer
                            });
                            //LoadBusMarker("崂山校区");
                           // LoadPanoMarker("崂山校区");
                            //LoadTreeType("l");
                            campus = "崂山校区";
                          // document.getElementById("dircon").style.backgroundImage = "url(../Content/Images/compassl.gif)";
                        }
                    }
                    initflag = false;
                });
                
                /*
                定义地图结束
                ************************************/
			 



            //地图
              /*qdmap = new OpenLayers.Map("map",{
              
               numZoomLevels:3,
               maxResolution: 1,
               controls: [
              <!-- new OpenLayers.Control.CusLayerSwitcher({ baseLayerTitle: '校区', activeColor: '#d0d0d0' }),
			   -->
			   new OpenLayers.Control.LayerSwitcher({ baseLayerTitle: '校区', overLayerTitle: '标识', activeColor: '#d0d0d0' }),

               new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    enableKinetic: true
                }
            }),
               new OpenLayers.Control.Zoom()			  
               ]
           });*/


 // qdMap.controls[0].maximizeControl();
//定义图层



         var lsLayer = new OpenLayers.Layer.TMS("崂山校区",
                                                //"http://222.195.158.169:8060/ouc/laoshan/",
												 "ouc/laoshan/",
                                                 {
                                                     type: "png",
													  maxExtent: new OpenLayers.Bounds(-512, -384, 512, 384),
                                                     tileSize: new OpenLayers.Size(64, 64),
                                                     getURL: get_lsmap_url
                                                 });
 
          var ysLayer = new OpenLayers.Layer.TMS("鱼山校区",
                                                //"http://222.195.158.169:8060/ouc/yushan/",
												 "ouc/yushan/",
                                                 {
                                                     type: "png",
													  maxExtent: new OpenLayers.Bounds(-256, -256, 256, 256),
                                                     tileSize: new OpenLayers.Size(64, 64),
                                                     getURL: get_ysmap_url
                                                 });
                                                 
           var fsLayer = new OpenLayers.Layer.TMS("浮山校区",
                                               //"http://222.195.158.169:8060/ouc/fushan/",
											   "ouc/fushan/",
                                                 {
                                                     type: "png",
													  maxExtent: new OpenLayers.Bounds(-256, -256, 256, 256),
                                                     tileSize: new OpenLayers.Size(64, 64),
                                                     getURL: get_fsmap_url
                                                 });
//定义图层结束




  var shortcampus = function(cam){
                var c = "l";
                if(cam ==  "鱼山校区"){ c = "y";}
                if(cam == "浮山校区"){ c = "f";}
                return c;
            };






               var buildingLayer = new OpenLayers.Layer.Vector("建筑区域", {
                    strategies: [new OpenLayers.Strategy.Fixed()],
                    protocol: new OpenLayers.Protocol.HTTP({
                        url: "/Home/GmlBuilding?ouc="+shortcampus(campus),
                        format: new OpenLayers.Format.GML()
                    }),
                    displayInLayerSwitcher: true,
                    styleMap: myStyles
                });             
                
                
                buildingLayer.events.register("visibilitychanged",roadLayer,function(){
                    if(this.visibility){
                       roadLayer.setVisibility(false);
                    }
                    else{
                        roadLayer.setVisibility(true);
                    }
                });
				
				 buildingLayer.events.register("loadend", buildingLayer, function() {
                    var fs = this.features;
                    for (var i = 0; i < fs.length; i++) {
                       var position = fs[i].geometry.getCentroid();
                        var lonLat = new OpenLayers.LonLat(position.x, position.y);
                        var markertype = fs[i].attributes["type"];
                        // var d = "";
						/*var newmarker = new OpenLayers.TextMarker(lonLat, new OpenLayers.TextMarker.defaultText(fs[i].attributes["name"]));
                        officemarkerLayer.addMarker(newmarker);*/
                      
                        // var d = "";
                        if (markertype.indexOf("食堂", 0) != -1) {
                           var newmarker = new OpenLayers.TextMarker(lonLat, new OpenLayers.TextMarker.defaultText(fs[i].attributes["name"]));
                            dietmarkerLayer.addMarker(newmarker);
                        }
                        if (markertype.indexOf("教室", 0) != -1) {
                            var newmarker = new OpenLayers.TextMarker(lonLat, new OpenLayers.TextMarker.defaultText(fs[i].attributes["name"]));
                            classroommarkerLayer.addMarker(newmarker);
                        }

                        if (markertype.indexOf("科研", 0) != -1 || markertype.indexOf("实验", 0) != -1) {
                            var newmarker = new OpenLayers.TextMarker(lonLat, new OpenLayers.TextMarker.defaultText(fs[i].attributes["name"]));
                            testmarkerLayer.addMarker(newmarker);
                        }
                        if (markertype.indexOf("行政办公", 0) != -1) {
                            var newmarker = new OpenLayers.TextMarker(lonLat, new OpenLayers.TextMarker.defaultText(fs[i].attributes["name"]));
                            officemarkerLayer.addMarker(newmarker);
                        }
                        if (markertype.indexOf("图书馆", 0) != -1) {
                            var newmarker = new OpenLayers.TextMarker(lonLat, new OpenLayers.TextMarker.defaultText(fs[i].attributes["name"]));
                            libmarkerLayer.addMarker(newmarker);
                        }
                        if (markertype.indexOf("体育", 0) != -1) {
                            var newmarker = new OpenLayers.TextMarker(lonLat, new OpenLayers.TextMarker.defaultText(fs[i].attributes["name"]));
                            sportmarkerLayer.addMarker(newmarker);
                        }
                        if (markertype.indexOf("综合", 0) != -1) {
                            var newmarker = new OpenLayers.TextMarker(lonLat, new OpenLayers.TextMarker.defaultText(fs[i].attributes["name"]));
                            commarkerLayer.addMarker(newmarker);
                        }
                      /*  if (markertype.indexOf("公交班车", 0) != -1) {
                            var newmarker = new OpenLayers.Marker(lonLat, new OpenLayers.Icon(OpenLayers.Util.getImagesLocation() + "bus.gif", new OpenLayers.Size(14, 44)));
                            bustmarkerLayer.addMarker(newmarker);
                        }*/
                        if (markertype.indexOf("宿舍", 0) != -1) {
                            var newmarker = new OpenLayers.TextMarker(lonLat, new OpenLayers.TextMarker.defaultText(fs[i].attributes["name"]));
                            livemarkerLayer.addMarker(newmarker);
                      }
                    }
                });
                
				

      		    var roadLayer = new OpenLayers.Layer.Vector("校园道路", {
                    strategies: [new OpenLayers.Strategy.Fixed()],
                    protocol: new OpenLayers.Protocol.HTTP({
                        url: "/Home/GmlRoad?ouc="+shortcampus(campus),
                        format: new OpenLayers.Format.GML()
                    }),
                    displayInLayerSwitcher: true,
                    styleMap: roadStyles,
                    visibility: false
                });
                
                var officemarkerLayer = new OpenLayers.Layer.Markers("行政办公", { displayInLayerSwitcher: true, visibility: true  });
				//var officemarkerLayer = new OpenLayers.Layer.Markers("行政办公", { displayInLayerSwitcher: true, visibility: false  });
				var dietmarkerLayer = new OpenLayers.Layer.Markers("食堂", { displayInLayerSwitcher: true, visibility: true });
                var classroommarkerLayer = new OpenLayers.Layer.Markers("教室", { displayInLayerSwitcher: true, visibility: false });
                var livemarkerLayer = new OpenLayers.Layer.Markers("宿舍", { displayInLayerSwitcher: true, visibility: false });
               
                var testmarkerLayer = new OpenLayers.Layer.Markers("科研实验", { displayInLayerSwitcher: true, visibility: false  });
                var libmarkerLayer = new OpenLayers.Layer.Markers("图书馆", { displayInLayerSwitcher: true, visibility: false });
                var sportmarkerLayer = new OpenLayers.Layer.Markers("体育场所", { displayInLayerSwitcher: true, visibility: false });
                var commarkerLayer = new OpenLayers.Layer.Markers("综合", { displayInLayerSwitcher: true, visibility: false });
                //var bustmarkerLayer = new OpenLayers.Layer.Markers("公交班车", { displayInLayerSwitcher: true, visibility: false });
                //var navigationLayer = new OpenLayers.Layer.Markers("流程导航", { displayInLayerSwitcher: false });
               // var vrLayer = new OpenLayers.Layer.Markers("校园全景", { displayInLayerSwitcher: true,visibility:true });
                var roadmarkerLayer = new OpenLayers.Layer.Markers("校园道路", { displayInLayerSwitcher: false,visibility:false });
				
				
				
				
				
				
                qdMap.addLayers([lsLayer, fsLayer, ysLayer, buildingLayer,roadLayer,officemarkerLayer,dietmarkerLayer,classroommarkerLayer,livemarkerLayer,testmarkerLayer,libmarkerLayer,sportmarkerLayer,commarkerLayer]);
				qdMap.addControl( new OpenLayers.Control.LLayerSwitcher());
    
          // qdmap.setCenter(new OpenLayers.LonLat(-105, 156), 1);
		  // this.touchhandler = new TouchHandler( qdmap, 4 );
		 
		   qdMap.addControl( new OpenLayers.Control.TouchNavigation({dragPanOptions: {enableKinetic: true}}));
		   //qdMap.addControl( new OpenLayers.Control.Zoom());  		   
		   qdMap.setBaseLayer(qdMap.getLayersByName(campus)[0]);

		  qdMap.setCenter(new OpenLayers.LonLat(-60, 140), 2);
           initLayerList();
		   //qdMap.events.register("changebaselayer", qdMap, function());



           setTimeout(function(){
            $('#loading').fadeOut();
            },2000);