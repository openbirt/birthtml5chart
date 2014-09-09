/**
 * A bar chart based on d3js
 * @author: Heng Li(Henry)
 */
	var barChartDefaultOptions = {
			mode: 'horizontal', // vertial or horizontal ,default is horizontal
			width:600,
			height:400,
			padding: {
				top:20,
				right:20,
				bottom:20,
				left:20
			},
			fillStyle:{
				fill: '#FFFFCC',
				fillOpacity:1,
				stroke:'black',
				strokeWidth:1,
				strokeOpacity:0.5
			},
			animation: {
				enabled: true,
				mode:'oneByOne', // 'oneByOne' or 'both'
				ease: null,
				duration: 1000
			},
			plot:{
				fill: '#FFFF99',
				fillOpacity:1,
				stroke:'red',
				strokeWidth:1,
				strokeOpacity:0.5
			},
			xAxis: {
				type:null,
				line:{
					fill:'none',
					stroke:'green',
					strokeWidth:1,
					strokeOpacity:0.5
				},
				tick:{
					number:10,
					fillStyle:{
						stroke:'green',
						strokeWidth:2,
						strokeOpacity:0.5
					}
				},
				label:{
					enabled:true,
					fillStyle:{
						fill:'',
					},
					fontStyle:{},
					format:null
				}
			},
			yAxis: {
				type:null,
				line:{
					stroke:'black',
					strokeWidth:1,
					strokeOpacity:0.5
				},
				tick:{
					number:10,
					fillStyle:{
						stroke:'black',
						strokeWidth:1,
						strokeOpacity:0.5
					}
				},
				label:{
					enabled:true,
					fillStyle:{
						fill:'',
					},
					fontStyle:{},
					format: null
				}
			},
			series:[{
				enabled:true,
				data:[100, 200, 150, 170],
				label:{
					enabled: true,
					fontStyle: {
						  'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif',
						  'font-size': '24px',
						  'font-weight': 'bold',
					},
					animation: {
						enabled: true,
						mode:'oneByOne', // 'oneByOne' or 'both'
						ease: null,
						duration: 1000
					}
				},
				colors:d3.scale.category20().range(),
				fillStyle:{
					fill: '#CCCCCC',
					fillOpacity:1,
					stroke:'#999999',
					strokeWidth:2,
					strokeOpacity:0.5
				},
				width: '50%'
			},
			{
				enabled:true,
				data:[80, 100, 110, 90],
				label:{
					enabled: true,
					format: function(d, context){
						return d.value;
					},
					fontStyle: {
						  'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif',
						  'font-size': '24px',
						  'font-weight': 'bold',
					}
				},
				colors:d3.scale.category20().range(),

				width: '50%'
			}],
			categories:{
				type:null,
				data:['a', 'b', 'c', 'd']
			},
			on: {
				end: null
			}
	};

	function Bar() {
		return this.init.apply(this, arguments);
	}
	
	Bar.prototype = {
		opts:null,
		init:function(_opts) {
			this.opts = _opts;
		},
		render:function(container) {
			var i, j, opts = this.opts, context= {}, barChart, chartArea, remainedBox = {};
			
			context.barChart = this;
			context.opts = opts;
			context.remainedBox = remainedBox;
			context.isVertical = opts.mode === 'vertical';
			
			// Init width and height
			if(!opts.width) {
				opts.width = $(container).width();
			}
			if (!opts.height) {
				opts.height = $(container).height();
			}
			
			remainedBox.x = 0;
			remainedBox.y = 0;
			remainedBox.w = opts.width;
			remainedBox.h = opts.height;
			
			this.svg = d3.select(container).append('svg');
			barChart = this.svg.attr('width', opts.width)
				.attr('height', opts.height)
				.append('g').attr('class', 'chart barChart');
			
			chartArea = barChart.append('g')
			.attr('class', 'chartArea');
			if (opts.padding) {
				remainedBox.x += (opts.padding.left || 0);
				remainedBox.y += (opts.padding.top || 0);
				remainedBox.w -= ((opts.padding.left || 0) + (opts.padding.right || 0));
				remainedBox.h -= ((opts.padding.top || 0) + (opts.padding.bottom || 0));
			}
		
			// Adapt series options
			this.adaptSeries(context);
			this.adaptAxis(context);
			
			// Render yAxis
			var y = d3.scale.linear()
		    .range(context.isVertical ? [remainedBox.h, 0] : [0, remainedBox.w])
		    .domain([0, context.seriesValueExtent[1]]);

			var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient(context.isVertical ? 'left' : 'bottom')
		    .ticks(opts.yAxis.tick.number || 10);
			
			if (opts.yAxis.label.format) {
				yAxis.tickFormat(opts.yAxis.label.format);
			}
			
			var yAxisBlock = chartArea.append('g')
			.attr('class', 'yAxis')
			.attr('transform', 'translate(' + remainedBox.x + ',' + remainedBox.y + ')')
			.call(yAxis);
			yAxisBlock.selectAll('text').style(toCssStyle(opts.yAxis.label.fillStyle));
			yAxisBlock.select('path').style(toCssStyle(opts.yAxis.line));
			yAxisBlock.selectAll('line').style(toCssStyle(opts.yAxis.tick.fillStyle));
			
			var yAxisBBox = yAxisBlock.node().getBBox();
			
			// Render xAxis;
			var x = d3.scale.ordinal()
				    .rangeBands(context.isVertical ? [0, remainedBox.w] : [remainedBox.h, 0])
				    .domain(opts.categories.data);
			var xAxis = d3.svg.axis()
			    .scale(x)
			    .orient(context.isVertical ? 'bottom': 'left');
			if (opts.xAxis.label.format) {
				xAxis.tickFormat(opts.xAxis.label.format);
			} 
			
			var xAxisBlock = chartArea.append('g')
			.attr('class', 'xAxis')
			.attr('transform', 'translate(0,' + (remainedBox.y + remainedBox.h) + ')')
			.call(xAxis);
			
			xAxisBlock.selectAll('text').style(toCssStyle(opts.xAxis.label.fillStyle));
			xAxisBlock.select('path').style(toCssStyle(opts.xAxis.line));
			xAxisBlock.selectAll('line').style(toCssStyle(opts.xAxis.tick.fillStyle));
			
			var xAxisBBox = xAxisBlock.node().getBBox();

			// Adjust size of y Axis according to xAxis
			
			var xTickBBox = xAxisBlock.select('.tick').node().getBBox()
				, yTickBBox = yAxisBlock.select('.tick').node().getBBox();
			if (context.isVertical) {
				x.rangeBands([0, remainedBox.w - yTickBBox.width]);
				xAxis.scale(x);
				xAxisBlock.attr('transform', 'translate(' + (remainedBox.x + yAxisBBox.width) + ', ' + (remainedBox.y + remainedBox.h - xAxisBBox.height)  + ')')
				.call(xAxis);
				
				y.range([remainedBox.h -  xTickBBox.height, 0]);
				yAxis.scale(y);
				yAxisBlock.attr('transform', 'translate(' + (remainedBox.x + yAxisBBox.width) + ',' + remainedBox.y + ')')
				.call(yAxis);
			}  else {
				y.range([0, remainedBox.w - xAxisBBox.width]);
				yAxis.scale(y);
				yAxisBlock.attr('transform', 'translate(' + (remainedBox.x + xAxisBBox.width) + ',' + (remainedBox.y + remainedBox.h - yAxisBBox.height) + ')')
				.call(yAxis);
				
				x.rangeBands([remainedBox.h -  yAxisBBox.height, 0]);
				xAxis.scale(x);
				xAxisBlock.attr('transform', 'translate(' + (remainedBox.x + xAxisBBox.width) + ', ' + remainedBox.y + ')')
				.call(xAxis);
			}
			
			if (context.isVertical) {
				context.remainedBox.x += yAxisBBox.width;
				context.remainedBox.w -= yAxisBBox.width;
				context.remainedBox.h -= xAxisBBox.height;
			} else {
				context.remainedBox.x += xAxisBBox.width;
				context.remainedBox.w -= xAxisBBox.width;
				context.remainedBox.h -= yAxisBBox.height;
			}
			
			// Render plot
			chartPlot = chartArea.append('g')
			.attr('class', 'plot')
			.style(toCssStyle(opts.plot.fillStyle))
			.attr('transform', 'translate(' + remainedBox.x + ',' + remainedBox.y + ')');
			
			// Render series
			context.transitionCount = 0;
			context.x = x;
			context.y = y;
			context.xAxis = xAxis;
			context.yAxis = yAxis;
			context.barChart = barChart;
			context.chartArea = chartArea;
			context.chartPlot = chartPlot;
			context.xAxisBlock = xAxisBlock;
			context.yAxisBlock = yAxisBlock;
			context.renderSeriesCallback = this.renderSeries;
			context._this = this;
			
			this.onRenderSeries(context);
		},
		onRenderSeries: function(context) {
			var opts = context.opts;
			if (opts.animation.mode === 'oneByOne') {
				series = opts.series[0];
				context.seriesIndex = 0;
				context.renderSeriesCallback.call(context._this, series, context);
			} else {
				for(var i = 0; i < opts.series.length; i++) {
					series = opts.series[i];
					context.seriesIndex = i;
					context.renderSeriesCallback.call(context._this, series, context);
				}
			}
		},
		renderSeries: function(series, context) {
			var x = context.x, y = context.y, remainedBox = context.remainedBox, seriesBlock, barsBlock, barBlock, labelBlock, xRangeBand = context.x.rangeBand(), xDelta;
			
			if (series.enabled === false) {
				return;
			}
			
			xDelta = adaptSize((series.width || xRangeBand), xRangeBand);
			
			seriesBlock = chartPlot.append('g').attr('class', 'series ' + context.seriesIndex);
			
			barsBlock = seriesBlock.selectAll('.bar')
			.data(series.data)
			.enter();
			
			barBlock = barsBlock.append('rect')
			.attr('class', 'bar')
			.each(function(d) {
				d3.select(this).style(toCssStyle(d.fillStyle));
			})
			.attr("x", function(d) { return context.isVertical ? x(d.category)  + (xRangeBand - xDelta) / 2: 0; })
		    .attr("width", context.isVertical ? adaptSize((series.width || xRangeBand), xRangeBand) : 0)
		    .attr("y", context.isVertical ? remainedBox.h : function(d) {return x(d.category) + (xRangeBand - xDelta) / 2; })
		    .attr("height", context.isVertical ? 0 : xDelta)
			.transition()
			.duration((series.animation.enabled!== false) ? (series.animation.duration || DEFAULT_DURATION) : DEFAULT_DURATION)
			.ease((series.animation.enabled!== false) ? (series.animation.ease || DEFAULT_EASE) : DEFAULT_EASE)
			.attr("y", context.isVertical ? function(d) { return y(d.value); } : function(d) {return x(d.category) + (xRangeBand - xDelta) / 2;})
			.attr("width", context.isVertical ? adaptSize((series.width || xRangeBand), xRangeBand) : function(d) { return y(d.value); })
			.attr("height", context.isVertical ? function(d) { return remainedBox.h - y(d.value); } : xDelta)
			.each('start', function() {context.transitionCount++;})
			.each('end', function(d, i){
				if ((i + 1) <= series.data.length 
						&& context.opts.animation.enabled !== false 
						&& context.opts.animation.mode === 'oneByOne') {
					// Render next series.
					context.seriesIndex++;
					if (context.seriesIndex < context.opts.series.length) {
						context.renderSeriesCallback.call(context._this, context.opts.series[context.seriesIndex], context);
					}
				}
				
				if( --context.transitionCount === 0 && context.opts.on && context.opts.on.end) {
					context.opts.on.end.call(context._this, context);
		        }
			});
			
			if (series.label.enabled === false) {
				return;
			}
			
			labelBlock = barsBlock.append('text')
			.attr('class', 'label')
			.text(function(d){
				return d.label.format !== false ? (d.label.format ? d.label.format.call(this, d, context) : d.value): '';})
			.each(function(d){
				var label = d3.select(this);
				label.style(toCssStyle(d.label.fillStyle))
				.style(toCssStyle(d.label.fontStyle))
				.attr('text-anchor', d.label.align)
				.attr("x", context.isVertical ? x(d.category)  + xRangeBand / 2: 0)
				.attr("y", context.isVertical ? context.remainedBox.h :  x(d.category) + xRangeBand /2)
				.transition()
				.duration((d.label.animation.enabled!== false) ? (d.label.animation.duration || DEFAULT_DURATION) : DEFAULT_DURATION)
				.ease((d.label.animation.enabled!== false) ? (d.label.animation.ease || DEFAULT_EASE) : DEFAULT_EASE)
				.attr("x", context.isVertical ? x(d.category)  + xRangeBand / 2: y(d.value))
				.attr("y", context.isVertical ? y(d.value): x(d.category) + xRangeBand /2)
				.attr('dy', context.isVertical ? '0em' : '.5em')
				.each('start', function(){
					context.transitionCount++;
				})
				.each('end', function(){
					
					if( --context.transitionCount === 0 && context.opts.on && context.opts.on.end) {
						context.opts.on.end.call(context._this, context);
			        }
				});
			});
			
		},
		adaptAxis: function(context) {
			var opts = context.opts, xAxis = opts.xAxis, yAxis = opts.yAxis;
			xAxis.line = xAxis.line || {};
			xAxis.line.fill = xAxis.line.fill || 'none';
			yAxis.line = yAxis.line || {};
			yAxis.line.fill = yAxis.line.fill || 'none';
		},
		adaptSeries: function(context) {
			var i,j, d, nd, series = context.opts.series, s, dataType, fillStyle, extent = [0, 0], categoryData = context.opts.categories.data;
			for(i = 0; i < series.length; i++) {
				s = series[i];
				
				s.label.align = s.label.align || (context.isVertical ? 'middle' : 'end');
				s.animation = $.extend({}, context.opts.animation || {}, s.animation || {});
				
				for(j = 0; j < s.data.length; j++) {
					d = s.data[j];
					dataType = typeof d;
					if (dataType !== 'object') {
						nd = {};
						nd.value = d;
					} else {
						nd = s.data[j];
					}
					nd.category = categoryData[j];
					nd.fillStyle = $.extend({}, s.fillStyle, nd.fillStyle);
					nd.fillStyle.fill = nd.fillStyle.fill || (s.colors|| d3.scale.category20().range())[ j % s.data.length];
					nd.label = $.extend({}, s.label);
					nd.label.animation = $.extend({}, s.animation, nd.label.animation);
					s.data[j] = nd; 
					
					extent = d3.extent(extent.concat(d3.extent([nd.value])));
				}
			}
			context.seriesValueExtent = extent;
		}
	}

