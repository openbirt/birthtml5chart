/**
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
});