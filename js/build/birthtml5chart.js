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
};;/** Check if specified value is number.
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
    
    var b = (node.nodeName === 'g' || node.nodeName === 'text') ? node.getBBox() : {'x': 0, 'y': 0, 'width': 0, 'height': 0};
    node._bbox = {'x': b.x, 'y': b.y, 'width': b.width, 'height': b.height};
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
	var degree = _degree, mode = _mode, enabled = true;
	if (typeof _degree === 'object' && !mode) {
		degree = _degree.degree;
		mode = _degree.mode;
		enabled = _degree.enabled !== false;
	}
	
    var box, cx, cy, tran, tranA, cxy;

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
        tran = svgNode.getAttribute('transform');
        if (tran) {
            tranA = tran.split(/\)/g);
            if (tranA.length) {
                tran = '';
                for (var i in tranA) {
                    if (tranA.hasOwnProperty(i)) {
                        tran += ' ' + (tranA[i].indexOf('rotate') >= 0) ? 'rotate(' +
                                degree + cxy + ')'
                                : tranA[i].trim() + ')';
                    }
                }
            }
        } else {
            tran = 'rotate(' + degree + cxy + ')';
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
	var degree = _degree, mode = _mode, enabled = true;
	if (typeof _degree === 'object' && !mode) {
		degree = _degree.degree;
		mode = _degree.mode;
		enabled = _degree.enabled !== false;
	}
	
    return d3Sel.attr('transform', function (_d) {
        var box, cx, cy, tran = null, tranA, cxy;

        if (enabled  && typeof degree === 'number') {
            box = this.getBBox();
            if (mode === 'auto') {
                cxy = '';
            } else {
                cx = (mode === 'start') ? box.x : (mode === 'end') ? box.x +
                        box.width : (box.x + box.width / 2);
                cy = box.y + box.height / 2;  
                cxy = ' ' + cx + ',' + cy;
            }
            
            tran = this.getAttribute('transform');
            if (tran) {
                tranA = tran.split(/\)/g);
                if (tranA.length) {
                    tran = '';
                    for (var i in tranA) {
                        if (tranA.hasOwnProperty(i)) {
                            tran += ' ' + (tranA[i].indexOf('rotate') >= 0) ? 'rotate(' +
                                    degree + cxy + ')'
                                    : tranA[i].trim() + ')';
                        }
                    }
                }
            } else {
                tran = 'rotate(' + degree + cxy + ')';
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
function translate(d3Sel, x, y) {
    if (arguments.length === 1) {
        // Return x and y of current translate.
        var transXY = [];
        d3Sel.each(function(){
            var tran = this.getAttribute('transform');
            if (tran && tran.indexOf('translate') >= 0) {
                tran = tran.match(/translate\([0-9\s\.\-,]+\)/);
                if (tran && tran.length) {
                    tran = tran[0].match(/([0-9\.\-]+)/g);
                    if (tran && tran.length && tran.length > 1) {
                        transXY.push({'x':tran[0], 'y': tran[1]});
                    }
                }
            }
        });
        return transXY;
    }
    
    function f (x, d) {
        return typeof x === 'function' ? x(d) : x; 
    }
    return d3Sel.attr('transform', function (d) {
        var tran = this.getAttribute('transform');
        if (tran && tran.indexOf('translate') >= 0) {
            tranA = tran.split(/\)/g);
            if (tranA.length) {
                tran = '';
                for (var i in tranA) {
                    if (tranA.hasOwnProperty(i) && tranA[i].trim() !== '') {
                        tran += ' ' + (tranA[i].indexOf('translate') >= 0) ? 'translate(' +
                                f(x, d) + ',' + f(y, d) + ')'
                                : tranA[i].trim() + ')';
                    }
                }
            }
        } else {
            tran = 'translate(' + f(x, d) + ',' + f(y, d) + ') ' + (tran || '');
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
		fstyle += fontOpts['font-style'] ? (fontOpts['font-style'] + ' '): ''; 
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
	
	if(options.data instanceof Array) {
		var returnOpts = [], i;
		for(i = 0; i < options.data.length; i++) {
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
 * @param clazzName
 * @returns {String}
 */
function toClassKey(clazzName) {
	return '.' + clazzName;
}

function toCssStyle(style) {
	if (typeof style === 'function') {
		return style;
	}
	else if (typeof style === 'object') {
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
		d3Sel.attr(opts.width);
	}
	if (opts.heigth) {
		d3Sel.attr(opts.height);
	}
}

function adaptCssStyle(property, styleOpts) {
	var type = typeof styleOpts, s;
	if (type === 'string' || type === 'function') {
		s = {};
		s[property] = styleOpts;
		return s;
	} else if (type === 'object' ){
		return toCssStyle(styleOpts);
	} else {
		return {};
	}
}

function adaptBorderStyle(borderStyleOpts, context) {
	if (typeof borderStyle === 'object') {
        // Adjust property value
        for (var k in borderStyleOpts) {
            if (borderStyleOpts.hasOwnProperty(k)) {
                if (k === 'roundCorner') {
                    borderStyleOpts.rx = borderStyleOpts.rx || borderStyleOpts.roundCorner;
                    borderStyleOpts.ry = borderStyleOpts.ry || borderStyleOpts.roundCorner;
                } else if (k === 'dashStyle') {
                    borderStyleOpts[k] = adaptDashstyle.call(this, k, borderStyleOpts[k], d3c_getBorderWidth(borderStyleOpts), context).value;
                } else if (k === 'stroke' || k === 'fill') {
                    borderStyleOpts[k] = adaptFill.call(this, borderStyleOpts[k], context).value;
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
        return (function (_this) {
            var args = context ? d3.merge(arguments, [context])
                : arguments;
            return {
                'value' : fillValue.apply(_this, args)
            };
        })(this);
    } else if (typeof fillValue === 'object') {
        if (fillValue.type === 'image') {
            bbox = this.getBBox();
            img = this.d3Sel.append('image').datum(fillValue);
            img.attr({'x': 0, 'y': 0, 'width': bbox.width, 'height': bbox.height,
            'xlink:href': fillValue.parameters && fillValue.parameters[0]});
            return {
                value : (fillValue.indexOf('url') >= 0) ? fillValue : ('#url(' + fillValue + ')'),
                imageNode : img
            };
        } else if (fillValue.type === 'linearGradient' || fillValue.type === 'radialGradient') {
            var defs = context.fDefs();
            id = uniqueId(fillValue.type);
            lg = defs.append(fillValue.type).attr('id', id).attr(adaptColorGradient(fillValue));
            for (i = 0; i < fillValue.stops.length; i++) {
                lg.append('stop')
                .attr(toCssStyle({offset: fillValue.stops[i].offset || '0%', stopColor: (fillValue.stops[i].stopColor || (this.options && this.options.fill) || 'white'), stopOpacity: fillValue.stops[i].stopOpacity || 1}));
            }
            return {
                value : 'url(#' + id + ')',
                gradientNode : lg
            };
        }
    } else {
        return {
            value : fillValue
        };
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
        'L' : ['0%', '50%'],
        'R' : ['100%', '50%'],
        'T' : ['50%', '0%'],
        'B' : ['50%', '100%'],
        'LT' : ['0%', '0%'],
        'TL' : ['0%', '0%'],
        'LB' : ['0%', '100%'],
        'BL' : ['0%', '100%'],
        'RT' : ['100%', '0%'],
        'TR' : ['100%', '0%'],
        'RB' : ['100%', '100%'],
        'BR' : ['100%', '100%']
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
        params = params || ['0%',  '0%', '100%', '100%'];
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
        return {x1 : params[0], y1 : params[1], x2 : params[2], y2 : params[3]};
    } else if (gradientOpts.type === 'radialGradient') {
        return {cx : params[0], cy : params[1], r : params[2], fx : params[3], fy : params[4]};
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
function adaptDashstyle(name, v, width, context) {
    var i, value = v;
    if (typeof value === 'function') {
        return (function (_this) {
            var args = context ? d3.merge(arguments, [context])
                    : arguments;
            return {
                'name' : name,
                'value' : value.apply(_this, args)
            };
        })(this);
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

        return {
            'name' : name,
            'value' : value
        };
    }
}

function adaptFontStyle(fontStyleOpts, context) {
	if (typeof fontStyleOpts === 'object') {
        
        // Adjust property value.
        for (var k in fontStyleOpts) {
            if (fontStyleOpts.hasOwnProperty(k)) {
                if (k === 'stroke' || k === 'fill') {
                    fontStyleOpts[k] = adaptFill.call(this, fontStyleOpts[k], context).value;
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
	fInit: function() {
		this.prefix = Global.prefix;
		this.lazyRender = Global.lazyRender;
	},
	fDefs: function() {
		// Return SVG definitions.
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
	data:'',  
	textAnchor:'',
	format:'', // This is a format pattern or a function
	font:'', // Font css styles
	border:'', // Border css styles or svg stroke styles
	color:'', // Color css styles or svg fill styles
	rotate:{
		degree:'',
		mode:''
	}
};

var Text = extendClass('Text', null, Element, {
	_fRender:function(_d3Sel) {
		var opts = this.options
		,textUpdate = _d3Sel.selectAll(toClassKey(this.__className)).data(toArray(opts.data));
		
		textUpdate.exit().remove();
		textUpdate.enter().append('text').attr('class', this.__className);
		
		textUpdate
		.text(function(d, i){
			return format(d, opts.format);
		})
		.call(setBounds, opts)
		.style(adaptFontStyle(opts.font))
		.style(adaptBorderStyle(opts.border))
		.style(adaptFillStyle(opts.color))
		.style(adaptCssStyle('text-anchor', opts.textAnchor))
		.call(rotate, opts.rotate);
	},
});

;/**
 * New node file
 */
var birtchart = birtchart || {};
birtchart.Global = Global;
birtchart.Context = Context;
birtchart.Text = Text;


window.birtchart = window.birtchart || birtchart;
;/**
 * New node file
 */
})()