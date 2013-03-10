/*globals RetroCanvas:true */
(function(root){

    var RetroCanvas = root.RetroCanvas = {};

    var backingStorePixelRatio
      , devicePixelRatio_ = window.devicePixelRatio || 1
      //, styleTransformOrigin = 'transformOrigin'
      //, styleTransform = 'transform'
      , getImageData = 'getImageData'
      , putImageData = 'putImageData'
      ;


    (function(){
        var canvas_ = document.createElement('canvas')
          , ctx_ = canvas_.getContext('2d')
          ;

        backingStorePixelRatio = ctx_.webkitBackingStorePixelRatio ||
                                 ctx_.mozBackingStorePixelRatio ||
                                 ctx_.msBackingStorePixelRatio ||
                                 ctx_.backingStorePixelRatio ||
                                 1;

        if (backingStorePixelRatio !== 1) {
            getImageData = 'webkitGetImageDataHD';
            putImageData = 'webkitPutImageDataHD';
        }

        /*
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
        */

        ctx_ = null;
        canvas_.width = 0;
        canvas_.height = 0;
        canvas_ = null;
    })();

    var scaleByElementStyle = backingStorePixelRatio === 1 && devicePixelRatio_ > 1;

    RetroCanvas.isRetina = backingStorePixelRatio !== 1 || devicePixelRatio_ !== 1;


    RetroCanvas.Create = function(width, height) {

        var domEl = document.createElement('canvas')
          , ctx = domEl.getContext('2d')
          ;


        if (typeof ctx.webkitImageSmoothingEnabled === 'boolean')
            ctx.webkitImageSmoothingEnabled = false;
        if (typeof ctx.mozImageSmoothingEnabled === 'boolean')
            ctx.mozImageSmoothingEnabled = false;
        if (typeof ctx.imageSmoothingEnabled === 'boolean')
            ctx.imageSmoothingEnabled = false;


        if (width && height) {
            domEl.width = width;
            domEl.height = height;
        }

        function updateElementStyles() {
            if (scaleByElementStyle) {
                var scale = 1.0 / devicePixelRatio_;
                //domEl.style[styleTransformOrigin] = '0px 0px';
                //domEl.style[styleTransform] = 'scale('+scale+','+scale+')';
                domEl.style.width = ((domEl.width*scale)|0)+'px';
                domEl.style.height = ((domEl.height*scale)|0)+'px';
            }
        }

        updateElementStyles();

        var api = {

            domEl: function() { return domEl; },
            ctx: function() { return ctx; },

            width: function() { return (domEl.width * backingStorePixelRatio)|0; },
            height: function() { return (domEl.height * backingStorePixelRatio)|0; },

            resize: function(w, h) {
                domEl.width = w;
                domEl.height = h;
                updateElementStyles();
            },

            destroy: function() {
                api.resize(0, 0);
                if (typeof domEl.remove === 'function') domEl.remove();
                ctx = api.ctx = undefined;
                domEl = api.domEl = undefined;
            }
        };

        api.loadImage = function(src, onLoad) {
            var img;
            if (src instanceof Image || src instanceof HTMLImageElement) {
                img = src;
            } else {
                img = new Image();
                img.src = src;
            }
            img.onload = function() {
                api.resize(img.width / backingStorePixelRatio,
                            img.height / backingStorePixelRatio);

                ctx.drawImage(img, 0, 0, domEl.width, domEl.height);

                if (typeof onLoad === 'function') onLoad(api);
            };
        };

        api.imageData = function(pixelData) {
            if (pixelData) {
                ctx[putImageData](pixelData, 0, 0);
            } else {
                return ctx[getImageData](0, 0, api.width(), api.height());
            }
        };

        api.scaledByElementStyle = scaleByElementStyle;
        api.scaledByBackingStore = backingStorePixelRatio !== 1;

        return api;
    };



    function pixelCopy(source, target) {

        var sourcePixel = source.imageData()
          , pixel = target.imageData()
          , w = target.width()
          , h = target.height()
          , sw = source.width()
          , swFactor = sw / w
          , shFactor = source.height() / h
          , x, y, sx, sy
          , si, pi
          ;

        for (y = 0; y < h; y++)
            for (x = 0; x < w; x++) {
                sx = (swFactor * x)|0;
                sy = (shFactor * y)|0;
                si = ((sy * sw) + sx) << 2;
                pi = ((y * w) + x) << 2;

                pixel.data[pi] = sourcePixel.data[si];
                pixel.data[pi+1] = sourcePixel.data[si+1];
                pixel.data[pi+2] = sourcePixel.data[si+2];
                pixel.data[pi+3] = sourcePixel.data[si+3];
            }

        target.imageData(pixel);
    }


    RetroCanvas.LoadImage = function(src, pixelZoom, onLoad) {

        var onLoad_ = arguments[arguments.length-1]
          , pixelZoom_ = (typeof pixelZoom === 'function' ? 1 : pixelZoom || 1) *
                                            (devicePixelRatio_ / backingStorePixelRatio)
          , target = RetroCanvas.Create()
          ;

        RetroCanvas.Create().loadImage(src, function(origin){

            var w = origin.width() * pixelZoom_
              , h = origin.height() * pixelZoom_
              ;

            target.resize(w, h);

            target.pixelInfo = {
                originalImageSize: [origin.width(), origin.height()],
                domElementSize: [w, h],
                realPixelSize: [target.width(), target.height()]
            };

            pixelCopy(origin, target);

            origin.destroy();

            if ('function' === typeof onLoad_) onLoad_(target);
        });

        return target;
    };


    function replaceImage(imgElement, pixelZoom) {
        RetroCanvas.LoadImage(imgElement, pixelZoom, function(canvas){
            imgElement.parentNode.replaceChild(canvas.domEl(), imgElement);
        });
    }

    RetroCanvas.ReplaceImage = function(imgElement, pixelZoom) {
        if (imgElement.jquery) {
            imgElement.each(function(){
                replaceImage(this, pixelZoom);
            });
        } else {
            replaceImage(imgElement, pixelZoom);
        }
    };


})(this);






jQuery(function($){
    console.log('hello RetroCanvas.js!');

    var imgUrl = 'assets/tileset1.png';

    RetroCanvas.LoadImage(imgUrl, 3, function(canvas){
        window.c = canvas;
        console.log(canvas);

        $('section').append(canvas.domEl());

        console.log('domEl:', canvas.domEl());
        console.log('pixelInfo:', canvas.pixelInfo);
    });

    if (RetroCanvas.isRetina) {
        RetroCanvas.ReplaceImage($('#originalImage'), 1);
    }
});

