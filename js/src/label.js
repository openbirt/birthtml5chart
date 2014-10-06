/**
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
    _fRender: function (_d3Sel) {
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
            .each(function (d, i) {
                var
                    parent = d3.select(this),
                    outlineSel = parent.append('rect').attr('class', 'outline')
                        .attr({
                            'x': 0,
                            'y': 0
                        })
                        .style('fill-opacity', TRANSPARENCY);


                if (!emptyObject(opts.border) || !emptyObject(opts.background)) {
                    // Add border and background rect
                    borderSel = parent.append('rect').attr('class', 'border background')
                        .style('fill-opacity', TRANSPARENCY)
                        .style(adaptBorderStyle(opts.border))
                        .style(adaptFillStyle(opts.background));
                }

                var textSel = parent.append('text').attr('class', 'text')
                    .each(function (d, i) {
                        var _this = d3.select(this);
                        if (typeof d === 'string') {
                            var texts = d.split('\n');

                            if (texts.length <= 1) {
                                _this.text(function (d, i) {
                                    return format(d, opts.format);
                                });
                            } else {
                                for (var k in texts) {
                                    _this.append('tspan').text(function () {
                                        return format(texts[k], opts.format);
                                    })
                                        .attr('x', opts.x || 0)
                                        .attr('dy', (k * 1) + 'em');
                                }
                            }
                        } else {
                            _this.text(function (d, i) {
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
    }
});