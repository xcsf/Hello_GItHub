define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "esri/Color",
  	"dojo/_base/connect",
  	"esri/geometry/SpatialReference",
  	"esri/geometry/Point",
  	"esri/Graphic",
  	"esri/symbols/SimpleMarkerSymbol",
  	"esri/symbols/TextSymbol",
  	"esri/geometry/support/webMercatorUtils",
  	"esri/PopupTemplate",
  	"esri/layers/GraphicsLayer", "esri/layers/mixins/ScaleRangeLayer"
], function (
  declare, arrayUtils, Color, connect,
  SpatialReference, Point, Graphic, SimpleMarkerSymbol, TextSymbol,webMercatorUtils, 
  PopupTemplate, GraphicsLayer,ScaleRangeLayer
) {
	return GraphicsLayer.createSubclass([ScaleRangeLayer],{
		declaredClass : "ClusterLayer",
		properties : {
			view:null,//当前视图，必须
			map:null,//当前地图，必须
			id:"clusters",//图层id，必须
			data:[],//聚类数据，必须
			field : "clusterCount",//聚类的字段
			distance:0.001,//距离
			labelColor:"#FFF",//标注颜色，默认为白色
			labelOffset : -4,//标注偏移，默认为-4
			resolution:null,
			clusters : null,
	        singles : null, //单个对象,点击时出现
	        showSingles : true,
	        symbolArray : null,//graphic样式数组
	        singleSym:null,//单个graphic样式
	        graphicSym:null,//要素高亮样式
	        singleTemplate : new PopupTemplate({ "title": "{type}", "description": "{material}" }),
	        spatialReference : null,//空间参考
	        maxSingles : 100000//单个集群最大数
		},
		/**
		 * @description 初始化
		 * @creator 
		 * @createtime 2018-02-06
		 */
		init:function(){
			this.clusters = [];
			this.singles = [];
			this.spatialReference = this.view.spatialReference;
			if(this.symbolArray == null){
				var red = new SimpleMarkerSymbol("circle", 20, null, new Color("green"));
				var blue = new SimpleMarkerSymbol("circle", 20, null, new Color("blue"));
				var green = new SimpleMarkerSymbol("circle", 20, null, new Color("red"));
				this.symbolArray = [red, blue,green];
			}
		},
		/**
		 * @description 执行点聚合事件
		 * @creator 
		 * @createtime 2018-02-06
		 */
		excuseClusterEvent: function() {
			//判断当前是否存在该id的图层，若有，删除
			//var layer = this.map.findLayerById(this.id);
			//if(layer != undefined || layer != null)
			//	this.map.remove(layer);
			//初始化
			this.init();
			//清除当前图层上的图形
			this.clear();
			//设置Resolution
			this.setResolution(); 
			//创建聚合图形
		    this.clusterGraphics();
		    var div = this.inherited(arguments);
		    return div;
		},
 
		/**
		 * @description 设置Resolution
		 * @creator 
		 * @createtime 2018-02-06
		 */
		setResolution: function() {
			var e = this.view.extent;
			if(e)
			{
				var rightTop =  new Point(e.xmax, e.ymax, this.spatialReference); //右上角  
				var leftBottom =  new Point(e.xmin, e.ymin, this.spatialReference); //左下角
				var rightTopPoint = webMercatorUtils.geographicToWebMercator(rightTop);  
				var leftBottomPoint = webMercatorUtils.geographicToWebMercator(leftBottom); 
				this.resolution = (rightTopPoint.x - leftBottomPoint.x) / this.view.width;
			}
			
		},
		/**
		 * @description 地图缩放处理事件
		 * @creator 
		 * @createtime 2018-02-06
		 */
		changeExtentEvent:function(){
			//清除当前图层上的图形
			this.clear();
			//设置Resolution
			this.setResolution(); 
			//创建聚合图形
		    this.clusterGraphics();
		},
		/**
		 * @description 移除缩放事件
		 * @creator 
		 * @createtime 2018-02-06
		 */
	    removeZoomEnd: function() {
	    	this.inherited(arguments);
	    },
 
	    /**
		 * @description 添加聚合集群
		 * @creator 
		 * @createtime 2018-02-06
		 */
		add : function(p) {
			//判断点是否落在现有集群中，若没有，则新建一个新集群
			if (p.declaredClass) {
				this.inherited(arguments);
				return;
			}
 
			//把新数据添加到data中
			this.data.push(p);
			//是否添加到集群中
			var clustered = false;
			for (var i = 0; i < this.clusters.length; i++) {
				var c = this.clusters[i];
				//判断两点之间是否属于同一集群
				if (this.clusterTest(p, c)) {
					//添加新点到现有集群
					this.clusterAddPoint(p, c);
					//更新集群图形信息
					this.updateClusterGeometry(c);
					//更新集群label信息
					this.updateLabel(c);
					clustered = true;
					break;
				}
			}
 
			//如果没有添加到集群中，则创建新集群
			if (!clustered) {
				this.clusterCreate(p);
				p.attributes.clusterCount = 1;
				this.showCluster(p);
			}
		},
		/**
		 * @description 清楚当前所有集群
		 * @creator 
		 * @createtime 2018-02-06
		 */
		clear : function() {
			var layer = this.map.findLayerById(this.id);
			if (layer != undefined || layer != null)
				layer.removeAll();
			// Summary: Remove all clusters and data
			// points.
			this.inherited(arguments);
			if(this.clusters)
			{
				this.clusters.length = 0;
			}
			
		},
 
		/**
		 * @description 清除单个集群
		 * @creator 
		 * @createtime 2018-02-06
		 */
		clearSingles : function(singles) {
			var s = singles || this.singles;
			arrayUtils.forEach(s, function(g) {
				this.remove(g);
			}, this);
			this.singles.length = 0;
		},
		/**
		 * @description 点击集群事件
		 * @creator 
		 * @createtime 2018-02-06
		 */
		onClick : function(e) {
			this.clear();
			//清除单个要素
			this.clearSingles(this.singles);
 
			//获取当前集群的数据
			var singles = [];
			for (var i = 0, il = this.data.length; i < il; i++) {
				if (e.attributes.clusterId == this.data[i].attributes.clusterId) {
					singles.push(this.data[i]);
				}
			}
			//判断单个集群长度是否有大于单个集群最大长度
			if (singles.length > this.maxSingles) {
				alert("对不起，当前集群长度大于" + this.maxSingles + "个，请放大到更大级别再进行查询当个集群！");
				return null;
			} else {
				//停止地图点击
				//e.stopPropagation();
				//this.view.popup.content = "<div style='background-color:DarkGray;color:white'> miles.</div>";
				//this.map.infoWindow.show(e.graphic.geometry);
				this.addSingles(singles);
				return singles;
			}
		},
 
		/**
		 * @description 创建聚合图形
		 * @creator 
		 * @createtime 2018-02-06
		 */
		clusterGraphics : function() {
			for (var j = 0, jl = this.data.length; j < jl; j++) {
				var point = this.data[j];
				var clustered = false;
				var numClusters = this.clusters.length;
				for (var i = 0; i < this.clusters.length; i++) {
					var c = this.clusters[i];
					//判断两点之间是否属于同一集群
					if (this.clusterTest(point, c)) {
						//添加新点到现有集群
						this.clusterAddPoint(point, c);
						clustered = true;
						break;
					}
				}
				//如果没有添加到集群中，则创建新集群
				if (!clustered) {
					this.clusterCreate(point);
				}
			}
			//显示所有集群
			this.showAllClusters();
		},
 
		/**
		 * @description 判断两点之间是否属于同一个集群
		 * @creator 
		 * @createtime 2018-02-06
		 */
		clusterTest : function(p, cluster) {
			var c_latlng;
			var p_latlng;
			if (this.spatialReference.isWebMercator) {
				//地图 为WebMercator坐标系
				c_point = new Point(cluster.x,
						cluster.y,
						this.spatialReference);
				p_point = new Point(p.x, p.y,
						this.spatialReference);
			} else {
				//地图为非WebMercator坐标系，则需转换为墨卡托坐标系
				c_latlng = new Point(
						parseFloat(cluster.x),
						parseFloat(cluster.y),
						this.spatialReference);
				p_latlng = new Point(parseFloat(p.x),
						parseFloat(p.y),
						this.spatialReference);
				c_point = webMercatorUtils
						.geographicToWebMercator(c_latlng);
				p_point = webMercatorUtils
						.geographicToWebMercator(p_latlng);
			}
			var distance = (Math.sqrt(Math.pow(
					(c_point.x - p_point.x), 2)
					+ Math.pow((c_point.y - p_point.y),
							2)) / this.resolution);
			return (distance <= this.distance);
		},
 
		/**
		 * @description 添加新点到现有集群
		 * @creator 
		 * @createtime 2018-02-06
		 */
		clusterAddPoint : function(p, cluster) {
			//添加新点到现有集群
			var count, x, y;
			count = cluster.attributes.clusterCount;
			x = (p.x + (cluster.x * count))
					/ (count + 1);
			y = (p.y + (cluster.y * count))
					/ (count + 1);
			cluster.x = x;
			cluster.y = y;
 
			//创建这个集群的新范围
			if (p.x < cluster.attributes.extent[0]) {
				cluster.attributes.extent[0] = p.x;
			} else if (p.x > cluster.attributes.extent[2]) {
				cluster.attributes.extent[2] = p.x;
			}
			if (p.y < cluster.attributes.extent[1]) {
				cluster.attributes.extent[1] = p.y;
			} else if (p.y > cluster.attributes.extent[3]) {
				cluster.attributes.extent[3] = p.y;
			}
 
			//统计这个集群有多少个点
			cluster.attributes.clusterCount++;
			//判断是否包含attributes字段，若无，赋值
			if (!p.hasOwnProperty("attributes")) {
				p.attributes = {};
			}
			//给这个属性一个clusterId值
			p.attributes.clusterId = cluster.attributes.clusterId;
		},
 
		/**
		 * @description 创建一个新集群
		 * @creator 
		 * @createtime 2018-02-06
		 */
		clusterCreate : function(p) {
			var clusterId = this.clusters.length + 1;
			if (!p.attributes) {
				p.attributes = {};
			}
			p.attributes.clusterId = clusterId;
			//创建一个新集群
			var cluster = {
				"x" : p.x,
				"y" : p.y,
				"attributes" : {
					"clusterCount" : 1,
					"clusterId" : clusterId,
					"extent" : [ p.x, p.y, p.x, p.y ]
				}
			};
			this.clusters.push(cluster);
		},
 
		/**
		 * @description 显示所有集群
		 * @creator 
		 * @createtime 2018-02-06
		 */
		showAllClusters : function() {
			var array = this.groupData();
			for (var i = 0; i <this.clusters.length; i++) {
				var c = this.clusters[i];
				if(c.attributes.clusterCount > array[0]){
					this.singleSym = this.symbolArray[0];
				}else if(c.attributes.clusterCount > array[1]){
					this.singleSym = this.symbolArray[1];
				}else{
					this.singleSym = this.symbolArray[2];
				}
				this.showCluster(c);
			}
		},
		/**
		 * @description 获取分组组值数组
		 * @creator 
		 * @createtime 2018-02-06
		 */
		groupData:function(){
			//获取最大最小值
			var max = this.clusters[0].attributes.clusterCount;
			var min = this.clusters[0].attributes.clusterCount;
			for (var i = 0; i <this.clusters.length; i++) {
				var count = this.clusters[i].attributes.clusterCount;
				if(max < count)
					max = count;
				else if(min > count)
					min = count;
			}
			//组距
			var dValue = (max - min)/3;
			return [(max - dValue),(min + dValue)];
		},
		/**
		 * @description 显示集群
		 * @creator 
		 * @createtime 2018-02-06
		 */
		showCluster : function(c) {
			var point = new Point(c.x, c.y,this.spatialReference);
			if(this.singleSym == null)
				this.singleSym = new SimpleMarkerSymbol("circle", 20, null, new Color("red"));
			//添加点图形
			this.add(new Graphic(point, this.singleSym,c.attributes));
			//添加文字到指定位置
			var label = new TextSymbol(c.attributes.clusterCount.toString())
			label.color = new Color(this.labelColor);
			label.xoffset = 0;
			label.yoffset = this.labelOffset;
			this.add(new Graphic(point, label,c.attributes));
			
			//var _pLngLat = webMercatorUtils.xyToLngLat(c.x, c.y);
			//console.log(_pLngLat);
			
			
			
		},
		/**
		 * @description 添加单个点
		 * @creator 
		 * @createtime 2018-02-06
		 */
		addSingles : function(singles) {
			//添加单个点到地图上
			arrayUtils.forEach(singles, function(p) {
				var g = new Graphic(new Point(p.x, p.y,this.spatialReference),this.graphicSym, p.attributes,this.singleTemplate);
				this.singles.push(g);
				if (this.showSingles) {
					this.add(g);
				}
			}, this);
		},
 
		/**
		 * @description 更新集群图形
		 * @creator 
		 * @createtime 2018-02-06
		 */
		updateClusterGeometry : function(c) {
			var cg = arrayUtils.filter(this.graphics,function(g) {
				return !g.symbol && g.attributes.clusterId == c.attributes.clusterId;
			});
			if (cg.length == 1) {
				cg[0].geometry.update(c.x, c.y);
			} else {
				console.log("didn't find exactly one cluster geometry to update: ",cg);
			}
		},
		/**
		 * @description 更新集群Label
		 * @creator 
		 * @createtime 2018-02-06
		 */
		updateLabel : function(c) {
			//找到已存在的集群label
			var label = arrayUtils.filter(this.graphics,function(g) {
				return g.symbol && g.symbol.declaredClass == "esri.symbol.TextSymbol" && g.attributes.clusterId == c.attributes.clusterId;
			});
			if (label.length == 1) {
				//更新集群Label
				this.remove(label[0]);
				var newLabel = new TextSymbol(c.attributes.clusterCount);
				newLabel.color = new Color(this.labelColor);
				newLabel.xoffset = 0;
				newLabel.yoffset = this.labelOffset;
				this.add(new Graphic(new Point(c.x,c.y, this.spatialReference), newLabel, c.attributes));
			} else {
				console.log("didn't find exactly one label: ",label);
			}
		}
 
	});
});