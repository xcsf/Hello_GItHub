/*!
 * application.Map.js 1.0
 * arcgis 地图 公用操作api
 * 
 * 
 */


define(["dojo/_base/declare",
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/layers/GraphicsLayer",
    "esri/layers/FeatureLayer",
    "esri/views/2d/layers/BaseLayerViewGL2D",
    "esri/core/watchUtils",
    "esri/core/promiseUtils",
    "szdtmap/TDmapLayer",
    "szdtmap/TDmapOfflineLayer",
    "szdtmap/echartsLayer",
    "esri/widgets/LayerList",
    "esri/layers/IntegratedMeshLayer",
    "esri/layers/ElevationLayer",
    "esri/layers/SceneLayer",
    "esri/layers/GroupLayer",
    "esri/layers/ClusterLayer",
    "esri/layers/TileLayer",
    "esri/layers/MapImageLayer",
    "esri/widgets/DistanceMeasurement2D",
    "esri/widgets/AreaMeasurement2D",
    "esri/widgets/DirectLineMeasurement3D",
    "esri/widgets/AreaMeasurement3D",
    "esri/widgets/Slice",
    "esri/widgets/ScaleBar",
    "esri/Graphic",
    "esri/symbols/TextSymbol",
    "esri/widgets/Sketch/SketchViewModel",
    "esri/geometry/SpatialReference",
    "esri/geometry/support/webMercatorUtils",
    "esri/geometry/geometryEngine",
    "szdtmap/gl-matrix",
    "esri/identity/IdentityManager",

    "dojo/domReady!"
  ],

  function(declare, esriConfig, Map, MapView, SceneView, GraphicsLayer, FeatureLayer, BaseLayerViewGL2D, watchUtils, promiseUtils, TDmapLayer, TDmapOfflineLayer, EchartsLayer, LayerList, IntegratedMeshLayer, ElevationLayer,
    SceneLayer, GroupLayer, ClusterLayer, TileLayer, MapImageLayer, DistanceMeasurement2D, AreaMeasurement2D, DirectLineMeasurement3D, AreaMeasurement3D, Slice, ScaleBar, Graphic, TextSymbol,
    SketchViewModel, SpatialReference, webMercatorUtils, geometryEngine, matrix, esriId) {
    let graphicsLayers = [];
    let drawLyrId = "drawLyrId";

    const pi = 3.14159265358979324;
    const x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    const a = 6378245.0;
    const ee = 0.00669342162296594323;

    declare("map.Draw", null, {
      appMap: null,
      view: null,
      drawTool: null,
      mapType: null, //地图二三维类型
      editTool: null,
      spatialReference: null,
      elementInfos: [],
      constructor: function(map, view, spatialReference, mapType) {

        this.spatialReference = spatialReference;
        this.mapType = mapType;
        if (!map) {
          console.log("未设置地图对象!");
          return;
        }
        //esriConfig.request.proxyUrl = "http://webgis.szmedi.com.cn:88/proxy/proxy.ashx";
        //esriConfig.portalUrl = "https://gisportal.szmedi.com.cn/";
        //esriConfig.request.corsEnabledServers.push("webgis.szmedi.com.cn");
        //esriConfig.request.corsEnabledServers.push("gisportal.szmedi.com.cn");
        //esriConfig.request.corsEnabledServers.push("survey.szmedi.com.cn");
        this.appMap = map;
        this.view = view;
      },

      //画一个图标点
      //            "x": locationPoint.x, 不为空
      //            "y": locationPoint.y,  不为空
      //let options = {
      //        layerid:图形图层id
      //            "symbolUrl" 付号 //可为空
      //             symbolStyle :{width:24,height:24, angle:0,r:0,g:0,b:0,a:1,xOffset,yOffset }
      //            "callBack" 图标的单击事件 //可为空
      //            "attributes" 图标的属性值，可为空
      //             maxScale:0
      //             minScale:0
      //        };
      drawPoint: function(x, y, z, options) {
        if (x == "" || y == "" || isNaN(x) || isNaN(y)) {
          console.log("坐标值未设置!");
          return;
        }

        let myGraphicsLayer = getGraphicsLayer(this.appMap, options && options.layerid, options && options.index);
        //默认
        let symbol = {
          type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
          color: options.simpleColor || [226, 119, 40],
          size: options.symbolSize || 12,
          outline: { // autocasts as new SimpleLineSymbol()
            color: options.outColor || [255, 255, 255],
            width: options.outwidth || 2
          }
        };
        //设置图片图标
        if (options && options.symbolUrl) {
          symbol = {
            type: "picture-marker", // autocasts as new PictureMarkerSymbol()
            url: options.symbolUrl,
            width: "24px",
            height: "24px"
          };
          if (options.symbolStyle) {
            if (options.symbolStyle.height) {
              symbol.height = options.symbolStyle.height;
            }
            if (options.symbolStyle.width) {
              symbol.width = options.symbolStyle.width;
            }
            if (options.symbolStyle.angle)
              symbol.angle = options.symbolStyle.angle;
          }
        }

        if (this.mapType == "2D") {
          //This property is currently not supported in 3D SceneViews.
          if (options && options.symbolStyle && !isNaN(options.symbolStyle.xOffset) && !isNaN(options.symbolStyle.yOffset)) {
            symbol.xOffset = options.symbolStyle.xOffset;
            symbol.yOffset = options.symbolStyle.yOffset;
          }
        }
        //图标点击事件
        if (options && options.callBack) {
          myGraphicsLayer.callBack = options.callBack;
        }

        if (options && options.maxScale)
          myGraphicsLayer.maxScale = options.maxScale;
        if (options && options.minScale)
          myGraphicsLayer.minScale = options.minScale;

        //添加图形
        let point = {
          type: "point",
          longitude: x,
          latitude: y,
          spatialReference: this.spatialReference
        };
        if (this.mapType == "3D") {
          point = {
            type: "point",
            x: x,
            y: y,
            z: z,
            spatialReference: this.spatialReference
          };
        }

        let graphic = new Graphic({
          geometry: point,
          symbol: symbol
        });
        if (options && options.attributes)
          graphic.attributes = options.attributes;


        myGraphicsLayer.add(graphic);

        return graphic;
      },
      //画线  points:[{x:114,y:24,z:100},.....], options={ layerid:图形图层id,
      //isDashdot:true/false,style:{ r:0,g:0,b:255,a:0.75,width:3  },
      //isMoveToLine:true/false }
      drawLine: function(points, options) {

        if (!points || points.length < 2) {
          console.log("坐标值未设置!");
          return;
        }

        let myGraphicsLayer = getGraphicsLayer(this.appMap, options && options.layerid, options && options.index);

        if (options && options.callBack)
          myGraphicsLayer.callBack = options.callBack;

        let path = [];
        for (let n = 0; n < points.length; n++) {
          let p = points[n];
          if (this.mapType == "2D") {
            path.push([p.x, p.y]);
          } else {
            path.push([p.x, p.y, p.z]);
          }
        }

        let polyline = {
          type: "polyline", // autocasts as new Polyline()
          paths: path
        };

        let lineSymbol = {
          type: "simple-line", // autocasts as SimpleLineSymbol()
          color: { r: 226, g: 119, b: 40, a: 1 },
          width: 2
        };
        let style = options && options.style || null;
        if (style) {
          lineSymbol.color = { r: options.style.r, g: options.style.g, b: options.style.b, a: options.style.a };
          lineSymbol.width = options.style.width;
        }

        let polylineGraphic = new Graphic({
          geometry: polyline,
          symbol: lineSymbol
        });

        //设置图标属性信息模板
        polylineGraphic.attributes = options && options.attributes || null;
        myGraphicsLayer.add(polylineGraphic);

        //缩放到线
        if (options && options.isMoveToLine) {
          this.view.extent = polylineGraphic.geometry.extent;
        }
        return polylineGraphic;

      },
      // 画多边形
      //points:[[114,24],.....] 
      //option={ layerid:图形图层id,
      //lineStyle: { r: 0, g: 0, b: 255, a: 0.75, width: 3,isDashdot:true/false}, 
      //fillPicUrl::/images/mangrove.png, //图片优先，没有图片，就默认
      //fillStyle:{ style: "STYLE_SOLID" , r: 0, g: 0, b: 255, a: 0.75, }
      //isMoveTo:true/false,  callBack:function(e){} 
      // attributes:特性}
      drawPolygon: function(points, option) {

        let myGraphicsLayer = getGraphicsLayer(this.appMap, option && option.layerid, option && option.index);
        if (option && option.callBack)
          myGraphicsLayer.callBack = option.callBack;

        if (!points || points.length <= 2) {
          console.log("至少需要三个顶点坐标!");
          return;
        }
        let ring = [];
        if (Array.isArray(points[0])) {
          ring = points;
        } else {
          for (i = 0; i < points.length; i++) {
            let p = points[i];
            if (this.mapType == "2D")
              ring.push([p.x, p.y]);
            else
              ring.push([p.x, p.y, p.z]);
          }
        }

        let polygon = {
          type: "polygon", // autocasts as new Polygon()
          rings: ring
        };
        if (option && option.spatialReference) {
          polygon.spatialReference = option.spatialReference
        };
        let fillSymbol = {
          type: "simple-fill", // autocasts as new SimpleFillSymbol()
          color: [227, 139, 79, 0.8],
          outline: { // autocasts as new SimpleLineSymbol()
            color: [255, 255, 255],
            width: 2
          }
        };

        if (option && option.fillStyle) {
          let fillStyle = option.fillStyle;
          fillSymbol.color = [fillStyle.r, fillStyle.g, fillStyle.b, fillStyle.a];
        }

        if (option && option.lineStyle) {
          if (option.lineStyle.width) {
            fillSymbol.outline.width = option.lineStyle.width;
          }
          fillSymbol.outline.color = [option.lineStyle.r, option.lineStyle.g, option.lineStyle.b, option.lineStyle.a];
        }
        let polygonGraphic = new Graphic({
          geometry: polygon,
          symbol: fillSymbol
        });

        //设置图标属性信息模板
        polygonGraphic.attributes = option && option.attributes || null;
        myGraphicsLayer.add(polygonGraphic);

        //缩放到面
        if (option && option.isMoveTo) {
          this.view.extent = polygonGraphic.geometry.extent;
        }

        return polygonGraphic;

      },
      //画文本信息 title :text, x:0,y:0,z:0, options={ layerid:layerid, style:{ size:14,r:255,g:0,b:0,xOffset:0,yOffset:0},halostyle:{size:1,r:255,g:0,b:0}  }
      drawText: function(lbltext, x, y, z, options) {
        let txtGraphicsLayer = getGraphicsLayer(this.appMap, options && options.layerid, options && options.index);
        let size = 12;
        if (options && options.style && options.style.size) {
          size = options.style.size;
        }

        let point = {
          type: "point",
          longitude: x,
          latitude: y,
          spatialReference: this.spatialReference
        };
        if (options && options.spatialReference) {
          point.spatialReference = options.spatialReference
        };
        if (this.mapType == "3D") {
          point = {
            type: "point",
            x: x,
            y: y,
            z: z,
            spatialReference: this.spatialReference
          };
        }

        let textSymbol = {
          //type: "text",  // autocasts as new TextSymbol()
          text: lbltext,
          haloColor: [255, 0, 0],
          haloSize: 2,
          color: [255, 255, 255],
          font: { // autocast as new Font()
            family: "sans-serif",
            size: size
          }
        };
        let textsyb = new TextSymbol(textSymbol);

        if (options && options.style) {
          if (options.style.r >= 0 && options.style.g >= 0 && options.style.b >= 0)
            textsyb.color = [options.style.r, options.style.g, options.style.b, options.style.a];
        }
        if (options && !isNaN(options.xOffset) && !isNaN(options.yOffset)) {
          textsyb.xoffset = options.xOffset;
          textsyb.yoffset = options.yOffset;
        }
        if (options && options.halostyle) {
          let color1 = [options.halostyle.r, options.halostyle.g, options.halostyle.b, options.halostyle.a];
          textsyb.haloColor = color1;
          textsyb.haloSize = options.halostyle.size || 1;

        }

        let txtgraphic = new Graphic({
          geometry: point,
          symbol: textsyb
        });
        //设置图标属性信息模板
        if (options && options.attributes)
          txtgraphic.attributes = options.attributes;

        txtGraphicsLayer.add(txtgraphic);

        if (options && options.maxScale)
          txtGraphicsLayer.maxScale = options.maxScale;
        if (options && options.minScale)
          txtGraphicsLayer.minScale = options.minScale;

        return txtgraphic;

      },
      //清除图标 layerid :图层id
      clearGraphics: function(layerid) {
        let myGraphicsLayer;
        //设置图形图层
        if (layerid) {
          myGraphicsLayer = this.appMap.findLayerById(layerid);
        } else
          myGraphicsLayer = this.appMap.findLayerById(drawLyrId);

        if (myGraphicsLayer)
          myGraphicsLayer.removeAll();
      },
      //激活画点，线，面工具 drawEndFunc 回调
      startDrawTool: function(drawEndFunc) {

      },
      //图形编辑
      activateGraphicEdit: function(graphic) {
        if (graphic) {

        }
      }
    });

    return declare("szdt.Map", null, {
      mapConfig: null,
      gisUrl: null,
      appMap: null,
      view: null,
      serveisName: null,
      mapType: null,
      drawApi: null,
      spatialReference: null,
      baseMapToggleType: null, //记录当前是影像图还是道路
      stamenTileLayer: null,
      vectorLayer: null,
      clickMapPoint: null,
      geometryEngine: null,
      clusterLayer: null,
      //op={
      //mapDivId :地图 div id
      constructor: function(mapType, op) {
        this.gisUrl = op.gisUrl;
        this.mapConfig = op;
        if (!mapType) {
          console.log("地图类型没设置");
          return;
        };

        this.mapType = mapType;
        this.serveisName = op.serveisName;

        if (!op.mapDivId) {
          console.log("未设置地图Div");
          return;
        };
        this.spatialReference = new SpatialReference({
          wkid: op.wkid ? op.wkid : 4326
        }); // 经伟度

        esriConfig.portalUrl = "https://szsz.com/";
        esriConfig.request.corsEnabledServers.push("szsz.com");
        if (op.token) {
          esriId.registerToken(op.token);
        }

        var centerAt = [114.05, 22.54];
        if (op.centerAt) {
          centerAt = {
            x: op.centerAt[0],
            y: op.centerAt[1],
            z: op.centerAt[2] ? op.centerAt[2] : 12000,
            spatialReference: this.spatialReference
          };
        }

        var zoomLevel = 13;
        if (op.zoomLevel) {
          zoomLevel = op.zoomLevel;
        }

        if (mapType == "3D") {
          let mapconfig = {};
          if (op.worldelevation) {
            mapconfig.ground = "world-elevation";
          }
          this.appMap = new Map(mapconfig); //加入高程 {ground: "world-elevation"}
          this.view = new SceneView({
            container: op.mapDivId,
            map: this.appMap,
            center: centerAt,
            zoom: zoomLevel
          });

          if (op && op.viewGround) {
            let self = this;
            //查看地表以下图层
            this.view.when(function() {
              self.appMap.ground.navigationConstraint = {
                type: "none"
              };
              self.appMap.ground.surfaceColor = "#fff";
              self.appMap.ground.opacity = 1;
            });
          }

        } else {
          this.appMap = new Map({
            //basemap: "satellite"
          });
          this.view = new MapView({
            container: op.mapDivId,
            map: this.appMap,
            zoom: zoomLevel,
            center: centerAt
          });
        }

        //图层上的点击事件
        let view = this.view;
        let self = this;
        this.drawApi = new map.Draw(this.appMap, this.view, this.spatialReference, mapType);
        this.view.on("click", function(event) {
          let result = view.hitTest(event.screenPoint);
          result.then(function(response) {
            if (response.results.length) {
              //let graphic = response.results.filter(function(result) {
              //	return result.graphic.layer === graphicsLayer;
              // });
              //console.log(graphic);
              self.clickMapPoint = response.results[0].mapPoint;
              if (response.results[0].graphic && response.results[0].graphic.layer.callBack) {
                response.results[0].event = event;
                response.results[0].graphic.layer.callBack(response.results[0]);
              }
            }
          });
        });

        this.geometryEngine = geometryEngine;
      },
      //设置坐标系 isLngLat=1: 经伟度,isLngLat=0:莫卡托
      setSpatialReference: function(wkid) {
        this.spatialReference = new SpatialReference({
          wkid: wkid
        }); // 经伟度

        this.drawApi.spatialReference = this.spatialReference;
      },
      getSpatialReference: function() {
        return this.spatialReference;
      },
      //添加一个图形图层
      newGraphicLayer: function(layerid) {
        if (layerid)
          return getGraphicsLayer(this.appMap, layerid);
      },
      // 图例列表
      showLayerListPnale: function(position) {
        let layerList = new LayerList({
          view: this.view,
        });
        this.view.ui.add(layerList, position);
      },
      //创建要素层
      //layerName:"图层名", options={ showLabels:true,opacity:0.5, maxScale :0,minScale :0, index:图层顺序
      // definitionExpression: "unitid=1" }
      addFeatureLayer: function(layerName, options) {

        let lyrid = getLayerServeridByName(this.mapConfig.layerInfo2D, layerName);
        if (!lyrid && lyrid != 0) {
          console.log("未找到图层信息!");
          return;
        }

        if (!this.gisUrl) {
          console.log("gis服务器地址未设置");
          return;
        }

        let url = this.gisUrl + this.serveisName + "/MapServer/" + lyrid;
        let layer = new FeatureLayer({
          url: url

        });

        if (options && options.maxScale)
          layer.maxScale = options.maxScale;
        if (options && options.minScale)
          layer.minScale = options.minScale;
        layer.id = options.id;
        //图层透明度
        layer.opacity = options && options.opacity || 1;
        if (options && options.index) {
          this.appMap.add(layer, options.index);
        } else {
          this.appMap.add(layer);
        }
        layer.callBack = options && options.callBack || null;

        if (options && options.elevationInfo) {
          layer.elevationInfo = {
            mode: "relative-to-ground"
          }; ///on-the-ground
          layer.featureReduction = {
            type: "selection"
          };
        }

        return layer;
      },
      addFeatureLayerWithClientSide: function(id, options) {
        let { features, fields, renderer } = options
        if (!renderer) {
          renderer = {
            type: "simple", // autocasts as new SimpleRenderer()
            symbol: {
              type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
              size: 6,
              color: "black",
              outline: { // autocasts as new SimpleLineSymbol()
                width: 0.5,
                color: "white"
              }
            }
          };
        }
        // xyToLngLat
        let graphics = features.map(feature => {
          feature["geometry"]["type"] = "point"
          let t = this.xyToLngLat(feature["geometry"]["x"], feature["geometry"]["y"])
          feature["geometry"]["x"] = t[0]
          feature["geometry"]["y"] = t[1]
          return feature
        })

        let layer = new FeatureLayer({
          id,
          source: graphics,
          fields,
          //spatialReference,
          objectIdField: "OBJECTID",
          //geometryType: "point",
          //type:"feature",
          renderer
        });
        if (options && options.index) {
          this.appMap.add(layer, options.index);
        } else {
          this.appMap.add(layer);
        }
        layer.callBack = options && options.callBack || null;
        return layer;
      },
      //添加聚合图层
      addClusterLayer: function(data, options) {
        const lyrid = options.layerid || "clusterlyrid";
        const labelColor = options.labelColor || "#fff"; //#000
        const distance = options.distance || 0.001;
        const labelOffset = options.labelOffset || -4;

        const graphicSym = {
          type: "simple-marker",
          color: [226, 119, 40],
          size: "10px",
          outline: { // autocasts as new SimpleLineSymbol()
            color: [255, 255, 255],
            width: 1
          }
        };

        const clusterRed = {
          type: "picture-marker",
          url: "./static/images/map/Red.png",
          width: "48px",
          height: "48px"
        };
        const clusterBlue = {
          type: "picture-marker",
          url: "./static/images/map/Blue.png",
          width: "64px",
          height: "64px"
        };
        const clusterGreen = {
          type: "picture-marker",
          url: "./static/images/map/Green.png",
          width: "64px",
          height: "64px"
        };

        let clusterLayer = new ClusterLayer({
          "view": this.view,
          "map": this.appMap,
          "distance": distance,
          "data": data,
          "id": lyrid,
          "labelColor": labelColor,
          "labelOffset": labelOffset,
          "graphicSym": graphicSym,
          "symbolArray": [clusterGreen, clusterBlue, clusterRed]

        });

        this.appMap.add(clusterLayer);

        this.clusterLayer = clusterLayer;
        this.clusterLayer.excuseClusterEvent();

        this.clusterLayer.callBack = function(e) {
          console.log(e);
          const data = clusterLayer.onClick(e.graphic);
        };

        if (options && options.maxScale)
          this.clusterLayer.maxScale = options.maxScale;
        if (options && options.minScale)
          this.clusterLayer.minScale = options.minScale;

        return this.clusterLayer;
      },
      //添加三维发布的模型场景
      addSceneLayer: function(options, clickCallback) {
        if (this.mapType == "2D") {
          console.log("当前地图不支持二维地图.");
          return;
        }

        if (!this.gisUrl) {
          console.log("gis服务器地址未设置");
          return;
        }


        let self = this;
        //点击事件
        if (clickCallback) {
          options.popupEnabled = true;
          /*options.popupTemplate = {
              title: "标题",
              content: function (feature) {
                  let ele = document.querySelector(".esri-popup");
                  ele.style.display = "none";
                  feature.mapPoint = self.clickMapPoint;
                  clickCallback(feature);
              }
          }*/
        }

        options.url = this.gisUrl + "Hosted/" + options.urlServerName + "/SceneServer";
        let layer = new SceneLayer(options);
        this.appMap.add(layer);
        return layer;
      },
      addLayerGL2D(g, popupTemplate) {
        let { mat3, vec2, vec3 } = matrix
        var CustomLayerView2D = BaseLayerViewGL2D.createSubclass({
          // Locations of the two vertex attributes that we use. They
          // will be bound to the shader program before linking.
          aPosition: 0,
          aOffset: 1,
          constructor: function() {
            // Geometrical transformations that must be recomputed
            // from scratch at every frame.
            this.transform = mat3.create();
            this.translationToCenter = vec2.create();
            this.screenTranslation = vec2.create();

            // Geometrical transformations whose only a few elements
            // must be updated per frame. Those elements are marked
            // with NaN.
            this.display = mat3.fromValues(NaN, 0, 0, 0, NaN, 0, -1, 1, 1);
            this.screenScaling = vec3.fromValues(NaN, NaN, 1);

            // Whether the vertex and index buffers need to be updated
            // due to a change in the layer data.
            this.needsUpdate = false;

            // We listen for changes to the graphics collection of the layer
            // and trigger the generation of new frames. A frame rendered while
            // `needsUpdate` is true may cause an update of the vertex and
            // index buffers.
            var requestUpdate = function() {
              this.needsUpdate = true;
              this.requestRender();
            }.bind(this);

            this.watcher = watchUtils.on(
              this,
              "layer.graphics",
              "change",
              requestUpdate,
              requestUpdate,
              requestUpdate
            );
          },

          attach: function() {
            var gl = this.context;
            // Define and compile shaders.
            var vertexSource =
              "precision highp float;" +
              "uniform mat3 u_transform;" +
              "uniform mat3 u_display;" +
              "attribute vec2 a_position;" +
              "attribute vec2 a_offset;" +
              "varying vec2 v_offset;" +
              "const float SIZE = 20.0;" +
              "void main() {" +
              "    gl_Position.xy = (u_display * (u_transform * vec3(a_position, 1.0) + vec3(a_offset * SIZE, 0.0))).xy;" +
              "    gl_Position.zw = vec2(0.0, 1.0);" +
              "    v_offset = a_offset;" +
              "}";
            // cos(l * PI) 半径l的圆超出则为0  =>透明度递减
            // cos(2.0 * PI * (l * 2.0 * N_RINGS - FREQ * u_current_time)) 波纹的三角函数
            var fragmentSource =
              "precision highp float;" +
              "uniform float u_current_time;" +
              "varying vec2 v_offset;" +
              "const float PI = 3.14159;" +
              "const float N_RINGS = 3.0;" +
              "const vec3 COLOR = vec3(0.05, 0.67, 0.73);" +
              "const float FREQ = 1.0;" +
              "void main() {" +
              "    float l = length(v_offset);" +
              "    float intensity;" +
            //"    float intensity = clamp(cos(l * PI), 0.0, 1.0) * clamp(cos(2.0 * PI * (l * 2.0 * N_RINGS - FREQ * u_current_time)), 0.0, 1.0);" +
              "    float t = abs(sin(u_current_time)) / 2.0;" +
              "    float y = abs(cos(u_current_time)) / 2.0;" +
              "    float f = sin(2.0*u_current_time);" +
              "    intensity = clamp(cos(l * PI), 0.2, 1.0);" +
              "    if(l > 0.5){" +
              "     gl_FragColor = vec4(COLOR*0.0 ,0.0);" +
              "    }else{" +
              "    if(l < 0.20){" +
              "       gl_FragColor = vec4(COLOR,1.0);" +
              "    }else{" +
              "    if(f > 0.0){" +
              "       if(l > t){" +
              "       gl_FragColor = vec4(COLOR*0.0,0.0);" +
              "       }else{" +
              "        gl_FragColor = vec4(COLOR*intensity,intensity);" +
              "       }" +
              "     }else{" +
            //   "      gl_FragColor = vec4(COLOR*0.0,0.0);" +
              "       if(l > y){" +
              "       gl_FragColor = vec4(COLOR*0.0,0.0);" +
              "       }else{" +
              "        gl_FragColor = vec4(COLOR*intensity,intensity);" +
              "       }" +
              "     }" +
              "     }" +
              "    }" +
            //   "    gl_FragColor = vec4(COLOR * intensity ,intensity);" +
              "}";

            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, vertexSource);
            gl.compileShader(vertexShader);
            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, fragmentSource);
            gl.compileShader(fragmentShader);

            // Create the shader program.
            this.program = gl.createProgram();
            gl.attachShader(this.program, vertexShader);
            gl.attachShader(this.program, fragmentShader);

            // Bind attributes.
            gl.bindAttribLocation(this.program, this.aPosition, "a_position");
            gl.bindAttribLocation(this.program, this.aOffset, "a_offset");

            // Link.
            gl.linkProgram(this.program);

            // Shader objects are not needed anymore.
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);

            // Retrieve uniform locations once and for all.
            this.uTransform = gl.getUniformLocation(
              this.program,
              "u_transform"
            );
            this.uDisplay = gl.getUniformLocation(this.program, "u_display");
            this.uCurrentTime = gl.getUniformLocation(
              this.program,
              "u_current_time"
            );

            // Create the vertex and index buffer. They are initially empty. We need to track the
            // size of the index buffer because we use indexed drawing.
            this.vertexBuffer = gl.createBuffer();
            this.indexBuffer = gl.createBuffer();

            // Number of indices in the index buffer.
            this.indexBufferSize = 0;

            // When certain conditions occur, we update the buffers and re-compute and re-encode
            // all the attributes. When buffer update occurs, we also take note of the current center
            // of the view state, and we reset a vector called `translationToCenter` to [0, 0], meaning that the
            // current center is the same as it was when the attributes were recomputed.
            this.centerAtLastUpdate = vec2.fromValues(
              this.view.state.center[0],
              this.view.state.center[1]
            );
          },
          // Called once a custom layer is removed from the map.layers collection and this layer view is destroyed.
          detach: function() {
            // Stop watching the `layer.graphics` collection.
            this.watcher.remove();

            var gl = this.context;

            // Delete buffers and programs.
            gl.deleteBuffer(this.vertexBuffer);
            gl.deleteBuffer(this.indexBuffer);
            gl.deleteProgram(this.program);
          },

          // Called every time a frame is rendered.
          render: function(renderParameters) {
            var gl = renderParameters.context;
            var state = renderParameters.state;

            // Update vertex positions. This may trigger an update of
            // the vertex coordinates contained in the vertex buffer.
            // There are three kinds of updates:
            //  - Modification of the layer.graphics collection ==> Buffer update
            //  - The view state becomes non-stationary ==> Only view update, no buffer update
            //  - The view state becomes stationary ==> Buffer update
            this.updatePositions(renderParameters);

            // If there is nothing to render we return.
            if (this.indexBufferSize === 0) {
              return;
            }

            // Update view `transform` matrix; it converts from map units to pixels.
            mat3.identity(this.transform);
            this.screenTranslation[0] = (state.pixelRatio * state.size[0]) / 2;
            this.screenTranslation[1] = (state.pixelRatio * state.size[1]) / 2;
            mat3.translate(
              this.transform,
              this.transform,
              this.screenTranslation
            );
            mat3.rotate(
              this.transform,
              this.transform,
              (Math.PI * state.rotation) / 180
            );
            this.screenScaling[0] = state.pixelRatio / state.resolution;
            this.screenScaling[1] = -state.pixelRatio / state.resolution;
            mat3.scale(this.transform, this.transform, this.screenScaling);
            mat3.translate(
              this.transform,
              this.transform,
              this.translationToCenter
            );

            // Update view `display` matrix; it converts from pixels to normalized device coordinates.
            this.display[0] = 2 / (state.pixelRatio * state.size[0]);
            this.display[4] = -2 / (state.pixelRatio * state.size[1]);
            // Draw.
            gl.useProgram(this.program);
            gl.uniformMatrix3fv(this.uTransform, false, this.transform);
            //this.display投影矩阵
            gl.uniformMatrix3fv(this.uDisplay, false, this.display);
            //单位s
            gl.uniform1f(this.uCurrentTime, performance.now() / 1000.0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            // 16 = BYTES_PER_ELEMENT 4BYTES * 4个元素
            //aPosition为 xy  aOffset为±0.5
            gl.vertexAttribPointer(this.aPosition, 2, gl.FLOAT, false, 16, 0);
            gl.vertexAttribPointer(this.aOffset, 2, gl.FLOAT, false, 16, 8);
            gl.enableVertexAttribArray(this.aPosition);
            gl.enableVertexAttribArray(this.aOffset);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.drawElements(
              gl.TRIANGLES,
              this.indexBufferSize,
              gl.UNSIGNED_SHORT,
              0
            );

            // Request new render because markers are animated.
            this.requestRender();
          },

          // Called by the map view or the popup view when hit testing is required.
          hitTest: function(x, y) {
            // The map view.
            var view = this.view;

            if (this.layer.graphics.length === 0) {
              // Nothing to do.
              return promiseUtils.resolve(null);
            }

            // Compute screen distance between each graphic and the test point.
            var distances = this.layer.graphics.map(function(graphic) {
              var graphicPoint = view.toScreen(graphic.geometry);
              return Math.sqrt(
                (graphicPoint.x - x) * (graphicPoint.x - x) +
                (graphicPoint.y - y) * (graphicPoint.y - y)
              );
            });

            // Find the minimum distance.
            var minIndex = 0;

            distances.forEach(function(distance, i) {
              if (distance < distances.getItemAt(minIndex)) {
                minIndex = i;
              }
            });

            var minDistance = distances.getItemAt(minIndex);

            // If the minimum distance is more than 35 pixel then nothing was hit.
            if (minDistance > 35) {
              return promiseUtils.resolve(null);
            }

            // Otherwise it is a hit; We set the layer as the source layer for the graphic
            // (required for the popup view to work) and we return a resolving promise to
            // the graphic.
            var graphic = this.layer.graphics.getItemAt(minIndex);
            graphic.sourceLayer = this.layer;
            return promiseUtils.resolve(graphic);
          },
          // Called internally from render().
          updatePositions: function(renderParameters) {
            var gl = renderParameters.context;
            var stationary = renderParameters.stationary;
            var state = renderParameters.state;

            // If we are not stationary we simply update the `translationToCenter` vector.
            if (!stationary) {
              vec2.sub(
                this.translationToCenter,
                this.centerAtLastUpdate,
                state.center
              );
              this.requestRender();
              return;
            }

            // If we are stationary, the `layer.graphics` collection has not changed, and
            // we are centered on the `centerAtLastUpdate`, we do nothing.
            if (
              !this.needsUpdate &&
              this.translationToCenter[0] === 0 &&
              this.translationToCenter[1] === 0
            ) {
              return;
            }

            // Otherwise, we record the new encoded center, which imply a reset of the `translationToCenter` vector,
            // we record the update time, and we proceed to update the buffers.
            this.centerAtLastUpdate.set(state.center);
            this.translationToCenter[0] = 0;
            this.translationToCenter[1] = 0;
            this.needsUpdate = false;

            var graphics = this.layer.graphics;

            // Generate vertex data.
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            var vertexData = new Float32Array(16 * graphics.length);

            var i = 0;
            graphics.forEach(
              function(graphic) {
                var point = graphic.geometry;

                // The (x, y) position is relative to the encoded center.
                var x = point.x - this.centerAtLastUpdate[0];
                var y = point.y - this.centerAtLastUpdate[1];

                vertexData[i * 16 + 0] = x;
                vertexData[i * 16 + 1] = y;
                vertexData[i * 16 + 2] = -0.5;
                vertexData[i * 16 + 3] = -0.5;
                vertexData[i * 16 + 4] = x;
                vertexData[i * 16 + 5] = y;
                vertexData[i * 16 + 6] = 0.5;
                vertexData[i * 16 + 7] = -0.5;
                vertexData[i * 16 + 8] = x;
                vertexData[i * 16 + 9] = y;
                vertexData[i * 16 + 10] = -0.5;
                vertexData[i * 16 + 11] = 0.5;
                vertexData[i * 16 + 12] = x;
                vertexData[i * 16 + 13] = y;
                vertexData[i * 16 + 14] = 0.5;
                vertexData[i * 16 + 15] = 0.5;

                ++i;
              }.bind(this)
            );

            gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

            // Generates index data.
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

            var indexData = new Uint16Array(6 * graphics.length);
            for (var i = 0; i < graphics.length; ++i) {
              indexData[i * 6 + 0] = i * 4 + 0;
              indexData[i * 6 + 1] = i * 4 + 1;
              indexData[i * 6 + 2] = i * 4 + 2;
              indexData[i * 6 + 3] = i * 4 + 1;
              indexData[i * 6 + 4] = i * 4 + 3;
              indexData[i * 6 + 5] = i * 4 + 2;
            }

            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);

            // Record number of indices.
            this.indexBufferSize = indexData.length;
          }
        })

        // Subclass the custom layer view from GraphicsLayer.
        var CustomLayer = GraphicsLayer.createSubclass({
          createLayerView: function(view) {
            // We only support MapView, so we only need to return a
            // custom layer view for the `2d` case.
            if (view.type === "2d") {
              return new CustomLayerView2D({
                view: view,
                layer: this
              });
            }
          }
        });

        // Create an instance of the custom layer with 4 initial graphics.
        let layer = new CustomLayer({
          popupTemplate,
          graphics: g
        });
        this.appMap.add(layer)
        console.log(layer)
        return layer
      },
      //添加三维发布的模型场景
      addIntegratedMeshLayer: function(options, clickCallback) {
        if (this.mapType == "2D") {
          console.log("当前地图不支持二维地图.");
          return;
        }

        if (!this.gisUrl) {
          console.log("gis服务器地址未设置");
          return;
        }
        let self = this;
        //点击事件
        if (clickCallback) {
          //options.popupEnabled = true;
          options.popupTemplate = {
            title: "标题",
            content: function(feature) {
              let ele = document.querySelector(".esri-popup");
              ele.style.display = "none";
              feature.mapPoint = self.clickMapPoint;
              clickCallback(feature);
            }
          }
        }
        options.url = this.gisUrl + "Hosted/" + options.urlServerName + "/SceneServer";
        let layer = new IntegratedMeshLayer(options);
        this.appMap.add(layer);
        return layer;
      },

      addTileLayer: function(url) {
        if (!this.gisUrl) {
          console.log("gis服务器地址未设置");
          return;
        }
        let layer = new TileLayer({
          url: url
        });
        this.appMap.add(layer);
        return layer;
      },
      addMapImageLayer: function(url) {
        if (!this.gisUrl) {
          console.log("gis服务器地址未设置");
          return;
        }
        let layer = new MapImageLayer({
          url: url
        });
        this.appMap.add(layer);
        return layer;
      },
      addElevationLayer: function(url) {
        if (this.mapType == "2D") {
          console.log("当前地图不支持二维地图.");
          return;
        }
        if (!this.gisUrl) {
          console.log("gis服务器地址未设置");
          return;
        }
        let layer = new ElevationLayer({
          url: url
        });
        this.appMap.ground.layers.add(layer);
        return layer;
      },
      //Create GroupLayer
      createGroupLayer: function(arrLayer, title = 'new group') {
        let graphicGroupLayer = new GroupLayer({
          title: title,
          visible: true,
          visibilityMode: "independent",
        });
        graphicGroupLayer.addMany(arrLayer);
        return graphicGroupLayer
      },
      //Create LayerList
      addLayerList: function(containerID, funActions) {
        //console.log("-------");
        //console.log(this.view);
        let layerlist = new LayerList({
          view: this.view,
          listItemCreatedFunction: funActions,
          container: containerID
        });
        this.view.ui.add(layerlist);
        return layerlist;
      },
      //Create DistanceMeasurement2D
      addDistanceMeasure2D: function(containerID) {
        let dismeasurement2d = new DistanceMeasurement2D({
          view: this.view,
          container: containerID
        });
        this.view.ui.add(dismeasurement2d);
        return dismeasurement2d;
      },
      //Create AreaMeasurement2D
      addAreaMeasure2D: function(containerID) {
        let areameasurement2d = new AreaMeasurement2D({
          view: this.view,
          container: containerID
        });
        this.view.ui.add(areameasurement2d);
        return areameasurement2d;
      }, //Create DistanceMeasurement3D
      addDistanceMeasure3D: function(containerID) {
        let dismeasurement3d = new DirectLineMeasurement3D({
          view: this.view,
          container: containerID
        });
        this.view.ui.add(dismeasurement3d);
        return dismeasurement3d;
      },
      //Create AreaMeasurement3D
      addAreaMeasure3D: function(containerID) {
        let areameasurement3d = new AreaMeasurement3D({
          view: this.view,
          container: containerID
        });
        this.view.ui.add(areameasurement3d);
        return areameasurement3d;
      },
      //Create Slice Tool
      addSlice: function(containerID) {
        let slicetool = new Slice({
          view: this.view,
          container: containerID
        });
        this.view.ui.add(slicetool);
        return slicetool;
      },
      addScaleBar: function(position) {
        let scaleBar = new ScaleBar({
          view: this.view, // mapView  
          unit: "dual" // The scale bar displays both metric and non-metric units.
        });
        // Add the widget to the bottom left corner of the view
        this.view.ui.add(scaleBar, {
          position: position
        });
      },

      addEchartsLayer(echarts, series) {
        this.view.on('layerview-create', () => {
          let chart = new EchartsLayer(this.view, echarts);
          var option = {
            series: series
          };
          chart.setChartOption(option);
        })
      },

      //天地图底图
      addTDBaseMap: function(baseMapType, basemapToggleDiv, offline) {

        this.baseMapToggleType = baseMapType;
        if (offline) {
          this.stamenTileLayer = new TDmapOfflineLayer(this.appMap, "image");
          this.vectorLayer = new TDmapOfflineLayer(this.appMap, "vector");
        } else {
          this.stamenTileLayer = new TDmapLayer(this.appMap, "image");
          this.vectorLayer = new TDmapLayer(this.appMap, "vector");
        }

        if (this.baseMapToggleType == "image") {
          this.stamenTileLayer.setVisibility(true);
          this.vectorLayer.setVisibility(false);
        } else {
          this.stamenTileLayer.setVisibility(false);
          this.vectorLayer.setVisibility(true);
        }


        let self = this;
        let toggle = document.querySelector("#" + basemapToggleDiv);
        let aSpan = document.querySelector("#" + basemapToggleDiv + " span");
        if (toggle) {
          toggle.addEventListener('click', function(e) {
            if (self.baseMapToggleType == "image") {
              self.stamenTileLayer.setVisibility(false);
              self.vectorLayer.setVisibility(true);
              self.baseMapToggleType = "vector";
              aSpan.innerHTML = "道路图";
              toggle.style.backgroundImage = "url('./static/images/map/streets.jpg')";
            } else {
              self.stamenTileLayer.setVisibility(true);
              self.vectorLayer.setVisibility(false);
              self.baseMapToggleType = "image";
              aSpan.innerHTML = "影像图";
              toggle.style.backgroundImage = "url('./static/images/map/2D.png')";
            }
          })
        }
      },
      //添加矢量地图 url:矢量图地址 
      addDynamicMap: function(url) {

      },
      //添加图形
      addGraphic: function(layerid, geometry, symbol) {
        //let graphicsLayer = this.appMap.findLayerById(layerid);
        let graphicsLayer = getGraphicsLayer(this.appMap, layerid);
        if (!graphicsLayer) {
          console.log("找不到图层:" + layerid);
          return;
        }
        const graphic = new Graphic({
          geometry: geometry,
          symbol: symbol
        });
        graphicsLayer.add(graphic);
        return graphic;
      },
      setBaseMapOpacity: function(value) {
        this.stamenTileLayer && this.stamenTileLayer.setOpacity(value);
        this.vectorLayer && this.vectorLayer.setOpacity(value);
      },
      //创建画图工具
      creatSketchViewModel: function(pointSymbol, polylineSymbol, polygonSymbol, layerid, index) {
        if (this.mapType == "3D") {
          console.log("当前地图不支持三维地图.");
          return;
        }
        if (!layerid) {
          layerid = "drawLayer";
        }
        let view = this.view;
        let graphicsLayer = getGraphicsLayer(this.appMap, layerid, index);
        let sketchViewModel = new SketchViewModel({
          view: view,
          layer: graphicsLayer,
          updateOnGraphicClick: false,
          pointSymbol: pointSymbol,
          polylineSymbol: polylineSymbol,
          polygonSymbol: polygonSymbol
        });
        return sketchViewModel;
      },
      //通过过坐标定位
      zoomTobyXY: function(x, y, z, options) {

        if (this.mapType == "3D") //三维
        {
          let target = {
            position: {
              x: x,
              y: y,
              z: z,
              spatialReference: this.spatialReference
            },
            heading: options && options.targetheading || 0,
            tilt: options && options.targettitl || 0
          };
          let options1 = {
            speedFactor: options && options.speedFactor || 0.3,
            easing: options && options.easing || "out-quint"
          };
          this.view.goTo(target, options1);
        } else {
          let zoom = 15;
          if (options && options.minZoom) {
            zoom = minZoom;
          }
          this.view.center = [x, y];
          this.view.zoom = zoom;
        }
      },
      //莫卡托转经伟度
      xyToLngLat: function(x, y) {
        let _pLngLat = webMercatorUtils.xyToLngLat(x, y);
        return _pLngLat;
      },
      //经伟度转莫卡托
      lngLatToXY: function(lng, lat) {
        let _pLngLat = webMercatorUtils.lngLatToXY(lng, lat);
        return _pLngLat;
      },
      //火星==>百度
      mars2Badiu: function(ggLngLat) {
        let x = ggLngLat.lng,
          y = ggLngLat.lat;
        let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
        let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
        let bd_lng = z * Math.cos(theta) + 0.0065;
        let bd_lat = z * Math.sin(theta) + 0.006;

        return {
          lng: bd_lng,
          lat: bd_lat
        }
      },
      //百度==>火星
      baidu2Mars: function(bdLngLat) {
        let x = bdLngLat.lng - 0.0065,
          y = bdLngLat.lat - 0.006;
        let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
        let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
        gg_lng = z * Math.cos(theta);
        gg_lat = z * Math.sin(theta);

        return {
          lng: gg_lng,
          lat: gg_lat
        }
      },
      /**
       * WGS84转GCj02
       * @param lng
       * @param lat
       * @returns {*[]}
       */
      wgs84togcj02: function(lng, lat) {
        if (out_of_china(lng, lat)) {
          return [lng, lat]
        } else {
          var dlat = transformlat(lng - 105.0, lat - 35.0);
          var dlng = transformlng(lng - 105.0, lat - 35.0);
          var radlat = lat / 180.0 * pi;
          var magic = Math.sin(radlat);
          magic = 1 - ee * magic * magic;
          var sqrtmagic = Math.sqrt(magic);
          dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * pi);
          dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * pi);
          var mglat = lat + dlat;
          var mglng = lng + dlng;
          return [mglng, mglat]
        }
      },

      /**
       * GCJ02 转换为 WGS84
       * @param lng
       * @param lat
       * @returns {*[]}
       */
      gcj02towgs84: function(lng, lat) {
        if (out_of_china(lng, lat)) {
          return [lng, lat]
        } else {
          var dlat = transformlat(lng - 105.0, lat - 35.0);
          var dlng = transformlng(lng - 105.0, lat - 35.0);
          var radlat = lat / 180.0 * pi;
          var magic = Math.sin(radlat);
          magic = 1 - ee * magic * magic;
          var sqrtmagic = Math.sqrt(magic);
          dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * pi);
          dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * pi);
          mglat = lat + dlat;
          mglng = lng + dlng;
          return [lng * 2 - mglng, lat * 2 - mglat]
        }
      },

      //通过经纬度查询两点间距离
      getDistance: function(lat1, lng1, lat2, lng2) {

        let EARTH_RADIUS = 6378.137; //赤道半径(单位km)  
        function rad(d) {
          return d * Math.PI / 180.0;
        };


        let radLat1 = rad(lat1);
        let radLat2 = rad(lat2);
        let a = radLat1 - radLat2;
        let b = rad(lng1) - rad(lng2);
        let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
          Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * EARTH_RADIUS;
        s = Math.round(s * 10000) / 10000;
        return s;
      },
      //获取中心点points:[[114, 24],[114,23].....]
      getCenterPoint: function(points) {


        if (!points) {
          console.log("至少需要1个点坐标!");
          return;
        }

        let centerPoint = {
          x: 0,
          y: 0
        };

        if (points.length == 1) {
          centerPoint = {
            x: points[0][0],
            y: points[0][1]
          }
        } else if (points.length === 2) {

          let x = ((points[0][0] + points[0][1]) / 2).toFixed(6);
          let y = ((points[1][0] + points[1][1]) / 2).toFixed(6);

          centerPoint = {
            x: x,
            y: y
          };
        } else if (points.length > 2) {
          let polygon = new Polygon(points);
          polygon.setSpatialReference(this.spatialReference);

          centerPoint = polygon.getExtent().getCenter();
        } else {

          console.log("error:" + points);
        }
        return centerPoint;
      },
      //判断点是否在多边形内
      isInPolygon: function(checkPoint, polygonPoints) {
        let counter = 0;
        let i;
        let xinters;
        let p1, p2;
        let pointCount = polygonPoints.length;
        p1 = polygonPoints[0];

        for (i = 1; i <= pointCount; i++) {
          p2 = polygonPoints[i % pointCount];
          if (
            checkPoint[0] > Math.min(p1[0], p2[0]) &&
            checkPoint[0] <= Math.max(p1[0], p2[0])
          ) {
            if (checkPoint[1] <= Math.max(p1[1], p2[1])) {
              if (p1[0] != p2[0]) {
                xinters =
                  (checkPoint[0] - p1[0]) *
                  (p2[1] - p1[1]) /
                  (p2[0] - p1[0]) +
                  p1[1];
                if (p1[1] == p2[1] || checkPoint[1] <= xinters) {
                  counter++;
                }
              }
            }
          }
          p1 = p2;
        }
        if (counter % 2 == 0) {
          return false;
        } else {
          return true;
        }
      },
      //获取不规则多边形重心点(经纬度)
      getCenterOfGravityPoint: function(mPoints) {
        let area = 0.0; //多边形面积
        let Gx = 0.0,
          Gy = 0.0; // 重心的x、y
        for (let i = 1; i < mPoints.length; i++) {

          let iLat = mPoints[i % mPoints.length].y;
          let iLng = mPoints[i % mPoints.length].x;

          let nextLat = mPoints[i - 1].y;
          let nextLng = mPoints[i - 1].x;
          let temp = (iLat * nextLng - iLng * nextLat) / 2.0;
          area += temp;
          Gx += temp * (iLat + nextLat) / 3.0;
          Gy += temp * (iLng + nextLng) / 3.0;
        }

        Gx = Gx / area;
        Gy = Gy / area;
        return [Gy, Gx];
      }

    });

    function transformlat(lng, lat) {
      var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
      ret += (20.0 * Math.sin(6.0 * lng * pi) + 20.0 * Math.sin(2.0 * lng * pi)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(lat * pi) + 40.0 * Math.sin(lat / 3.0 * pi)) * 2.0 / 3.0;
      ret += (160.0 * Math.sin(lat / 12.0 * pi) + 320 * Math.sin(lat * pi / 30.0)) * 2.0 / 3.0;
      return ret
    }

    function transformlng(lng, lat) {
      var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
      ret += (20.0 * Math.sin(6.0 * lng * pi) + 20.0 * Math.sin(2.0 * lng * pi)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(lng * pi) + 40.0 * Math.sin(lng / 3.0 * pi)) * 2.0 / 3.0;
      ret += (150.0 * Math.sin(lng / 12.0 * pi) + 300.0 * Math.sin(lng / 30.0 * pi)) * 2.0 / 3.0;
      return ret
    }

    /**
     * 判断是否在国内，不在国内则不做偏移
     * @param lng
     * @param lat
     * @returns {boolean}
     */
    function out_of_china(lng, lat) {
      return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
    }

    //根据图层名字获取serverid
    function getLayerServeridByName(layerInfos, lyrName) {
      let serverid;
      for (i = 0; i < layerInfos.length; i++) {
        let item = layerInfos[i];
        if (item.layerName == lyrName) {
          serverid = item.serverId;
          return serverid;
        }
      }
      return serverid;
    }
    //设置画点线面的图层
    function getGraphicsLayer(m_map, id, index) {
      //设置图形图层
      let layerid = drawLyrId;
      if (id)
        layerid = id

      let myGraphicsLayer = m_map.findLayerById(layerid);
      if (!myGraphicsLayer) {
        myGraphicsLayer = new GraphicsLayer({
          id: layerid
        });
        myGraphicsLayer.listMode = "hide";
        graphicsLayers.push(myGraphicsLayer);
        if (index >= 0) {
          m_map.add(myGraphicsLayer, index);
        } else
          m_map.add(myGraphicsLayer);
      }

      return myGraphicsLayer;
    }

    function newGuid() {

      let s4 = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      return (s4 + s4 + "-" + s4 + "-" + s4 + "-" + s4 + "-" + s4 + s4 + s4);
    }
  }
);