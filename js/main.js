//WEB SQL OPS

var db;

try {
	if (window.openDatabase) {
	    db = openDatabase("TodoDB", "1.0", "HTML5 Database API example", 200000);
	    if (!db)
	        console.log("Failed to open the database on disk.  This is probably because the version was bad or there is not enough space left in this domain's quota");
		else
			console.log("Database opened succesfuly");
	} else
		console.log("Couldn't open the database.  Please try with a WebKit nightly with this feature enabled");
} catch(err) {}


var initDB = function(){
	db.transaction(function(tx) {
		tx.executeSql("SELECT COUNT(*) FROM Todo", [], function(result) {

	    }, function(tx, error) {
	        tx.executeSql("CREATE TABLE Todo (text TEXT)", [], function(result) { 
	        	console.log("Database created succesfuly");
	        });
	    });
	});	
}

var loadTodos = function(){
	console.log("Loading Todos...");
	$("#todos").empty();
	db.transaction(function(tx) {
		tx.executeSql("SELECT text FROM Todo", [], function(tx, result) {
            for (var i = 0; i < result.rows.length; ++i) {
                var row = result.rows.item(i);
                var text = row['text'];
                $("#todos").append("<li>"+text+"</li>");
            }

            if (!result.rows.length){
            	console.log("No Todos found.");
            }	
            	
        }, function(tx, error) {
            alert('Failed to retrieve Todos from database - ' + error.message);
            return;
        });
	});	
}

var deleteTodos = function(){
	db.transaction(function(tx)
	{
	    tx.executeSql("DELETE FROM Todo");
	});
	loadTodos();
}

var addTodo = function(){
	console.log("Adding a Todo");
	var todoText = $("#todoText").val();
	db.transaction(function (tx) 
	{
	    tx.executeSql("INSERT INTO Todo (text) VALUES (?)", [todoText], function(tx,result){

	    }, function(tx,error){
			alert('Insert Failed');
			return;
	    });
	});	
	loadTodos();
};

//LOCAL AND SESSION STORAGE
var localStorage = window['localStorage'];
var sessionStorage = window['sessionStorage'];

var saveLocalSessionStorage = function(){
	clearLocalSessionStorage();
	localStorage.setItem('local',$("#localStorage").val());
	sessionStorage.setItem('session',$("#sessionStorage").val());
	refreshLocalSessionStorage();
}

var clearLocalSessionStorage = function(){
	sessionStorage.clear();
  	localStorage.clear();
  	refreshLocalSessionStorage();
}

var refreshLocalSessionStorage = function(){
	$("#localStorageValue").text(localStorage.getItem('local'));
	$("#sessionStorageValue").text(sessionStorage.getItem('session'));
}

//DRAW CANVAS

var canvasDrawLine = function(){
	var c = document.getElementById("canvas");
	var ctx = c.getContext("2d");
	ctx.moveTo(0,0);
	ctx.lineTo(500,250);
	ctx.stroke();
}

var canvasDawCircle = function(){
	var c = document.getElementById("canvas");
	var ctx = c.getContext("2d");
	ctx.beginPath();
	ctx.arc(145,75,60,0,2*Math.PI);
	ctx.stroke();
}

var canvasDrawGradient = function(){
	var c = document.getElementById("canvas2");
	var ctx = c.getContext("2d");

	var grd = ctx.createLinearGradient(0,0,200,0);
	grd.addColorStop(0,"black");
	grd.addColorStop(1,"white");

	ctx.fillStyle = grd;
	ctx.fillRect(0,0,500,250);
}

//SUBMIT HTML5 INPUTS

var submitHTML5form = function(){
	$("#emailValue").text($("#email").val());
	$("#passwordValue").text($("#password").val());
	$("#fileValue").text($("#file").val());
	$("#numberValue").text($("#number").val());
	$("#numberValue2").text($("#number2").val());
	$("#dateValue").text($("#date").val());
	$("#colorValue").text($("#color").val());
}

//EXPLODE VIDEO

var video;
var copy;
var copycanvas;
var draw;

var TILE_WIDTH = 32;
var TILE_HEIGHT = 24;
var TILE_CENTER_WIDTH = 16;
var TILE_CENTER_HEIGHT = 12;
var SOURCERECT = {x:0, y:0, width:0, height:0};
var PAINTRECT = {x:0, y:0, width:1000, height:600};

function init(){
	video = document.getElementById('sourcevid');
	copycanvas = document.getElementById('sourcecopy');
	copy = copycanvas.getContext('2d');
	var outputcanvas = document.getElementById('output');
	draw = outputcanvas.getContext('2d');
	setInterval("processFrame()", 33);
}
function createTiles(){
	var offsetX = TILE_CENTER_WIDTH+(PAINTRECT.width-SOURCERECT.width)/2;
	var offsetY = TILE_CENTER_HEIGHT+(PAINTRECT.height-SOURCERECT.height)/2;
	var y=0;
	while(y < SOURCERECT.height){
		var x=0;
		while(x < SOURCERECT.width){
			var tile = new Tile();
			tile.videoX = x;
			tile.videoY = y;
			tile.originX = offsetX+x;
			tile.originY = offsetY+y;
			tile.currentX = tile.originX;
			tile.currentY = tile.originY;
			tiles.push(tile);
			x+=TILE_WIDTH;
		}
		y+=TILE_HEIGHT;
	}
}

var RAD = Math.PI/180;
var randomJump = false;
var tiles = [];
var debug = false;
function processFrame(){
	if(!isNaN(video.duration)){
		if(SOURCERECT.width == 0){
			SOURCERECT = {x:0,y:0,width:video.videoWidth,height:video.videoHeight};
			createTiles();
		}
		//this is to keep my sanity while developing
		if(randomJump){
			randomJump = false;
			video.currentTime = Math.random()*video.duration;
		}
		//loop
		if(video.currentTime == video.duration){
			video.currentTime = 0;
		}
	}
	var debugStr = "";
	//copy tiles
	copy.drawImage(video, 0, 0);
	draw.clearRect(PAINTRECT.x, PAINTRECT.y,PAINTRECT.width,PAINTRECT.height);
	
	for(var i=0; i<tiles.length; i++){
		var tile = tiles[i];
		if(tile.force > 0.0001){
			//expand
			tile.moveX *= tile.force;
			tile.moveY *= tile.force;
			tile.moveRotation *= tile.force;
			tile.currentX += tile.moveX;
			tile.currentY += tile.moveY;
			tile.rotation += tile.moveRotation;
			tile.rotation %= 360;
			tile.force *= 0.9;
			if(tile.currentX <= 0 || tile.currentX >= PAINTRECT.width){
				tile.moveX *= -1;
			}
			if(tile.currentY <= 0 || tile.currentY >= PAINTRECT.height){
				tile.moveY *= -1;
			}
		}else if(tile.rotation != 0 || tile.currentX != tile.originX || tile.currentY != tile.originY){
			//contract
			var diffx = (tile.originX-tile.currentX)*0.2;
			var diffy = (tile.originY-tile.currentY)*0.2;
			var diffRot = (0-tile.rotation)*0.2;
			
			if(Math.abs(diffx) < 0.5){
				tile.currentX = tile.originX;
			}else{
				tile.currentX += diffx;
			}
			if(Math.abs(diffy) < 0.5){
				tile.currentY = tile.originY;
			}else{
				tile.currentY += diffy;
			}
			if(Math.abs(diffRot) < 0.5){
				tile.rotation = 0;
			}else{
				tile.rotation += diffRot;
			}
		}else{
			tile.force = 0;
		}
		draw.save();
		draw.translate(tile.currentX, tile.currentY);
		draw.rotate(tile.rotation*RAD);
		draw.drawImage(copycanvas, tile.videoX, tile.videoY, TILE_WIDTH, TILE_HEIGHT, -TILE_CENTER_WIDTH, -TILE_CENTER_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
		draw.restore();
	}
	if(debug){
		debug = false;
		document.getElementById('trace').innerHTML = debugStr;
	}
}

function explode(x, y){
	for(var i=0; i<tiles.length; i++){
		var tile = tiles[i];
		
		var xdiff = tile.currentX-x;
		var ydiff = tile.currentY-y;
		var dist = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
		
		var randRange = 220+(Math.random()*30);
		var range = randRange-dist;
		var force = 3*(range/randRange);
		if(force > tile.force){
			tile.force = force;
			var radians = Math.atan2(ydiff, xdiff);
			tile.moveX = Math.cos(radians);
			tile.moveY = Math.sin(radians);
			tile.moveRotation = 0.5-Math.random();
		}
	}
	tiles.sort(zindexSort);
	processFrame();
}
function zindexSort(a, b){
	return (a.force-b.force);
}

function dropBomb(evt, obj){
	var posx = 0;
	var posy = 0;
	var e = evt || window.event;
	if (e.pageX || e.pageY){
		posx = e.pageX;
		posy = e.pageY;
	}else if (e.clientX || e.clientY) {
		posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	var canvasX = posx-obj.offsetLeft;
	var canvasY = posy-obj.offsetTop;
	explode(canvasX, canvasY);
}

function Tile(){
	this.originX = 0;
	this.originY = 0;
	this.currentX = 0;
	this.currentY = 0;
	this.rotation = 0;
	this.force = 0;
	this.z = 0;
	this.moveX= 0;
	this.moveY= 0;
	this.moveRotation = 0;
	
	this.videoX = 0;
	this.videoY = 0;
}


/*
	getPixel
	return pixel object {r,g,b,a}
*/
function getPixel(imageData, x, y){
	var data = imageData.data;
	var pos = (x + y * imageData.width) * 4;
	return {r:data[pos], g:data[pos+1], b:data[pos+2], a:data[pos+3]}
}
/*
	setPixel
	set pixel object {r,g,b,a}
*/
function setPixel(imageData, x, y, pixel){
	var data = imageData.data;
	var pos = (x + y * imageData.width) * 4;
	data[pos] = pixel.r;
	data[pos+1] = pixel.g;
	data[pos+2] = pixel.b;
	data[pos+3] = pixel.a;
}
/*
	copyPixel
	faster then using getPixel/setPixel combo
*/
function copyPixel(sImageData, sx, sy, dImageData, dx, dy){
	var spos = (sx + sy * sImageData.width) * 4;
	var dpos = (dx + dy * dImageData.width) * 4;
	dImageData.data[dpos] = sImageData.data[spos];     //R
	dImageData.data[dpos+1] = sImageData.data[spos+1]; //G
	dImageData.data[dpos+2] = sImageData.data[spos+2]; //B
	dImageData.data[dpos+3] = sImageData.data[spos+3]; //A
}


//ROTATE DIV	

var x,y,n=0,ny=0,rotINT,rotYINT

function rotate2D(){
	x=document.getElementById("rotate2D")
	clearInterval(rotINT)
	rotINT=setInterval("startRotate()",10)
}


function rotate3D(){
	y=document.getElementById("rotate3D")
	clearInterval(rotYINT)
	rotYINT=setInterval("startYRotate()",10)
}


function startRotate()
{
n=n+1
x.style.transform="rotate(" + n + "deg)"
x.style.webkitTransform="rotate(" + n + "deg)"
x.style.OTransform="rotate(" + n + "deg)"
x.style.MozTransform="rotate(" + n + "deg)"
if (n==180 || n==360)
	{
	clearInterval(rotINT)
	if (n==360){n=0}
	}
}


function startYRotate()
{
ny=ny+1
y.style.transform="rotateY(" + ny + "deg)"
y.style.webkitTransform="rotateY(" + ny + "deg)"
y.style.OTransform="rotateY(" + ny + "deg)"
y.style.MozTransform="rotateY(" + ny + "deg)"
if (ny==180 || ny>=360)
	{
	clearInterval(rotYINT)
	if (ny>=360){ny=0}
	}
}

//CALL FUNCTIONS WHEN DOCUMENT IS FULLY RENDERED

$( document ).ready(function() {
	console.log("Document ready");
	initDB();
	loadTodos();
	refreshLocalSessionStorage();
	canvasDrawLine();
	canvasDawCircle();
	canvasDrawGradient();

});

