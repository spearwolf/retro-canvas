
(function(root){

    var RetroCanvas = root.RetroCanvas = {};

    var styleTransformOrigin = 'transformOrigin'
      , styleTransform = 'transform'
      ;


    var div = document.createElement('div');

    if ('webkitTransformOrigin' in div.style) {
        styleTransformOrigin = 'webkitTransformOrigin';
    } else if ('mozTransformOrigin' in div.style) {
        styleTransformOrigin = 'mozTransformOrigin';
    } else if ('msTransformOrigin' in div.style) {
        styleTransformOrigin = 'msTransformOrigin';
    }

    if ('webkitTransform' in div.style) {
        styleTransform = 'webkitTransform';
    } else if ('mozTransform' in div.style) {
        styleTransform = 'mozTransform';
    } else if ('msTransform' in div.style) {
        styleTransform = 'msTransform';
    }

    div = null;


    RetroCanvas.create = function(width, height) {

        var domEl = document.createElement('canvas')
          , ctx = domEl.getContext('2d')
          ;

        var backingStorePixelRatio = ctx.webkitBackingStorePixelRatio
                                     || ctx.mozBackingStorePixelRatio
                                     || ctx.msBackingStorePixelRatio
                                     || ctx.backingStorePixelRatio
                                     || 1;

        if (width && height) {
            domEl.width = width;
            domEl.height = height;
        }

        var api = {
            el: function() { return domEl; },
            ctx: function() { return ctx; },

            width: function() { return (domEl.width * backingStorePixelRatio)|0; },
            height: function() { return (domEl.height * backingStorePixelRatio)|0; },

            resize: function(w, h) {
                domEl.width = w;
                domEl.height = h;
            },

            destroy: function() {
                api.resize(0, 0);
                domEl.remove();
                domEl = api.el = undefined;
            }
        };

        api.loadImage = function(src, onLoad) {
            var img = new Image();
            img.src = src;
            img.onload = function() {
                api.resize(img.width / backingStorePixelRatio,
                            img.height / backingStorePixelRatio);
                ctx.drawImage(img, 0, 0, domEl.width, domEl.height);

                if (backingStorePixelRatio == 1 && devicePixelRatio > 1) {
                    var scale = 1.0 / devicePixelRatio;
                    domEl.style[styleTransformOrigin] = '0px 0px';
                    domEl.style[styleTransform] = 'scale('+scale+','+scale+')';
                }
                if (typeof onLoad === 'function') onLoad(api, img);
            };
        };

        return api;
    };


})(this);






jQuery(function($){

    console.log('hello RetroCanvas.js!');

    window.rc = RetroCanvas.create();
    $('section').append(rc.el());
    console.log('domEl:', rc.el());

    rc.loadImage('assets/fantasy-tileset.png', true);

});

