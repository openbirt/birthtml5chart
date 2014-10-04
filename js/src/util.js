var DPI;
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

    return d3Sel.attr('transform', function (_d) {
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
        d3Sel.each(function (d, i, j) {
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
            if (!transXY[j]) {
                transXY.push({'x': 0, 'y': 0});
            }
        });
        return transXY;
    }

    function f(x, d, i, j) {
        return typeof x === 'function' ? x(d, i, j, context) : x;
    }

    return d3Sel.attr('transform', function (d, i, j) {
        var translateEpr = 'translate(' + f(x, d, i, j) + ',' + f(y, d, i, j) + ')',
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
        return style ? style.replace(/([A-Z])/g, function (m, s) {
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
        return function (_this) {
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
        return function () {
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
}