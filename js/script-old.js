var voronoi = null;
var canvas = null;
var context = null;
var width = null;
var height = null;
var sites = null;
var polygons =  null;
var links = null;

var west = -45;
var south = -24;
var east = -40;
var north = -20;

// origem = west,north

$( document ).ready(function() {
	canvas = d3.select("canvas").node();//.on("touchmove mousemove", moved).node();
	context = canvas.getContext("2d");
	width = canvas.width;
	height = canvas.height;

console.log( width + " x " + height);

	sites = d3.range( 10 ).map(function( d ) { 
		return [  east - ( Math.random() * west), north - ( Math.random() * south ) ]; 
	});

console.log( sites );

	voronoi = d3.voronoi().extent([[-1, -1], [width + 1, height + 1]]);
	redraw();

});

function redraw(){
	var diagram = voronoi(sites);
	links = diagram.links();
	polygons = diagram.polygons();
	
	context.clearRect(0, 0, width, height);

	// Desenha as areas
	context.beginPath();
	for (var i = 0, n = polygons.length; i < n; ++i) drawCell(polygons[i]);
	context.strokeStyle = "#000";
	context.stroke();

	// desenha as linhas que ligam os pontos
	context.beginPath();
	for (var i = 0, n = links.length; i < n; ++i) drawLink(links[i]);
	context.strokeStyle = "rgba(0,0,0,0.2)";
	context.stroke();
	
	// Desenha os pontos
	context.beginPath();
	for (var i = 0, n = sites.length; i < n; ++i) drawSite(sites[i]);
	context.fillStyle = "#000";
	context.fill();
	context.strokeStyle = "#fff";
	context.stroke();	
	
}


function moved() {
	//sites[0] = d3.mouse(this);
	//redraw();
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
