var ColorCube = function (info, parent) {
    var self = this;
    self.background = ko.observable(info.background);
    self.rotation = ko.observable(0);
    self.rightClick = function () {
        var newRot = self.rotation() + 90;
        if (newRot >= 360) {
            newRot = newRot - 360;
        }
        self.rotation(newRot);
    }
    self.click = function () {
        self.background(parent.cubeBrush() );
    }
}
var Wall = function( info , parent ){
    var self = this;
    self.background = ko.observable(info.background);
    self.orientation =  info.orientation;
   
    self.click = function () {
        self.background(parent.wallBrush());
    }
}
var CubeGrid = function () {
    var self = this;
    self.cubeBrush = ko.observable('squares/cobblestone-grey-0.png');
    self.wallBrush = ko.observable('wall1');
    var tmpCubeTypes = [
        'squares/wood-boards-2-runner.png', 
        'squares/brick-grey-1.png',
        'squares/pavingblock-medium-grey-0.png', 
        'squares/cobblestone-grey-0.png',
        'squares/wood-floor-medium-brown0.png',
        'squares/wood-floor-light-grey0.png',
        'squares/hay-barn0.png',
        'squares/hay-barn1.png',
    ];
    
    var x = 0;
    while( x < 63 ){
        tmpCubeTypes.push('squares/redstone' + x +'.png');
        tmpCubeTypes.push('squares/stone-black-' + x + '.png' );
        x++;
    }
    x = 0;
    while (x < 34) {
        tmpCubeTypes.push('squares/woodgrain-dark' + x +'.png');
        x++;
    }
    self.cubeStyles = ko.observableArray(tmpCubeTypes);
    self.wallStyles = ko.observableArray([ 
        'walls/none.png' , 
        'walls/stone-full-basic.png' ,
        'walls/stone-full-door.png' , 
        'walls/stone-full-largedoor.png',
        'walls/stone-full-largedoor-right.png' ]);
    self.cubeSearch = ko.observable("");
    self.cubes = ko.observableArray([]);
    self.filteredCubes = ko.computed(function(){
        var cs = self.cubeSearch();
        var arr = ko.utils.arrayFilter(self.cubeStyles() , function(c ){
            return cs == "" || c.match(cs) !== null ;
        });
        return arr.sort( function( a , b ){
            var aInt = parseInt(String(a).replace(/\D/g, ''));
            var bInt = parseInt(String(b).replace(/\D/g, ''));
            return aInt > bInt ? 1 : ( aInt < bInt ? -1 : 0 );
        });
    });
    self.walls = ko.observableArray([]);
    self.verticalWalls = ko.computed(function(){
        return ko.utils.arrayFilter( self.walls() , function( w ){ return w.orientation == "v";});
    });
    self.horizantalWalls = ko.computed(function () {
        return ko.utils.arrayFilter(self.walls(), function (w) { return w.orientation == "h"; });
    });
    var i = 0;
    while (i < 64) {
        var obs = {};
        obs.background = 'squares/cobblestone-grey-0.png';
        self.cubes.push(new ColorCube(obs, self));
        i++;
    }
    i = 0;
    while( i <  72){
        self.walls.push( new Wall({"background" : "none" , "orientation" :"v" } , self ));
        self.walls.push(new Wall({ "background": "none", "orientation": "h" }, self));
        i++;
    }
}
ko.bindingHandlers.draggable = {
    init : function( element , valueAccessor , allBindings ){
        var snap = allBindings.get('draggableSnap');
        if( !snap ){
            snap = ".droppable";
        }
        $(element).draggable({
            revert: true,
            snap: '.droppable',
            snapMode: 'corner',
            snapTolerance: '22'
        }).css("position", "absolute");;
    }
}
ko.bindingHandlers.droppable = {
    init: function (element, valueAccessor , allBindings){
        var va = ko.unwrap(valueAccessor());
        while( typeof va == "function" && ko.isObservable( va )){
            va = va();
        }
        var accept = allBindings.get('droppableAccept');
        if (!accept) {
            accept = ".draggable";
        }
        $(element).droppable({
            accept: accept,
            drop: function (event, ui) {
                if( typeof va == "function"){
                    va( ui.draggable );
                } 
            }
        });
    }
}