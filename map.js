require([
    "esri/layers/SceneLayer",
    "esri/Map",
    "esri/views/SceneView",
    "esri/views/MapView",
    "esri/widgets/LayerList"
], function (SceneLayer, Map, SceneView, MapView, LayerList) {
    var bimlayer = new SceneLayer({
        url: "http://server.szsz.com/server/rest/services/Hosted/stratums/SceneServer"
    });
    var map3D = new Map({
        basemap: "topo",
        layers: [bimlayer],
    });
    var view3D = new SceneView({
        container: "viewDiv",
        map: map3D,
    });
    var map2D = new Map({
        basemap: 'dark-gray',
    });
    var view2D = new MapView({
        container: 'viewDiv',
        map: map2D,
    });
    // bimlayer.when(function () {
    //     view3D.extent = bimlayer.fullExtent;
    // });
    // view3D.when(function () {
    //     // allow navigation above and below the ground
    //     map3D.ground.navigationConstraint = {
    //         type: "none"
    //     };
    //     // the webscene has no basemap, so set a surfaceColor on the ground
    //     map3D.ground.surfaceColor = "#fff";
    //     // to see through the ground, set the ground opacity to 0.4
    //     map3D.ground.opacity = 0.4;
    // });

    var layerList = new LayerList({
        view: view2D
    });
    view2D.ui.add({
        component: layerList,
        position: "top-right",
        index: 2
    })
})