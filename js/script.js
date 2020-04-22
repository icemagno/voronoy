var west = -45;
var south = -24;
var east = -40;
var north = -20;
var homeLocation = null;
var width = 0;
var height = 0;

var minX = Infinity;
var minY = Infinity;
var maxX = -Infinity;
var maxY = -Infinity;

var voronoi = null;
var canvas = null;
var context = null;
var width = null;
var height = null;
var sites = null;
var polygons =  null;
var links = null;
var geomPoints = null;
var projection = null;

var geoGenerator = null;

$(window).on("resize", applyMargins);

$( document ).ready(function() {
	
	canvas = d3.select('canvas').node();
	context = canvas.getContext('2d');
	width = canvas.width;
	height = canvas.height;


	d3.json('senario.json', function(err, json) {
		var center = d3.geoCentroid(json);

		projection = d3.geoEquirectangular()
			.scale(4000)
			.center( center ); // geoOrthographic

		setaLimites( json );
		main( json );
		goToOperationArea( );
	})

	doTheMap();
	applyMargins();
	
	
});


function goToOperationArea(  ) {
	var center = Cesium.Rectangle.center( homeLocation );
	var initialPosition = Cesium.Cartesian3.fromRadians(center.longitude, center.latitude, 980000);
	var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(0, -90, 0);
	scene.camera.setView({
	    destination: initialPosition,
	    orientation: initialOrientation,
	    endTransform: Cesium.Matrix4.IDENTITY
	});	
}

function loadFeatures( json ){
	
	var promise = Cesium.GeoJsonDataSource.load( json, {
        stroke: Cesium.Color.RED,
        fill: Cesium.Color.PINK.withAlpha(0.2),
        strokeWidth: 5
    });
	
	promise.then(function(dataSource) {
		var p = dataSource.entities.values;
		for (var i = 0; i < p.length; i++) {
			var entity = p[i];
			if ( Cesium.defined( entity.polygon ) ) {
				p[i].polygon.extrudedHeight = 300;
			}
			if( Cesium.defined( entity.billboard ) ){
				entity.billboard = undefined;
				entity.point = new Cesium.PointGraphics({
					color: Cesium.Color.YELLOW,
					pixelSize: 7,
					clampToGround : true,
					outlineColor : Cesium.Color.RED,
					disableDepthTestDistance : Number.POSITIVE_INFINITY,
				});			
			}
		}
		viewer.dataSources.add( dataSource );
	});		
}


function doTheMap(){


	var baseOsmProvider = new Cesium.createOpenStreetMapImageryProvider({
		url : 'https://a.tile.openstreetmap.org/'
	});	
	
	viewer = new Cesium.Viewer('cesiumContainer',{
		//terrainProvider : terrainProvider,
		timeline: false,
		animation: false,
		baseLayerPicker: false,
		skyAtmosphere: false,
		fullscreenButton : false,
		geocoder : false,
		homeButton : false,
		infoBox : false,
		sceneModePicker : false,
		selectionIndicator : false,
		navigationHelpButton : false,
		requestRenderMode : true,
	    imageryProvider: baseOsmProvider,
	    scene3DOnly : false,
	    shouldAnimate : true
	});
	
	camera = viewer.camera;
	scene = viewer.scene;
	scene.scene3DOnly = true;	
	
	scene.highDynamicRange = false;
	scene.globe.enableLighting = false;
	scene.globe.baseColor = Cesium.Color.WHITE;
	scene.screenSpaceCameraController.enableLook = false;
	scene.screenSpaceCameraController.enableCollisionDetection = false;
	scene.screenSpaceCameraController.inertiaZoom = 0.8;
	scene.screenSpaceCameraController.inertiaTranslate = 0.8;
	scene.globe.maximumScreenSpaceError = 1;
	scene.globe.depthTestAgainstTerrain = true;
	scene.globe.tileCacheSize = 250;
	scene.pickTranslucentDepth = true;
	scene.useDepthPicking = true;
	
    // MACETES - ESCONDER ELEMENTOS "DESNECESSARIOS"
    jQuery(".cesium-viewer-bottom").hide();
    jQuery(".cesium-viewer-navigationContainer").hide();
    jQuery(".cesium-viewer-zoomIndicatorContainer").hide();
    jQuery(".cesium-viewer-toolbar").hide();
    jQuery(".navigation-controls").hide();
    jQuery(".compass").hide();
    jQuery(".distance-legend").css( {"border": "none", "background-color" : "rgb(60, 141, 188, 0.5)", "height" : 25, "bottom": 60, "right" : 61, "border-radius": 0} );
    jQuery(".distance-legend-label").css( {"font-size": "11px", "font-weight":"bold",  "line-height" : 0, "color" : "white", "font-family": "Consolas"} );
    jQuery(".distance-legend-scale-bar").css( {"height": "9px", "top" : 10, "border-color" : "white"} );
    

}

function main( json ){

	var poly = {
	  type: 'Feature',
	  properties: {},
	  geometry: {
		type: 'Polygon',
		coordinates: []
	  }
	}

	var fc =  {
	  "type": "FeatureCollection",
	  "features": []
	}
	
	geomPoints = json.features.map(feature => {
		return feature.geometry.coordinates
	});	

	voronoi = d3.voronoi()
		.extent([[minX, minY], [maxX, maxY]]);

	var polygons = voronoi( geomPoints ).polygons();
	
	geoGenerator = d3.geoPath()
		.projection(projection)
		.context(context)
		.pointRadius(2.5);	


	polygons.forEach(p => {
		let feature = JSON.parse( JSON.stringify( poly ) );
		p.reverse().push( p[0] );
		feature.geometry.coordinates.push( p );
		fc.features.push( feature );
	});

	drawPolygons( fc );
	drawPoints( json );

	loadFeatures( json );
	loadFeatures( fc );
	
}

function drawPolygons( fc ){
	console.log( fc );
	context.beginPath();
	geoGenerator({type: 'FeatureCollection', features: fc.features})
	context.stroke();	
}

function drawPoints( json ){
	console.log( json );
	context.beginPath();
	geoGenerator({type: 'FeatureCollection', features: json.features})
	context.stroke();
}

function setaLimites( json ){

	json.features.forEach(feature => {
		var c = feature.geometry.coordinates;
		
		if ( c[0] < minX ) {
		  minX = c[0]
		}
		if ( c[0] > maxX ) {
		  maxX = c[0]
		}
		if ( c[1] < minY ) {
		  minY = c[1]
		}
		if ( c[1] > maxY ) {
		  maxY = c[1]
		}
	});
  
	console.log(minX, minY, maxX, maxY);
	homeLocation = Cesium.Rectangle.fromDegrees(minX, minY, maxX, maxY);
}	


function applyMargins() {
	var totalHeight= jQuery(window).height();
	var contentHeight= totalHeight - 100;
	jQuery(".content-wrapper").css({"height": contentHeight});
	jQuery(".content-wrapper").css({"min-height": contentHeight});	
	
	
	jQuery(".cesium-viewer").css({"height": contentHeight, "width": "100%"});
	jQuery(".cesium-viewer-cesiumWidgetContainer").css({"height": contentHeight, "width": "100%"});
	jQuery(".cesium-widget").css({"height": contentHeight, "width": "100%"});
	jQuery(".cesium-widget canvas").css({"height": contentHeight, "width": "100%"});
}
