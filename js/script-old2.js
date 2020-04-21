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

$( document ).ready(function() {
	canvas = d3.select('canvas').node();
	context = canvas.getContext('2d');
	width = canvas.width;
	height = canvas.height;

	var projection = d3.geoEquirectangular()
		.scale(5000)
		.center([-44.9264527063343,-20.2888907165595]); // geoOrthographic


	d3.json('senario.json', function(err, json) {
		
		setaLimites( json );
		
		var geoGenerator = d3.geoPath()
			.projection(projection)
			.context(context)
			.pointRadius(2.5);		


		voronoi = d3.voronoi()
			//.extent([[minX, minY], [maxX, maxY]]);
			.extent([[-1, -1], [width + 1, height + 1]]);
			
		var neighborhoodPoints = json.features.map(feature => {
			return feature.geometry.coordinates
		});			
		polygons = voronoi(neighborhoodPoints).polygons();

		
		/*
		var graticule = d3.geoGraticule();
		context.beginPath();
		geoGenerator( graticule() );
		context.stroke();
		
		context.beginPath();
		geoGenerator({type: 'FeatureCollection', features: json.features})
		context.stroke();
		*/
		
		// Desenha as areas
		context.beginPath();
		for (var i = 0, n = polygons.length; i < n; ++i) drawCell(polygons[i]);
		context.strokeStyle = "#000";
		context.stroke();		
		
		
	})


});

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
	
function drawSite(site) {
	context.moveTo(site[0] + 2.5, site[1]);
	context.arc(site[0], site[1], 2.5, 0, 2 * Math.PI, false);
}

function drawLink(link) {
	context.moveTo(link.source[0], link.source[1]);
	context.lineTo(link.target[0], link.target[1]);
}

function drawCell(cell) {
	if (!cell) return false;
	context.moveTo(cell[0][0], cell[0][1]);
	for (var j = 1, m = cell.length; j < m; ++j) {
		context.lineTo(cell[j][0], cell[j][1]);
	}
	context.closePath();
	return true;
}




