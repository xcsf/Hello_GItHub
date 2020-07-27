

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "esri/config",
    "esri/request",
    "esri/Color",
    "esri/layers/BaseTileLayer",
    "esri/geometry/Extent",
    "esri/geometry/SpatialReference",
    "esri/layers/support/TileInfo",
    "esri/geometry/Point"], function (declare, lang, esriConfig, esriRequest, Color, BaseTileLayer, Extent, SpatialReference, TileInfo, point) {
        // *******************************************************  
        // Custom tile layer class code  
        // Create a subclass of BaseTileLayer  
        // *******************************************************  
        return declare("OrthophotoLayer", null,
            {
                map: null,
                type: null,
                version: null,
                stamenTileLayer: null,
                constructor: function (map, type, version) {

                    this.map = map;
                    this.type = type;
                    this.version = version;
                    this.stamenTileLayer;
                    var TintLayer = BaseTileLayer.createSubclass({
                        properties: {
                            urlTemplate: null,
                            tint: {
                                value: null,
                                type: Color
                            }
                        },
                        getDefaults: function (a) {
                            this.spatialReference = new SpatialReference({
                                wkid: 102113
                            });
                            var b = new Extent(-20037508.348286, -20037508.342787, 20037508.348286, 20037508.342787, this.spatialReference);

                            return lang.mixin(this.inherited(arguments), {
                                fullExtent: b,
                                tileInfo: new TileInfo({
                                    size: 256,
                                    dpi: 96,
                                    format: "PNG8",
                                    compressionQuality: 0,
                                    origin: new point({
                                        x: -2.0037508342787E7,
                                        y: 2.0037508342787E7,
                                        spatialReference: this.spatialReference
                                    }),
                                    spatialReference: this.spatialReference,
                                    lods: [
                                        { level: 0, resolution: 156543.03, scale: 591657527.59 },
                                        { level: 1, resolution: 78271.52, scale: 295828763.80 },
                                        { level: 2, resolution: 39135.7584820001, scale: 147914381.897889 },
                                        { level: 3, resolution: 19567.8792409999, scale: 73957190.948944 },
                                        { level: 4, resolution: 9783.93962049996, scale: 36978595.474472 },
                                        { level: 5, resolution: 4891.96981024998, scale: 18489297.737236 },
                                        { level: 6, resolution: 2445.98490512499, scale: 9244648.868618 },
                                        { level: 7, resolution: 1222.99245256249, scale: 4622324.434309 },
                                        { level: 8, resolution: 611.49622628138, scale: 2311162.217155 },
                                        { level: 9, resolution: 305.748113140558, scale: 1155581.108577 },
                                        { level: 10, resolution: 152.874056570411, scale: 577790.554289 },
                                        { level: 11, resolution: 76.4370282850732, scale: 288895.277144 },
                                        { level: 12, resolution: 38.2185141425366, scale: 144447.638572 },
                                        { level: 13, resolution: 19.1092570712683, scale: 72223.819286 },
                                        { level: 14, resolution: 9.55462853563415, scale: 36111.909643 },
                                        { level: 15, resolution: 4.77731426794937, scale: 18055.954822 },
                                        { level: 16, resolution: 2.38865713397468, scale: 9027.977411 },
                                        { level: 17, resolution: 1.19432856698734, scale: 4513.9887055 },
                                        { level: 18, resolution: 0.59716428349367, scale: 2254.4677204799655 },
                                        { level: 19, resolution: 0.298582141746835, scale: 1127.2338602 },
                                        { level: 20, resolution: 0.1492910708734175, scale: 563.6169301 },
                                        { level: 21, resolution: 0.0746455354367088, scale: 281.80846505 },
                                        { level: 22, resolution: 0.0373227677183544, scale: 140.904232525 }
                                    ]
                                })
                            })
                        },
                        // generate the tile url for a given level, row and column  
                        getTileUrl: function (level, row, col) {
                            return this.urlTemplate.replace("{z}", level).replace("{x}",
                                col).replace("{y}", row).replace("{tag}", (col % 8));
                        },

                        // This method fetches tiles for the specified level and size.  
                        // Override this method to process the data returned from the server.  
                        fetchTile: function (level, row, col) {

                            // call getTileUrl() method to construct the URL to tiles  
                            // for a given level, row and col provided by the LayerView  
                            var url = this.getTileUrl(level, row, col);

                            // request for tiles based on the generated url  
                            // set allowImageDataAccess to true to allow  
                            // cross-domain access to create WebGL textures for 3D.  
                            return esriRequest(url, {
                                responseType: "image",
                                allowImageDataAccess: true
                            })
                                .then(function (response) {
                                    // when esri request resolves successfully  
                                    // get the image from the response  
                                    var image = response.data;
                                    var width = this.tileInfo.size[0];
                                    var height = this.tileInfo.size[0];

                                    // create a canvas with 2D rendering context  
                                    var canvas = document.createElement("canvas");
                                    var context = canvas.getContext("2d");
                                    canvas.width = width;
                                    canvas.height = height;


                                    // Draw the blended image onto the canvas.  
                                    context.drawImage(image, 0, 0, width, height);

                                    return canvas;
                                }.bind(this));
                        }
                    });
                    // *******************************************************  
                    // Start of JavaScript application  
                    // *******************************************************  

                    // Add stamen url to the list of servers known to support CORS specification.  
                    esriConfig.request.corsEnabledServers.push("172.18.230.166");

                    // Create a new instance of the TintLayer and set its properties  
                    //正摄影像
                    var mapurl = "http://tpr_test.szmedi.com.cn:6689/tdkc/map/photos?x={x}&y={y}&z={z}&mt=" + unescape(type);
                    this.stamenTileLayer = new TintLayer({
                        urlTemplate: mapurl,
                        tint: new Color("#004FBB"),
                        title: "正摄影像",
                        id: "img_ortho"
                    });

                    map.layers.add(this.stamenTileLayer, 5);
                },
                setVisibility: function (isVisibility) {
                    var img = this.map.findLayerById("img_ortho");

                    img.visible = isVisibility;
                },
                //设置透明度
                setOpacity: function (value) {

                    var img = this.map.findLayerById("img_ortho");

                    img.opacity = value;
                }


            });





    });