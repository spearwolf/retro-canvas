/*globals TMX:true */
(function(root){

    var TMX = root.TMX = {
        VERSION: '0.0.1',
        Map: {}
    };

    TMX.Map.Create = function(tmxJsonData) {

        var api = {
            width: tmxJsonData.width,
            height: tmxJsonData.height,
            tileWidth: tmxJsonData.tilewidth,
            tileHeight: tmxJsonData.tileheight
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

