/**
 * New node file
 */
(function(){
	
;/**
 * 
 */
// Inject extended d3 funciton
d3.selection.prototype.bbox = function (refresh) {
    if (!refresh && this._bbox) {
        return this._bbox;
    }
    
    this._bbox = {x: 0, y: 0, width: 0, height: 0};
    for (var j = 0, m = this.length; j < m; j++) {
        for (var group = this[j], i = 0, n = group.length; i < n; i++) {
          var node = group[i];
          if (node && (node.nodeName === 'g' || node.nodeName === 'text')) {
              var bbox = node._bbox;
              if (!bbox || refresh) {
                  bbox = bbox || node.getBBox();
              }
              this._bbox.x = (bbox.x < this._bbox.x) ? bbox.x: this._bbox.x;
              this._bbox.y = (bbox.y < this._bbox.y) ? bbox.y : this._bbox.y;
              this._bbox.width = (bbox.x + bbox.width > this._bbox.x + this._bbox.width) ? bbox.width: this._bbox.width;
              this._bbox.height = (bbox.y + bbox.height > this._bbox.y + this._bbox.height) ? bbox.height: this._bbox.height;
          };
        }
    }
    return this._bbox;
};

d3.transition.prototype.bbox = d3.selection.prototype.bbox;

d3.selection.prototype.opts = function() {
	return arguments.length ? this.property("__opts__", value) : this.property("__opts__");
};;var DPI;
var FONT_BASELINE_SCALE = 0.8;
var PATTERN_ROTATE = /rotate\(.*?\)/g;
var PATTERN_TRANSLATE = /translate\(.*?\)/g;
var PATTERN_SCALE = /scale\(.*?\)/g;
var PATTERN_SKEW = /skew[XY]{1}\(.*?\)/g;
var PATTERN_MATRIX = /matrix\(.*?\)/g;

/** Check if specified value is number.
 *
 * @param v
 * @returns {Boolean}
 */
function isNumber(v) {
    return typeof v === 'number';
}

/**
 * Check if specified value is string.
 *
 * @param v
 * @returns {Boolean}
 */
function isString(v) {
    return typeof v === 'stirng';
}

/**
 * Check if specified value is function.
 *
 * @param v
 * @returns {Boolean}
 */
function isFunction(v) {
    return typeof v === 'funciton';
}

/**
 * Check if specified value is object.
 *
 * @param v
 * @returns {Boolean}
 */
function isObject(v) {
    return typeof v === 'object';
}

/**
 * Check if object is empty.
 *
 * @param map
 * @returns {Boolean}
 */
function emptyObject(map) {
    if (!map) {
        return true;
    }

    for (var key in map) {
        if (map.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

/**
 * Convert degree to radian.
 *
 * @param deg
 * @returns {Number}
 */
function toRadian(deg) {
    return deg * Math.PI / 180;
}

/**
 * Convert radian to degree
 *
 * @param radian
 * @returns {Number}
 */
function toDegree(radian) {
    return radian * 180 / Math.PI;
}

function getDPI() {
    var d = document.createElement('div');
    d.setAttribute('id', 'testdiv');
    d.style.height = '1in';
    d.style.left = '-100%';
    d.style.position = 'absolute';
    d.style.top = '-100%';
    d.style.width = '1in';
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(d);
    var dpi = document.getElementById('testdiv').offsetWidth;
    body.removeChild(d);
    return dpi;
}

function adaptSize(value, targetUnit, returnNum) {
    if (!targetUnit) {
        return value;
    }

    var dpi = DPI ? DPI : (DPI = getDPI(), DPI),
        v, tmp, unit, returnUnit = null;
    if (typeof value === 'number') {
        v = value;
        unit = 'px';
    } else {
        v = parseFloat(value);
        unit = value.indexOf('pt') > 0 ? 'pt' : value.indexOf('in') > 0 ? 'in' : value.indexOf('mm') > 0 ? 'mm' : value.indexOf('cm') > 0 ? 'cm' : 'px';
    }
    tmp = v;
    
    // Calculate tmp based on px;
    if (unit === 'pt') {
        tmp = dpi * v / 72;
    } else if (unit === 'in') {
        tmp = v * dpi;
    } else if (unit === 'mm') {
        tmp = dpi * v / 25.4;
    } else if (unit === 'cm') {
        tmp = dpi * v / 2.54;
    }

    if (targetUnit === 'pt') {
        tmp = tmp * 72 / dpi;
        returnUnit = 'pt';
    } else if (targetUnit === 'in') {
        tmp = tmp / dpi;
        returnUnit = 'in';
    } else if (targetUnit === 'mm') {
        tmp = tmp * 25.4 / dpi;
        returnUnit = 'mm';
    } else if (targetUnit === 'cm') {
        tmp = tmp * 2.54 / dpi;
        returnUnit = 'cm';
    } else if (targetUnit === 'px') {
        tmp = tmp;
        returnUnit = 'px';
    }
    return returnNum === true ? tmp : tmp + returnUnit;
}

function toPixel(v, returnNum) {
    return adaptSize(v, 'px', returnNum);
}

function toPoint(v, returnNum) {
    return adaptSize(v, 'pt', returnNum);
}

function toInch(v, returnNum) {
    return adaptSize(v, 'in', returnNum);
}

function toMm(v, returnNum) {
    return adaptSize(v, 'mm', returnNum);
}

function toCm(v, returnNum) {
    return adaptSize(v, 'cm', returnNum);
}

/**
 * Visit each element of specified object and process with specified function.
 *
 * @param obj
 * @param functor
 * @returns
 */
function each(obj, functor) {
    for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
            obj[k] = functor.call(obj, obj[k]);
        }
    }
    return obj;
}

/**
 * Clone an object and its properties.
 *
 * @param obj
 *            the object will be cloned.
 * @returns an new instance of specified object.
 */
function clone(obj) {
    if (obj === null || (typeof obj) !== 'object') {
        return obj;
    }
    var temp = new obj.constructor();
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            temp[key] = clone(obj[key]);
        }
    }
    return temp;
}

/**
 * Simple copy object.
 *
 * @param obj
 * @returns
 */
function copy(obj) {
    if (obj === null || (typeof obj) !== 'object') {
        return obj;
    }
    var temp = {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            temp[key] = copy(obj[key]);
        }
    }
    return temp;
}

/**
 * Return bounding box of specified svg node.
 *
 * @param node
 * @param refresh
 * @returns
 */
function bbox(node, refresh) {
    if (!refresh && node._bbox) {
        return node._bbox;
    }

    var b = (node.nodeName === 'g' || node.nodeName === 'text') ? node.getBBox() : {
        'x': 0,
        'y': 0,
        'width': 0,
        'height': 0
    };
    node._bbox = {
        'x': b.x,
        'y': b.y,
        'width': b.width,
        'height': b.height
    };
    return node._bbox;
}


/**
 * Merge properties of source object into target object and override.
 *
 * @param a
 *            the target object.
 * @param b
 *            the source object.
 * @returns target object
 */
function merge(a, b) {
    if (!b) {
        return a;
    }
    if (!a) {
        return clone(b);
    }

    for (var prop in b) {
        if (b.hasOwnProperty(prop)) {
            if (b[prop] === null || (typeof b[prop]) !== 'object') {
                a[prop] = b[prop];
            } else {
                a[prop] = merge(a[prop], b[prop]);
            }
        }
    }

    return a;
}

/**
 * Merge property of source object into target object.
 *
 * @param a
 * @param b
 * @returns
 */
function extend(a, b) {
    var k = null;
    if (!a) {
        a = {};
    }
    for (k in b) {
        if (b.hasOwnProperty(k)) {
            a[k] = b[k];
        }
    }
    return a;
}
/**
 * Define and extend class.
 *
 * @param self
 * @param pClass
 * @param protoObj
 * @returns
 */
function extendClass(className, self, pClass, protoObj) {
    function constructor(context, parent, options) {
        // Init this object.
        if (this.fInit) {
            this.fInit.apply(this, arguments);
        }
        return this;
    }

    var newClass = self ? self : constructor;
    newClass.prototype = pClass ? new pClass() : {};
    extend(newClass.prototype, protoObj);
    newClass.prototype.__super = pClass ? pClass.prototype : null;
    newClass.prototype.__className = className;
    //newClass.prototype.__classKey = '.' + className;
    return newClass;
}

/**
 * Rotate a svg node.
 * <p>
 * The _mode values include start, end, middle. Middle means the x and y
 * coordinates of rotation point is at center of text. Start means the x
 * coordinate of rotation point is at start of text, y coordinate is center of
 * text. End is similar to Start.
 *
 * @param svgNode
 * @param degree
 * @param mode 'auto'/'start'/'end'/'middle'
 */
function rotateNode(svgNode, _degree, _mode) {
    var degree = _degree,
        mode = _mode,
        enabled = true;
    if (typeof _degree === 'object' && !mode) {
        degree = _degree.degree;
        mode = _degree.mode;
        enabled = _degree.enabled !== false;
    }

    var box, cx, cy, tran, cxy, rotateExpr;

    if (enabled && typeof degree === 'number') {
        box = svgNode.getBBox();
        if (mode === 'auto') {
            cxy = '';
        } else {
            cx = (mode === 'start') ? box.x : (mode === 'end') ? box.x +
                box.width : (box.x + box.width / 2);
            cy = box.y + box.height / 2;
            cxy = ' ' + cx + ' ' + cy;
        }

        rotateExpr = 'rotate(' + degree + cxy + ')';
        tran = svgNode.getAttribute('transform');
        if (tran) {
            if (tran.match(PATTERN_ROTATE)) {
                tran = tran.replace(PATTERN_ROTATE, rotateExpr);
            } else {
                tran += ' ' + rotateExpr;
            }
        } else {
            tran = rotateExpr;
        }
        svgNode.setAttribute('transform', tran);
    }
    return svgNode;
}

/**
 * Rotate elements of selection.
 *
 * @param d3Sel d3js selection object
 * @param degree
 * @param mode start/middle/end/auto
 */
function rotate(d3Sel, _degree, _mode) {
    var degree = _degree,
        mode = _mode,
        enabled = true;
    if (typeof _degree === 'object' && !mode) {
        degree = _degree.degree;
        mode = _degree.mode;
        enabled = _degree.enabled !== false;
    }

    return d3Sel.attr('transform', function(_d) {
        var box, cx, cy, tran = null,
            cxy, rotateExpr;

        if (enabled && typeof degree === 'number') {
            box = this.getBBox();
            if (mode === 'auto') {
                cxy = '';
            } else {
                cx = (mode === 'start') ? box.x : (mode === 'end') ? box.x +
                    box.width : (box.x + box.width / 2);
                cy = box.y + box.height / 2;
                cxy = ' ' + cx + ',' + cy;
            }

            rotateExpr = 'rotate(' + degree + cxy + ')';
            tran = this.getAttribute('transform');
            if (tran) {
                if (tran.match(PATTERN_ROTATE)) {
                    tran = tran.replace(PATTERN_ROTATE, rotateExpr);
                } else {
                    tran += ' ' + rotateExpr;
                }
            } else {
                tran = rotateExpr;
            }
        }
        return tran;
    });
}

/**
 * Translate elements of selection.
 *
 * @param d3Sel d3js selection object
 * @param x
 * @param y
 */
function translate(d3Sel, x, y, context) {
    if (arguments.length === 1) {
        // Return x and y of current translate.
        var transXY = [];
        d3Sel.each(function() {
            var tran = this.getAttribute('transform'),
                x, y;
            if (tran && tran.indexOf('translate') >= 0) {
                tran = tran.match(PATTERN_TRANSLATE);
                if (tran && tran.length) {
                    tran = tran[0].match(/([0-9\.\-]+)/g);
                    if (tran && tran.length) {
                        x = parseFloat(tran[0]);
                        y = tran[1] ? parseFloat(tran[1]) : 0;
                        transXY.push({
                            'x': x,
                            'y': y
                        });
                    }
                }
            }
        });
        return transXY;
    }

    function f(x, d, i) {
        return typeof x === 'function' ? x(d, i, context) : x;
    }

    return d3Sel.attr('transform', function(d, i) {
        var translateEpr = 'translate(' + f(x, d, i) + ',' + f(y, d, i) + ')',
            tran = this.getAttribute('transform');
        if (tran) {
            if (tran.match(PATTERN_TRANSLATE)) {
                tran = tran.replace(PATTERN_TRANSLATE, translateEpr);
            } else {
                tran += ' ' + translateEpr;
            }

        } else {
            tran = translateEpr;
        }
        return tran;
    });
}

/**
 * {@link http://www.websiteoptimization.com/secrets/css/font-shorthand.html}
 * <br>The syntax of the font: shorthand property is as follows:
 * <br>
 * font: &lt;font-style&gt; &lt;font-variant&gt; &lt;font-weight&gt; &lt;font-size&gt; / &lt;line-height&gt; &lt;fontfamily&gt;
 *
 * @param fontOpts
 * @returns
 */
function adaptFontShorthand(fontOpts) {
    var fstyle = fontOpts;
    if (isObject(fontOpts)) {
        fstyle = '';
        fstyle += fontOpts['font-style'] ? (fontOpts['font-style'] + ' ') : '';
        fstyle += fontOpts['font-variant'] ? (fontOpts['font-variant'] + ' ') : '';
        fstyle += fontOpts['font-weight'] ? (fontOpts['font-weight'] + ' ') : '';
        fstyle += fontOpts['font-size'] ? (fontOpts['font-size'] + ' ') : '';
        fstyle += fontOpts['line-height'] ? (fontOpts['line-height'] + ' ') : '';
        fstyle += fontOpts['font-family'] ? (fontOpts['font-family'] + ' ') : '';
    }
    return fstyle;
}

/**
 * Converts optoins to array style as d3 data array.
 *
 * @param options
 * @returns Array of options
 */
function adaptOptsToD3Data(options) {
    if (options instanceof Array) {
        return options;
    }

    if (options.data instanceof Array) {
        var returnOpts = [],
            i;
        for (i = 0; i < options.data.length; i++) {
            returnOpts[i] = {};
            returnOpts.data = options.data[i];

        }

    } else {
        return [options];
    }
}

/**
 * Convert object to array style as d3 data array.
 * @param object
 * @returns Array of object
 */
function toArray(object) {
    if (object instanceof Array) {
        return object;
    }
    return [object];
}

/**
 * Get class key of specified class to be used for css class seelction.
 *
 * @param clazzNames
 * @returns {String}
 */
function toClassKey(clazzNames) {
    return '.' + clazzNames.replace(' ', '.');
}

function toCssStyle(style) {
    if (typeof style === 'function') {
        return style;
    } else if (typeof style === 'object') {
        for (var key in style) {
            if (style.hasOwnProperty(key)) {
                var newKey = toCssStyle(key);
                if (newKey !== key) {
                    style[newKey] = style[key];
                    style[key] = null;
                    delete style[key];
                }
            }
        }
        return style;
    } else {
        return style ? style.replace(/([A-Z])/g, function(m, s) {
            return '-' + s.toLowerCase();
        }) : {};
    }
}

function setBounds(d3Sel, opts) {
    if (opts.x) {
        d3Sel.attr('x', opts.x);
    }
    if (opts.y) {
        d3Sel.attr('y', opts.y);
    }
    if (opts.dx) {
        d3Sel.attr('dx', opts.dx);
    }
    if (opts.dy) {
        d3Sel.attr('dy', opts.dy);
    }
    if (opts.width) {
        d3Sel.attr('width', opts.width);
    }
    if (opts.heigth) {
        d3Sel.attr('height', opts.height);
    }
}

function adaptCssStyle(property, styleOpts) {
    var type = typeof styleOpts,
        s;
    if (type === 'string' || type === 'function') {
        s = {};
        s[property] = styleOpts;
        return s;
    } else if (type === 'object') {
        return toCssStyle(styleOpts);
    } else {
        return {};
    }
}

/**
 * Return combined border stroke width.
 *
 * @param borderStyle
 * @returns {Number}
 */
function getBorderStrokeWidth(borderStyle) {
    return borderStyle ? (borderStyle.strokeWidth || borderStyle['stroke-width'] || borderStyle.width || 0) : 0;
}

/**
 * Convert properties of border style object to fit attribute name standard of HTML/SVG/CSS.
 *
 * @param _borderStyle
 * @param _chartContext
 * @returns {Object}
 */
function adaptBorderStyle(borderStyleOpts, context) {
    if (typeof borderStyleOpts === 'object') {
        // Adjust property value
        for (var k in borderStyleOpts) {
            if (borderStyleOpts.hasOwnProperty(k)) {
                if (k === 'roundCorner') {
                    borderStyleOpts.rx = borderStyleOpts.rx || borderStyleOpts.roundCorner;
                    borderStyleOpts.ry = borderStyleOpts.ry || borderStyleOpts.roundCorner;
                } else if (k === 'dashStyle') {
                    borderStyleOpts[k] = adaptDashstyle.call(this, k, borderStyleOpts[k], getBorderStrokeWidth(borderStyleOpts), context);
                } else if (k === 'stroke' || k === 'fill') {
                    borderStyleOpts[k] = adaptFill.call(this, borderStyleOpts[k], context);
                }
            }
        }
    }
    return adaptCssStyle.call(this, 'border', borderStyleOpts);
}

/**
 * Convert color option to HTML/CSS style.
 *
 * @param fillValue
 * @param context
 * @returns fill value object
 */
function adaptFill(fillValue, context) {
    var bbox = null,
        img = null,
        id = null,
        lg = null,
        i = 0;
    if (typeof fillValue === 'function') {
        return function(_this) {
            var args = context ? d3.merge(arguments, [context]) : arguments;
            return fillValue.apply(_this, args);
        };
    } else if (typeof fillValue === 'object') {
        if (fillValue.type === 'image') {
            bbox = this.getBBox();
            img = this.d3Sel.append('image').datum(fillValue);
            img.attr({
                'x': 0,
                'y': 0,
                'width': bbox.width,
                'height': bbox.height,
                'xlink:href': fillValue.parameters && fillValue.parameters[0]
            });
            return (fillValue.indexOf('url') >= 0) ? fillValue : ('#url(' + fillValue + ')');
        } else if (fillValue.type === 'linearGradient' || fillValue.type === 'radialGradient') {
            var defs = context.fDefs();
            id = uniqueId(fillValue.type);
            lg = defs.append(fillValue.type).attr('id', id).attr(adaptColorGradient(fillValue));
            for (i = 0; i < fillValue.stops.length; i++) {
                lg.append('stop')
                    .attr(toCssStyle({
                        offset: fillValue.stops[i].offset || '0%',
                        stopColor: (fillValue.stops[i].stopColor || (this.options && this.options.fill) || 'white'),
                        stopOpacity: fillValue.stops[i].stopOpacity || 1
                    }));
            }
            return 'url(#' + id + ')';
        }
    } else {
        return fillValue;
    }
}

/**
 * Return an unique id.
 *
 * @returns {String}
 */
function uniqueId(_param) {
    return GLOBAL.prefix + '-' + (_param ? (_param + '-') : '') + (internalCount++) + '-' + Math.random().toString(2).slice(2);
}

var LINEAR_GRADIENT_SHORT_NAME_PARTS = {
    'L': ['0%', '50%'],
    'R': ['100%', '50%'],
    'T': ['50%', '0%'],
    'B': ['50%', '100%'],
    'LT': ['0%', '0%'],
    'TL': ['0%', '0%'],
    'LB': ['0%', '100%'],
    'BL': ['0%', '100%'],
    'RT': ['100%', '0%'],
    'TR': ['100%', '0%'],
    'RB': ['100%', '100%'],
    'BR': ['100%', '100%']
};

/**
 * Convert gradient color options to svg gradient color paramters.
 *
 * @param gradientOpts
 * @returns
 */
function adaptColorGradient(gradientOpts) {
    var params = gradientOpts.parameters,
        parts = null;
    if (gradientOpts.type === 'linearGradient') {
        params = params || ['0%', '0%', '100%', '100%'];
        if (typeof params === 'string') {
            /**
             * It uses short name. The short name include L,T,R,B and mean Left
             * side, Top side, Right side and Bottom Side.
             * <p>
             * The form should be like 'L,R' or 'T,B' or 'LT,RB' and so on
             * separated with comma, the first part means start and the second
             * part means end. The short name will be convert to percent value form.
             */
            parts = params.split(',');
            params = [];
            params[0] = LINEAR_GRADIENT_SHORT_NAME_PARTS[parts[0]][0];
            params[1] = LINEAR_GRADIENT_SHORT_NAME_PARTS[parts[0]][1];
            params[2] = LINEAR_GRADIENT_SHORT_NAME_PARTS[parts[1]][0];
            params[3] = LINEAR_GRADIENT_SHORT_NAME_PARTS[parts[1]][1];
        }
        return {
            x1: params[0],
            y1: params[1],
            x2: params[2],
            y2: params[3]
        };
    } else if (gradientOpts.type === 'radialGradient') {
        return {
            cx: params[0],
            cy: params[1],
            r: params[2],
            fx: params[3],
            fy: params[4]
        };
    }
}

/**
 * Convert dash-style option to HTML/CSS style.
 *
 * @param name
 * @param value
 * @param width
 *            dash width
 * @param context
 * @returns
 */
function adaptDashstyle(v, width, context) {
    var i, value = v;
    if (typeof value === 'function') {
        return function() {
            var args = context ? d3.merge(arguments, [context]) : arguments;
            return value.apply(this, args);
        };
    } else {
        value = value && value.toLowerCase();
        if (value === 'solid') {
            value = 'none';
        } else if (value) {
            value = value.replace(/(shortdashdotdot)/g, '3,1,1,1,1,1,').replace(
                /(shortdashdot)/g, '3,1,1,1').replace(/(shortdot)/g, '1,1,')
                .replace(/(shortdash)/g, '3,1,').replace(/(longdash)/g, '8,3,')
                .replace(/(dot)/g, '1,3,').replace(/(dash)/g, '4,3,').replace(
                    /,$/, '').split(','); // ending comma

            i = value.length;
            while (i--) {
                value[i] = parseInt(value[i]) * width;
            }
            value = value.join(',');
        }

        return value;
    }
}

function adaptFontStyle(fontStyleOpts, context) {
    if (typeof fontStyleOpts === 'object') {

        // Adjust property value.
        for (var k in fontStyleOpts) {
            if (fontStyleOpts.hasOwnProperty(k)) {
                if (k === 'stroke' || k === 'fill') {
                    fontStyleOpts[k] = adaptFill.call(this, fontStyleOpts[k], context);
                    fontStyleOpts[k + 'Opacity'] = (fontStyleOpts[k + 'Opacity'] === undefined) ? 1 : fontStyleOpts[k + 'Opacity'];
                }
            }
        }
    }

    return adaptCssStyle.call(this, 'font', fontStyleOpts);
}

function adaptFillStyle(color) {
    return adaptCssStyle.call(this, 'fill', color);
}

function adaptBackgroundStyle(background) {
    return adaptCssStyle.call(this, 'fill', background);
}

/**
 * Convert margin option to standard format, the returned margin option contains
 * top&right&bottom&left.
 *
 * @param margin
 * @returns
 */
function adaptMargin(margin) {
    if (typeof margin === 'string') {
        var values = margin.split(/ /g);
        switch (values.length) {
            case 1:
                return {
                    top: toPixel(values[0], true),
                    right: toPixel(values[0], true),
                    bottom: toPixel(values[0], true),
                    left: toPixel(values[0], true)
                };
            case 2:
                return {
                    top: toPixel(values[0], true),
                    right: toPixel(values[1], true),
                    bottom: toPixel(values[0], true),
                    left: toPixel(values[1], true)
                };
            case 3:
                return {
                    top: toPixel(values[0], true),
                    right: toPixel(values[1], true),
                    bottom: toPixel(values[2], true),
                    left: toPixel(values[1], true)
                };
            case 4:
                return {
                    top: toPixel(values[0], true),
                    right: toPixel(values[1], true),
                    bottom: toPixel(values[2], true),
                    left: toPixel(values[3], true)
                };
        }
        return {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        };
    } else {
        var m = merge({
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }, margin);
        return m;
    }
}

function adaptPadding(padding) {
    return adaptMargin(padding);
}

function newBBoxObj() {
    return {
        'x': 0,
        'y': 0,
        'width': 0,
        'height': 0
    };
}

function format(data, formatFact) {
    var type = typeof formatFact;
    if (!formatFact) {
        return data;
    }
    if (type === 'function') {
        return formatFact.call(this, data);
    } else if (type === 'string') { // It's pattern
        return d3.format(formatFact).call(this, data);
    }
};/**
 * Specification:
 * 1. Use css properties as default options.
 * 2. Variable starting with '_' means private object. e.g. _width indicates width of object, as default, other class should not access this variable.
 * 3. Variable starting with '__' means remained object. e.g. Class.__super indicates parent class
 * 4. All private functions should start with '_f', all other functions should start with 'f'.
 * 5. Constants are defined in prototype object and use UPPER case.
 * 6. Every element includes prototype functions fInit, fOptins, fRender, fRedraw, fApplyChange, fBBox, fDestory; and prototype properties __class_name, __super, options, context.    
 */


// The field is used to count internally.
var internalCount = 0;

var Global = {
    lazyRender: true,
    prefix: 'd3charts'
};

/**
 * New node file
 */
var Element = function() {};
var Label = function(){};
var Series = function(){};
var DataPoint = function(){};
var Axis = function(){};
var Legend = function(){};
var LegendItem = function(){};
var Title = function(){};

var Chart = function() {};
var Tooltip = function(){};


var Context = extendClass('Context', null, Object, {
	prefix: null,
	lazyRender: null,
	svgNode: null,
	fInit: function(svgNode) {
		this.prefix = Global.prefix;
		this.lazyRender = Global.lazyRender;
		this.svgNode = svgNode;
	},
	fSvgSel: function() {
		if (!arguments.length) {
			return this.svgSel;
		} else {
			this.svgSel = arugments[0];
			return this;
		}
	},
    fDefs: function () {
        if (!arguments.length) {
            return this.defs ? this.defs : (this.defs = this.svgSel.append('defs'));
        } else {
            this.defs = arguments[0];
            return this;
        }
    }
});


/**
 * This class defines two abstract callbacks for user to do custom process during rendering.
 */
var RendererCallback = extendClass('RenderCallback', null, null, {
    fBeforeRendering: function () {
        
    },
    fAfterRendering: function () {
        
    }
});

/**
 * Element class is base class of chart.
 */
var Element = extendClass('Element', null, RendererCallback,  {
    __className: null,
    //__classKey: null,
	__super: null,
    context: null,
    parent: null,
    options: null,
    d3Sel: null,
    isRendered: false,
    fInit: function(_context, _parent, _options) {
        this.context = _context;
        this.parent = _parent;
    	this.options = _options || {};
    },
    fOptions: function () {
        if (!arguments.length) {
            return this.options;
        } else {
            this.options = arguments[0];
            return this.fApplyChange(this.fOptions);
        }
    },
    fApplyChange: function (callerFunction) {
        if (!this.context.lazyRender) {
            this.fRedraw();
        }
        return this;
    },
    fRender: function (_d3Sel) {
    	this.d3Sel = _d3Sel;
        this.fBeforeRendering.apply(this, arguments);
        this._fRender.apply(this, arguments);
        this.isRendered = true;
        this.fAfterRendering.apply(this, arguments);
        return this;
    },
    _fRender: function (_d3Sel) {
        // Do nothing in abstract method.
        return this;
    },
    fRedraw: function () {
        // Only render element after destory successfully. Before first
        // rendering, the element have not been rendered, so it is forbidden to
        // redraw.
        if (this.d3Sel && this.fDestory()) {
            this.fRender(this.d3Sel);
        }
        
        return this;
    },
    fAttr: function () {
        var type = null;
        if (this.d3Sel) {
            if (arguments.length === 1) {
                type = typeof arguments[0];
                if (type === 'string') {
                    return this.d3Sel.attr(arguments[0]);
                } else if (type === 'object') {
                    this.d3Sel.attr.apply(this, arguments);
                }
            } else if (arguments.length) {
                this.d3Sel.attr.apply(this, arguments);
            }
        }
        
        return this;
    },
    fClassNames: function() {
    	return this.options.id ? this.options.id + ' ' + this.__className : this.__className;
    },
    fBBox: function () {
    	 return this.d3Sel ? copy(this.d3Sel.bbox()): {};
    },
    fDestory: function () {
        if (this.d3Sel) {
            this.d3Sel.selectAll('*').remove();
            //delete this;
            this.isRendered = false;
            return true;
        } else {
            return false;
        }
    }
});;var DefaultTextOpts = {
	enabled: true,
	id : '', // Here the id is same with class name with Dom element.
	x:0,
	y:0,
	data:'',  
	format:'', // This is a format pattern or a function
	font:'', // Font css styles
	border:'', // Border css styles or svg stroke styles
	color:'', // Color css styles or svg fill styles
	rotate:{
		degree:'',
		mode:''
	},
	align:'', // 'left', 'center', 'right', 'auto' == 'left'
	verticalAlign:'' // 'top', 'center', 'bottom', 'auto' == 'top'
};

var Text = extendClass('Text', null, Element, {
	_fRender:function(_d3Sel) {
		var opts = this.options,
		classNames = this.fClassNames(),
		textUpdate = _d3Sel.selectAll(toClassKey(classNames)).data(toArray(opts.data));
		
		if (opts.enabled === false) {
			textUpdate.remove();
			return;
		}

		textUpdate.exit().remove();
		textUpdate.enter().append('text').attr('class', classNames);
		
		textUpdate
		.each(function(d, i){
			var _this = d3.select(this), texts = d.split('\n');
			if (texts.length <= 1) {
				_this.text(function(d, i){
					return format(d, opts.format);
				});
			} else {
				for(var k in texts) {
					_this.append('tspan').text(function() {
						return format(texts[k], opts.format);
					})
					.attr('x', opts.x || 0)
					.attr('dy', (k * 1) + 'em');
				}
			}
		})
		.style(adaptFontStyle(opts.font))
		.style(adaptBorderStyle(opts.border))
		.style(adaptFillStyle(opts.color))
		.call(function(d3sel, options) {
			// adjust dy with vertical align
			var h = d3sel.bbox().height;
			var offset = (!options.verticalAlign || options.verticalAlign === 'top') ? h : (options.verticalAlign === 'center' ? h /2 : 0);
			if (typeof options.y === 'function') {
				var yFunc = options.y;
				options.y = function(){
					return yFunc.apply(this, arguments) + offset;
				};
			} else {
				options.y = (options.y || 0 ) + offset;
			}
			d3sel.call(setBounds, options);
		 }, opts)
		.style('text-anchor', text_adaptTextAnchor(opts.align))
		.call(rotate, opts.rotate);
	},
});

function text_adaptTextAnchor(align) {
	return align === 'center' ? 'middle' : (align === 'right' ? 'end' : 'start');
}


;/**
 * Merge options from text.
 */
var DefaultLabelOpts = {
	enabled: true,
    x: 0,
	y: 0,
	margin: {},
	padding: {},
	border: {},
	background: {
		fill: null
	},
	data: '',
	format: '', // This is a format pattern or a function
	font: '', // Font css styles
	fontBorder: '', // Border css styles or svg stroke styles
	fontColor: '', // Color css styles or svg fill styles
	rotate: {
		degree: '',
		mode: ''
	},
	align: '', // 'left', 'center', 'right', 'auto' == 'left'
	verticalAlign: '' // 'top', 'center', 'bottom', 'auto' == 'top'
};

var Label = extendClass('Label', null, Element, {
	_fRender: function(_d3Sel) {
		var opts = this.options,
			borderSel = null,
			borderStrokeWidth = getBorderStrokeWidth(opts.border),
			classNames = this.fClassNames(),
			labelUpdate = _d3Sel.selectAll(toClassKey(classNames)).data(toArray(opts.data));

		if (opts.enabled === false) {
			labelUpdate.remove();
			return;
		}
		
		opts.margin = adaptMargin(opts.margin);
		opts.padding = adaptPadding(opts.padding);

		labelUpdate.exit().remove();
		labelUpdate.enter().append('g').attr('class', classNames);
		labelUpdate.call(translate, opts.x || 0, opts.y || 0, this.context)
			.each(function(d, i) {
				var
					parent = d3.select(this),
					outlineSel = parent.append('rect').attr('class', 'outline')
					.attr({
						'x': 0,
						'y': 0
					});


				if (!emptyObject(opts.border) || !emptyObject(opts.background)) {
					// Add border and background rect
					borderSel = parent.append('rect').attr('class', 'border background')
						.style(adaptBorderStyle(opts.border))
						.style(adaptFillStyle(opts.background));
				}

				textSel = parent.append('text').attr('class', 'text')
					.each(function(d, i) {
						var _this = d3.select(this);
						if (typeof d === 'string') {
							var texts = d.split('\n');
						
							if (texts.length <= 1) {
								_this.text(function(d, i) {
									return format(d, opts.format);
								});
							} else {
								for (var k in texts) {
									_this.append('tspan').text(function() {
										return format(texts[k], opts.format);
									})
									.attr('x', opts.x || 0)
									.attr('dy', (k * 1) + 'em');
								}
							}
						} else {
							_this.text(function(d, i) {
									return format(d, opts.format);
							});
						}
					})
					.style(adaptFontStyle(opts.font))
					.style(adaptBorderStyle(opts.fontBorder))
					.style(adaptFillStyle(opts.fontColor));

					//.style('text-anchor', text_adaptTextAnchor(opts.align));

				var outlineBBox = outlineSel.bbox();
				var borderBBox = borderSel ? borderSel.bbox() : newBBoxObj();
				var textBBox = textSel.bbox();

				borderBBox.x = opts.margin.left;
				borderBBox.y = opts.margin.top;
				textBBox.x = borderBBox.x + borderStrokeWidth + opts.padding.left;
				textBBox.y = borderBBox.y + borderStrokeWidth + opts.padding.top;
				borderBBox.width = (textBBox.x - borderBBox.x) * 2 + textBBox.width;
				borderBBox.height = (textBBox.y - borderBBox.y) * 2 + textBBox.height;
				outlineBBox.width = opts.margin.left + borderBBox.width + opts.margin.right;
				outlineBBox.height = opts.margin.top + borderBBox.height + opts.margin.bottom;

				outlineSel.attr({
					'x': outlineBBox.x,
					'y': outlineBBox.y,
					'width': outlineBBox.width,
					'height': outlineBBox.height
				});
				if (borderSel) {
					borderSel.attr({
						'x': borderBBox.x,
						'y': borderBBox.y,
						'width': borderBBox.width,
						'height': borderBBox.height
					});
				}
				textSel.attr({
					'x': textBBox.x,
					'y': textBBox.y + textBBox.height / (textSel.selectAll('tspan').size() || 1)
				});
				// Adjust tspan position.
				textSel.selectAll('tspan').attr('x', textSel.attr('x'));

				// Adjust group translate coordinates with vertical align and horizontal align
				var dx = opts.align === 'right' ? -outlineBBox.width : (opts.align === 'center' ? -outlineBBox.width / 2 : 0),
					dy = opts.verticalAlign === 'bottom' ? -outlineBBox.height : (opts.verticalAlign === 'center' ? -outlineBBox.height / 2 : 0),
					trans = translate(parent);
				parent.call(translate, trans[0].x + dx, trans[0].y + dy, this.context)
					.call(rotate, opts.rotate);
			});
	},
});;var DEFAULT_MAJOR_TICKS = 10;
var DEFAULT_MINOR_TICKS = 3;
var DEFAULT_MAJOR_TICK_SIZE = 5;
var DEFAULT_MINOR_TICK_SIZE = 3;
var DEFAULT_TICK_LABEL_PADDING = 3;

var DefaultAxisOptions = {
	orient: 'x', // 'x' or 'y'
	mode: 'linear', // 'linear', 'pow', 'log', 'sqrt', 'quantize', 'quantile', 'identity', 'ordinal', 'time'
	domain: null, // Actual values or value range to be presented on the axis.
	reversed: false, // default direction of axis is left to right or bottom to top, <code>TRUE</code> means rigth to left or top to bottom.
	location: 'bottom', // 'bottom', 'left', 'top', 'right'. x default is 'bottom', y default is 'left'
	x: 0, // The x coordinate
	y: 0, // The y coordinate
	width: 0,
	height: 0,
	background: {

	},
	border: {

	},
	title: {
		enabled: true,
		position: 'bottom', // 'below', 'above', 'left', 'right'
		anchor: 'center', // 'left', 'center', 'right' , 'top', 'bottom'
		dx: 0,
		dy: 0
	},
	line: {
		enabled: true,
		style: {}
	},
	tick: {
		major: {
			enabled: true,
			mode: 'above', // 'below', 'above', 'left', 'right', 'cross'. x bottom default is 'above', x top default is 'below', y left default is 'right', y right default is 'left'.
			numbers: 'auto',
			size: 5,
			style: {}
		},
		minor: {
			enabled: false,
			mode: 'above', // Same with major.mode.
			numbers: 3,
			size: 3,
			style: {}
		},
		label: {
			enabled: true,
			mode: 'below', // 'below', 'above', 'left', 'right' or 'same', 'opposite'. 'same' means same mode with tick.major.mode
			stagger: false,
			autoDrop: false, // Auto detect overlap label and drop it.
			dx: 0,
			dy: 0,
			tickPadding: 3
		}
	},
	mark: [{
		enabled: true,
		type: 'symbol', // 'symbol', 'line', 'band'
		symbol: null, // Valid for symbol mark type.
		size: null, // Valid for symbl mark type.
		start: null, // Valid for symbol, line or band marks.
		end: null, // Only valid for band mark.
		min: null, // Indicate line or band min/max limits on opposite axis.
		max: null, // Same with 'min'.
		background: {}, // The fill style of this mark.
		border: {}, // The border style of this mark.
		label: {} // Mark label.
	}]
}

var Axis = extendClass('Axis', null, Element, {
	_fRender: function(_d3Sel) {
		var context = this.context,
			opts = this.options,
			lineOpts = opts.line,
			tickOpts = opts.tick,
			majorOpts = tickOpts.major,
			minorOpts = tickOpts.minor,
			labelOpts = tickOpts.label,
			scale = axis_scale(opts.mode),
			axis = d3.svg.axis(),
			classNames = this.fClassNames(),
			axisUpdate = _d3Sel.selectAll(toClassKey(classNames)).data([opts.domain]),
			w = toPixel(opts.width || _d3Sel.attr('width'), true),
			h = toPixel(opts.height || _d3Sel.attr('height'), true);

		if (opts.enabled === false) {
			labelUpdate.remove();
			return;
		}

		// Remove unused axes and new axes.
		axisUpdate.exit().remove();
		axisUpdate.enter().append('g').attr('class', classNames)
			.call(translate, opts.x || 0, opts.y || 0, this.context);

		// Render background and border.
		if (opts.background || opts.border) {
			var backgroundUpdate = axisUpdate.selectAll('.border.background').data([0]);
			backgroundUpdate.enter().append('rect').attr('class', 'border background');
			d3.transition(backgroundUpdate)
				.style(adaptBorderStyle(opts.border))
					.style(adaptBackgroundStyle(opts.background))
					.attr({
						'x': 0,
						'y': 0,
						'width': w,
						'height': h
					});
		}

		// Set scale domain and range.
		scale.domain(opts.domain);
		if (opts.orient === 'x') {
			scale.range(opts.reversed ? [w, 0] : [0, w]);
		} else if (opts.orient === 'y') {
			scale.range(opts.reversed ? [0, height] : [height, 0]);
		}

		var scale0 = this.__scale__ || scale,
			scale1 = this.__scale__ = scale.copy();

		// Ticks, or domain vaues for ordinal scales.
		var tickNumbers = majorOpts.tickNumbers || DEFAULT_MAJOR_TICKS,
			ticks = scale1.ticks ? scale1.ticks.apply(scale1, [tickNumbers]) : scale1.domain(),
			majorTickUpdate = axisUpdate.selectAll('.major.tick').data(ticks, scale1),
			majorTickExit = d3.transition(majorTickUpdate.exit()).style('opaity', 1e-6).remove(),
			majorTickEnter = majorTickUpdate.enter().insert('g', '.axis.line').attr('class', 'major tick').style(toCssStyle(majorOpts.style)).style('opacity', 1e-6),
			lableFormat = String;
		majorTickUpdate = d3.transition(majorTickUpdate).style('opacity', 1);

		// Init tick label formatter.
		if (typeof labelOpts.format === 'function') {
			labelFormat = labelOpts.format;
		} else {
			labelFormat = scale1.tickFormat ? scale1.tickFormat.apply(scale1, [tickNumbers], labelOpts.format) : (labelOpts.format || String);
		}
		labelOpts.format= labelFormat;

		if (minorOpts && minorOpts.enabled !== false) {
			var minorTickNumbers = minorOpts.tickNumber || DEFAULT_MINOR_TICKS,
				minorTicks = axis_minorTicksDivide(scale1, ticks, minorTickNumbers),
				minorTickUpdate = axisUpdate.selectAll('minor tick').data(minorTicks, String),
				minorTickExit = d3.transition(minorTickUpdate.exit()).style('stroke-opacity', 1e-6).remove(),
				minorTickEnter = minorTickUpdate.enter().insert('line', '.tick').attr('class', 'minor tick line').style(toCssStyle(minorOpts.style)),
				hasMinor = true;
			minorTickUpdate = d3.transition(minorTickUpdate).style(toCssStyle(minorOpts.style));
		}

		// Axis axis line, domain.
		var range = axis_scaleRange(scale1),
			axisLineUpdate = axisUpdate.selectAll('.axis.line').data([opts.orient]),
			axisLineEnter = axisLineUpdate.enter().append('path').attr('class', 'axis line').style('fill', 'none');
		axisLineUpdate = d3.transition(axisLineUpdate);

		// Add major ticks
		majorTickEnter.append('line').attr('class', 'major tick line').style('fill', 'none');
		// Add major tick labels
		labelOpts.id = 'major tick label';
		labelOpts.align = labelOpts.align || 'center';
		var label = null, _this = this;
		majorTickUpdate.each(function(d, i){
			var lOpts = clone(labelOpts);
			lOpts.data = [d];
			label = new Label(context, _this, lOpts);
			label.fRender(d3.select(this));
		});

		var majorTickLineSel = majorTickUpdate.selectAll('.major.tick.line'),
			tickLabelSel = majorTickEnter.selectAll('g.major.tick.label');

		axis_adaptTicksMode(tickOpts, opts.orient);

		var majorTickSize = majorOpts.size || DEFAULT_MAJOR_TICK_SIZE,
			minorTickSize = minorOpts.size || DEFAULT_MINOR_TICK_SIZE,
			labelTickPadding = labelOpts.tickPadding || DEFAULT_TICK_LABEL_PADDING,
			majorTickOffset = axis_tickOffset(majorOpts, majorTickSize, opts.location),
			minorTickOffset = axis_tickOffset(minorOpts, minorTickSize, opts.location),
			tickLabelOffset = axis_tickLabelOffset(labelOpts, opts.location, majorOpts.mode, majorTickSize, labelTickPadding),
			axisLinePath = axis_linePath(opts.location, range),
			tickTransform = null;

		if (opts.location === 'top' || opts.location === 'bottom') {
			tickTransform = axis_transformHorizontal;
			majorTickLineSel.attr('x1', 0).attr('x2', 0).attr('y1', majorTickOffset[0]).attr('y2', majorTickOffset[1]);
			//tickLabelSel.selectAll('text').attr({'dx': 0, 'dy': tickLabelOffset[0] + tickLabelOffset[1]});
			if (hasMinor) {
				minorTickEnter.attr('y1', minorTickOffset[0]).attr('y2', minorTickOffset[1]);
				minorTickUpdate.attr('x2', 0).attr('y1', minorTickOffset[0]).attr('y2', minorTickOffset[1]);
			}
		} else if (opts.location === 'left' || opts.location === 'right') {
			tickTransform = axis_transformVertical;
			majorTickLineSel.attr('x1', majorTickOffset[0]).attr('x2', majorTickOffset[1]).attr('y2', 0);
			//tickLabelSel.selectAll('text').attr({'dx': 0, 'dy': tickLabelOffset[0] + tickLabelOffset[1]});
			if (hasMinor) {
				minorTickEnter.attr('x1', minorTickOffset[0]).attr('x2', minorTickOffset[1]);
				minorTickUpdate.attr('x1', minorTickOffset[0]).attr('x2', minorTickOffset[1]).attr('y2', 0);
			}
		}
		axisLineEnter.attr('d', axisLinePath).style(toCssStyle(lineOpts.style));
		axisLineUpdate.attr('d', axisLinePath).style(toCssStyle(lineOpts.style));

		// For ordinal scales:
		// - any entering ticks are undefined in the old scale
		// - any exiting ticks are undefined in the new scale
		// Therefor, we only need to transition updating ticks.
		if (scale1.rangeBand) {
			var dx = scale1.rangeBand() / 2,
				x = function(d) {
					return scale1(d) + dx;
				};
			majorTickEnter.call(tickTransform, x);
			majorTickUpdate.call(tickTransform, x);
		}
		// For quantitative scales;
		// - enter new ticks from the old scale
		// - exit old ticks to the new scale
		else {
			majorTickEnter.call(tickTransform, scale0);
			majorTickUpdate.call(tickTransform, scale1);
			majorTickExit.call(tickTransform, scale1);
			if (hasMinor) {
				minorTickEnter.call(tickTransform, scale0);
				minorTickUpdate.call(tickTransform, scale1);
				minorTickExit.call(tickTransform, scale1);
			}
		}

	},
	fDomain: function() {
		if (!arguments.length) {
			return this.options.domain;
		} else {
			this.options.domain = arguments[0];
			return this;
		}
	},
	fGetLineXY: function() {
		// Return x, yThe st
	}
});

function axis_scale(mode) {
	if (d3.scale[mode] && typeof d3.scale[mode] === 'function') {
		return d3.scale[mode]();
	} else {
		return d3.scale.ordinal()
	}
}

function axis_scaleExtent(domain) {
	var start = domain[0],
		stop = domain[domain.length - 1];
	return start < stop ? [start, stop] : [stop, start];
}

function axis_scaleRange(scale) {
	return scale.rangeExtent ? scale.rangeExtent() : axis_scaleExtent(scale.range());
}

function axis_tickOffset(tickOpts, tickSize, location) {
	if (location === 'top' || location === 'bottom') {
		return [(tickOpts.mode === 'cross') ? -tickSize : 0, (tickOpts.mode === 'above') ? -tickSize : ((!tickOpts.mode && location === 'top') ? -tickSize : tickSize)];
	} else {
		return [(tickOpts.mode === 'cross') ? -tickSize : 0, (tickOpts.mode === 'left') ? -tickSize : ((!tickOpts.mode && location === 'left') ? -tickSize : tickSize)];
	}
}

function axis_adaptTicksMode(tickOpts, orient) {
	if (tickOpts.label) {
		tickOpts.label.mode = axis_adaptTickMode(orient, tickOpts.label.mode);
	}
	tickOpts.major.mode = axis_adaptTickMode(orient, tickOpts.major.mode);
	if (tickOpts.minor) {
		tickOpts.minor.mode = axis_adaptTickMode(orient, tickOpts.minor.mode);
	}
}

function axis_adaptTickMode(location, mode) {
	if (mode === 'corss') {
		return mode;
	}

	if (location === 'top') {
		return mode === 'left' ? 'below' : (mode === 'right' ? 'top' : mode);
	} else if (location === 'bottom') {
		return mode === 'right' ? 'above' : (mode === 'left' ? 'below' : mode);
	} else if (location === 'left') {
		return mode === 'above' ? 'right' : (mode === 'below' ? 'left' : mode);
	} else if (location === 'right') {
		return mode === 'below' ? 'left' : (mode === 'above' ? 'right' : mode);
	} else {
		return mode;
	}
}

function axis_tickLabelOffset(opts, location, tickMode, tickSize, tickPadding) {
	var _tickMode = axis_adaptTickMode(location, tickMode);
	if (opts.mode === 'same') {
		opts.mode = _tickMode;
	} else if (opts.mode === 'opposite') {
		opts.mode = (_tickMode === 'cross') ? ((location === 'top') ? 'below' : (location === 'bottom' ? 'above' : location === 'left' ? 'right' : 'left')) : ((_tickMode === 'below') ? 'above' : (_tickMode === 'above' ? 'below' : _tickMode === 'left' ? 'right' : 'left'));
	}

	if (opts.mode === 'cross') {
		opts.mode = (location === 'top') ? 'above' : (location === 'bottom' ? 'below' : location === 'left' ? 'left' : 'right');
	}

	if (location === 'bottom' || location === 'top') {
		if (opts.mode === 'above') {
			return [((_tickMode !== 'below') ? -Math.max(tickSize, 0) : 0) - tickPadding, '0em'];
		} else {
			return [((_tickMode !== 'above') ? Math.max(tickSize, 0) : 0) + tickPadding, '.8em'];
		}
	} else if (location === 'left' || location === 'right') {
		if (opts.mode === 'left') {
			return [((_tickMode !== 'right') ? -Math.max(tickSize, 0) : 0) - tickPadding, '.32em'];
		} else {
			return [((_tickMode !== 'left') ? Math.max(tickSize, 0) : 0) + tickPadding, '.32em'];
		}
	}
}


function axis_linePath(location, range) {
	if (location === 'top' || location === 'bottom') {
		return 'M' + range[0] + ',0' + ' H' + range[1];
	} else if (location === 'left' || location === 'right') {
		return 'M' + range[0] + ',0' + ' V' + range[1];
	}
}

function axis_transformHorizontal(selection, x) {
	selection.attr("transform", function(d) {
		return "translate(" + x(d) + ",0)";
	});
}

function axis_transformVertical(selection, y) {
	selection.attr("transform", function(d) {
		return "translate(0," + y(d) + ")";
	});
}

function axis_minorTicksDivide(scale, ticks, m) {
	var subticks = [];
	if (m && ticks.length > 1) {
		var extent = axis_scaleExtent(scale.domain()),
			i = -1,
			n = ticks.length,
			d = (ticks[1] - ticks[0]) / ++m,
			j, v;
		while (++i < n) {
			for (j = m; --j > 0;) {
				if ((v = +ticks[i] - j * d) >= extent[0]) {
					subticks.push(v);
				}
			}
		}
		for (--i, j = 0; ++j < m && (v = +ticks[i] + j * d) < extent[1];) {
			subticks.push(v);
		}
	}
	return subticks;
};/**
 * New node file
 */
var birtchart = birtchart || {};
birtchart.Global = Global;
birtchart.Context = Context;
birtchart.Text = Text;
birtchart.Label = Label;
birtchart.Axis = Axis;

var util = util || {};
birtchart.util = util;
util.DPI = DPI;
util.getDPI = getDPI;
util.uniqueId = uniqueId;
util.clone = clone;
util.copy = copy;
util.merge = merge;
util.isFunction = isFunction;
util.isNumber = isNumber;
util.isObject = isObject;
util.isString = isString;
util.emptyObject = emptyObject;
util.toRadian = toRadian;
util.toDegree = toDegree;
util.toArray = toArray;
util.rotateNode = rotateNode;
util.adaptSize = adaptSize;

window.birtchart = window.birtchart || birtchart;
;/**
 * New node file
 */
})();