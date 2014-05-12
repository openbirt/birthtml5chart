/**
 * New node file
 */

var defaultOpts = {
	width: 0,
	height: 0,
	fill:null,
	fillOpacity:e-6,
	series: [{
		data:{},
		tooltip:{
			text:'',
		}
	}],
};

var ForcedDirectedGraph = function(opts) {
	this.opts = opts;
	return this;
}

ForcedDirectedGraph.prototype = {
	opts : {},
	width : function() {
		if (!arguments.length) {
			return this.opts.width;
		}
		this.opts.width = arguments[0];
		return this;
	},
	height : function() {
		if (!arguments.length) {
			return this.opts.height;
		}
		this.opts.height = arguments[0];
		return this;
	},
	data : function() {
		if (!arguments.length) {
			return this.opts.series && this.opts.series[0] && this.opts.series[0].data;
		}
		this.opts.series = this.opts.series || [{}];
		this.opts.series[0].data = arguments[0];
		return this;
	},
	render : function(sel) {
		var width = this.opts.width, height = this.opts.height, color = this.opts.color
				|| d3.scale.category20(), charge = this.opts.change || -120, distance = this.opts.distance || 30;

		var force = d3.layout.force().charge(charge).linkDistance(distance)
				.size([ width, height ]);

		var svg = d3.select(sel).append("svg").attr("width", width).attr(
				"height", height);

		function onData(graph) {
			force.nodes(graph.nodes).links(graph.links).start();

			var link = svg.selectAll(".link").data(graph.links).enter().append(
					"line").attr("class", "link").style("stroke-width",
					function(d) {
						return Math.sqrt(d.value);
					});

			var node = svg.selectAll(".node").data(graph.nodes).enter().append(
					"circle").attr("class", "node").attr("r", 5).style("fill",
					function(d) {
						return color(d.group);
					}).call(force.drag);

			node.append("title").text(function(d) {
				return d.name;
			});

			force.on("tick", function() {
				link.attr("x1", function(d) {
					return d.source.x;
				}).attr("y1", function(d) {
					return d.source.y;
				}).attr("x2", function(d) {
					return d.target.x;
				}).attr("y2", function(d) {
					return d.target.y;
				});

				node.attr("cx", function(d) {
					return d.x;
				}).attr("cy", function(d) {
					return d.y;
				});
			});
		};
		
		onData(this.opts.series[0].data);
	}
}