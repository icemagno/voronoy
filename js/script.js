var west = -45;
var south = -24;
var east = -40;
var north = -20;

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


$( document ).ready(function() {
	canvas = d3.select('canvas').node();
	context = canvas.getContext('2d');
	width = canvas.width;
	height = canvas.height;


	d3.json('senario.json', function(err, json) {
		var center = d3.geoCentroid(json);

		projection = d3.geoEquirectangular()
			.scale(19000)
			.center( center ); // geoOrthographic

		
		setaLimites( json );
		main( json );
	})


});


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

}	

