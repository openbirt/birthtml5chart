var DEFAULT_MAJOR_TICKS = 10;
var DEFAULT_MINOR_TICKS = 3;
var DEFAULT_MAJOR_TICK_SIZE = 5;
var DEFAULT_MINOR_TICK_SIZE = 3;
var DEFAULT_LABEL_GAP = 3;

var DefaultAxisOptions = {
    orient: 'x', // 'x' or 'y'
    type: 'linear', // 'linear', 'pow', 'log', 'sqrt', 'quantize', 'quantile', 'identity', 'ordinal', 'time', 'threshold'
    domain: null, // Actual values or value range to be presented on the axis.
    range: null,
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
        gap: 3
        //anchor: 'center', // 'left', 'center', 'right' , 'top', 'bottom'
        //dx: 0,
        //dy: 0
    },
    line: {
        enabled: true,
        style: {}
    },
    tick: {
        major: {
            enabled: true,
            position: 'above', // 'below', 'above', 'left', 'right', 'cross'. x bottom default is 'above', x top default is 'below', y left default is 'right', y right default is 'left'.
            numbers: 'auto',
            size: 5,
            style: {}
        },
        minor: {
            enabled: false,
            position: 'above', // Same with major.position.
            numbers: 3,
            size: 3,
            style: {}
        },
        label: {
            enabled: true,
            position: 'below', // 'below', 'above', 'left', 'right' or 'same', 'opposite'. 'same' means same mode with tick.major.position
            //stagger: false,
            //autoDrop: false, // Auto detect overlap label and drop it.
            gap: 3
            //dx: 0,
            //dy: 0
        }
    },
    mark: [
        {
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
        }
    ]
}

var Axis = extendClass('Axis', null, Element, {
    _fRender: function (_d3Sel) {
        var context = this.context,
            opts = this.options,
            titleOpts = opts.title,
            lineOpts = opts.line,
            tickOpts = opts.tick,
            majorOpts = tickOpts.major,
            minorOpts = tickOpts.minor,
            labelOpts = tickOpts.label,
            scale = axis_scale(opts.type),
            axis = d3.svg.axis(),
            classNames = this.fClassNames(),
            axisUpdate = _d3Sel.selectAll(toClassKey(classNames)).data([opts.domain]),
            w = toPixel(opts.width || _d3Sel.attr('width'), true),
            h = toPixel(opts.height || _d3Sel.attr('height'), true);

        if (opts.enabled === false) {
            axisUpdate.remove();
            return;
        }

        // Init default options
        majorOpts.tickNumbers = majorOpts.tickNumbers || DEFAULT_MAJOR_TICKS;
        minorOpts.numbers = minorOpts.numbers || DEFAULT_MINOR_TICKS;
        majorOpts.size = majorOpts.size || DEFAULT_MAJOR_TICK_SIZE;
        minorOpts.size = minorOpts.size || DEFAULT_MINOR_TICK_SIZE;
        labelOpts.gap = labelOpts.gap || DEFAULT_LABEL_GAP;
        titleOpts.gap = titleOpts.gap || DEFAULT_LABEL_GAP;
        axis_adaptTickOpts(tickOpts, opts.location);
        axis_adaptLabelAlign(opts.title, opts.location);

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
            scale.range(opts.range ? opts.range : (opts.reversed ? [w, 0] : [0, w]));
        } else if (opts.orient === 'y') {
            scale.range(opts.range ? opts.range : (opts.reversed ? [0, h] : [h, 0]));
        }

        var oldScale = this.__scale__ || scale,
            curScale = this.__scale__ = scale.copy();

        // Ticks, or domain values for ordinal scales.
        var ticks = curScale.ticks ? curScale.ticks.apply(curScale, [majorOpts.tickNumbers]) : curScale.domain(),
            majorTickUpdate = axisUpdate.selectAll('.major-tick').data(ticks, curScale),
            majorTickExit = majorTickUpdate.exit().remove(),
            majorTickEnter = majorTickUpdate.enter().insert('g', '.axis-line').attr('class', 'major-tick'),
            labelFormat = String;
        majorTickUpdate = axisUpdate.selectAll('.major-tick');

        // Init tick label formatter.
        if (typeof labelOpts.format === 'function') {
            labelFormat = labelOpts.format;
        } else {
            labelFormat = curScale.tickFormat ? curScale.tickFormat.apply(curScale, [majorOpts.tickNumbers], labelOpts.format) : (labelOpts.format || String);
        }
        labelOpts.format = labelFormat;

        if (minorOpts && minorOpts.enabled !== false) {
            var minorTicks = axis_minorTicksDivide(curScale, ticks, minorOpts.numbers),
                minorTickUpdate = axisUpdate.selectAll('.minor-tick').data(minorTicks, String),
                minorTickExit = minorTickUpdate.exit().remove(),
                minorTickEnter = minorTickUpdate.enter().insert('line', '.major-tick').attr('class', 'minor-tick').style(toCssStyle(minorOpts.style)),
                hasMinor = true;
            minorTickUpdate = axisUpdate.selectAll('.minor-tick').style(toCssStyle(minorOpts.style));
        }

        // Axis axis line, domain.
        var range = axis_scaleRange(curScale),
            axisLineUpdate = axisUpdate.selectAll('.axis-line').data([opts.orient]),
            axisLineEnter = axisLineUpdate.enter().append('path').attr('class', 'axis-line').style('fill', 'none');
        axisLineUpdate = d3.transition(axisLineUpdate);

        // Add major ticks
        if (majorOpts && majorOpts.enabled !== false) {
            majorTickEnter.append('line').attr('class', 'major-tick-line').style('fill', 'none').style(toCssStyle(majorOpts.style));
        }

        // Add major tick labels
        labelOpts.id = 'tick-label';
        labelOpts.align = labelOpts.align || 'center';
        var label = null, _this = this;
        majorTickUpdate.each(function (d, i) {
            var lOpts = clone(labelOpts);
            lOpts.data = [d];
            label = new Label(context, _this, lOpts);
            label.fRender(d3.select(this));
        });

        var majorTickLineSel = majorTickUpdate.selectAll('.major-tick-line'),
            tickLabelSel = majorTickEnter.selectAll('.tick-label');

        var majorTickOffset = axis_tickOffset(majorOpts, majorOpts.size, opts.location),
            minorTickOffset = axis_tickOffset(minorOpts, minorOpts.size, opts.location),
            labelBBox = tickLabelSel.bbox(),
            axisLinePath = axis_linePath(opts.location, range),
            tickTransform = null;

        if (opts.location === 'top' || opts.location === 'bottom') {
            tickTransform = axis_transformHorizontal;
            majorTickLineSel.attr('x1', 0).attr('x2', 0).attr('y1', majorTickOffset[0]).attr('y2', majorTickOffset[1]);
            if (hasMinor) {
                minorTickEnter.attr('y1', minorTickOffset[0]).attr('y2', minorTickOffset[1]);
                minorTickUpdate.attr('x2', 0).attr('y1', minorTickOffset[0]).attr('y2', minorTickOffset[1]);
            }
        } else if (opts.location === 'left' || opts.location === 'right') {
            tickTransform = axis_transformVertical;
            majorTickLineSel.attr('x1', majorTickOffset[0]).attr('x2', majorTickOffset[1]).attr('y2', 0);
            if (hasMinor) {
                minorTickEnter.attr('x1', minorTickOffset[0]).attr('x2', minorTickOffset[1]);
                minorTickUpdate.attr('x1', minorTickOffset[0]).attr('x2', minorTickOffset[1]).attr('y2', 0);
            }
        }

        var transXy = translate(tickLabelSel),
            tickLabelOffset = axis_tickLabelOffset(tickOpts, tickLabelSel.bbox(), opts.location);
        tickLabelSel.call(translate, function (d, i, j, context) {
            return transXy[j].x + tickLabelOffset.dx;
        }, tickLabelOffset.dy, context);

        axisLineEnter.attr('d', axisLinePath).style(toCssStyle(lineOpts.style));
        axisLineUpdate.attr('d', axisLinePath).style(toCssStyle(lineOpts.style));


        // For ordinal scales:
        // - any entering ticks are undefined in the old scale
        // - any exiting ticks are undefined in the new scale
        // Therefor, we only need to transition updating ticks.
        if (curScale.rangeBand) {
            var dx = curScale.rangeBand() / 2,
                x = function (d) {
                    return curScale(d) + dx;
                };
            majorTickEnter.call(tickTransform, x);
            majorTickUpdate.call(tickTransform, x);
        }
        // For quantitative scales;
        // - enter new ticks from the old scale
        // - exit old ticks to the new scale
        else {
            majorTickEnter.call(tickTransform, oldScale);
            majorTickUpdate.call(tickTransform, curScale);
            majorTickExit.call(tickTransform, curScale);
            if (hasMinor) {
                minorTickEnter.call(tickTransform, oldScale);
                minorTickUpdate.call(tickTransform, curScale);
                minorTickExit.call(tickTransform, curScale);
            }
        }

        // Add axis title
        // Add axis title
        axis_adaptTitleAlign(titleOpts, opts.location);
        var axisTitleUpdate = axisUpdate.select('.axis-title').remove();
        if (titleOpts && titleOpts.enabled !== false) {
            titleOpts.id = 'axis-title';
            var title = new Label(context, _this, titleOpts);
            title.fRender(axisUpdate);

            var titleOffset = axis_titleOffset(titleOpts, opts.location, tickOpts, axisUpdate.bbox(true), tickLabelOffset, tickLabelSel.bbox(true), axisUpdate.select('.axis-title').bbox());
            var titleSel = axisUpdate.select('.axis-title');
            var titleTrans = translate(titleSel);
            titleSel.call(translate, titleTrans[0].x + titleOffset.dx, titleTrans[0].y + titleOffset.dy);
        }

        // Adjust positions
        backgroundUpdate.call(translate, axisUpdate.bbox(true).x, axisUpdate.bbox(false).y, context);
    },
    fOptions: function () {
        if (!arguments.length) {
            return this.options;
        } else {
            this.options = arguments[0];
            return this;
        }
    },
    fDomain: function () {
        if (!arguments.length) {
            return this.options.domain;
        } else {
            this.options.domain = arguments[0];
            return this;
        }
    },
    fRange: function () {
        if (!arguments.length) {
            return this.options.range;
        } else {
            this.options.range = arguments[0];
            return this;
        }
    },
    fAxisLineCoordinates: function () {
        // Return x, y of axis line
        var bbox = d3.select('.axis-line').bbox();
        return {'x': bbox.x, 'y': bbox.y};
    }
});

function axis_scale(type) {
    if (d3.scale[type] && typeof d3.scale[type] === 'function') {
        return d3.scale[type]();
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

function axis_tickOffset(tickOpts, tickSize, axisLocation) {
    if (axisLocation === 'top' || axisLocation === 'bottom') {
        return [(tickOpts.position === 'cross') ? -tickSize : 0, (tickOpts.position === 'above') ? -tickSize : ((!tickOpts.position && axisLocation === 'top') ? -tickSize : tickSize)];
    } else {
        return [(tickOpts.position === 'cross') ? -tickSize : 0, (tickOpts.position === 'left') ? -tickSize : ((!tickOpts.position && axisLocation === 'left') ? -tickSize : tickSize)];
    }
}

function axis_adaptTickOpts(tickOpts, axisLocation) {
    axis_adaptTicksPosition(tickOpts, axisLocation);
    axis_adaptLabelAlign(tickOpts.label, axisLocation);
}

function axis_adaptTicksPosition(tickOpts, axisLocation) {
    if (tickOpts.label) {
        tickOpts.label.position = axis_adaptTickPosition(axisLocation, tickOpts.label.position);
    }
    tickOpts.major.position = axis_adaptTickPosition(axisLocation, tickOpts.major.position);
    if (tickOpts.minor) {
        tickOpts.minor.position = axis_adaptTickPosition(axisLocation, tickOpts.minor.position);
    }
}

function axis_adaptTickPosition(axisLocation, tickPosition) {
    return axis_adaptPosition(axisLocation, tickPosition);
}

function axis_adaptPosition(axisLocation, pos) {
    if (pos === 'cross') {
        return pos;
    }

    if (axisLocation === 'top') {
        return pos === 'left' ? 'below' : (pos === 'right' ? 'top' : pos);
    } else if (axisLocation === 'bottom') {
        return pos === 'right' ? 'above' : (pos === 'left' ? 'below' : pos);
    } else if (axisLocation === 'left') {
        return pos === 'above' ? 'right' : (pos === 'below' ? 'left' : pos);
    } else if (axisLocation === 'right') {
        return pos === 'below' ? 'left' : (pos === 'above' ? 'right' : pos);
    } else {
        return pos;
    }
}

function axis_adaptAnchor(axisLocation, anchor) {
    if (axisLocation === 'top' || axisLocation === 'bottom') {
        return anchor === 'bottom' ? 'left' : (anchor === 'top' ? 'rigth' : anchor);
    } else if (axisLocation === 'left' || axisLocation === 'right') {
        return anchor === 'left' ? 'bottom' : (anchor === 'right' ? 'top' : anchor);
    } else {
        return anchor;
    }
}

function axis_adaptLabelAlign(labelOpts, axisLocation) {
    if (!labelOpts) {
        return;
    }
    if (axisLocation === 'top' || axisLocation === 'bottom') {
        labelOpts.align = labelOpts.align === 'auto' ? 'center' : (labelOpts.align || 'center');
        labelOpts.verticalAlign = labelOpts.verticalAlign === 'auto' ? (labelOpts.position === 'below' ? 'top' : 'bottom') : (labelOpts.verticalAlign || (labelOpts.position === 'below' ? 'top' : 'bottom'));
    } else {
        labelOpts.align = labelOpts.align === 'auto' ? (labelOpts.position === 'left' ? 'right' : 'left') : (labelOpts.align || (labelOpts.position === 'left' ? 'right' : 'left'));
        labelOpts.verticalAlign = labelOpts.verticalAlign === 'auto' ? 'center' : (labelOpts.verticalAlign || 'center');
    }
}

function axis_tickLabelOffset(tickOpts, labelBBox, axisLocation) {
    var offset = {'dx': 0, 'dy': 0},
        labelOpts = tickOpts.label,
        majorOpts = tickOpts.major,
        minorOpts = tickOpts.minor,
        majorTickPos = axis_adaptTickPosition(axisLocation, majorOpts.position),
        minorTickPos = axis_adaptTickPosition(axisLocation, minorOpts.position),
        majorTickSize = majorOpts.enabled ? majorOpts.size : 0,
        minorTickSize = minorOpts.enabled ? minorOpts.size : 0,
        labelGap = labelOpts.gap,
        hAlign = labelOpts.align,
        tickSize = 0;

    if (labelOpts.position === 'same') {
        labelOpts.position = majorTickPos;
    } else if (labelOpts.position === 'opposite') {
        labelOpts.position = (majorTickPos === 'cross') ? ((axisLocation === 'top') ? 'below' : (axisLocation === 'bottom' ? 'above' : axisLocation === 'left' ? 'right' : 'left')) : ((majorTickPos === 'below') ? 'above' : (majorTickPos === 'above' ? 'below' : majorTickPos === 'left' ? 'right' : 'left'));
    }

    if (labelOpts.position === 'cross') {
        labelOpts.position = (axisLocation === 'top') ? 'above' : (axisLocation === 'bottom' ? 'below' : axisLocation === 'left' ? 'left' : 'right');
    }

    if (axisLocation === 'bottom' || axisLocation === 'top') {
        if (labelOpts.position === 'above') {
            tickSize = majorTickPos !== 'below' ? majorTickSize : (minorTickPos !== 'below' ? minorTickSize : 0);
            offset.dy = -(tickSize + labelGap + labelBBox.height);
        } else {
            tickSize = majorTickPos !== 'above' ? majorTickSize : (minorTickPos !== 'above' ? minorTickSize : 0);
            offset.dy = tickSize + labelGap;
        }
    } else if (axisLocation === 'left' || axisLocation === 'right') {
        if (labelOpts.position === 'left') {
            tickSize = (majorTickPos !== 'right') ? majorTickSize : (minorTickPos !== 'right' ? minorTickSize : 0);
            offset.dx = hAlign === 'center' ? -(tickSize + labelGap) : (hAlign === 'left' ? -(tickSize + labelGap + labelBBox.width) : -(tickSize + labelGap));
            offset.dy = -labelBBox.height / 2;
        } else {
            tickSize = majorTickPos !== 'left' ? majorTickSize : (minorTickPos !== 'left') ? minorTickSize : 0;
            offset.dx = hAlign === 'right' ? (tickSize + labelGap + labelBBox.width) : (tickSize + labelGap);
            offset.dy = -labelBBox.height / 2;
        }
    }
    return offset;
}

/**
 * Always set horizontal or vertical align to center under different case to simply coordinates calculation of rotated title.
 *
 * @param titleOpts
 * @param axisLocation
 */
function axis_adaptTitleAlign(titleOpts, axisLocation) {
    if (!titleOpts) {
        return;
    }
    if (axisLocation === 'top' || axisLocation === 'bottom') {
        titleOpts.verticalAlign = titleOpts.position === 'above' ? 'bottom' : 'top';
    } else {
        titleOpts.align = titleOpts.position === 'left' ? 'right' : 'left';
    }
}

function axis_titleOffset(titleOpts, axisLocation, tickOpts, axisBBox, tickLabelOffset, labelBBox, titleBBox) {
    var offset = {'dx': 0, 'dy': 0},
        titlePos = titleOpts.position,
        titleGap = titleOpts.gap,
        majorOpts = tickOpts.major,
        minorOpts = tickOpts.minor,
        majorTickPos = axis_adaptTickPosition(axisLocation, majorOpts.position),
        minorTickPos = axis_adaptTickPosition(axisLocation, minorOpts.position),
        majorTickSize = majorOpts.enabled ? majorOpts.size : 0,
        minorTickSize = minorOpts.enabled ? minorOpts.size : 0,
        labelPos = tickOpts.label.position,
        labelGap = tickOpts.label.gap,
        hAlign = titleOpts.align,
        vAlign = titleOpts.verticalAlign;

    var tickSize = 0, labelOffset = 0;
    if (axisLocation === 'top' || axisLocation === 'bottom') {
        offset.dx = hAlign === 'right' ? (axisBBox.width + axisBBox.x) : (hAlign === 'center' ? (axisBBox.width + axisBBox.x ) / 2 : axisBBox.x);
        if (titlePos === 'above' || (axisLocation === 'bottom' && titlePos !== 'above')) {
            offset.dy -= (majorTickPos !== 'below' ? majorTickSize : (minorTickPos !== 'below' ? minorTickSize : 0));
            offset.dy -= (labelPos === 'above' ? (labelBBox.height + labelGap) : 0 );
            offset.dy -= titleGap;
        } else if (titlePos === 'below' || (axisLocation === 'top' && titlePos !== 'below')) {
            offset.dy += (majorTickPos !== 'above' ? majorTickSize : (minorTickPos !== 'above' ? minorTickSize : 0));
            offset.dy += (labelPos === 'below') ? (labelBBox.height + labelGap) : 0;
            offset.dy += titleGap;
        }
    } else if (axisLocation === 'left' || axisLocation === 'right') {
        offset.dy = vAlign === 'bottom' ? (axisBBox.height + axisBBox.y) : (vAlign === 'center' ? (axisBBox.height + axisBBox.y) / 2 : axisBBox.y);
        if (titlePos === 'left' || (axisLocation === 'right' && titlePos !== 'right')) {
            offset.dx -= (majorTickPos !== 'right' ? majorTickSize : (minorTickPos !== 'right' ? minorTickSize : 0));
            offset.dx -= (labelPos === 'left' ? (labelBBox.width + labelGap) : 0);
            offset.dx -= titleGap;
        } else if (titlePos === 'right' || (axisLocation === 'left' && titlePos !== 'left')) {
            offset.dx += (majorTickPos !== 'left' ? majorTickSize : (minorTickPos !== 'left' ? minorTickSize : 0));
            offset.dx += (labelPos === 'right' ? (labelBBox.width + labelGap) : 0);
            offset.dx += titleGap;
        }
    }
    return offset;
}

function axis_linePath(axisLocation, range) {
    if (axisLocation === 'top' || axisLocation === 'bottom') {
        return 'M' + range[0] + ',0' + ' H' + range[1];
    } else if (axisLocation === 'left' || axisLocation === 'right') {
        return 'M' + range[0] + ',0' + ' V' + range[1];
    }
}

function axis_transformHorizontal(selection, x) {
    selection.attr("transform", function (d) {
        var trans = translate(d3.select(this));
        return 'translate(' + x(d) + ',' + trans[0].y + '0)';
    });
}

function axis_transformVertical(selection, y) {
    selection.attr('transform', function (d) {
        var trans = translate(d3.select(this));
        return 'translate(' + trans[0].x + ',' + y(d) + ')';
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