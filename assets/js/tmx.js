/*globals TMX:true */
(function(root){

    var TMX = root.TMX = {
        VERSION: '0.0.1',

        Map: {},
        TileLayer: {},
        TileSet: {}
    };

    TMX.TileLayer.Create = function() {
        // TODO
    };

    TMX.TileSet.Create = function() {
        // TODO
    };

    TMX.Map.Create = function(tmxJsonData) {
        
        if ('orthogonal' !== tmxJsonData.orientation.toLowerCase())
            throw new Error("unsupported tmx orientation type '"+tmxJsonData.orientation+"'");

        var api = {
            width: tmxJsonData.width,
            height: tmxJsonData.height,
            tileWidth: tmxJsonData.tilewidth,
            tileHeight: tmxJsonData.tileheight,
            pxWidth: tmxJsonData.width * tmxJsonData.tilewidth,
            pxHeight: tmxJsonData.height * tmxJsonData.tileheight
        };

        return api;
    };

})(this);



jQuery(function($){
    console.log('hello tmx.js!');

    $.getJSON('assets/dungeon0.json', function(tmx) {

        window.tmxMap = TMX.Map.Create(tmx);
        console.log(window.tmxMap);

    });
});

