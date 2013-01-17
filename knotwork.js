// init
grid = new Array(1);
grid.cellWidth = 100;
grid.cellHeight = 100;
grid.gridWidth= 1;
grid.gridHeight = 1;

idealWidth = 80;
idealHeight = 80;
currentX = 0;
currentY = 0;
maxY = 0;

// edge values
squaretop = 1;
squarebottom = 2;
squareright = 4;
squareleft = 8;

tileset = "thick";
function switchPattern(){
    switch(tileset)
    {
        case "thick":
            {
                tileset = "simple";
                break;
            }
        case "simple":
            {
                tileset = "template";
                break;
            }
        case "template":
            {
                tileset = "blank";
                break;
            }
        default:
            {
                tileset = "thick";
                break;
            }
    }    
    redraw(true);
}
// fire the code
$(init);
// bind the redraw code to the window resize event
$(window).resize(redraw);
function init()
{
	grid = new Array(1);
	grid.cellwidth = 100;
	grid.cellheight = 100;
	grid.gridWidth= 1;
	grid.gridHeight = 1;
	// set the container up as the same size as the window
	container = document.getElementById("container");
	if(container)
	{
		container.style.height = window.innerHeight+ 1 + "px";
	}
	redraw();
}
function redraw(force)
{
    
	// work out the grid size
	newgrid = setupGrid("container");
	// if it's the same as the current grid size, nothing to do here
        if(typeof(force) == 'undefined')
            force = false;
	if(force || (newgrid.length != grid.length))
		grid = newgrid;
	else
		return;
	// locate the boxes in the grid (no overlaps, no edges unless 'edge=true', space as evenly as possible)
	resetGrid();
	$(".box").each(function(index, element){locateBox(index,element);});
	// clear the previous img elements out from the container children
	$(".gridsquare").remove();
	// iterate the grid
	allocateNumbers();
	//create the img element
	createGridSquares("container");
	// and we're done
}
function setupGrid(parentName)
{
	// get the actual sizes of the container
	parent = document.getElementById(parentName)
	if(!parent)
	{
		// no such parent, so return a default grid
		newgrid = new Array(1);
		newgrid.cellWidth = 100;
		newgrid.cellHeight = 100;
		newgrid.gridWidth = 1;
		newgrid.gridHeight = 1;
		return newgrid;
	}
	gw = parent.clientWidth;
	gh = parent.clientHeight;
	//check for zero height, in which case use the window height
	// in this case, we always want the full window height
	//if(gh == 0)
		gh = window.innerHeight;
	// we'd like a idealwidth x idealheight px square cell size if possible
	// but if that's not exact, then shrink it a bit
	nw = Math.floor(gw / idealWidth)+1;
	mw = (nw * idealWidth) - gw;
		
	nh = Math.floor(gh / idealHeight)+1;
	mh = (nh * idealHeight) - gh;
		
	newgrid = new Array(nw * nh);
	newgrid.cellWidth = idealWidth - (mw/nw);
	newgrid.cellHeight = idealHeight - (mh/nh);
	newgrid.gridWidth = nw;
	newgrid.gridHeight = nh;
	return newgrid;
}
function resetGrid()
{
	currentX = 0;
	currentY = 0;
	for(x=0; x<grid.gridWidth ;x++)
		for(y=0; y<grid.gridHeight ;y++)
		{
			c=grid.gridWidth*y +x;
			grid[c] = 0;
		}
}
function locateBox(index, element)
{
	// element should have gridwide, gridtall properties
	gridWide = 1; gridTall = 1;
	if(element.getAttribute("gridwide"))
		gridWide = parseInt(element.getAttribute("gridwide"));
	else
		element.setAttribute("gridwide",gridWide);
	if(element.getAttribute("gridtall"))
		gridTall = parseInt(element.getAttribute("gridtall"));
	else
		element.setAttribute("gridtall",gridTall);
	// check if wider or taller than grid
	if(gridTall > grid.gridHeight)
		gridTall = parseInt(grid.gridHeight);
	if(gridWide > grid.gridWidth)
		gridWide = parseInt(grid.gridWidth);
	
	test = 0;
	limit =20;
	overlap = false;
	while(test < limit)
	{
		// pick a random spot in the page
		startX = Math.floor((grid.gridWidth - gridWide) * Math.random());
		startY = Math.floor((grid.gridHeight - gridTall) * Math.random());
		// check for overlap
		overlap = false;
		for(var x = startX; !overlap && x < startX + gridWide+1;x++)
			for(var y = startY; !overlap && y < startY + gridTall+1; y++)
			{
				value = getCellValue(x,y);
				if(value == 15)
					overlap = true;
			}
		if(!overlap)
			test = limit +1;
		test++;
	}
	if(overlap)
	{
		// couldn't find a decent spot
		// so...extend the page?
		// for now, just slap it at 0,0
		element.gridX = 0;
		element.gridY = 0;
	}
	else
	{
		// we found a decent spot
		element.gridX = startX;
		element.gridY = startY;
	}
	// mark up the grid spaces we cover as having value 15 ( = solid)
	for(x = element.gridX;x < element.gridX + gridWide;x++)
		for(y = element.gridY;y<element.gridY + gridTall;y++)
		{
			index = y * grid.gridWidth + x;
			grid[index] = 15;
		}
	// put the box in the right place
	element.style.left = element.gridX * grid.cellWidth + "px";
	element.style.width = gridWide * grid.cellWidth + "px";
	element.style.top = element.gridY * grid.cellHeight + "px";
	element.style.height = gridTall * grid.cellHeight + "px";
}
function allocateNumbers()
{
	// then iterate the grid and check the squares in each direction
	for(x=0; x< grid.gridWidth; x++)
		for(y=0; y < grid.gridHeight; y++)
		{
			//calculate cell
			c = y * grid.gridWidth + x;
			value = getCellValue(x,y);
			// check this one
			if(value != 15)
			{
				// check up
				if(getCellValue(x,y-1) == 15)
					value = value | squaretop;
				// check down
				if(getCellValue(x,y+1) == 15)
					value = value | squarebottom;
				// check left
				if(getCellValue(x-1,y) == 15)
					value = value | squareleft;
				// check right
				if(getCellValue(x+1,y) == 15)
					value = value | squareright;
				grid[c] = value;
			}
		}
}
function createGridSquares(containerName)
{
	container = document.getElementById(containerName);
	if(!container)
		return;
	for(x=0; x< grid.gridWidth; x++)
		for(y=0; y < grid.gridHeight; y++)
		{
			//calculate cell
			c = y * grid.gridWidth + x;
			//calculate position
			cx = grid.cellWidth * x;
			cy = grid.cellHeight * y;
			source = "./" + tileset + "/" + grid[c] + ".png";
			newimg = "<img id='gs" + x + "-" + y + "' class='gridsquare' src='" + source + "' style='left:" + cx + "px;top:"+ cy + "px;width:" + (Math.floor(grid.cellWidth)+1.0) + "px;height:"+ (Math.floor(grid.cellHeight)+1.0) +"px;' />";
			container.innerHTML += newimg;
		}
		
}
function getCellValue(x,y)
{
	if(x < 0)
		return 15;
	if(y <0)
		return 15;
	if(x >= grid.gridWidth)
		return 15;
	if(y >= grid.gridHeight)
		return 15;
	var c = y * grid.gridWidth + x;
	return grid[c];
}