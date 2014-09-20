var DEFAULT_MAJOR_TICKS = 10;
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
}