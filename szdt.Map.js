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
    "szdtmap/TDmapLayer",
    "esri/widgets/LayerList",
    "esri/layers/SceneLayer",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/geometry/ScreenPoint",
    "esri/symbols/PictureMarkerSymbol",
    "esri/widgets/BasemapToggle",
    "esri/geometry/SpatialReference",
    "dojo/domReady!"
], function (declare, esriConfig, Map, MapView, SceneView, GraphicsLayer, FeatureLayer, TDmapLayer, LayerList, SceneLayer, Graphic, Point, ScreenPoint, PictureMarkerSymbol, BasemapToggle, SpatialReference) {
    var graphicsLayers = [];
    var drawLyrId = "drawLyrId";

    var layerInfos = []; //图层信息
    var pi = 3.14159265358979324;
    var x_pi = 3.14159265358979324 * 3000.0 / 180.0;

    var agstoken = "";


    declare("map.Draw", null,
        {
            appMap: null,
            drawTool: null,
            mapType: null,//地图二三维类型
            editTool: null,
            spatialReference: null,
            elementInfos: [],
            constructor: function (map, spatialReference, mapType) {

                this.spatialReference = spatialReference;
                this.mapType = mapType;
                if (!map) {
                    console.log("未设置地图对象!");
                    return;
                }
                this.appMap = map;
            },

            //画一个图标点
            //            "x": locationPoint.x, 不为空
            //            "y": locationPoint.y,  不为空
            //var options = {
            //        layerid:图形图层id
            //            "symbolUrl" 付号 //可为空
            //             symbolStyle :{width:24,height:24, angle:0,r:0,g:0,b:0,a:1,xOffset,yOffset }
            //            "callBack" 图标的单击事件 //可为空
            //            "attributes" 图标的属性值，可为空
            //             maxScale:0
            //             minScale:0
            //        };
            drawPoint: function (x, y, z, options) {
                if (x == "" || y == "" || isNaN(x) || isNaN(y)) {
                    console.log("坐标值未设置!");
                    return;
                }

                var myGraphicsLayer = getGraphicsLayer(this.appMap, options && options.layerid, options && options.index);
                //默认
                var symbol = {
                    type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                    color: [226, 119, 40],
                    outline: { // autocasts as new SimpleLineSymbol()
                        color: [255, 255, 255],
                        width: 2
                    }
                };
                //设置图片图标
                if (options && options.symbolUrl) {
                    var symbol = {
                        type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
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
                var point = { type: "point", longitude: x, latitude: y, spatialReference: this.spatialReference };
                if (z && !isNaN(z)) {
                    point = { type: "point", x: x, y: y, z: z, spatialReference: this.spatialReference };
                }

                var graphic = new Graphic({ geometry: point, symbol: symbol });
                if (options && options.attributes)
                    graphic.attributes = options.attributes;


                myGraphicsLayer.add(graphic);
            },

            drawLine: function (points, options) {


            },
            drawPolygon: function (points, option) {


            },
            //画文本信息 title :text, x:0,y:0, options={ layerid:layerid, style:{ size:14,r:255,g:0,b:0,xOffset:0,yOffset:0},halostyle:{size:1,r:255,g:0,b:0}  }
            drawText: function (text, x, y, options) {


            },
            //清除图标 layerid :图层id
            clearGraphics: function (layerid) {
                var myGraphicsLayer;
                //设置图形图层
                if (layerid) {
                    myGraphicsLayer = this.appMap.findLayerById(layerid);
                }
                else
                    myGraphicsLayer = this.appMap.findLayerById(drawLyrId);

                if (myGraphicsLayer)
                    myGraphicsLayer.removeAll();
            },
            //激活画点，线，面工具 drawEndFunc 回调
            startDrawTool: function (drawEndFunc) {

            },
            //图形编辑
            activateGraphicEdit: function (graphic) {
                if (graphic) {

                }
            }
        });

    return declare("szdt.Map", null,
        {
            gisUrl: null,
            appMap: null,
            view: null,
            layerInfo: null,
            serveisName: null,
            mapType: null,
            drawApi: null,
            spatialReference: null,
            baseMapToggleType: null, //记录当前是影像图还是道路
            stamenTileLayer: null,
            vectorLayer: null,
            //op={
            //mapDivId :地图 div id
            constructor: function (mapType, op) {
                this.gisUrl = op.gisUrl;

                if (!mapType) {
                    console.log("地图类型没设置");
                    return;
                };

                this.mapType = mapType;
                this.serveisName = op.serveisName;

                if (op.ArcgisToken) {
                    agstoken = op.ArcgisToken;
                }
                this.layerInfo = op.layerInfo;


                if (!op.mapDivId) {
                    console.log("未设置地图Div");
                    return;
                };

                this.spatialReference = new SpatialReference({ wkid: 4326 }); // 经伟度
                if (op.spatialReference == 0) {
                    this.spatialReference = new SpatialReference({ wkid: 102113 }); // 莫卡托
                }

                esriConfig.portalUrl = "https://szsz.com/";
                esriConfig.request.corsEnabledServers.push("szsz.com");

                if (mapType == "3D") {
                    var mapconfig = {};
                    if (op.worldelevation) {
                        mapconfig.ground = "world-elevation";
                    }
                    this.appMap = new Map(mapconfig);//加入高程 {ground: "world-elevation"}
                    this.view = new SceneView({
                        container: op.mapDivId,
                        map: this.appMap
                        // center: [114.07,22.62],
                        // zoom: 3
                    });

                    if (op && op.viewGround) {
                        var self = this;
                        //查看地表以下图层
                        this.view.when(function () {
                            self.appMap.ground.navigationConstraint = { type: "none" };
                            self.appMap.ground.surfaceColor = "#fff";
                            self.appMap.ground.opacity = 1;
                        });
                    }

                }
                else {
                    this.appMap = new Map({
                        //basemap: "osm"
                    });
                    this.view = new MapView({
                        container: op.mapDivId,
                        map: this.appMap,
                        //zoom: 8,
                        //center: [114, 30] 
                    });
                }

                //图层上的点击事件
                var view = this.view;
                this.drawApi = new map.Draw(this.appMap, this.spatialReference, mapType);
                this.view.on("click", function (event) {
                    var result = view.hitTest(event.screenPoint);
                    result.then(function (response) {
                        if (response.results.length) {
                            //var graphic = response.results.filter(function(result) {
                            //	return result.graphic.layer === graphicsLayer;
                            // });
                            //console.log(graphic);
                            if (response.results[0].graphic && response.results[0].graphic.layer.callBack) {
                                response.results[0].graphic.layer.callBack(response.results[0]);
                            }
                        }
                    });
                });
            },
            //设置坐标系 isLngLat=1: 经伟度,isLngLat=0:莫卡托
            setSpatialReference: function (isLngLat) {
                if (isLngLat)
                    this.spatialReference = new SpatialReference(4326);
                else
                    this.spatialReference = new SpatialReference(102113); //102113, 102100, 3857.

                this.drawApi.spatialReference = this.spatialReference;
            },
            getSpatialReference: function () {
                return this.spatialReference;
            },
            //添加一个图形图层
            newGraphicLayer: function (layerid) {
                if (layerid)
                    return getGraphicsLayer(this.appMap, layerid);
            },
            // 图例列表
            showLayerListPnale: function (position) {
                var layerList = new LayerList({
                    view: this.view,
                });
                this.view.ui.add(layerList, position);
            },
            //创建要素层
            //layerName:"图层名", options={ showLabels:true,opacity:0.5, maxScale :0,minScale :0, index:图层顺序
            // definitionExpression: "unitid=1" }
            addFeatureLayer: function (layerName, options) {

                var lyrid = getLayerServeridByName(this.layerInfo, layerName);
                if (!lyrid && lyrid != 0) {
                    console.log("未找到图层信息!");
                    return;
                }

                if (!this.gisUrl) {
                    console.log("gis服务器地址未设置");
                    return;
                }

                var url = this.gisUrl + this.serveisName + "/FeatureServer/" + lyrid + agstoken;
                var layer = new FeatureLayer({
                    url: url

                });

                if (options && options.maxScale)
                    layer.maxScale = options.maxScale;
                if (options && options.minScale)
                    layer.minScale = options.minScale;

                //图层透明度
                layer.opacity = options && options.opacity || 1;
                if (options && options.index) {
                    this.appMap.add(layer, options.index);
                }
                else {
                    this.appMap.add(layer);
                }
                layer.callBack = options && options.callBack || null;

                layer.elevationInfo = { mode: "relative-to-ground" }; ///on-the-ground
                layer.featureReduction = { type: "selection" };

                return layer;
            },
            //添加三维发布的模型场景
            addSceneLayer: function (options, clickCallback) {
                if (this.mapType == "2D") {
                    console.log("当前地图不支三维场景.");
                    return;
                }

                if (!this.gisUrl) {
                    console.log("gis服务器地址未设置");
                    return;
                }

                options.popupEnabled = false;
                if (options.popupEnabled) {
                    options.popupEnabled = true;
                }
                //点击事件
                if (clickCallback) {
                    options.popupEnabled = true;
                    options.popupTemplate = {
                        title: "标题",
                        content: function (feature) {

                            var ele = document.querySelector(".esri-popup");
                            ele.style.display = "none";
                            clickCallback(feature);
                        }
                    }
                }

                options.url = this.gisUrl + "Hosted/" + options.urlServerName + "/SceneServer";
                var layer = new SceneLayer(options);
                this.appMap.add(layer);

                return layer;
            },
            //天地图底图
            addTDBaseMap: function (baseMapType, basemapToggleDiv) {

                this.baseMapToggleType = baseMapType;

                this.stamenTileLayer = new TDmapLayer(this.appMap, "image");
                this.vectorLayer = new TDmapLayer(this.appMap, "vector");

                if (this.baseMapToggleType == "image") {
                    this.stamenTileLayer.setVisibility(true);
                    this.vectorLayer.setVisibility(false);
                }
                else {
                    this.stamenTileLayer.setVisibility(false);
                    this.vectorLayer.setVisibility(true);
                }


                var self = this;
                var toggle = document.querySelector("#" + basemapToggleDiv);
                toggle.addEventListener('click', function (e) {
                    if (self.baseMapToggleType == "image") {
                        self.stamenTileLayer.setVisibility(false);
                        self.vectorLayer.setVisibility(true);
                        self.baseMapToggleType = "vector";
                        toggle.innerHTML = "道路图";
                        toggle.style.backgroundImage = "url('/static/images/map/streets.jpg')";
                    }
                    else {
                        self.stamenTileLayer.setVisibility(true);
                        self.vectorLayer.setVisibility(false);
                        self.baseMapToggleType = "image";
                        toggle.innerHTML = "影像图";
                        toggle.style.backgroundImage = "url('/static/images/map/2D.png')";
                    }
                })

            },
            //添加矢量地图 url:矢量图地址 
            addDynamicMap: function (url) {

            },

            setBaseMapOpacity: function (value) {
                this.stamenTileLayer.setOpacity(value);
                this.vectorLayer.setOpacity(value);
            },

            //通过过坐标定位
            zoomTobyXY: function (x, y, z, options) {

                if (this.mapType == "3D") //三维
                {
                    var target = {
                        position: {
                            x: x,
                            y: y,
                            z: z,
                            spatialReference: this.spatialReference
                        },
                        heading: options && options.targetheading || 0,
                        tilt: options && options.targettitl || 0
                    };
                    var options = {
                        speedFactor: options && options.speedFactor || 0.3,
                        easing: options && options.easing || "out-quint"
                    };
                    this.view.goTo(target, options);
                }
                else {
                    var zoom = 15;
                    if (minZoom) {
                        zoom = minZoom;
                    }
                    this.view.center = [x, y];
                    this.view.zoom = zoom;
                }
            },
            //莫卡托转经伟度
            xyToLngLat: function (x, y) {
                var _pLngLat = webMercatorUtils.xyToLngLat(x, y);
                return _pLngLat;
            },
            //莫卡托转经伟度
            lngLatToXY: function (lng, lat) {
                var _pLngLat = webMercatorUtils.lngLatToXY(lng, lat);
                return _pLngLat;
            },
            //火星==>百度
            mars2Badiu: function (ggLngLat) {
                var x = ggLngLat.lng, y = ggLngLat.lat;
                var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
                var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
                var bd_lng = z * Math.cos(theta) + 0.0065;
                var bd_lat = z * Math.sin(theta) + 0.006;

                return { lng: bd_lng, lat: bd_lat }
            },
            //百度==>火星
            baidu2Mars: function (bdLngLat) {
                var x = bdLngLat.lng - 0.0065, y = bdLngLat.lat - 0.006;
                var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
                var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
                gg_lng = z * Math.cos(theta);
                gg_lat = z * Math.sin(theta);

                return { lng: gg_lng, lat: gg_lat }
            },
            //通过经纬度查询两点间距离
            getDistance: function (lat1, lng1, lat2, lng2) {

                var EARTH_RADIUS = 6378.137;//赤道半径(单位km)  
                function rad(d) {
                    return d * Math.PI / 180.0;
                };


                var radLat1 = rad(lat1);
                var radLat2 = rad(lat2);
                var a = radLat1 - radLat2;
                var b = rad(lng1) - rad(lng2);
                var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
                    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
                s = s * EARTH_RADIUS;
                s = Math.round(s * 10000) / 10000;
                return s;
            },
            //获取中心点points:[[114, 24],[114,23].....]
            getCenterPoint: function (points) {


                if (!points) {
                    console.log("至少需要1个点坐标!");
                    return;
                }

                var centerPoint = { x: 0, y: 0 };

                if (points.length == 1) {
                    centerPoint = { x: points[0][0], y: points[0][1] }
                }
                else if (points.length === 2) {

                    var x = ((points[0][0] + points[0][1]) / 2).toFixed(6);
                    var y = ((points[1][0] + points[1][1]) / 2).toFixed(6);

                    centerPoint = { x: x, y: y };
                }
                else if (points.length > 2) {
                    var polygon = new Polygon(points);
                    polygon.setSpatialReference(this.spatialReference);

                    centerPoint = polygon.getExtent().getCenter();
                }
                else {

                    console.log("error:" + points);
                }
                return centerPoint;
            },
            //判断点是否在多边形内
            isInPolygon(checkPoint, polygonPoints) {
                var counter = 0;
                var i;
                var xinters;
                var p1, p2;
                var pointCount = polygonPoints.length;
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
            getCenterOfGravityPoint: function (mPoints) {
                var area = 0.0;//多边形面积
                var Gx = 0.0, Gy = 0.0;// 重心的x、y
                for (var i = 1; i < mPoints.length; i++) {

                    var iLat = mPoints[i % mPoints.length].y;
                    var iLng = mPoints[i % mPoints.length].x;

                    var nextLat = mPoints[i - 1].y;
                    var nextLng = mPoints[i - 1].x;
                    var temp = (iLat * nextLng - iLng * nextLat) / 2.0;
                    area += temp;
                    Gx += temp * (iLat + nextLat) / 3.0;
                    Gy += temp * (iLng + nextLng) / 3.0;
                }

                Gx = Gx / area;
                Gy = Gy / area;
                return [Gy, Gx];
            }

        });


    //根据图层名字获取serverid
    function getLayerServeridByName(layerInfos, lyrName) {
        var serverid;
        for (i = 0; i < layerInfos.length - 1; i++) {
            var item = layerInfos[i];
            if (item.layerName == lyrName) {
                serverid = item.serverId;
                return serverid;
            }
        }
        return serverid;
    }
    //设置画点线面的图层
    function getGraphicsLayer(m_map, id, index) {
        var myGraphicsLayer;
        //设置图形图层
        var layerid = drawLyrId;
        if (id)
            layerid = id

        var myGraphicsLayer = m_map.findLayerById(layerid);
        if (!myGraphicsLayer) {
            myGraphicsLayer = new GraphicsLayer({ id: layerid });
            myGraphicsLayer.listMode = "hide";
            graphicsLayers.push(myGraphicsLayer);
            if (index >= 0) {
                m_map.add(myGraphicsLayer, index);
            }
            else
                m_map.add(myGraphicsLayer);
        }

        return myGraphicsLayer;
    }

    function newGuid() {

        var s4 = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        return (s4 + s4 + "-" + s4 + "-" + s4 + "-" + s4 + "-" + s4 + s4 + s4);
    }
}
);

