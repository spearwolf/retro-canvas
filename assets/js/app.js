
(function(root){

    var RetroCanvas = root.RetroCanvas = {};

    var styleTransformOrigin = 'transformOrigin'
      , styleTransform = 'transform'
      , backingStorePixelRatio
      , getImageData = 'getImageData'
      , putImageData = 'putImageData'
      ;


    (function(){
        var canvas_ = document.createElement('canvas')
            ctx_ = canvas_.getContext('2d')
            ;

        backingStorePixelRatio = ctx_.webkitBackingStorePixelRatio
                                 || ctx_.mozBackingStorePixelRatio
                                 || ctx_.msBackingStorePixelRatio
                                 || ctx_.backingStorePixelRatio
                                 || 1;

        if (backingStorePixelRatio != 1) {
            getImageData = 'webkitGetImageDataHD';
            putImageData = 'webkitPutImageDataHD';
        }

        if ('webkitTransformOrigin' in canvas_.style) {
            styleTransformOrigin = 'webkitTransformOrigin';
        } else if ('mozTransformOrigin' in canvas_.style) {
            styleTransformOrigin = 'mozTransformOrigin';
        } else if ('msTransformOrigin' in canvas_.style) {
            styleTransformOrigin = 'msTransformOrigin';
        }

        if ('webkitTransform' in canvas_.style) {
            styleTransform = 'webkitTransform';
        } else if ('mozTransform' in canvas_.style) {
            styleTransform = 'mozTransform';
        } else if ('msTransform' in canvas_.style) {
            styleTransform = 'msTransform';
        }

        ctx_ = null;
        canvas_ = null;
    })();


    RetroCanvas.create = function(width, height) {

        var domEl = document.createElement('canvas')
          , ctx = domEl.getContext('2d')
          ;

        if (width && height) {
            domEl.width = width;
            domEl.height = height;
        }

        if (backingStorePixelRatio == 1 && devicePixelRatio > 1) {
            var scale = 1.0 / devicePixelRatio;
            domEl.style[styleTransformOrigin] = '0px 0px';
            domEl.style[styleTransform] = 'scale('+scale+','+scale+')';
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

                if (typeof onLoad === 'function') onLoad(api);
            };
        };

        api.pixels = function(pixelData) {
            if (pixelData) {
                ctx[putImageData](pixelData, 0, 0);
            } else {
                return ctx[getImageData](0, 0, api.width(), api.height());
            }
        };

        return api;
    };



    function pixelCopy(source, target) {

        var sp = source.pixels()
          , p = target.pixels()
          , w = target.width()
          , h = target.height()
          , sw = source.width()
          , sw_ = sw / w
          , sh = source.height()
          , sh_ = sh / h
          , x, y, sx, sy, si, i
          ;

        console.log(sp, p);

        for (y = 0; y < h; y++)
            for (x = 0; x < w; x++) {
                sx = (sw_ * x)|0;
                sy = (sh_ * y)|0;
                si = ((sy * sw) + sx) << 2; 
                i = ((y * w) + x) << 2; 
                p.data[i] = sp.data[si];
                p.data[i+1] = sp.data[si+1];
                p.data[i+2] = sp.data[si+2];
                p.data[i+3] = sp.data[si+3];
            }

        target.pixels(p);
    }


    RetroCanvas.loadImage = function(src, pixelZoom, onLoad) {

        var pixelZoom_ = (pixelZoom || 1) * (devicePixelRatio / backingStorePixelRatio);

        var target = RetroCanvas.create();

        RetroCanvas.create().loadImage(src, function(origin){

            var w = origin.width() * pixelZoom_
              , h = origin.height() * pixelZoom_
              ;

            target.resize(w, h);

            console.log('pixelZoom_', pixelZoom_);
            console.log('originImageSize: '+origin.width()+'x'+origin.height(),
                        'domSize: '+w+'x'+h,
                        'realPixelSize: '+target.width()+'x'+target.height());

            pixelCopy(origin, target);

            if ('function' === typeof onLoad) onLoad(target);
        });

        return target;
    };


})(this);






jQuery(function($){

    console.log('hello RetroCanvas.js!');

    //window.rc = RetroCanvas.create();
    //$('section').append(rc.el());
    //console.log('domEl:', rc.el());

    //rc.loadImage('assets/fantasy-tileset.png');

    RetroCanvas.loadImage('assets/fantasy-tileset.png', 2, function(canvas){
        console.log(canvas);
        $('section').append(canvas.el());
        console.log('domEl:', canvas.el());
    });
});

