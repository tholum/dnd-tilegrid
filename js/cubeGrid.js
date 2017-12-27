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
    self.toJson = function () {
        return {
            "background": self.background(),
            "orientation": self.orientation
        };
    }
}
var Wall = function( info , parent ){
    var self = this;
    self.background = ko.observable(info.background);
    self.orientation =  info.orientation;
   
    self.click = function () {
        self.background(parent.wallBrush());
    }
    self.toJson = function(){
        return {
            "background" : self.background(),
            "orientation": self.orientation
        };
    }
}
var CubePack = function(pack ){
    if (typeof pack !== "object" || pack === null) {
        pack = {};
    }
    var self = this;
    self.name = ko.observable(pack.name);
    self.cubes = ko.observableArray([]);
    if (pack.hasOwnProperty("cubes")) {
        self.cubes(pack.cubes);
    }
    self.download = function(){
        download( JSON.stringify( { "cubepacks" : [ { name : self.name() , cubes : self.cubes() } ] } ) , self.name() + ".gridpack", "text/json");
    }
}
var WallPack = function( pack ){
    if( typeof pack !== "object" || pack === null ){
        pack = {};
    }
    self = this;
    self.name = ko.observable(pack.name);
    self.walls = ko.observableArray([]);
    if( pack.hasOwnProperty("walls") ){
        self.walls( pack.walls);
    }
}
var CubeGrid = function () {
    var self = this;
    self.toolboxSelect = ko.observable('tiles');
    self.page = ko.observable('grid-editor');
    self.wallPacks = ko.observableArray( [
        new WallPack({
            "name": "Simple Stone", 
            "walls": [
                'walls/none.png',
                'walls/stone-full-basic.png',
                'walls/stone-full-door.png',
                'walls/stone-full-largedoor.png',
                'walls/stone-full-largedoor-right.png']
            } ) ]
    );
    self.wallPack = ko.observable( self.wallPacks()[0]);
    self.wallStyles = ko.computed( function(){
        var wp = self.wallPack();
        var walls = [];
        if( typeof wp == "object" && wp !== null ){
            walls = wp.walls();
        }
        return walls;
    });
    self.cubePacks = ko.observableArray([]);
    self.cubePack = ko.observable();
    self.addCube = function( url ){
        var cp = self.cubePack();
        if( cp && typeof cp == "object" && cp !== null && cp.hasOwnProperty('cubes') ){
            cp.cubes.push( url );
        }
    }
    self.addCubepack = function(){
        self.cubePacks.push(new CubePack({ 'name': 'New Gridpack', 'cubes': [] }) );
    }
    self.cubeStyles = ko.computed(function(){
        var wp = self.cubePack();
        var cubes = [];
        if (typeof wp == "object" && wp !== null) {
            cubes = wp.cubes();
        }
        return cubes;
    });

    self.print = function(){
        window.print();
    }
    self.cubeBrush = ko.observable('squares/cobblestone-grey-0.png');
    self.iconPacks = ko.observableArray([]);
    self.wallBrush = ko.observable('wall1');
    
    self.cubePacks.push(new CubePack( {
        "name" : "Default Misc",
        "cubes" : [
        'squares/wood-boards-2-runner.png', 
        'squares/brick-grey-1.png',
        'squares/pavingblock-medium-grey-0.png', 
        'squares/cobblestone-grey-0.png',
        'squares/wood-floor-medium-brown0.png',
        'squares/wood-floor-light-grey0.png',
        'squares/hay-barn0.png',
        'squares/hay-barn1.png',
        'squares/water0.png'
    ] } ) );
    self.cubePack( self.cubePacks()[0]);
    var x = 0;
    var redstone = [];
    var blackstone = [];
    var woodgrainDark = [];
    while( x < 63 ){
        redstone.push('squares/redstone' + x +'.png');
        blackstone.push('squares/stone-black-' + x + '.png' );
        x++;
    }
    x = 0;
    while (x < 34) {
        woodgrainDark.push('squares/woodgrain-dark' + x +'.png');
        x++;
    }
    self.cubePacks.push(new CubePack({
        "name": "Red Stone",
        "cubes": redstone
    }));
    self.cubePacks.push(new CubePack({
        "name": "Black Stone",
        "cubes": blackstone
    }));
    self.cubePacks.push(new CubePack({
        "name": "Dark Woodgrain",
        "cubes": woodgrainDark
    }));
    
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
    self.save = function () {
        var info = {"cubes" : [] , "walls" : [] };
        self.cubes().forEach( function( c ){
            info.cubes.push( c.toJson() );
        });
        self.walls().forEach( function(w){
            info.walls.push( w.toJson() );
        });
        var saveText = JSON.stringify(info);
        download(saveText, "mymap.gridview", "text/json");
    }
    self.load = function( data ){
        var newCubes = [];
        var newWalls = [];
        if (data.hasOwnProperty("cubepacks") ){
            if( Array.isArray( data.cubepacks ) ){
                data.cubepacks.forEach( function( cubePack){
                    self.cubePacks.push(new CubePack(cubePack ));
                });
            }
        }
        if( data.hasOwnProperty("cubes") ){
            data.cubes.forEach( function( cube ){
                newCubes.push(new ColorCube(cube, self));
            });
            self.cubes( newCubes );
        }
        if (data.hasOwnProperty("walls")) {
            data.walls.forEach(function (wall) {
                newWalls.push(new Wall(wall, self));
            });
            self.walls(newWalls);
        }
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
ko.bindingHandlers.popedit = {
    init : function( element , valueAccessor ){
        function makeId() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < 10; i++){
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        }
        var x = 100;
        var va = ko.unwrap(valueAccessor);
        while( typeof va == "function" && !ko.isObservable( va ) && x > 0 ){
            va = va();
            x--;
        }
        var tmpId = makeId();
        var editName = "";
        while( $("#modal-" + tmpId ).length !== 0 ){
            tmpId = makeId();
        }

        $(element).attr('data-modalid', 'modal-' + tmpId );
        var modalTemplate = $(`<div class="modal fade" id="modal-${tmpId}" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
          <span class="pficon pficon-close"></span>
        </button>
        <h4 class="modal-title" id="myModalLabel">Edit ${editName}</h4>
      </div>
      <div class="modal-body">
        <form class="form-horizontal" data-bind="submit : function(){save();}" >
          <div class="form-group">
            <div class="col-sm-12">
              <input type="text" id="textInput-modal-markup" class="form-control" data-bind="value : editValue, valueUpdate : 'keyup' " ></div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-bind="click : function(){ save(); }" >Save and close</button>
      </div>
    </div>
  </div>
</div>`);
        $('body').append(modalTemplate);
        ko.applyBindings({ editValue: va, save: function () { modalTemplate.modal('hide'); } }, modalTemplate[0])
        $(element).dblclick( function(){
            $('#modal-' + tmpId).modal('show');
        } );
    }
}
var templateFromUrlLoader = {
    loadTemplate: function (name, templateConfig, callback) {
        if (templateConfig.fromUrl) {
            var fullUrl = 'views/' + templateConfig.fromUrl ;
            $.get(fullUrl, function (markupString) {
                ko.components.defaultLoader.loadTemplate(name, markupString, callback);
            });
        } else {
            callback(null);
        }
    }
};

// Register it
ko.components.loaders.unshift(templateFromUrlLoader);
['grid-editor', 'cubepack-editor'].forEach(function(page){
    ko.components.register("view-" + page , {
        template: {
            "fromUrl": page + '.html'
        },
        viewModel: { createViewModel: (params, componentInfo) => ko.dataFor(componentInfo.element) }
    });
});

