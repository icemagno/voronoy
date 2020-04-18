var voronoi = null;
var canvas = null;
var context = null;
var width = null;
var height = null;
var sites = null;

$( document ).ready(function() {
   


	canvas = d3.select("canvas").node();//.on("touchmove mousemove", moved).node();
	context = canvas.getContext("2d");
	width = canvas.width;
	height = canvas.height;

	sites = d3.range(100).map(function( d ) { 
		return [Math.random() * width, Math.random() * height]; 
	});

	voronoi = d3.voronoi().extent([[-1, -1], [width + 1, height + 1]]);

	redraw();

});

function redraw(){
	var diagram = voronoi(sites);
	var links = diagram.links();
	var polygons = diagram.polygons();

	
	context.clearRect(0, 0, width, height);
	
	/*
	context.beginPath();
	drawCell(polygons[0]);
	context.fillStyle = "#f00";
	context.fill();
	*/

	context.beginPath();
	for (var i = 0, n = polygons.length; i < n; ++i) drawCell(polygons[i]);
	context.strokeStyle = "#000";
	context.stroke();

	context.beginPath();
	for (var i = 0, n = links.length; i < n; ++i) drawLink(links[i]);
	context.strokeStyle = "rgba(0,0,0,0.2)";
	context.stroke();

	context.beginPath();
	drawSite(sites[0]);
	context.fillStyle = "#fff";
	context.fill();

	context.beginPath();
	for (var i = 1, n = sites.length; i < n; ++i) drawSite(sites[i]);
	context.fillStyle = "#000";
	context.fill();
	context.strokeStyle = "#fff";
	context.stroke();	
	
}


function moved() {
	sites[0] = d3.mouse(this);
	redraw();
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
