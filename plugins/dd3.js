(function () {
	var $, DD3;
	
	DD3 = window.DD3 = {};

	$ = jQuery;



	function AJAX(uri, cons) {
	
		$.ajax({
			url: uri,
			type: 'GET',
			dataType: 'json',
			async: true,
			error: function (jqXHR, textStatus, errorThrown) {
				alert(uri);
			}
		}).done(function (data) {
			cons.data = data;
//			console.log(data);
			cons.generate();
			
		});
	}
	
	// pick up csv data as input and generate output in json form
	function CSV_AJAX(uri, cons){
		d3.csv(uri, function(data){
			cons.data = data;
			cons.generate();
		});
	}
	
	DD3.Tree = (function () {


		function Tree(options) {

			//getElement(this, DD3.Tree, options);
			if (!(this instanceof DD3.Tree)) {
				return new DD3.Tree(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
				
			var div = this.el[0];
				
			Tree.prototype.data = typeof options.data === "string" ? {} : options.data;
					
					// another way to set default values ...
			/*Tree.prototype.defaults = {
				"height": 500,
				"width": this.el[0].parentNode.clientWidth,
				"xLabel": "",
				"yLabel": ""
			};

*/

			Tree.prototype.generate = function(){

				var main_width = typeof options.width === "undefined" ? 5000 : parseInt(options.width),
					main_height = typeof options.height === "undefined" ? 400 : parseInt(options.height),
					tipColor = typeof options.tipColor === "undefined" ? "#fff" : options.tipcolor;
				var margin = {
						top: 20,
						right: 120,
						bottom: 20,
						left: 120
					},
					width = main_width - margin.right - margin.left,
					height = main_height - margin.top - margin.bottom;
					
				var maxWidth = 	width,	//typeof options.maxWidth === "undefined" ? $(div).parent().width() : parseInt(options.maxWidth),
					maxHeight = main_height,//typeof options.maxHeight === "undefined" ? 400 : parseInt(options.maxHeight),
					expandIx = false,
					collapseIx = false;

				var i = 0,
					duration = 750,
					root;

				var tree = d3.layout.tree()
					.size([height, width]);

				var diagonal = d3.svg.diagonal()
					.projection(function (d) {
						return [d.y, d.x];
					});
					
					d3.select(div).select("svg").remove();
				var svg = d3.select(div).append("svg")
					.attr("width", width + margin.right + margin.left)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
					
					// for 1st time when tree is loaded then make it vertical scroll position in center.
					$(div).scrollTop(height/2.5);
					
					
				var tip = d3.tip()
					.attr('class', 'd3-tip')
					.offset([-10, 0])
					.html(function (d) {
						var result = "<span style='color : "+tipColor+";'>"+d.property+"</span>";
						return result;
					}).style("font-size", "12px");
				
				svg.call(tip);

				//this.setData(options.data);
				root = this.data[0];
				root.x0 = height / 2;
				root.y0 = 0;
						
						// make collapse function for node..
				function collapse(d) {
					if (d.children) {
						d._children = d.children;
						d._children.forEach(collapse);
						d.children = null;
					}
				}
				
							// make expand function for node..
				function expand(d) {
					if (d._children) {
						d.children = d._children;
						d.children.forEach(expand);
						d._children = null;
					}
				}
				
				root.children.forEach(collapse);
				update(root);


				d3.select(self.frameElement).style("height", main_height+"px");

								// make Update function for tree data and construct updation on every click and hover functions
				function update(source) {
						
					d3.select(div).select("svg")
					.attr("width", maxWidth)
					.attr("height", maxHeight);	
						
					// Compute the new tree layout.
					var nodes = tree.nodes(root).reverse(),
						links = tree.links(nodes);

					// Normalize for fixed-depth.
					nodes.forEach(function (d) {
						//d.x = d.x * 1;
						//d.y = d.depth * 180;
						  d.y = d.depth * 180 + (20 * (expandIx ? 1 : -1));
					});

					// Update the nodes…
					var node = svg.selectAll("g.node")
						.data(nodes, function (d) {
							return d.id || (d.id = ++i);
						});

					// Enter any new nodes at the parent's previous position.
					var nodeEnter = node.enter().append("g")
						.attr("class", "node")
						.attr("transform", function (d) {
							return "translate(" + source.y0 + "," + source.x0 + ")";
						})
						.on("click", function(d){
							click(d, div);
						})
						.on("mouseover", tip.show)
						.on("mouseout", tip.hide)
						//  .on("mouseover", function(d){ node_onmouseover(d); });

					nodeEnter.append("circle")
						.attr("r", 1e-6)
						.style("fill", function (d) {
							return d._children ? "lightsteelblue" : "#fff";
						});

					nodeEnter.append("text")
						.attr("x", function (d) {
							return d.children || d._children ? -10 : 10;
						})
						.attr("dy", ".35em")
						.attr("text-anchor", function (d) {
							return d.children || d._children ? "end" : "start";
						})
						.text(function (d) {
							return d.name;
						})
						.style("fill-opacity", 1e-6);

					// nodeEnter.selectAll("circle")
						// .append("svg:title")
						// .text(function (d) {
							// return d.property
						// });
						
					// Transition nodes to their new position.
					var nodeUpdate = node.transition()
						.duration(duration)
						.attr("transform", function (d) {
							return "translate(" + d.y + "," + d.x + ")";
						});

					nodeUpdate.select("circle")
						.attr("r", 4.5)
						.style("fill", function (d) {
							return d._children ? "lightsteelblue" : "#fff";
						});

					nodeUpdate.select("text")
						.style("fill-opacity", 1);

					// Transition exiting nodes to the parent's new position.
					var nodeExit = node.exit().transition()
						.duration(duration)
						.attr("transform", function (d) {
							return "translate(" + source.y + "," + source.x + ")";
						})
						.remove();

					nodeExit.select("circle")
						.attr("r", 1e-6);

					nodeExit.select("text")
						.style("fill-opacity", 1e-6);

					// Update the links…
					var link = svg.selectAll("path.link")
						.data(links, function (d) {
							return d.target.id;
						});

					// Enter any new links at the parent's previous position.
					link.enter().insert("path", "g")
						.attr("class", "link")
						.attr("d", function (d) {
							var o = {
								x: source.x0,
								y: source.y0
							};
							return diagonal({
								source: o,
								target: o
							});
						});

					// Transition links to their new position.
					link.transition()
						.duration(duration)
						.attr("d", diagonal);

					// Transition exiting nodes to the parent's new position.
					link.exit().transition()
						.duration(duration)
						.attr("d", function (d) {
							var o = {
								x: source.x,
								y: source.y
							};
							return diagonal({
								source: o,
								target: o
							});
						})
						.remove();

					// Stash the old positions for transition.
					nodes.forEach(function (d) {
						d.x0 = d.x;
						d.y0 = d.y;
					});
					
				}

				// Toggle children on click.
				function click(d, div) {
					if (d.children) {
						d._children = d.children;
						d.children = null;
						//collapseIx = true;
                       // expandIx = false;
					} else {
						d.children = d._children;
						d._children = null;
						//maxWidth += 150;
						//maxHeight += 50;
						//expandIx = true;
						//collapse = false;
					}
					update(d);
					//toScroll(div, d, expandIx);
				}

				
				// for scrolling if we going in 3 node depth....
				function toScroll(div, d, flag) {
							var ndiv = $(div);
							var pos = ndiv.scrollLeft();
							var posDelta = 0;
							if (d.depth > 4)
								posDelta = 3 * (flag ? 40 : -40);
							else
								posDelta = d.depth * (flag ? 40 : -40);
							ndiv.scrollLeft(pos + posDelta);
	//                        var dId = d.id;
	//                        $('#' + dId).focus();
						}
				
				
			};
			
							

			
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return Tree;
	})();

	//---------------------------------------------DD3.Tree ends------------------------------------------------------------------- 
	DD3.Line = (function () {

		function Line(options) {
				
		 //getElement(this, DD3.Line, options);
			if (!(this instanceof DD3.Line)) {
				return new DD3.Line(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			var div=this.el[0];
			var _this = this;
			
			Line.prototype.data = typeof options.data === "string" ? {} : options.data;

			Line.prototype.generate = function () {
				// line code starts
				var grid = typeof options.grid === "undefined" ? false : options.grid,
					Y_AXIS_LABEL = typeof options.yAxisLabel === "undefined" ? "" : options.yAxisLabel,
					main_height = typeof options.height === "undefined" ? 500 : options.height,
					lineType = typeof options.type === "undefined" ? "cardinal" : optons.type,
					yFormater = typeof options.yFormater === "undefined" ? d3.format(",.2s") : d3.format(options.yFormater),
					textRotate = typeof options.rotateX === "undefined" ? "-65" : options.rotateX,
					rotation = typeof options.rotation === "undefined" ? true : options.rotation,
					xCategories = typeof options.xCategory === "undefined" ? "xCategory" : options.xCategory;
				
				
				
				var legend_width = typeof options.legend_width === "undefined" ? 120 : options.legend_width;						
				var color = typeof options.color === "undefined" ? d3.scale.category10() : d3.scale.ordinal().range(options.color);
					
				var mainWidth = typeof options.width === "undefined" ? $(div).parent().width() : options.width;
				var margin = {
						top: typeof options.margin_top === "undefined" ? 20 : options.margin_top,
						right:  typeof options.margin_right === "undefined" ? 80 : options.margin_right,
						bottom:  typeof options.margin_bottom === "undefined" ? 120 : options.margin_bottom,
						left:  typeof options.margin_left === "undefined" ? 50 : options.margin_left
					},
					width = mainWidth - margin.left - margin.right-legend_width,
					height = main_height - margin.top - margin.bottom;


				var x = d3.scale.ordinal().rangeRoundBands([0, width], 1),
					y = d3.scale.linear().range([height, 0]),
					xCircle = d3.scale.ordinal();

			 _this.data.sort(function(a, b){
					if(xCategories == "date"||xCategories=="Date"){
						a = a[xCategories].split("-");
						b = b[xCategories].split("-");
						var ad = new Date(a[2], a[1], a[0]);
						var bd = new Date(b[2], b[1], b[0]);
							return ad - bd;
					}else{
						return a[xCategories] - b[xCategories];
					}					
				});


				if(grid){
					var xAxis = d3.svg.axis().scale(x).orient("bottom").innerTickSize(-height).outerTickSize(0).tickPadding(10),
					yAxis = d3.svg.axis().scale(y).orient("left").innerTickSize(-width).outerTickSize(0).tickPadding(10).tickFormat(function(d){ return yFormater(d); });
				} else{
					var xAxis = d3.svg.axis().scale(x).orient("bottom"),
					 yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(function(d){ return yFormater(d); });
				}	
		
				color.domain(d3.keys(_this.data[0]).filter(function (key) {
					return key !== xCategories;
				}));

				var cities = color.domain().map(function (name) {
					return {
						name: name,
						values: _this.data.map(function (d) {
							return {
								key: d[xCategories],
								Value: +d[name],
								color: name
							};
						})
					};
				});

				var line = d3.svg.line()
					.interpolate(lineType)
					.x(function (d) {
						return x(d.key);
					})
					.y(function (d) {
						return y(d.Value);
					});

				d3.select(div).select("svg").remove();
				var svg = d3.select(div).append("svg")
					.attr("width", width + margin.left + margin.right+legend_width)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
					
				var tip = d3.tip()
					.attr('class', 'd3-tip')
					.offset([-10, 0])
					.html(function (d) {
						
					 return "<center><span>"+xCategories+" : "+d.key+"</span><br /><span>"+d.color+" : "+yFormater(d.Value)+"</span></center>";
					});
				
				svg.call(tip);

				var yMin = d3.min(cities, function (c) {
					return d3.min(c.values, function (v) {
						return (v.Value);
					});
				});
				var yMax = d3.max(cities, function (c) {
					return d3.max(c.values, function (v) {
						return v.Value;
					});
				});

				var d_f = (yMax - yMin)/8;
				yMin = yMin - 2*d_f;
				yMin = yMin < 100000 ? yMin : 100000;

				x.domain(_this.data.map(function (d) {
					return d[xCategories];
				}));
				y.domain([yMin, yMax]);
				xCircle.domain(_this.data.map(function (d) {
					return d.name;
				}))
					.rangeRoundBands([0, x.rangeBand()], 0);

				if(rotation){
				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis)
					.attr("stroke-width", "1.5px")
					.selectAll("text")
					.style("text-anchor", "end")
					.attr("dx", "-.8em")
					.attr("dy", ".15em")
					.attr("transform", function (d) {
						return "rotate("+textRotate+")"
					});
				} else {
					svg.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + height + ")")
						.call(xAxis)
						.attr("stroke-width", "1.5px")
						.selectAll("text")
						.style("text-anchor", "end");
				}

				svg.append("g")
					.attr("class", "y axis")
					.call(yAxis)					
					.attr("stroke-width", "1.5px")
					.append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", 6)
					.attr("dy", ".71em")
					.style("text-anchor", "end")
					.text(Y_AXIS_LABEL);

				var city = svg.selectAll(".city")
					.data(cities)
					.enter().append("g")
					.attr("class", "city");


				city.append("path")
					.attr("class", "line")
				// .attr("transform",function(d){ return "translate(" + xCircle(d.date) + ")"; })
				.attr("d", function (d) {
					return line(d.values);
				})
					.style("stroke", function (d) {
						return color(d.name);
					})
					.attr("stroke-width", "1.5px");

				city.selectAll("circle")
					.data(function (d) {
						return d.values;
					})
					.enter()
					.append("circle")
					.attr("r", 5)
					.attr("cx", function (d) {
						return x(d.key);
					})
					.attr("cy", function (d) {
						return y(d.Value);
					})
					.style("fill", function (d) {
						return color(d.color);
					})
					.style("stroke", "none")
					.style("pointer-events", "all")
					.style("cursor", "poiter")
					.on("mouseover", tip.show)
					.on("mouseout", tip.hide);
					
				var legend = svg.selectAll(".legend")
							.data(color.domain().slice().reverse())
						  .enter().append("g")
							.attr("class", "legend")
							.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

						legend.append("rect")
							.attr("x", width - 18+legend_width)
							.attr("width", 18)
							.attr("height", 18)
							.style("fill", color);

						legend.append("text")
							.attr("x", width - 24+legend_width)
							.attr("y", 9)
							.attr("dy", ".35em")
							.style("text-anchor", "end")
							.text(function(d) { return d; });

			}
			
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return Line;

	})();

	
	DD3.Histogram = (function() {
		function Histogram(options){
		
				//getElement(this, DD3.Histogram, options);
			if (!(this instanceof DD3.Histogram)) {
				return new DD3.Histogram(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
		 
			var div = this.el[0];			
			var _this = this;
				
				Histogram.prototype.data = typeof options.data === "string" ? {} : options.data;
				Histogram.prototype.generate = function () {
					//Histogram Code start
					
					var grid = typeof options.grid === "undefined" ? false : options.grid,
					Y_AXIS_LABEL = typeof options.yAxisLabel === "undefined" ? "" : options.yAxisLabel,
					main_height = typeof options.height === "undefined" ? 500 : options.height,
					yFormater = typeof options.yFormater === "undefined" ? d3.format(",.2s") : d3.format(options.yFormater),
					textRotate = typeof options.rotateX === "undefined" ? "-65" : options.rotateX,
					rotation = typeof options.rotation === "undefined" ? true : options.rotation,
					key = typeof options.key === "undefined" ? "key" : options.key,
					color = typeof options.color === "undefined" ? "#4C64AB" : options.color;				//d3.scale.category10() : d3.scale.ordinal().range(options.color),
					value = typeof options.value === "undefined" ? "value" : options.value;
				
				
					
					var mainWidth = typeof options.width === "undefined" ? $(div).parent().width() : options.width;
					var margin = {
							top: typeof options.margin_top === "undefined" ? 20 : options.margin_top,
							right:  typeof options.margin_right === "undefined" ? 80 : options.margin_right,
							bottom:  typeof options.margin_bottom === "undefined" ? 120 : options.margin_bottom,
							left:  typeof options.margin_left === "undefined" ? 50 : options.margin_left
						},
						width = mainWidth - margin.left - margin.right,
						height = main_height - margin.top - margin.bottom;
						
					var x = d3.scale.ordinal()
						.rangeRoundBands([0, width], .1);

					var y = d3.scale.linear()
						.range([height, 0]);
					
					if(grid){
						var xAxis = d3.svg.axis().scale(x).orient("bottom").innerTickSize(-height).outerTickSize(0).tickPadding(10),
						yAxis = d3.svg.axis().scale(y).orient("left").innerTickSize(-width).outerTickSize(0).tickPadding(10).tickFormat(function(d){ return yFormater(d); });
					} else{
						var xAxis = d3.svg.axis().scale(x).orient("bottom"),
						 yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(function(d){ return yFormater(d); });
					}	//.tickFormat(formatPercent);
					
					
					d3.select(div).select("svg").remove();
				var svg = d3.select(div).append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
				  .append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
					
				var tip = d3.tip()
					.attr('class', 'd3-tip')
					.offset([-10, 0])
					.html(function (d) {
					 return "<span>"+key+" : "+d[key]+"</span><br /><span>"+value+" : "+yFormater(d[value])+"</span>";
					});
				
				svg.call(tip);
				
				var yMin = d3.min(_this.data, function(d) { return d[value]; });
				var yMax = d3.max(_this.data, function(d) { return d[value]; });
					yMin = yMin < 10000 ? 0 : (yMin-100);
					x.domain(_this.data.map(function(d) {  return d[key]; }));
					y.domain([yMin, yMax]);
					
					if(rotation){
						svg.append("g")
								.attr("class", "x axis")
								.attr("transform", "translate(0," + height + ")")
								.call(xAxis)
								.attr("stroke-width", "1.5px")
							.selectAll("text")  
								.style("text-anchor", "end")
								.attr("dx", "-.8em")
								.attr("dy", ".15em")
								.attr("transform", function(d) {
									return "rotate("+textRotate+")" 
								});
					} else{
						svg.append("g")
								.attr("class", "x axis")
								.attr("transform", "translate(0," + height + ")")
								.call(xAxis)
								.attr("stroke-width", "1.5px")
							.selectAll("text")  
								.style("text-anchor", "end");
					}

					svg.append("g")
						  .attr("class", "y axis")
						  .call(yAxis)
						  .attr("stroke-width", "1.5px")
						.append("text")
						  .attr("transform", "rotate(-90)")
						  .attr("y", 6)
					      .attr("dy", ".71em")
						  .style("text-anchor", "end")
						  .text(Y_AXIS_LABEL);
						
					svg.selectAll(".bar")
						  .data(_this.data)
						.enter().append("rect")
						  .attr("class", "bar")
						  .attr("x", function(d) { return x(d[key]); })
						  .attr("width", x.rangeBand())
						  .attr("y", function(d) { return y(d[value]); })
						  .attr("height", function(d) { return height - y(d[value]); })
						  .style("fill", color)
						  .on('mouseover', tip.show)
						  .on('mouseout', tip.hide);
						  
			  }
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return Histogram;
	})();
	
	DD3.Grouped_Histogram = (function() {
	
		function Grouped_Histogram(options){

			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.Grouped_Histogram)) {
				return new DD3.Grouped_Histogram(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
				Grouped_Histogram.prototype.data = typeof options.data === "string" ? {} : options.data;
				Grouped_Histogram.prototype.generate = function () {
				
					var grid = typeof options.grid === "undefined" ? false : options.grid,
					Y_AXIS_LABEL = typeof options.yAxisLabel === "undefined" ? "" : options.yAxisLabel,
					main_height = typeof options.height === "undefined" ? 500 : options.height,
					yFormater = typeof options.yFormater === "undefined" ? d3.format(",.2s") : d3.format(options.yFormater),
					textRotate = typeof options.rotateX === "undefined" ? "-65" : options.rotateX,
					rotation = typeof options.rotation === "undefined" ? true : options.rotation,
					xCategories = typeof options.xCategory === "undefined" ? "xCategory" : options.xCategory,
					color = typeof options.color === "undefined" ? d3.scale.category10() : d3.scale.ordinal().range(options.color);
					var legend_width = typeof options.legend_width === "undefined" ? 120 : options.legend_width;	
				
					var mainWidth = typeof options.width === "undefined" ? $(div).parent().width() : options.width;
					var margin = {
							top: typeof options.margin_top === "undefined" ? 20 : options.margin_top,
							right:  typeof options.margin_right === "undefined" ? 80 : options.margin_right,
							bottom:  typeof options.margin_bottom === "undefined" ? 120 : options.margin_bottom,
							left:  typeof options.margin_left === "undefined" ? 50 : options.margin_left
					},
						width = mainWidth - margin.left - margin.right-legend_width,
						height = main_height - margin.top - margin.bottom;
					
						
					var x0 = d3.scale.ordinal()
							.rangeRoundBands([0, width], .1);

					var x1 = d3.scale.ordinal();

					var y = d3.scale.linear()
							.range([height, 0]);
							
					 _this.data.sort(function(a, b){
							if(xCategories == "date"|| xCategories=="Date"){
								a = a[xCategories].split("-");
								b = b[xCategories].split("-");
								var ad = new Date(a[2], a[1], a[0]);
								var bd = new Date(b[2], b[1], b[0]);
									return ad - bd;
							}else{
								return a[xCategories] - b[xCategories];
							}					
					});
					  
					if(grid){
						var xAxis = d3.svg.axis().scale(x0).orient("bottom").innerTickSize(-height).outerTickSize(0).tickPadding(10),
						yAxis = d3.svg.axis().scale(y).orient("left").innerTickSize(-width).outerTickSize(0).tickPadding(10).tickFormat(function(d){ return yFormater(d); });
					} else{
						var xAxis = d3.svg.axis().scale(x0).orient("bottom"),
						 yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(function(d){ return yFormater(d); });
					}
						
							  d3.select(div).select("svg").remove();
					var svg = d3.select(div).append("svg")
							.attr("width", width + margin.left + margin.right+legend_width)
							.attr("height", height + margin.top + margin.bottom)
						  .append("g")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
							
					var tip = d3.tip()
						.attr('class', 'd3-tip')					
						.offset([-10, 0])
						.html(function (d) {
							return "<center><span>"+xCategories+" : "+d.key+"</span><br /><span>"+d.name+" : "+yFormater(d.value)+"</span></center>";
					});
					
					svg.call(tip);
					
	
					 var BARS = d3.keys(_this.data[0]).filter(function (key) {
						return key !== xCategories;
					});
					_this.data.forEach(function(d){
						d.bars = BARS.map(function(name){
							return {name: name, value: +d[name], key: d[xCategories]};
						});
					});
	
	
					/*						
						_this.data.forEach(function(d) {
						  d.bars = BARS.map(function(name) { return {name: name, value: +d[name]}; });
						});
					*/
						x0.domain(_this.data.map(function(d) { return  d[xCategories]; /*d[GROUPS];*/ }));
						x1.domain(BARS).rangeRoundBands([0, x0.rangeBand()]);
						y.domain([0, d3.max(_this.data, function(d) { return d3.max(d.bars, function(d) { return d.value; }); })]);	
						
						if(rotation){
						svg.append("g")
								.attr("class", "x axis")
								.attr("transform", "translate(0," + height + ")")
								.call(xAxis)
								.attr("stroke-width", "1.5px")
							.selectAll("text")  
								.style("text-anchor", "end")
								.attr("dx", "-.8em")
								.attr("dy", ".15em")
								.attr("transform", function(d) {
									return "rotate("+textRotate+")" 
								});
						} else {
							svg.append("g")
									.attr("class", "x axis")
									.attr("transform", "translate(0," + height + ")")
									.call(xAxis)
									.attr("stroke-width", "1.5px")
								.selectAll("text")  
									.style("text-anchor", "end");
						}

						svg.append("g")
							.attr("class", "y axis")
							.call(yAxis)
							.attr("stroke-width", "1.5px")
						  .append("text")
							.attr("transform", "rotate(-90)")
							.attr("y", 6)
							.attr("dy", ".71em")
							.style("text-anchor", "end")
							.text(Y_AXIS_LABEL);

					var groups = svg.selectAll(".groups")
							.data(_this.data)
						  .enter().append("g")
							.attr("class", "g")
							.attr("transform", function(d) { return "translate(" + x0(d[xCategories]) + ",0)"; });    //x0(d[GROUPS])

						groups.selectAll("rect")
							.data(function(d) { return d.bars; })
						  .enter().append("rect")
							.attr("width", x1.rangeBand())
							.attr("x", function(d) { return x1(d.name); })
							.attr("y", function(d) { return y(d.value); })
							.attr("height", function(d) { return height - y(d.value); })
							.style("fill", function(d) { return color(d.name); })
							.on("mouseover", tip.show)
							.on("mouseout", tip.hide);

					var legend = svg.selectAll(".legend")
							.data(BARS.slice().reverse())
						  .enter().append("g")
							.attr("class", "legend")
							.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

						legend.append("rect")
							.attr("x", width - 18+legend_width)
							.attr("width", 18)
							.attr("height", 18)
							.style("fill", color);

						legend.append("text")
							.attr("x", width - 24+legend_width)
							.attr("y", 9)
							.attr("dy", ".35em")
							.style("text-anchor", "end")
							.text(function(d) { return d; });

					
				}
					if (this.data.length) this.generate();
					else AJAX(options.data, this);
		}
		
		return Grouped_Histogram;
	})();
	
	DD3.Bubble = (function() {
	
		function Bubble(options){

			//getElement(this, DD3.Bubble, options);
			if (!(this instanceof DD3.Bubble)) {
				return new DD3.Bubble(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
				Bubble.prototype.data = typeof options.data === "string" ? {} : options.data;
				Bubble.prototype.generate = function () {
					// Bubble code starts
					var root = _this.data;
					var diameter = options.diameter !== undefined ? options.diameter : 960,
						stroke = options.stroke !== undefined ? options.stroke : "#000",
						format = d3.format(",d"),
						color = d3.scale.category20();
						
					var bubble = d3.layout.pack()
						.sort(null)
						.size([diameter, diameter])
						.padding(1.5);
								
							d3.select(div).select("svg").remove();
					var svg = d3.select(div).append("svg")
						.attr("width", diameter)
						.attr("height", diameter)
						.attr("class", "bubble");

					var node = svg.selectAll(".node")
					  .data(bubble.nodes(classes(root))
					  .filter(function(d) { return !d.children; }))
					.enter().append("g")
					  .attr("class", "node")
					  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

						node.append("circle")
						  .attr("r", function(d) { return d.r; })
						  .style("fill", function(d) { return color(d.packageName); })
						  .style("stroke", stroke);
						
												
						node.append("title")
						  .text(function(d) { return d.className + ": " + format(d.value); });
						
						node.append("text")
						  .attr("dy", ".0em")
						  .style("text-anchor", "middle")
						  .text(function(d) { return d.className.substring(0, d.r / 3); });
						
						node.append("text")
						  .attr("dy", "1.3em")
						  .style("font-size", "10px")
						  .style("text-anchor", "middle")
						  .text(function(d) { return "$" + format(d.value).substring(0, d.r / 3); });

						  // Returns a flattened hierarchy containing all leaf nodes under the root.
					function classes(root) {
					  var classes = [];

					  function recurse(name, node) {
						if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
						else classes.push({packageName: name, className: node.name, value: node.size});
					  }

					  recurse(null, root);
					  return {children: classes};
					}
					
					d3.select(self.frameElement).style("height", diameter + "px");
					
				}
					if (this.data.length) this.generate();
					else AJAX(options.data, this);
		}
		
		return Bubble;
	})();
	
	DD3.Pie = (function() {
	
		function Pie(options){

			//getElement(this, DD3.Pie, options);
		 
			if (!(this instanceof DD3.Pie)) {
				return new DD3.Pie(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
				Pie.prototype.data = typeof options.data === "string" ? {} : options.data;
				Pie.prototype.generate = function () {
					var root = _this.data;
					
					
					var height = typeof options.height === "undefined" ? 300: options.height,
						width = typeof options.width === "undefined" ? $(div).parent().width() : options.width,
						donut = typeof options.donut === "undefined" ? false : options.donut,
						donutWidth = typeof options.donutWidth === "undefined" ? 30 : options.donutWidth,
						legend_X = typeof options.legend_X === "undefined" ? -2 : options.legend_X,
						key = typeof options.key === "undefined" ? "key" : options.key,
						value = typeof options.value === "undefined" ? "value" : options.value,
						valuePercent = typeof options.valuePercent === "undefined" ? "" : options.valuePercent,
						valueFormater = typeof options.valueFormater === "undefined" ? d3.format(",") : d3.format(options.valueFormater),
						radius = Math.min(width, height) / 2,
						legendRectSize = 18,                                 // NEW
						legendSpacing = 4,
						stroke = typeof options.stroke === "undefined" ? "#000": options.stroke,
						color = typeof options.color === "undefined" ? d3.scale.category10() : d3.scale.ordinal().range(options.color);
						
					if(donut){
						var arc = d3.svg.arc()
							.innerRadius(radius - donutWidth)
							.outerRadius(radius);
					} else{
						var arc = d3.svg.arc()
							.outerRadius(radius);
					}
						
					var sum = d3.sum(_this.data, function(d){ return d[value]; });
					
					var pie = d3.layout.pie()
						.sort(null)
						.value(function(d) { return d[value]; });
						
							 d3.select(div).select("svg").remove();
					var svg = d3.select(div).append("svg")
						.attr("width", width)
						.attr("height", height)
					  .append("g")
						.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
					
					var tip = d3.tip()
						.attr('class', 'd3-tip')
						.offset([-10, 0])
						.html(function (d) {
							if(options.valuePercent){
								return "<center><span>"+key+" : "+d.data[key]+"</span><br /><span>"+value+" : "+valueFormater(d.data[value])+" ( "+d3.round(d.data[value]*100/sum, 2)+valuePercent+" )</span></center>";
							}else {
								return "<center><span>"+key+" : "+d.data[key]+"</span><br /><span>"+value+" : "+valueFormater(d.data[value])+"</span></center>";
							}
					});
					
					svg.call(tip);
					
						
					var path = svg.selectAll('path')
						  .data(pie(_this.data))
						  .enter()
						  .append('path')
						  .attr('d', arc)	
						  .attr('fill', function(d, i) { 
							return color(d.data[key]);
						  })
						  .on("mouseover", tip.show)
						  .on("mouseout", tip.hide)
						  .style("stroke", stroke);	
						  
					if(donut == true){
					
						 var legend = svg.selectAll('.legend')                     // NEW
							  .data(color.domain())                                   // NEW
							  .enter()                                                // NEW
							  .append('g')                                            // NEW
							  .attr('class', 'legend')                                // NEW
							  .attr('transform', function(d, i) {                     // NEW
								var height = legendRectSize + legendSpacing;          // NEW
								var offset =  height * color.domain().length / 2;     // NEW
								var horz = legend_X * legendRectSize;                       // NEW
								var vert = i * height - offset; 
								return 'translate(' + horz + ',' + vert + ')';        // NEW
							  });                                                     // NEW

							legend.append('rect')                                     // NEW
							  .attr('width', legendRectSize)                          // NEW
							  .attr('height', legendRectSize)                         // NEW
							  .style('fill', color)                                   // NEW
							  .style('stroke', color);                                // NEW
							  
							legend.append('text')                                     // NEW
							  .attr('x', legendRectSize + legendSpacing)              // NEW
							  .attr('y', legendRectSize - legendSpacing)              // NEW
							  .text(function(d) { return d; });                       // NEW

					
					} else{
						return ;
					}
						
						
				}
					if (this.data.length) this.generate();
					else AJAX(options.data, this);
		}
		
		return Pie;
	})();
	
	
	DD3.Area = (function(){
		function Area(options){

			//getElement(this, DD3.Area, options);
			if (!(this instanceof DD3.Area)) {
				return new DD3.Area(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
		 
			var div = this.el[0];			
			var _this = this;
				
			Area.prototype.data = typeof options.data === "string" ? {} : options.data;
			Area.prototype.generate = function () {	

				var grid = typeof options.grid === "undefined" ? false : options.grid,
					Y_AXIS_LABEL = typeof options.yAxisLabel === "undefined" ? "" : options.yAxisLabel,
					main_height = typeof options.height === "undefined" ? 500 : options.height,
					yFormater = typeof options.yFormater === "undefined" ? d3.format(",.2s") : d3.format(options.yFormater),
					textRotate = typeof options.rotateX === "undefined" ? "-65" : options.rotateX,
					rotation = typeof options.rotation === "undefined" ? true : options.rotation,
					key = typeof options.key === "undefined" ? "key" : options.key,
					//color = typeof options.color === "undefined" ? d3.scale.category10() : d3.scale.ordinal().range(options.color),
					value = typeof options.value === "undefined" ? "value" : options.value;
				
				
				var mainWidth = typeof options.width === "undefined" ? $(div).parent().width() : options.width;
				var margin = {
						top: typeof options.margin_top === "undefined" ? 20 : options.margin_top,
						right:  typeof options.margin_right === "undefined" ? 80 : options.margin_right,
						bottom:  typeof options.margin_bottom === "undefined" ? 120 : options.margin_bottom,
						left:  typeof options.margin_left === "undefined" ? 50 : options.margin_left
					},
					width = mainWidth - margin.left - margin.right,
					height = main_height - margin.top - margin.bottom;
				
				
				
					
					
					

				var x = d3.scale.ordinal().rangeRoundBands([0, width], 1),
					y = d3.scale.linear().range([height, 0]);
				//var xCircle = d3.scale.ordinal();


				//var color = d3.scale.category10();


				if(grid){
					var xAxis = d3.svg.axis().scale(x).orient("bottom").innerTickSize(-height).outerTickSize(0).tickPadding(10),
					yAxis = d3.svg.axis().scale(y).orient("left").innerTickSize(-width).outerTickSize(0).tickPadding(10).tickFormat(function(d){ return yFormater(d); });
				} else{
					var xAxis = d3.svg.axis().scale(x).orient("bottom"),
					 yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(function(d){ return yFormater(d); });
				}	
				
				
				var area = d3.svg.area()
					.x(function(d) { return x(d[key]); })
					.y0(height)
					.y1(function(d) { return y(d[value]); });

						d3.select(div).select("svg").remove();
				var svg = d3.select(div).append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
					
					
					x.domain(_this.data.map(function (d) {
						return d[key];
					}));
					y.domain([0, d3.max(_this.data, function(d) { return (d[value]+100000); })]);

				
			if(rotation){
				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis)
					.attr("stroke-width", "1.5px")
					.selectAll("text")
					.style("text-anchor", "end")
					.attr("dx", "-.8em")
					.attr("dy", ".15em")
					.attr("transform", function (d) {
						return "rotate("+textRotate+")"
					});
				} else {
					svg.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + height + ")")
						.call(xAxis)
						.attr("stroke-width", "1.5px")
						.selectAll("text")
						.style("text-anchor", "end");
				}

				svg.append("g")
					.attr("class", "y axis")
					.call(yAxis)
					.attr("stroke-width", "1.5px");
					
				svg.append("path")
					.datum(_this.data)
					.attr("class", "area")
					.attr("d", area)
					.style("fill", "steelblue")
					.style("opacity", ".8");
				
				
				 
				
			}
				if (this.data.length) this.generate();
					else AJAX(options.data, this);
		}
		
		return Area;
			
	})();
	
	DD3.Scatterplot = (function(){
		function Scatterplot(options){

			//getElement(this, DD3.Scatterplot, options);
			if (!(this instanceof DD3.Scatterplot)) {
				return new DD3.Scatterplot(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
		 
			var div = this.el[0];			
			var _this = this;
				
			Scatterplot.prototype.data = typeof options.data === "string" ? {} : options.data;
			Scatterplot.prototype.generate = function () {
				
				var grid = typeof options.grid === "undefined" ? false : options.grid,
					Y_AXIS_LABEL = typeof options.yAxisLabel === "undefined" ? "" : options.yAxisLabel,
					main_height = typeof options.height === "undefined" ? 500 : options.height,
					yFormater = typeof options.yFormater === "undefined" ? d3.format(",.2s") : d3.format(options.yFormater),
					textRotate = typeof options.rotateX === "undefined" ? "-65" : options.rotateX,
					rotation = typeof options.rotation === "undefined" ? true : options.rotation,
					xCategories = typeof options.xCategory === "undefined" ? "xCategory" : options.xCategory;
				
				var legend_width = typeof options.legend_width === "undefined" ? 120 : options.legend_width;	
				var color = typeof options.color === "undefined" ? d3.scale.category10() : d3.scale.ordinal().range(options.color);
					
				var mainWidth = typeof options.width === "undefined" ? $(div).parent().width() : options.width;
				
				var margin = {
						top: typeof options.margin_top === "undefined" ? 20 : options.margin_top,
						right:  typeof options.margin_right === "undefined" ? 80 : options.margin_right,
						bottom:  typeof options.margin_bottom === "undefined" ? 120 : options.margin_bottom,
						left:  typeof options.margin_left === "undefined" ? 50 : options.margin_left
					},
					width = mainWidth - margin.left - margin.right-legend_width,
					height = main_height - margin.top - margin.bottom;
				
				
				
				var x = d3.scale.ordinal().rangeRoundBands([0, width], 1),
					y = d3.scale.linear().range([height, 0]),
					xCircle = d3.scale.ordinal();
				
				 _this.data.sort(function(a, b){
					if(xCategories == "date"||xCategories == "Date"){
						a = a[xCategories].split("-");
						b = b[xCategories].split("-");
						var ad = new Date(a[2], a[1], a[0]);
						var bd = new Date(b[2], b[1], b[0]);
							return ad - bd;
					}else{
						return a[xCategories] - b[xCategories];
					}					
				});



				if(grid){
					var xAxis = d3.svg.axis().scale(x).orient("bottom").innerTickSize(-height).outerTickSize(0).tickPadding(10),
					yAxis = d3.svg.axis().scale(y).orient("left").innerTickSize(-width).outerTickSize(0).tickPadding(10).tickFormat(function(d){ return yFormater(d); });
				} else{
					var xAxis = d3.svg.axis().scale(x).orient("bottom"),
					 yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(function(d){ return yFormater(d); });
				}
				
				color.domain(d3.keys(_this.data[0]).filter(function (key) {
					return (key !== xCategories);
				}));

				var cities = color.domain().map(function (name) {
					return {
						name: name,
						values: _this.data.map(function (d) {
							return {
								key: d[xCategories],
								Value: +d[name],
								color: name
							};
						})
					};
				});
				
				
				
				d3.select(div).select("svg").remove();
				var svg = d3.select(div).append("svg")
					.attr("width", width + margin.left + margin.right+legend_width)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
					
					
				var tip = d3.tip()
					.attr('class', 'd3-tip')
					.offset([-10, 0])
					.html(function (d) {
						
					 return "<center><span>"+xCategories+" : "+d.key+"</span><br /><span>"+d.color+" : "+yFormater(d.Value)+"</span></center>";
					});
				
				svg.call(tip);

				var yMin = d3.min(cities, function (c) {
					return d3.min(c.values, function (v) {
						return (v.Value);
					});
				});
				var yMax = d3.max(cities, function (c) {
					return d3.max(c.values, function (v) {
						return v.Value;
					});
				});


				yMin = yMin < 100000 ? 0 : (yMin-100);
				
				x.domain(_this.data.map(function (d) {
					return d[xCategories];
				}));
				y.domain([yMin, yMax]);
				xCircle.domain(_this.data.map(function (d) {
					return d.name;
				}))
					.rangeRoundBands([0, x.rangeBand()], 0);

				
			if(rotation){
				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis)
					.attr("stroke-width", "1.5px")
					.selectAll("text")
					.style("text-anchor", "end")
					.attr("dx", "-.8em")
					.attr("dy", ".15em")
					.attr("transform", function (d) {
						return "rotate("+textRotate+")"
					});
				} else {
					svg.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + height + ")")
						.call(xAxis)
						.attr("stroke-width", "1.5px")
						.selectAll("text")
						.style("text-anchor", "end");
				}

				svg.append("g")
					.attr("class", "y axis")
					.call(yAxis)					
					.attr("stroke-width", "1.5px")
				.append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", 6)
					.attr("dy", ".71em")
					.style("text-anchor", "end")
					.text(Y_AXIS_LABEL);;

				var city = svg.selectAll(".dot")
					.data(cities)
					.enter().append("g")
					.attr("class", "dot");
					
					city.append("node")
						.attr("class", "group")
						.attr("d", function (d) {
							return d.values;
						})
					
				city.selectAll("circle")
					.data(function (d) {
						return d.values;
					})
					.enter()
					.append("circle")
					.attr("r", 5)
					.attr("cx", function (d) {
						return x(d.key);
					})
					.attr("cy", function (d) {
						return y(d.Value);
					})
					.style("fill", function (d) {
						return color(d.color);
					})
					.style("stroke", "nne")
					.style("pointer-events", "all")
					.style("cursor", "poiter")
					.on("mouseover", tip.show)
					.on("mouseout", tip.hide);
					
				var legend = svg.selectAll(".legend")
							.data(color.domain().slice().reverse())
						  .enter().append("g")
							.attr("class", "legend")
							.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

						legend.append("rect")
							.attr("x", width - 18+legend_width)
							.attr("width", 18)
							.attr("height", 18)
							.style("fill", color);

						legend.append("text")
							.attr("x", width - 24+legend_width)
							.attr("y", 9)
							.attr("dy", ".35em")
							.style("text-anchor", "end")
							.text(function(d) { return d; });
				
				}
				if (this.data.length) this.generate();
					else AJAX(options.data, this);
		}
		
		return Scatterplot;
			
	})();
	
	DD3.Force_Layout = (function(){
		function Force_Layout(options){

			//getElement(this, DD3.Force_Layout, options);
			if (!(this instanceof DD3.Force_Layout)) {
				return new DD3.Force_Layout(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
		 
			var div = this.el[0];			
			var _this = this;
				
			Force_Layout.prototype.data = typeof options.data === "string" ? {} : options.data;
			Force_Layout.prototype.generate = function () {
				var color = typeof options.color === "undefined" ? d3.scale.category10() : d3.scale.ordinal().range(options.color),
					charge = typeof options.charge === "undefined" ? -120 :options.charge,
					arrows = typeof options.arrow === "undefined" ? false : options.arrow,					
					threshed = typeof options.threshold === "undefined" ? false : options.threshold,
					linkDistance = typeof options.linkDistance === "undefined" ? 50 : options.linkDistance,
					//threshLimit = options.threshLimit !== undefined ? options.threshLimit : 10,
					nodeRadius = typeof options.nodeRadius === "undefined" ? 5 : options.nodeRadius,
					main_height =  typeof options.height === "undefined" ? 500: options.height;
					
				var mainWidth = typeof options.width==="undefined" ? $(div).parent().width() : options.width;
				var margin = { top: 50, right: 80, bottom: 120, left: 50 },					
					width = mainWidth - margin.left - margin.right,
					height = main_height - margin.top - margin.bottom;
					
				
					var graph = _this.data;
					var	graphRec= graph;
					// set up the force Layout
				var force = d3.layout.force()
						.charge(charge)
						.linkDistance(linkDistance)
						.size([width, height]);
						
				 //Append a SVG to the body of the html page. Assign this SVG as an object to svg					
				if(threshed){
							d3.select(div).select("svg").remove();
					var svg = d3.select(div).append("svg")
						.attr("width", width)
						.attr("height", height)
						.on("dblclick", threshold);						
						
				} else {
						d3.select(div).select("svg").remove();
					var svg = d3.select(div).append("svg")
					.attr("width", width)
					.attr("height", height);
				}
					
		//---Insert------
				//Set up tooltip
				var tip = d3.tip()
					.attr('class', 'd3-tip')
					.offset([-10, 0])
					.html(function (d) {
					return  "<span>" + d.name + "</span>";
				})
				svg.call(tip);
				//---End Insert---
				
					//Creates the graph data structure out of the json Data.
					force.nodes(graph.nodes)
						.links(graph.links)
						.start();
						
					//Create all the line svgs but without locations yet
				if(arrows){
					var link = svg.selectAll(".link")
							.data(graph.links)
							.enter().append("line")
							.attr("class", "link")
							.style("marker-end",  "url(#suit)");
				} else {
					var link = svg.selectAll(".link")
							.data(graph.links)
							.enter().append("line")
							.attr("class", "link")
							.style("stroke-width", function(d){
								return Math.sqrt(d.value);
							});
				}
					//Do the same with the circles for the nodes - no
				var node = svg.selectAll(".node")
						.data(graph.nodes)
						.enter().append("circle")
						.attr("class", "node")
						.attr("r", nodeRadius)
						.style("fill", function (d) {
						return color(d.group);
					})
					.call(force.drag)
					.on('mouseover', tip.show) //Added
					.on('mouseout', tip.hide);
					
				//Now we are giving the SVGs co-ordinates - the force layout is generating the co-ordinates which this code is using to update the attributes of the SVG elements
				
					force.on("tick", function () {
					
						link.attr("x1", function (d) {
							return d.source.x;
						})
							.attr("y1", function (d) {
							return d.source.y;
						})
							.attr("x2", function (d) {
							return d.target.x;
						})
							.attr("y2", function (d) {
								return d.target.y;
						});
						
						node.attr("cx", function (d) {
							return d.x;
						})
							.attr("cy", function (d) {
							return d.y;
						});
					});
					
					if(arrows){
						//---Insert-------
						svg.append("defs").selectAll("marker")
							.data(["suit", "licensing", "resolved"])
						  .enter().append("marker")
							.attr("id", function(d) { return d; })
							.attr("viewBox", "0 -5 10 10")
							.attr("refX", 20)
							.attr("refY", 0)
							.attr("markerWidth", 4)
							.attr("markerHeight", 5)
							.attr("orient", "auto")
						  .append("path")
							.attr("d", "M0,-5L10,0L0,5 L10,0 L0, -5")
							.style("stroke", "#4679BD")
							.style("opacity", "0.6");
					}
					
					//---Insert-------

			//adjust threshold
			
				function threshold(thresh) {
					graph.links.splice(0, graph.links.length);

						for (var i = 0; i < graphRec.links.length; i++) {
							if (graphRec.links[i].value > thresh) {
								graph.links.push(graphRec.links[i]);
							}
						}
					restart();
				}


				//Restart the visualisation after any node and link changes

				function restart() {
					
					link = link.data(graph.links);
					link.exit().remove();
					link.enter().insert("line", ".node").attr("class", "link");
					node = node.data(graph.nodes);
					node.enter().insert("circle", ".cursor").attr("class", "node").attr("r", 5).call(force.drag)
					.on('mouseover', tip.show) //Added
					.on('mouseout', tip.hide);
					force.start();
				}
				
			}	
				if (this.data.length) this.generate();
					else AJAX(options.data, this);
		}
		
		return Force_Layout;
			
	})();
	
	// DD3 Circle Packing Construct..
	DD3.Circle_Packing = (function(){
			
		function Circle_Packing(options) {

			
			if (!(this instanceof DD3.Circle_Packing)) {
				return new DD3.Circle_Packing(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
		 
			var div = this.el[0];			
			var _this = this;
				
			Circle_Packing.prototype.data = typeof options.data === "string" ? {} : options.data;
			Circle_Packing.prototype.generate = function () {
					
					
				
				var diameter = options.diameter !== undefined ? options.diameter : 960,
					stroke = options.stroke !== undefined ? options.stroke : "#000",
					format = d3.format(",d"),
					key = typeof options.key === "undefined" ? "name" : options.key,
					property = typeof options.property === "undefined" ? "size" : options.property,
					color = options.color !== undefined ? d3.scale.ordinal().range(options.color) : d3.scale.category20();
				
				var root = _this.data;
				
				var pack = d3.layout.pack()
					.size([diameter - 4, diameter - 4])
					.value(function(d) { return d[property]; });
					
					d3.select(div).select("svg").remove();
				var svg = d3.select(div).append("svg")
					.attr("width", diameter)
					.attr("height", diameter)
				  .append("g")
					.attr("transform", "translate(2,2)");

				
				  var node = svg.datum(root).selectAll(".node")
					  .data(pack.nodes)
					.enter().append("g")
					  .attr("class", function(d) { return d.children ? "node" : "leaf node"; })
					  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

				  node.append("title")
					  .text(function(d) { return d[key] + (d.children ? "" : ": " + format(d[property])); });

				  node.append("circle")
					  .attr("r", function(d) { return d.r; })
					  .style("fill", function(d) { return color(d[key]); })
					  .style("stroke", stroke);

				  node.filter(function(d) { return !d.children; }).append("text")
					  .attr("dy", ".3em")
					  .style("text-anchor", "middle")
					  .text(function(d) { return d[key].substring(0, d.r / 3); });
					
				d3.select(self.frameElement).style("height", diameter + "px");


				
			}	
				if (this.data.length) this.generate();
					else AJAX(options.data, this);
		}
			return Circle_Packing;
	})();
	
	// DD3 table construct with bootstrap..
	DD3.Table = (function(){
		function Table(options){
		
			if (!(this instanceof DD3.Table)) {
				return new DD3.Table(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
		 
			var div = this.el[0];			
			var _this = this;
			
			Table.prototype.generate = function(){
				//var request = typeof options.request === "undefined" ? true : options.method;
				var _method = typeof options.method === "undefined" ? "get" : options.method;
				var _contentType = typeof options.contentType === "undefined" ? "text/plain" : options.contentType;
				var _dataType = typeof options.dataType === "undefined" ? "text/plain" : options.dataType;
				var _height = typeof options.height === "undefined" ? 500 : parseInt(options.height);
				var _caching = typeof options.caching === "undefined" ? false : options.caching;
				var _striped = typeof options.striped === "undefined" ? true : options.striped;
				var _pagination = typeof options.pagination === "undefined" ? true : options.pagination;
				var _search = typeof options.search === "undefined" ? true : options.search;
				var _showExport = typeof options.showExport === "undefined" ? true : options.showExport;
				var _exportTypes = typeof options.exportTypes === "undefined" ? ['json', 'xml', 'csv', 'txt', 'sql', 'excel'] : options.exportTypes;
				var _showColumns = typeof options.showColumns === "undefined" ? true : options.showColumns;
				var _showRefresh = typeof options.showRefresh === "undefined" ? true : options.showRefresh;
				var _minimumCountColumns = typeof options.minimumCountColumns === "undefined" ? 2 : options.minimumCountColumns;
				var _clickToSelect = typeof options.clickToSelect === "undefined" ? true : options.clickToSelect;
				var _columns = typeof options.columns === "undefined" ? [] : options.columns;
				
				if(typeof options.data === "string"){
					$(div).bootstrapTable("destroy");
					$(div).bootstrapTable({
										method:_method,
										url: options.data,				
										dataType: _dataType,
										contentType: _contentType,
										height: _height,
										caching: _caching,
										striped: _striped,
										pagination: _pagination,
										search: _search,
										showExport: _showExport,
										exportTypes: _exportTypes,
										showColumns: _showColumns,
										showRefresh: _showRefresh,
										minimumCountColumns: _minimumCountColumns,
										clickToSelect: _clickToSelect,
										columns: _columns
					});
				} else {
					$(div).bootstrapTable("destroy");
					$(div).bootstrapTable({
									data : options.data,
									height: _height,
                                    caching: _caching,
									striped: _striped,
									pagination: _pagination,
									search: _search,
									showExport: _showExport,
									exportTypes: _exportTypes,
									showColumns: _showColumns,
									showRefresh: _showRefresh,
									minimumCountColumns: _minimumCountColumns,
									clickToSelect: _clickToSelect,
									columns:_columns
					});
				}
			}
			this.generate();
		}	
		return Table;
	})();	
	
		// DD3 Chord Construct ....
	DD3.Chord =(function(){
		function Chord(options) {

			if (!(this instanceof DD3.Chord)) {
				return new DD3.Chord(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
		 
			var div = this.el[0];			
			var _this = this;
				
			Chord.prototype.data = typeof options.data === "string" ? {} : options.data;
			Chord.prototype.generate = function () {
				var main_width = options.width !== undefined ? options.width : $(div).parent().width(),
					main_height = options.height !== undefined ? options.height : 300,
					color = options.color !== undefined ? options.color : ["#000000", "#FFDD89", "#957244", "#F26223"];
					
				var matrix = _this.data;
				
				var chord = d3.layout.chord()
					.padding(.05)
					.sortSubgroups(d3.descending)
					.matrix(matrix);

				var width = main_width,
					height = main_height,
					innerRadius = Math.min(width, height) * .41,
					outerRadius = innerRadius * 1.1;

				var fill = d3.scale.ordinal()
					.domain(d3.range(4))
					.range(color);
						
						d3.select(div).select("svg").remove();
				var svg = d3.select(div).append("svg")
					.attr("width", width)
					.attr("height", height)
				  .append("g")
					.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

				svg.append("g").selectAll("path")
					.data(chord.groups)
				  .enter().append("path")
					.style("fill", function(d) { return fill(d.index); })
					.style("stroke", function(d) { return fill(d.index); })
					.attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
					.on("mouseover", fade(.1))
					.on("mouseout", fade(1));

				var ticks = svg.append("g").selectAll("g")
					.data(chord.groups)
				  .enter().append("g").selectAll("g")
					.data(groupTicks)
				  .enter().append("g")
					.attr("transform", function(d) {
					  return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
						  + "translate(" + outerRadius + ",0)";
					});

				ticks.append("line")
					.attr("x1", 1)
					.attr("y1", 0)
					.attr("x2", 5)
					.attr("y2", 0)
					.style("stroke", "#000");

				ticks.append("text")
					.attr("x", 8)
					.attr("dy", ".35em")
					.attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
					.style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
					.text(function(d) { return d.label; });

				svg.append("g")
					.attr("class", "chord")
				  .selectAll("path")
					.data(chord.chords)
				  .enter().append("path")
					.attr("d", d3.svg.chord().radius(innerRadius))
					.style("fill", function(d) { return fill(d.target.index); })
					.style("opacity", 1);

				// Returns an array of tick angles and labels, given a group.
				function groupTicks(d) {
				  var k = (d.endAngle - d.startAngle) / d.value;
				  return d3.range(0, d.value, 1000).map(function(v, i) {
					return {
					  angle: v * k + d.startAngle,
					  label: i % 5 ? null : v / 1000 + "k"
					};
				  });
				}

				// Returns an event handler for fading a given chord group.
				function fade(opacity) {
				  return function(g, i) {
					svg.selectAll(".chord path")
						.filter(function(d) { return d.source.index != i && d.target.index != i; })
					  .transition()
						.style("opacity", opacity);
				  };
				}			
			}	
			if (this.data.length) this.generate();
				else AJAX(options.data, this);
		}
		return Chord;
	
	})();
	
	// DD3 Vertical Tree Layout ...

	DD3.Vertical_Tree = (function(){
		function Vertical_Tree(options) {

			
			if (!(this instanceof DD3.Vertical_Tree)) {
				return new DD3.Vertical_Tree(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
		 
			var div = this.el[0];			
			var _this = this;
				
			Vertical_Tree.prototype.data = typeof options.data === "string" ? {} : options.data;
			Vertical_Tree.prototype.generate = function () {
				var root = _this.data;
				var main_height = options.height !== undefined ? options.height : 500,
					main_width = options.width !== undefined ? options.width : $(div).parent().width();
					
				var margin = {top: 40, right: 120, bottom: 20, left: 120},
					width = main_width - margin.right - margin.left,
					height = main_height - margin.top - margin.bottom;
				var i = 0,
					duration = 750,
					rectW = 60,
					rectH = 30;

				var tree = d3.layout.tree()
						.nodeSize([70, 40]);
						
				var diagonal = d3.svg.diagonal()
					.projection(function (d) {
					return [d.x + rectW / 2, d.y + rectH / 2];
				//.projection(function(d) { return [d.x+bbox.getBBox().width/2, d.y+bbox.getBBox().height/2]; 

				});

						  d3.select(div).select("svg").remove();
				var svg = d3.select(div).append("svg")
							.attr("width", width + margin.left + margin.right)
							.attr("height", height + margin.top + margin.bottom)
							.call(zm = d3.behavior.zoom().scaleExtent([.1,10])
							.on("zoom", redraw))
							.append("g")
						.attr("transform", "translate(" + 350 + "," + 20 + ")");

				//necessary so that zoom knows where to zoom and unzoom from
				zm.translate([350, 20]);

				root.x0 = 0;
				root.y0 = height / 2;

				function collapse(d) {
					if (d.children) {
						d._children = d.children;
						d._children.forEach(collapse);
						d.children = null;
					}
				}

				root.children.forEach(collapse);
				update(root);

				d3.select(div).style("height", main_height+"px");

				function update(source) {

					// Compute the new tree layout.
					var nodes = tree.nodes(root).reverse(),
						links = tree.links(nodes);

					// Normalize for fixed-depth.
					nodes.forEach(function (d) {
						d.y = d.depth * 180;
					});

					// Update the nodes…
					var node = svg.selectAll("g.node")
						.data(nodes, function (d) {
						return d.id || (d.id = ++i);
					});

					// Enter any new nodes at the parent's previous position.
					var nodeEnter = node.enter().append("g")
						.attr("class", "node")
						.attr("transform", function (d) {
						return "translate(" + source.x0 + "," + source.y0 + ")";
					})
						.on("click", click);

					nodeEnter.append("rect")
						.attr("width", rectW)
						.attr("height", rectH)
						.attr("stroke", "black")
						.attr("stroke-width", 1)
						.style("fill", function (d) {
						return d._children ? "lightsteelblue" : "#fff";
					});

					nodeEnter.append("text")
						.attr("x", rectW / 2)
						.attr("y", rectH / 2)
						.attr("dy", ".35em")
						.attr("text-anchor", "middle")
						.text(function (d) {
						return d.name;
					});

					// Transition nodes to their new position.
					var nodeUpdate = node.transition()
						.duration(duration)
						.attr("transform", function (d) {
						return "translate(" + d.x + "," + d.y + ")";
					});

					nodeUpdate.select("rect")
						.attr("width", rectW)
						.attr("height", rectH)
						.attr("stroke", "black")
						.attr("stroke-width", 1)
						.style("fill", function (d) {
						return d._children ? "lightsteelblue" : "#fff";
					});

					nodeUpdate.select("text")
						.style("fill-opacity", 1);

					// Transition exiting nodes to the parent's new position.
					var nodeExit = node.exit().transition()
						.duration(duration)
						.attr("transform", function (d) {
						return "translate(" + source.x + "," + source.y + ")";
					})
						.remove();

					nodeExit.select("rect")
						.attr("width", rectW)
						.attr("height", rectH)
					//.attr("width", bbox.getBBox().width)""
					//.attr("height", bbox.getBBox().height)
					.attr("stroke", "black")
						.attr("stroke-width", 1);

					nodeExit.select("text");

					// Update the links…
					var link = svg.selectAll("path.link")
						.data(links, function (d) {
						return d.target.id;
					});

					// Enter any new links at the parent's previous position.
					link.enter().insert("path", "g")
						.attr("class", "link")
						.attr("x", rectW / 2)
						.attr("y", rectH / 2)
						.attr("d", function (d) {
						var o = {
							x: source.x0,
							y: source.y0
						};
						return diagonal({
							source: o,
							target: o
						});
					});

					// Transition links to their new position.
					link.transition()
						.duration(duration)
						.attr("d", diagonal);

					// Transition exiting nodes to the parent's new position.
					link.exit().transition()
						.duration(duration)
						.attr("d", function (d) {
						var o = {
							x: source.x,
							y: source.y
						};
						return diagonal({
							source: o,
							target: o
						});
					})
						.remove();

					// Stash the old positions for transition.
					nodes.forEach(function (d) {
						d.x0 = d.x;
						d.y0 = d.y;
					});
				}

				// Toggle children on click.
				function click(d) {
					if (d.children) {
						d._children = d.children;
						d.children = null;
					} else {
						d.children = d._children;
						d._children = null;
					}
					update(d);
				}

				//Redraw for zoom
				function redraw() {
				  //console.log("here", d3.event.translate, d3.event.scale);
				  svg.attr("transform",
					  "translate(" + d3.event.translate + ")"
					  + " scale(" + d3.event.scale + ")");
				}	
				
			} 
			if (this.data.length) this.generate();
				else AJAX(options.data, this);
				
		}
			return Vertical_Tree;
	})();
	
	DD3.Zoomable_Circle = (function(){
		function Zoomable_Circle(options) {

			
			if (!(this instanceof DD3.Zoomable_Circle)) {
				return new DD3.Zoomable_Circle(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
		 
			var div = this.el[0];			
			var _this = this;
				
			Zoomable_Circle.prototype.data = typeof options.data === "string" ? {} : options.data;
			Zoomable_Circle.prototype.generate = function () {
				
				var diameter = typeof options.diameter === "undefined" ? 960 : options.diameter,
					stroke = typeof options.stroke === "undefined" ? "#000" : options.stroke,
					margin = 20;
				var	key = typeof options.key === "undefined" ? "name" : options.key,
					property = typeof options.property === "undefined" ? 0 : options.property,
					colors = typeof options.color === "undefined" ? ["hsl(152,80%,80%)", "hsl(228,30%,40%)"] : options.color,
					bodyColor = typeof options.bodyColor === "undefined" ? "#fff" : options.bodyColor; 
					format = d3.format(",d");				
					//color = options.color !== undefined ? d3.scale.ordinal().range(options.color) : d3.scale.category20();
							
				var color = d3.scale.linear()
					.domain([-1, 5])
					.range(colors)
					.interpolate(d3.interpolateHcl);

				var pack = d3.layout.pack()
					.padding(2)
					.size([diameter - margin, diameter - margin])
					.value(function(d) {
						var arr = [],							
							test = d.property.split(",");							
							var count = test[property].split("=");							
							var	json = {"size":count[1]}							
						//return d.size;
						return json.size; 
					});
					
					d3.select(div).select("svg").remove();
				var svg = d3.select(div).append("svg")
					.attr("width", diameter)
					.attr("height", diameter)
				  .append("g")
					.attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
				
				
				
				var root = _this.data[0];
				//d3.json("flare.json", function(error, root) {
				  //if (error) return console.error(error);
				
				  var focus = root,
					  nodes = pack.nodes(root),
					  view;
					
				  var circle = svg.selectAll("circle")
					  .data(nodes)
					.enter().append("circle")
					  .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
					  .style("fill", function(d) { return d.children ? color(d.depth) : null; })
					  .style("fill-opacity", function(d) { return d.children ? ".25" : null;})
					  .style("stroke", stroke)
					  .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

				  var text = svg.selectAll("text")
					  .data(nodes)
					.enter().append("text")
					  .attr("class", "label")
					  .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
					  .style("display", function(d) { return d.parent === root ? null : "none"; })
					  .text(function(d) { return d[key]; });

				  var node = svg.selectAll("circle,text");

				  d3.select(div)
					  .style("background", bodyColor)							//color(-1)
					  .on("click", function() { zoom(root); });

				  zoomTo([root.x, root.y, root.r * 2 + margin]);

				  function zoom(d) {
					var focus0 = focus; focus = d;

					var transition = d3.transition()
						.duration(d3.event.altKey ? 7500 : 750)
						.tween("zoom", function(d) {
						  var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
						  return function(t) { zoomTo(i(t)); };
						});

					transition.selectAll("text")
					  .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
						.style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
						.each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
						.each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
				  }

				  function zoomTo(v) {
					var k = diameter / v[2]; view = v;
					node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
					circle.attr("r", function(d) { return d.r * k; });
				  }
			//	});

				d3.select(self.frameElement).style("height", diameter + "px");		
		
			}
			if (this.data.length) this.generate();
				else AJAX(options.data, this);
		}
		
		return Zoomable_Circle;
		
	})();
	
	DD3.WordTree=(function () {

	function WordTree(options) {

			//getElement(this, DD3.WordTree, options);
			if (!(this instanceof DD3.WordTree)) {
				return new DD3.WordTree(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
				
			var ele = this.el[0];		
				
			WordTree.prototype.data = typeof options.data === "string" ? {} : options.data;
			
	    WordTree.prototype.generate = function() {
		    var data = typeof options.data === "undefined" ? "" : options.data;
			var prefix = typeof options.startWord === "undefined" ? " " : options.startWord;
			var reverse1 = typeof options.reverse === "undefined" ? 0 : options.reverse;
			var phraseLine = typeof options.phraseLine === "undefined" ? 0 : options.phraseLine;
        
			var width,
				height,
			tree = wordtree()
			  .on("prefix", function(d) {
			  
				
				prefix = state.prefix = prefix;
				url({prefix: prefix});
				refreshText(d.tree);
			  });		
					 
			$(document).ready(function(){
				url(state = {source: ""}, true);
				$.ajax({
							url : data,
							dataType: "text",
							success : function (data1) {
							   processText(data1);
							   }
					   });	
			});
					
			
		var re = new RegExp("[" + unicodePunctuationRe + "]|\\d+|[^\\d" + unicodePunctuationRe + "0000-001F007F-009F002000A01680180E2000-200A20282029202F205F3000".replace(/\w{4}/g, "\\u$&") + "]+", "g");

			var vis = d3.select(ele),
				svg = vis.append("svg"),
				clip = svg.append("defs").append("clipPath").attr("id", "clip"),
				treeG = svg.append("g");
				

			var lines = [],
				text = d3.select("#text").on("scroll", scroll),
				hits = d3.select("#hits"),
				
				source = d3.select("#source"),
				state = {},
				tokens,
				selectedLines = [];

		
			d3.select(window)
				.on("keydown.hover", hoverKey)
				.on("keyup.hover", hoverKey)
				.on("resize", resize)
				.on("popstate", change);

			change();

			resize();
			/*
			//d3.select("#form-source").on("submit", function() {
			 // d3.event.preventDefault();
			 // url({source: source.property("value"), prefix: ""}, true);
			 // change();
			//});
			*/
			d3.select("#sort").selectAll("option")
				.data(["frequency", "occurrence"])
			  .enter().append("option")
				.attr("value", String)
				.text(String);
								
			d3.select("#sort")
				.on("change", function() {
				  url({sort: this.value});
				  change();
				});
			
			function resize() {
			  width = vis.node().clientWidth;
			  height = window.innerHeight - 50 - 0;
			 //heatmap.attr("transform", "translate(" + (width ) + ",.5)")
				 //.attr("height", height);
			  svg.attr("width", width+300)
				  .attr("height", height+200);
			  clip.attr("width", width)
				  .attr("height", height);
			  treeG.call(tree.width(width).height(height));
			  //updateHeatmap();
			 // text.call(textViewer);
			}
			
			
			

			function processText(t) {
			
			  var i = 0,
				  m,
				  n = 0,
				  line = 0,
				  lineLength = 0,
				  tmp = text.append("span").text("m"),
				  dx = 285 / tmp.node().offsetWidth;
			  tmp.remove();
			  tokens = [];
			  lines = [];
			  var line = [];
			  while (m = re.exec(t)) {
				var w = t.substring(i, m.index);
				if (/\r\n\r\n|\r\r|\n\n/.test(w)) {
				  lines.push(line, []);
				  line = [];
				  lineLength = m[0].length;
				} else {
				  lineLength += m[0].length + !!w.length;
				  if (lineLength > dx) lineLength = m[0].length, lines.push(line), line = [];
				}
				var token = {token: m[0], lower: m[0].toLowerCase(), index: n++, whitespace: w, line: lines.length};
				tokens.push(token);
				line.push(token);
				i = re.lastIndex;
			  }
			  lines.push(line);
			
			  tree.tokens(tokens);
			  change();
			}
		

			function getURL(url, callback) {
			  if (location.protocol === "https:" && /^http:/.test(url)) {
				proxy(url, response);
			  } else try {
				d3.xhr(url, function(error, req) {
				  if (error) proxy(url, response);
				  else response(error, req);
				});
			  } catch(e) {
				proxy(url, response);
			  }
			  function response(error, req) {
				callback(/^text\/html\b/.test(req.getResponseHeader("Content-Type"))
					? req.responseText
						 .replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, "")
						 .replace(/<style[^>]*>([\S\s]*?)<\/style>/gmi, "")
						 .replace(/<head[^>]*>([\S\s]*?)<\/head>/gmi, "")
						 .replace(/<[^>]*?>/gm, " ")
						 .replace(/&#?\w+;/g, decodeEntity)
					: req.responseText);
			  }
			}

			var entity = document.createElement("span");

			function decodeEntity(d) {
			  entity.innerHTML = d;
			  return entity.textContent;
			}

			function proxy(url, callback) {
			  d3.xhr("//www.jasondavies.com/xhr?url=" + encodeURIComponent(url), callback);
			}

			function url(o, push) {
			  var query = [],
				  params = {};
			  for (var k in state) params[k] = state[k];
			  for (var k in o) params[k] = o[k];
			  for (var k in params) {
				query.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k]));
			  }
			  history[push ? "pushState" : "replaceState"](null, null, "?" + query.join("&"));
			}

			function urlParams(h) {
			  var o = {};
			  h && h.split(/&/g).forEach(function(d) {
				d = d.split("=");
				o[decodeURIComponent(d[0])] = decodeURIComponent(d[1]);
			  });
			  return o;
			}

			function change() {
			  if (!location.search) {
				showHelp();
				return;
			  }
			  var last = state ? state.source : null;
			  state = urlParams(location.search.substr(1));
			  if (state.source !== last && state.source) {
				source.property("value", state.source);
				getURL(state.source, function(text) {
				  processText(dummy);
				});
				hideHelp();
			  } else if (tokens && tokens.length) {
				var start = state.prefix = prefix;
				if (!start) {
				  url({prefix: start = tokens[0].token});
				}
				//keyword
					//.property("value", start)
					//.node().select();
				start = start.toLowerCase().match(re);
				treeG.call(tree.sort(state.sort === "occurrence"
					  ? function(a, b) { return a.index - b.index; }
					  : function(a, b) { return b.count - a.count || a.index - b.index; })
					  //state.reverse=reverse1;
					.reverse(reverse1)
					.phraseLine(phraseLine)
					.prefix(start));
				refreshText(tree.root());
				hideHelp();
			  }
			
			}

			function showHelp() {
			  d3.selectAll("#help-window, #form-source").style("display", null);
			  d3.selectAll("#form, #reverse-wrapper").style("display", null);
			}

			function hideHelp() {
			  d3.selectAll("#help-window, #form-source").style("display", "none");
			  d3.selectAll("#form, #reverse-wrapper").style("display", "inline-block");
			}

			function currentLine(node) {
			  if (!node) return 0;
			  var children = node.children;
			  while (children && children.length) {
				node = children[0];
				children = node.children;
			  }
			  return node.tokens[0].line - 3; // bit of a hack!
			}

			function refreshText(node) {
			  clearHighlight();
			  var parent = node, depth = 0;
			  while (parent) {
				depth += parent.tokens.length;
				parent = parent.parent;
			  }
			  selectedLines = [];
			  highlightTokens(node, depth);
			 // updateHeatmap();
			 // text.call(textViewer.position(currentLine(node)));
			}

			function clearHighlight() {
			  for (var i = -1; ++i < tokens.length;) tokens[i].highlight = false;
			}

			function highlightTokens(node, depth) {
			  if (!node) return;
			  if (node.children && node.children.length) {
				depth += node.tokens.length;
				node.children.forEach(function(child) {
				  highlightTokens(child, depth);
				});
			  } else {
				node.tokens.forEach(function(token) { token.highlight = true; });
				for (var n = node.tokens[0].index, i = Math.max(0, n - depth); i <= n; i++) {
				  tokens[i].highlight = true;
				  selectedLines.push(tokens[i].line);
				}
			  }
			}

			function highlight(d) { return d.highlight; }

			
			function scroll() {
			  var d = page.datum();
			  page.attr("y", d.y = Math.max(0, Math.min(height - d.h, height * this.scrollTop / (textViewer.rowHeight() * lines.length))));
			}

			function drag(d) {
			  d.y = Math.max(0, Math.min(height - d.h - 1, d3.event.y));
			  text.node().scrollTop = d.y * textViewer.rowHeight() * lines.length / height;
			  page.attr("y", d.y);
			}

			function hoverKey() {
			  svg.classed("hover", d3.event.shiftKey);
			}
		}
			this.generate();
	}
			
	return WordTree;
	

  })();
	
	DD3.Tree_With_Table = (function(){
		function Tree_With_Table(options) {
			
			if (!(this instanceof DD3.Tree_With_Table)) {
				return new DD3.Tree_With_Table(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
				
			var div = this.el[0];
				
			Tree_With_Table.prototype.data = typeof options.data === "string" ? {} : options.data;

			Tree_With_Table.prototype.generate = function(){

				var main_width = typeof options.width === "undefined" ? 5000 : parseInt(options.width),
					main_height = typeof options.height === "undefined" ? 400 : parseInt(options.height),					
					tableDiv = typeof options.tableDiv === "undefined" ? " " : options.tableDiv,					
					fieldKey = typeof options.fieldKey === "undefined" ? "cli" : options.fieldKey,
					tableData = typeof options.tableData === "undefined" ? "CLI" : options.tableData,					
					columnTitle = typeof options.columnTitle === "undefined" ? "CLI" : options.columnTitle,
					tipColor = typeof options.tipColor === "undefined" ? "#fff" : options.tipcolor;
				var _height = typeof options.tableHeight === "undefined" ? 500 : parseInt(options.tableHeight);
				var _caching = typeof options.caching === "undefined" ? false : options.caching;
				var _striped = typeof options.striped === "undefined" ? true : options.striped;
				var _pagination = typeof options.pagination === "undefined" ? true : options.pagination;
				var _search = typeof options.search === "undefined" ? true : options.search;
				var _showExport = typeof options.showExport === "undefined" ? true : options.showExport;
				var _exportTypes = typeof options.exportTypes === "undefined" ? ['json', 'xml', 'csv', 'txt', 'sql', 'excel'] : options.exportTypes;
				var _showColumns = typeof options.showColumns === "undefined" ? true : options.showColumns;
				var _showRefresh = typeof options.showRefresh === "undefined" ? true : options.showRefresh;
				var _minimumCountColumns = typeof options.minimumCountColumns === "undefined" ? 1 : options.minimumCountColumns;
				var _clickToSelect = typeof options.clickToSelect === "undefined" ? true : options.clickToSelect;
				
					
					
				var margin = {
						top: 20,
						right: 120,
						bottom: 20,
						left: 120
					},
					width = main_width - margin.right - margin.left,
					height = main_height - margin.top - margin.bottom;
					
				var maxWidth = 	width,	//typeof options.maxWidth === "undefined" ? $(div).parent().width() : parseInt(options.maxWidth),
					maxHeight = main_height,//typeof options.maxHeight === "undefined" ? 400 : parseInt(options.maxHeight),
					expandIx = false,
					collapseIx = false;

				var i = 0,
					duration = 750,
					root;

				var tree = d3.layout.tree()
					.size([height, width]);

				var diagonal = d3.svg.diagonal()
					.projection(function (d) {
						return [d.y, d.x];
					});
					
					d3.select(div).select("svg").remove();
				var svg = d3.select(div).append("svg")
					.attr("width", width + margin.right + margin.left)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
					
					// for 1st time when tree is loaded then make it vertical scroll position in center.
					$(div).scrollTop(height/2.5);
					
					
				var tip = d3.tip()
					.attr('class', 'd3-tip')
					.offset([-10, 0])
					.html(function (d) {
						var result = "<span style='color : "+tipColor+";'>"+d.property+"</span>";
						return result;
					}).style("font-size", "12px");
				
				svg.call(tip);

				//this.setData(options.data);
				root = this.data[0];
				root.x0 = height / 2;
				root.y0 = 0;
						
						// make collapse function for node..
				function collapse(d) {
					if (d.children) {
						d._children = d.children;
						d._children.forEach(collapse);
						d.children = null;
					}
				}
				
							// make expand function for node..
				function expand(d) {
					if (d._children) {
						d.children = d._children;
						d.children.forEach(expand);
						d._children = null;
					}
				}
				
				root.children.forEach(collapse);
				update(root);


				d3.select(self.frameElement).style("height", main_height+"px");

								// make Update function for tree data and construct updation on every click and hover functions
				function update(source) {
						
					d3.select(div).select("svg")
					.attr("width", maxWidth)
					.attr("height", maxHeight);	
						
					// Compute the new tree layout.
					var nodes = tree.nodes(root).reverse(),
						links = tree.links(nodes);

					// Normalize for fixed-depth.
					nodes.forEach(function (d) {
						//d.x = d.x * 1;
						//d.y = d.depth * 180;
						  d.y = d.depth * 180 + (20 * (expandIx ? 1 : -1));
					});

					// Update the nodes…
					var node = svg.selectAll("g.node")
						.data(nodes, function (d) {
							return d.id || (d.id = ++i);
						});

					// Enter any new nodes at the parent's previous position.
					var nodeEnter = node.enter().append("g")
						.attr("class", "node")
						.attr("transform", function (d) {
							return "translate(" + source.y0 + "," + source.x0 + ")";
						})
						.on("click", function(d){						
							if(tableDiv){
							 Table(d, tableDiv);
							 click(d, div);
							} else{
								click(d, div)								
							}
						})
						.on("mouseover", tip.show)
						.on("mouseout", tip.hide)
						
						//  .on("mouseover", function(d){ node_onmouseover(d); });

					nodeEnter.append("circle")
						.attr("r", 1e-6)
						.style("fill", function (d) {
							return d._children ? "lightsteelblue" : "#fff";
						});

					nodeEnter.append("text")
						.attr("x", function (d) {
							return d.children || d._children ? -10 : 10;
						})
						.attr("dy", ".35em")
						.attr("text-anchor", function (d) {
							return d.children || d._children ? "end" : "start";
						})
						.text(function (d) {
							return d.name;
						})
						.style("fill-opacity", 1e-6);

					// nodeEnter.selectAll("circle")
						// .append("svg:title")
						// .text(function (d) {
							// return d.property
						// });
						
					// Transition nodes to their new position.
					var nodeUpdate = node.transition()
						.duration(duration)
						.attr("transform", function (d) {
							return "translate(" + d.y + "," + d.x + ")";
						});

					nodeUpdate.select("circle")
						.attr("r", 4.5)
						.style("fill", function (d) {
							return d._children ? "lightsteelblue" : "#fff";
						});

					nodeUpdate.select("text")
						.style("fill-opacity", 1);

					// Transition exiting nodes to the parent's new position.
					var nodeExit = node.exit().transition()
						.duration(duration)
						.attr("transform", function (d) {
							return "translate(" + source.y + "," + source.x + ")";
						})
						.remove();

					nodeExit.select("circle")
						.attr("r", 1e-6);

					nodeExit.select("text")
						.style("fill-opacity", 1e-6);

					// Update the links…
					var link = svg.selectAll("path.link")
						.data(links, function (d) {
							return d.target.id;
						});

					// Enter any new links at the parent's previous position.
					link.enter().insert("path", "g")
						.attr("class", "link")
						.attr("d", function (d) {
							var o = {
								x: source.x0,
								y: source.y0
							};
							return diagonal({
								source: o,
								target: o
							});
						});

					// Transition links to their new position.
					link.transition()
						.duration(duration)
						.attr("d", diagonal);

					// Transition exiting nodes to the parent's new position.
					link.exit().transition()
						.duration(duration)
						.attr("d", function (d) {
							var o = {
								x: source.x,
								y: source.y
							};
							return diagonal({
								source: o,
								target: o
							});
						})
						.remove();

					// Stash the old positions for transition.
					nodes.forEach(function (d) {
						d.x0 = d.x;
						d.y0 = d.y;
					});
					
				}

				// Toggle children on click.
				function click(d, div) {
					if (d.children) {
						d._children = d.children;
						d.children = null;
						//collapseIx = true;
                       // expandIx = false;
					} else {
						d.children = d._children;
						d._children = null;
						//maxWidth += 150;
						//maxHeight += 50;
						//expandIx = true;
						//collapse = false;
					}
					
					
					update(d);
					//toScroll(div, d, expandIx);
				}
				
				function Table(data, tableDiv){
					$(tableDiv).bootstrapTable("destroy");
					$(tableDiv).bootstrapTable({
									data : data[tableData],
									height: _height,
                                    caching: _caching,
									striped: _striped,
									pagination: _pagination,
									search: _search,
									showExport: _showExport,
									exportTypes: _exportTypes,
									showColumns: _showColumns,
									showRefresh: _showRefresh,
									minimumCountColumns: _minimumCountColumns,
									clickToSelect: _clickToSelect,
									columns:[{
												field: fieldKey,
												title: columnTitle,
												align: "center",
												valign: "center",
												sortable: true
											}]
					});
					
				}

				
				// for scrolling if we going in 3 node depth....
				function toScroll(div, d, flag) {
							var ndiv = $(div);
							var pos = ndiv.scrollLeft();
							var posDelta = 0;
							if (d.depth > 4)
								posDelta = 3 * (flag ? 40 : -40);
							else
								posDelta = d.depth * (flag ? 40 : -40);
							ndiv.scrollLeft(pos + posDelta);
	//                        var dId = d.id;
	//                        $('#' + dId).focus();
						}
				
				
			};
			
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return Tree_With_Table;
	})();

	DD3.Heatmap = (function(){
		
		function Heatmap(options){
			if (!(this instanceof DD3.Heatmap)) {
				return new DD3.Heatmap(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
				
			var div = this.el[0];
				
			Heatmap.prototype.data = typeof options.data === "string" ? {} : options.data;

			Heatmap.prototype.generate = function(){
				 // var mLeft = options.margin_left === "undefined"? 30 : options.margin_left,
					// mRight = options.margin_right === "undefined"? 0 : options.margin_right,
					// mTop = options.margin_top === "undefined"? 50 : options.margin_top,
					// mBottom = options.margin_bottom === "undefined"? 100 : options.margin_bottom
				 var margin = { 
						top: typeof options.margin_top === "undefined" ? 50 : options.margin_top,
						right: typeof options.margin_right === "undefined" ? 0 : options.margin_right,
						bottom: typeof options.margin_bottom === "undefined" ? 100 : options.margin_bottom,
						left: typeof options.margin_left === "undefined" ? 30 : options.margin_left
					 },
					 main_width = typeof options.width === "undefined" ? $(div).parent().width() : parseInt(options.width),
					 main_height = typeof options.height === "undefined" ? 400 : parseInt(options.height),					
					 width = main_width - margin.left - margin.right,
					 height = main_height - margin.top - margin.bottom,
					 blockSize = typeof options.blockSize === "undefined" ? 24 : parseInt(options.blockSize),
					  gridSize = Math.floor(width / blockSize),
					  legendElementWidth = gridSize*2,
					  buckets = typeof options.bucket === "undefined" ? 9 : options.bucket,
					  colors = typeof options.color === "undefined" ? ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]: options.color, // alternatively colorbrewer.YlGnBu[9]
					  days = typeof options.rowLabel === "undefined" ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] : options.rowLabel,
					  times = typeof options.columnLabel === "undefined" ? ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"] : options.columnLabel,
					  xkey = typeof options.xkey === "undefined" ? "day" : options.xkey,
					  ykey = typeof options.xkey === "undefined" ? "hour" : options.ykey,					  
					  value = typeof options.value === "undefined" ? "value" : options.value,
					  valueFormater = typeof options.valueFormater === "undefined" ? d3.format(",") : d3.format(options.valueFormater);

					  var dataset = this.data;
					  
				var colorScale = d3.scale.quantile()
					  .domain([0, buckets - 1, d3.max(dataset, function (d) { return d[value]; })])
					  .range(colors);
					  
				var tip = d3.tip()
					.attr('class', 'd3-tip')
					//.offset([-10, 0])
					.html(function (d) {
					 return "<span> "+xkey+" : "+days[d[xkey]-1]+" </span><br /><span>"+ykey+" : "+times[d[ykey]-1]+"</span><br /><span>"+value+" : "+valueFormater(d[value])+" </span>";
					});
					
				
				
							
						d3.select(div).select("svg").remove();
			    var svg = d3.select(div).append("svg")
					  .attr("width", width + margin.left + margin.right)
					  .attr("height", height + margin.top + margin.bottom)
					  .append("g")
					  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
				svg.call(tip);
				
				var dayLabels = svg.selectAll(".dayLabel")
					  .data(days)
					  .enter().append("text")
						.text(function (d) { return d; })
						.attr("x", 0)
						.attr("y", function (d, i) { return i * gridSize; })
						.style("text-anchor", "end")
						.attr("transform", "translate(-6," + gridSize / 1.5 + ")")
						.attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

				var timeLabels = svg.selectAll(".timeLabel")
					  .data(times)
					  .enter().append("text")
						.text(function(d) { return d; })
						// .attr("x", function(d, i) { return i * gridSize; })
						// .attr("y", 0)
						// .style("text-anchor", "middle")
						// .attr("transform", "translate(" + gridSize / 2 + ", -6)")
						 .attr("dy", ".32em")
						 .style("text-anchor", "end")
						 .attr("transform", function(d, i) {
							 return "translate(" + (i * gridSize) + ",0)"
												+ "translate(" + gridSize / 2 + ", -6)rotate(90)";								
						 })
						.attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });
				
				var heatMap = svg.selectAll(".hour")
					  .data(dataset)
					  .enter().append("rect")
					  .attr("x", function(d) { return (d[ykey] - 1) * gridSize; })
					  .attr("y", function(d) { return (d[xkey]- 1) * gridSize; })
					  .attr("rx", 4)
					  .attr("ry", 4)
					  .attr("class", "hour bordered")
					  .attr("width", gridSize)
					  .attr("height", gridSize)
					  .style("fill", colors[0]);
					  
					heatMap.transition().duration(1000)
						.style("fill", function(d) { return colorScale(d[value]); });
						
					heatMap
					// .on("mousemove", function(d){
								// tip.style("top", (d3.event.pageY-75) + "px")
								   // .style("left",(d3.event.pageX-80) + "px")
								   // .style("visibility", "visible");
								
							// })
							.on("mouseover", tip.show)							
							.on("mouseout", tip.hide);

				//	heatMap.append("title").text(function(d) { return d[value]; });
					
				var legend = svg.selectAll(".legend")
					  .data([0].concat(colorScale.quantiles()), function(d) { return d; })
					  .enter().append("g")
					  .attr("class", "legend");

					legend.append("rect")
						.attr("x", function(d, i) { return legendElementWidth * i; })
						.attr("y", height)
						.attr("width", legendElementWidth)
						.attr("height", gridSize / 2)
						.style("fill", function(d, i) { return colors[i]; });

					legend.append("text")
						.attr("class", "mono")
						.text(function(d) { return "= " + Math.round(d); })
						.attr("x", function(d, i) { return legendElementWidth * i; })
						.attr("y", height + gridSize);
					  
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return Heatmap;		
	})();
	
	DD3.BubbleAxisChart = (function() {
	
		function BubbleAxisChart(options){

			//getElement(this, DD3.Bubble, options);
			if (!(this instanceof DD3.BubbleAxisChart)) {
				return new DD3.BubbleAxisChart(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
				BubbleAxisChart.prototype.data = typeof options.data === "string" ? {} : options.data;
				BubbleAxisChart.prototype.generate = function() {
					
					var main_height = typeof options.height === "undefined"? 400: options.height;
					var main_width = typeof options.width === "undefined"? $(div).parent().width() : options.width;
					var margin = {
						top: typeof options.margin_top === "undefined"? 20: options.margin_top,
						right: typeof options.margin_right === "undefined"? 80: options.margin_right,
						bottom: typeof options.margin_bottom === "undefined"? 120: options.margin_bottom,
						left: typeof options.margin_left === "undefined"? 50 : options.margin_left
					};					
					var legend_width = typeof options.legend_width === "undefined" ? 120 : options.legend_width;
					var width = main_width - margin.left - margin.right-legend_width,
						height = main_height - margin.top - margin.bottom;
					var labelX = typeof options.labelX === "undefined"? "X": options.labelX;
					var labelY = typeof options.labelY === "undefined"? "Y": options.labelY;
					var xKey = typeof options.xKey === "undefined"? "x": options.xKey;
					var yKey = typeof options.yKey === "undefined"? "y": options.yKey;
					var group = typeof options.group === "undefined"? "c": options.group;
					var value = typeof options.value === "undefined"? "size": options.value;
					var color = typeof options.color === "undefined"? d3.scale.category10() : d3.scale.ordinal().range(options.color);
					var xformater = typeof options.xformater === "undefined" ? d3.format(",") : d3.format(options.xformater);
					var timeformater = typeof options.timeformater === "undefined" ? d3.time.format("%x") : d3.time.format(options.timeformater);
					var yformater = typeof options.yformater === "undefined" ? d3.format(",") : d3.format(options.yformater);
					var tipPreString = typeof options.tipPreString === "undefined" ? " ": options.tipPreString;
					var tipWildKey = typeof options.tipWildKey === "undefined"? "" : options.tipWildKey;
					var minSize = typeof options.minSize === "undefined" ? 2 : options.minSize;
					var maxSize = typeof options.maxSize === "undefined"? 20 : options.maxSize;
					var tipFlag = typeof options.tipFlag === "undefined" ? true : options.tipFlag;
					var data = _this.data;
					
						d3.select(div).select("svg").remove();
				var svg = d3.select(div)
                    .append('svg')
                    .attr('class', 'chart')
                    .attr("width", width + margin.left + margin.right+legend_width)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
					
				var tip = d3.tip()
					.attr('class', 'd3-tip')
					.offset([-10, 0])
					.html(function (d) {
							if(options.tipWildKey){
								return "<center><span>"+d[group]+" : "+yformater(d[yKey])+"</span><br /><span>"+value+" : "+yformater(d[value])+" ( "+tipWildKey+":" +tipPreString+d[tipWildKey]+" )</span></center>";
								} else {
								return "<center><span>"+d[group]+" : "+yformater(d[yKey])+"</span><br /><span>"+value+" : "+yformater(d[value])+"</span></center>";
								}
					});
				
				svg.call(tip);
                    
				// var x = d3.scale.linear()
					            // .domain([d3.min(data, function (d) { return d[xKey]; }), d3.max(data, function (d) { return d[xKey]; })])
					            // .range([0, width]);
				if(timeformater){
					var x = d3.time.scale()
						.domain([d3.min(data, function (d) { return d[xKey]; }), d3.max(data, function (d) { return d[xKey]; })])
						.range([0, width]);				
				}else{
					var x = d3.scale.linear()
						.domain([d3.min(data, function (d) { return d[xKey]; }), d3.max(data, function (d) { return d[xKey]; })])
						.range([0, width]);
				}
				
				var y = d3.scale.linear()
					            .domain([d3.min(data, function (d) { return d[yKey]; }), d3.max(data, function (d) { return d[yKey]; })])
					            .range([height, 0]);

				var scale = d3.scale.sqrt()
					            .domain([d3.min(data, function (d) { return d[value]; }), d3.max(data, function (d) { return d[value]; })])
					            .range([minSize, maxSize]);

				var opacity = d3.scale.sqrt()
					            .domain([d3.min(data, function (d) { return d[value]; }), d3.max(data, function (d) { return d[value]; })])
					            .range([1, .5]);
                                
				var xAxis;
				if(timeformater){
				
					 xAxis = d3.svg.axis().scale(x).tickFormat(function(d){ 	
						var num = Number(d);
						num = num - 1000;
						return d3.time.format(options.timeformater)(new Date(num));
						});
				}else {
					 xAxis = d3.svg.axis().scale(x).tickFormat(d3.format(",.f"));
				}
				
				var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(yformater);
 
					svg.append("g")
					        .attr("class", "y axis")
					        .call(yAxis)							
							.attr("stroke-width", "1.5px")
							.append("text")
								.attr("transform", "rotate(-90)")
								.attr("y", 6)
								.attr("dy", ".71em")
								.style("text-anchor", "end")
								.text(labelY);
					        // .append("text")
						        // .attr("transform", "rotate(-90)")
						        // .attr("x", 20)
						        // .attr("y", -margin)
						        // .attr("dy", ".71em")
						        // .style("text-anchor", "end")
						        // .text(labelY);
                          // x axis and label
				if(options.textRotate){
					  svg.append("g")
						  .attr("class", "x axis")
						  .attr("transform", "translate(0," + height + ")")
						  .call(xAxis)
						.attr("stroke-width", "1.5px")
						  .selectAll("text")  
								.style("text-anchor", "end")
								.attr("dx", "-.8em")
								.attr("dy", ".15em")
								.attr("transform", function(d) {
									return "rotate("+options.textRotate+")" 
								});
					} else {		  
                    svg.append("g")
                              .attr("class", "x axis")
                              .attr("transform", "translate(0," + height + ")")
                              .call(xAxis)
							  .attr("stroke-width", "1.5px");
                              // .append("text")
                                  // .attr("x", width + 20)
                                  // .attr("y", margin - 10)
                                  // .attr("dy", ".71em")
                                  // .style("text-anchor", "end")
                                  // .text(labelX);
					}
					svg.selectAll("circle")
                              .data(data)
                              .enter()
                              .insert("circle")
                              .attr("cx", width / 2)
                              .attr("cy", height / 2)
                              .attr("opacity", function (d) { return opacity(d[value]); })
                              .attr("r", function (d) { return scale(d[value]); })
                              .style("fill", function (d) { return color(d[group]); })
                              .on('mouseover', function (d, i) {
								if(options.tipFlag){
									tip.show(d);
								}else{
									d3.select(this).append("title")
										.text(d[group]+" : "+yformater(d[yKey]));
								}
								 // tip.show(d);
								  fade(d[group], .1);
								 
                              })
                             .on('mouseout', function (d, i) {
								if(options.tipFlag){
									tip.hide(d);
								}
							   // tip.hide(d);
								 fadeOut();
								 
                             })
                             .transition()
                            .delay(function (d, i) {  return x(d[xKey]) - y(d[yKey]); })
                            .duration(500)
                            .attr("cx", function (d) {  return x(d[xKey]); })
                            .attr("cy", function (d) {  return y(d[yKey]); })
                            .ease("bounce");
							
                   var legend = svg.selectAll(".legend")
							.data(color.domain().slice().reverse())
						  .enter().append("g")
							.attr("class", "legend")
							.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

						legend.append("rect")
							.attr("x", width - 18+legend_width)
							.attr("width", 18)
							.attr("height", 18)
							.style("fill", color);

						legend.append("text")
							.attr("x", width - 24+legend_width)
							.attr("y", 9)
							.attr("dy", ".35em")
							.style("text-anchor", "end")
							.text(function(d) { return d; });
				        
                             
					function fade(c, opacity) {
						  svg.selectAll("circle")
							  .filter(function (d) {
								  return d[group] != c;
							  })
							.transition()
							.style("opacity", opacity);
					}

					function fadeOut() {
						  svg.selectAll("circle")
						  .transition()
							 .style("opacity", function (d) { opacity(d[value]); });
					}
					
			}	
			if (this.data.length) this.generate();
				else AJAX(options.data, this);
		}
		
		return BubbleAxisChart;
	})();
	
	DD3.StackHistogramChart = (function() {
	
		function StackHistogramChart(options){

			//getElement(this, DD3.Bubble, options);
			if (!(this instanceof DD3.StackHistogramChart)) {
				return new DD3.StackHistogramChart(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
			StackHistogramChart.prototype.data = typeof options.data === "string" ? {} : options.data;
				
			StackHistogramChart.prototype.generate = function() {
					var height = typeof options.height === "undefined"? 400: options.height;
					var width = typeof options.width === "undefined"? $(div).parent().width() : options.width;
					var textRotate = typeof options.textRotate === "undefined" ? "0": options.textRotate;
					var labelY = typeof options.labelY === "undefined"? "Y Label": options.labelY;
					var xCategory = typeof options.xCategory === "undefined"? "State": options.xCategory;
					var yFormater = typeof options.yFormater === "undefined" ? d3.format(",.2s") : d3.format(options.yFormater);
					var color = typeof options.color === "undefined"? d3.scale.category10() : d3.scale.ordinal().range(options.color);
					var legend_width = typeof options.legend_width === "undefined" ? 120 : options.legend_width;
					var labelX = typeof options.labelX === "undefined" ? "" : options.labelX;
					var distance_X = typeof options.distance_X === "undefined"? 20: options.distance_X;	
					var distance_Y = typeof options.distance_Y === "undefined"? 6 : options.distance_Y;				
					var sortedKeys = typeof options.sortedKeys === "undefined"? [] : options.sortedKeys;	
					
					
					
				    var data = _this.data;
					
					data.sort(function(a, b){
							if(xCategory == "Date" || xCategory == "date"){
								a = a[xCategory].split("-");
								b = b[xCategory].split("-");
								var ad = new Date(a[2], a[1], a[0]);
								var bd = new Date(b[2], b[1], b[0]);
									return ad - bd;
							}else{
								return a[xCategory] - b[xCategory];
							}					
					});
					var margin = {top: typeof options.margin_top === "undefined"? 20 : options.margin_top,
								  right:typeof options.margin_right === "undefined"? 20: options.margin_right,
								  bottom:typeof options.margin_bottom === "undefined"? 30: options.margin_bottom,
								  left: typeof options.margin_left === "undefined"?120: options.margin_left},
						width = width - margin.left - margin.right-legend_width,
						height = height - margin.top - margin.bottom;

					var x = d3.scale.ordinal()
						.rangeRoundBands([0, width], .1);

					var y = d3.scale.linear()
						.rangeRound([height, 0]);

					var xAxis = d3.svg.axis()
						.scale(x)
						.orient("bottom");

					var yAxis = d3.svg.axis()
						.scale(y)
						.orient("left")
						.tickFormat(function(d){ return yFormater(d); });
							
							d3.select(div).select("svg").remove();
					var svg = d3.select(div)
                        .append('svg')
                        .attr('class', 'stackchart')
						.attr("width", width + margin.left + margin.right+legend_width)
						.attr("height", height + margin.top + margin.bottom)
					  .append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
						
					var tip = d3.tip()
						.attr('class', 'd3-tip')
						.offset([-10, 0])
						.html(function (d) {
								return "<center><span>"+xCategory+" : "+d.key+"</span><br /><span>"+d.name+" : "+yFormater(d.value)+"</span></center>";
					});
					
					  // make condition for sort Labels of json keys according to index sequence of external sortedKeys[]
					  if(sortedKeys.length == 0){
							color.domain(d3.keys(data[0]).filter(function(key) { return key !== xCategory; }));					
					 } else {
							color.domain(options.sortedKeys);
					 }
					 
					 // make Structure for stack Histogram..					  
					  data.forEach(function(d) {
						var y0 = 0;
						d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name], value: +d[name], key: d[xCategory]}; });
						d.total = d.ages[d.ages.length - 1].y1;
					  });

					  svg.call(tip);
					 // data.sort(function(a, b) { return b.total - a.total; });

					  x.domain(data.map(function(d) { return d[xCategory]; }));
					  y.domain([0, d3.max(data, function(d) { return d.total; })]);

					if(options.textRotate){
					  svg.append("g")
						  .attr("class", "x axis")
						  .attr("transform", "translate(0," + height + ")")
						  .call(xAxis)
						.attr("stroke-width", "1.5px")
						  .selectAll("text")  
								.style("text-anchor", "end")
								.attr("dx", "-.8em")
								.attr("dy", ".15em")
								.attr("transform", function(d) {
									return "rotate("+textRotate+")" 
								});
						svg.append("g")
							.attr("class", "labels")
							.attr("transform", "translate(0," + height + ")")
							.attr("stroke-width", "1.5px")
							.append("text")
							.attr("x", width/2)
							  .attr("y", margin.right + distance_X)
							  .attr("dy", ".71em")
							  .style("text-anchor", "end")
							  .text(labelX);
					} else {
						svg.append("g")
						  .attr("class", "x axis")
						  .attr("transform", "translate(0," + height + ")")
						  .call(xAxis)
						  .attr("stroke-width", "1.5px")
						  .append("text")
							  .attr("x", width/2)
							  .attr("y", margin.right + distance_X)
							  .attr("dy", ".71em")
							  .style("text-anchor", "end")
							  .text(labelX);
					}
					
					  svg.append("g")
						  .attr("class", "y axis")
						  .call(yAxis)
					      .attr("stroke-width", "1.5px")
						.append("text")
						  .attr("transform", "rotate(-90)")
						  .attr("y", distance_Y)
						  .attr("dy", ".71em")
						  .style("text-anchor", "end")
						  .text(labelY);

					  var state = svg.selectAll(".state")
						  .data(data)
						.enter().append("g")
						  .attr("class", "g")
						  .attr("transform", function(d) { return "translate(" + x(d[xCategory]) + ",0)"; });

					  state.selectAll("rect")
						  .data(function(d) { return d.ages; })
						.enter().append("rect")
						  .attr("width", x.rangeBand())
						  .attr("y", function(d) { return y(d.y1); })
						  .attr("height", function(d) { return y(d.y0) - y(d.y1); })
						  .style("fill", function(d) { return color(d.name); })
						  .attr("id",function(d) {return d.name})
						  .attr("class", "relative");
					
					  state.selectAll("rect")
							.on("mouseover", tip.show)
							.on("mouseout", tip.hide);
					
					  var legend = svg.selectAll(".legend")
						  .data(color.domain().slice().reverse())
						.enter().append("g")
						  .attr("class", "legend")
						  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

					  legend.append("rect")
						  .attr("x", width - 18+legend_width)
						  .attr("width", 18)
						  .attr("height", 18)
						  .style("fill", color);

					  legend.append("text")
						  .attr("x", width - 24+legend_width)
						  .attr("y", 9)
						  .attr("dy", ".35em")
						  .style("text-anchor", "end")
						  .text(function(d) { return d; });
			}

			if (this.data.length) this.generate();
				else AJAX(options.data, this);
		}
		
		return StackHistogramChart;
	})();
	
	DD3.HorizontalStackHistogramChart = (function() {
	
		function HorizontalStackHistogramChart(options){

			//getElement(this, DD3.Bubble, options);
			if (!(this instanceof DD3.HorizontalStackHistogramChart)) {
				return new DD3.HorizontalStackHistogramChart(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
			HorizontalStackHistogramChart.prototype.data = typeof options.data === "string" ? {} : options.data;
				
			HorizontalStackHistogramChart.prototype.generate = function() {
					var main_height = typeof options.height==="undefined"? 400 : options.height,
						main_width = typeof options.width==="undefined"? $(div).parent().width(): options.width,
						xCategory = typeof options.xCategory=== "undefined"? "xCategory" : options.xCategory,
						textRotate = typeof options.textRotate === "undefined" ? "0": options.textRotate,
						labelY = typeof options.labelY ==="undefined" ? "Label Y": options.labelY,
						label_Y_Distance = typeof options.label_Y_Distance === "undefined"? -30 : options.label_Y_Distance,
						xFormater = typeof options.xFormater === "undefined" ? d3.format(",.2s") : d3.format(options.xFormater),
						color = typeof options.color === "undefined" ? d3.scale.category10() :  d3.scale.ordinal().range(options.color);					
					var x_axis = typeof options.xAxis === "undefined"? true: options.xAxis,
						show_legend = typeof options.legend === "undefined" ? true: options.legend;					
					var legend_width = typeof options.legend_width === "undefined" ? 120 : options.legend_width;
				
					var data = _this.data;
					data.sort(function(a, b){
							if(xCategory == "Date" || xCategory == "date"){
								a = a[xCategory].split("-");
								b = b[xCategory].split("-");
								var ad = new Date(a[2], a[1], a[0]);
								var bd = new Date(b[2], b[1], b[0]);
									return ad - bd;
							}else{
								return a[xCategory] - b[xCategory];
							}					
					});
					
					var margin = {
								  top: typeof options.margin_top==="undefined"?20: options.margin_top,
								  right: typeof options.margin_right==="undefined"?20: options.margin_right,
								  bottom: typeof options.margin_bottom==="undefined"?100: options.margin_bottom,
								  left: typeof options.margin_left==="undefined"?120: options.margin_left
								  },
						width = main_width - margin.left - margin.right-legend_width,
						height = main_height - margin.top - margin.bottom;

					var y = d3.scale.ordinal()
						.rangeRoundBands([height, 0], .1);

					var x = d3.scale.linear()
						.rangeRound([0, width]);

					var xAxis = d3.svg.axis()
						.scale(x)
						.orient("bottom").tickFormat(function(d){ return xFormater(d); });
						

					var yAxis = d3.svg.axis()
						.scale(y)
						.orient("left");
						
						
							d3.select(div).select("svg").remove();
					var svg = d3.select(div)
                        .append('svg')
                        .attr('class', 'stackchart')
						.attr("width", width + margin.left + margin.right+legend_width)
						.attr("height", height + margin.top + margin.bottom)
					  .append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

					//d3.json("data.json", function(error, data) {
					var tip = d3.tip()
							.attr('class', 'd3-tip')
							.offset([-10, 0])
							.html(function (d) {
									return "<center><span>"+xCategory+" : "+d.key+"</span><br /><span>"+d.name+" : "+xFormater(d.value)+"</span></center>";
						});

					  
					  color.domain(d3.keys(data[0]).filter(function(key) { return key !== xCategory; }));
					  
					  data.forEach(function(d) {
						var y0 = 0;
						d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name], value: +d[name], key: d[xCategory]}; });
						d.total = d.ages[d.ages.length - 1].y1;
						
					  });
					  
					  svg.call(tip);

					  //data.sort(function(a, b) { return b.total - a.total; });

					  y.domain(data.map(function(d) { return d[xCategory]; }));
					  x.domain([0, d3.max(data, function(d) { return d.total; })]);
					
					if(x_axis){
						if(options.textRotate){
						  svg.append("g")
							  .attr("class", "x axis")
							  .attr("transform", "translate(0," + height + ")")
							  .call(xAxis)
							  .attr("stroke-width", "1.5px")
							  .selectAll("text")  
									.style("text-anchor", "end")
									.attr("dx", "-.8em")
									.attr("dy", ".15em")
									.attr("transform", function(d) {
										return "rotate("+textRotate+")" 
									});
						} else {
							svg.append("g")
							  .attr("class", "x axis")
							  .attr("transform", "translate(0," + height + ")")
							  .call(xAxis)
							  .attr("stroke-width", "1.5px");					
						}
					} else{					
							svg.append("g")
							  .attr("class", "x axis")
							  .attr("transform", "translate(0," + height + ")")
					}

					  svg.append("g")
						  .attr("class", "y axis")
						  .call(yAxis)
					      .attr("stroke-width", "1.5px")
						.append("text")
						  .attr("transform", "rotate(-90)")
						  .attr("y", label_Y_Distance)
						  .attr("dy", ".71em")
						  .style("text-anchor", "end")
						  .text(labelY);

					  var state = svg.selectAll(".state")
						  .data(data)
						.enter().append("g")
						  .attr("class", "g")
						  .attr("transform", function(d) { return "translate(0," + y(d[xCategory]) + ")"; });

					  state.selectAll("rect")
						  .data(function(d) { return d.ages; })
						.enter().append("rect")
						  .attr("height", y.rangeBand())
						  .attr("x", function(d) { return x(d.y0); })
						  .attr("width", function(d) { return x(d.y1) - x(d.y0); })
						  .style("fill", function(d) { return color(d.name); })
						  .attr("id",function(d) {return d.name})
						  .attr("class", "relative");
						  
					  state.selectAll("rect")
							.on("mouseover", tip.show)
							.on("mouseout", tip.hide);
						  
						  // set legend Container 
				if(show_legend){		  
				 var legend = svg.selectAll(".legend")
						  .data(color.domain().slice().reverse())
						.enter().append("g")
						  .attr("class", "legend")
						  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

					  legend.append("rect")
						  .attr("x", width - 18+legend_width)
						  .attr("width", 18)
						  .attr("height", 18)
						  .style("fill", color);

					  legend.append("text")
						  .attr("x", width - 24+legend_width)
						  .attr("y", 9)
						  .attr("dy", ".35em")
						  .style("text-anchor", "end")
						  .text(function(d) { return d; });
				} else{
					return ;
				}
				
			}

			if (this.data.length) this.generate();
				else AJAX(options.data, this);
		}
		
		return HorizontalStackHistogramChart;
	})();
	
	DD3.ScatterplotWithBubble = (function(){
		function ScatterplotWithBubble(options){

			//getElement(this, DD3.ScatterplotWithBubble, options);
			if (!(this instanceof DD3.ScatterplotWithBubble)) {
				return new DD3.ScatterplotWithBubble(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
		 
			var div = this.el[0];			
			var _this = this;
				
			ScatterplotWithBubble.prototype.data = typeof options.data === "string" ? {} : options.data;
			ScatterplotWithBubble.prototype.generate = function () {
				
				var grid = typeof options.grid === "undefined" ? false : options.grid,
					labelY = typeof options.labelY === "undefined" ? " ": options.labelY,
					main_height = typeof options.height === "undefined" ? 400: options.height,
					textRotate = typeof options.textRotate === "undefined" ? "-65": options.textRotate,
					xCategories = typeof options.xCategory === "undefined" ? "xCategory": options.xCategory;
				var legend_width = typeof options.legend_width === "undefined" ? 120 : options.legend_width;
				var yFormater = typeof options.yFormater === "undefined" ? d3.format(",.2s") : d3.format(options.yFormater);
					
					
					
				var color = typeof options.color==="undefined"? d3.scale.category10() : d3.scale.ordinal().range(options.color);
					
				var mainWidth = typeof options.width === "undefined"? $(div).parent().width() : options.width;
				var margin = {
						top: typeof options.margin_top === "undefined"? 20: options.margin_top,
						right: typeof options.margin_right === "undefined"? 80: options.margin_right,
						bottom: typeof options.margin_bottom === "undefined"? 120: options.margin_bottom,
						left: typeof options.margin_left === "undefined"? 50 : options.margin_left
					},
					width = mainWidth - margin.left - margin.right-legend_width,
					height = main_height - margin.top - margin.bottom;
					
				var x = d3.scale.ordinal().rangeRoundBands([0, width], 1),
					y = d3.scale.linear().range([height, 0]),
					xCircle = d3.scale.ordinal();
					
				var scale = d3.scale.sqrt()
					            .range([4, 20]);

				var opacity = d3.scale.sqrt()
					            .range([1, .3]);
				
				 _this.data.sort(function(a, b){
					if(xCategories == "date"||xCategories == "Date"){
						a = a[xCategories].split("-");
						b = b[xCategories].split("-");
						var ad = new Date(a[2], a[1], a[0]);
						var bd = new Date(b[2], b[1], b[0]);
							return ad - bd;
					}else{
						return a[xCategories] - b[xCategories];
					}					
				});

				


				if(grid){
					var xAxis = d3.svg.axis().scale(x).orient("bottom").innerTickSize(-height).outerTickSize(0).tickPadding(10),
					yAxis = d3.svg.axis().scale(y).orient("left").innerTickSize(-width).outerTickSize(0).tickPadding(10).tickFormat(function(d){ return yFormater(d); });
				} else{
					var xAxis = d3.svg.axis().scale(x).orient("bottom"),
					 yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(function(d){ return yFormater(d); });
				}
				
				color.domain(d3.keys(_this.data[0]).filter(function (key) {
					return (key !== xCategories);
				}));

				var cities = color.domain().map(function (name) {
					return {
						name: name,
						values: _this.data.map(function (d) {
							return {
								key: d[xCategories],
								Value: +d[name],
								color: name
							};
						})
					};
				});
				
				
				
				d3.select(div).select("svg").remove();
				var svg = d3.select(div).append("svg")
					.attr("width", width + margin.left + margin.right+legend_width)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
					
					
				var tip = d3.tip()
					.attr('class', 'd3-tip')
					.offset([-10, 0])
					.html(function (d) {
						
					 return "<center><span>"+d.color+" : "+yFormater(d.Value)+"</span></center>";
					});
				
				svg.call(tip);

				var yMin = d3.min(cities, function (c) {
					return d3.min(c.values, function (v) {
						return (v.Value);
					});
				});
				var yMax = d3.max(cities, function (c) {
					return d3.max(c.values, function (v) {
						return v.Value;
					});
				});


				yMin = yMin < 100000 ? 0 : (yMin-100);
				
				x.domain(_this.data.map(function (d) {
					return d[xCategories];
				}));
				y.domain([yMin, yMax]);
				xCircle.domain(_this.data.map(function (d) {
					return d.name;
				}))
					.rangeRoundBands([0, x.rangeBand()], 0);

				// for radius and opacity of  circle
				scale.domain([
							d3.min(cities, function (c) { return d3.min(c.values, function (v) { return (v.Value); });}),
							d3.max(cities, function (c) { return d3.max(c.values, function (v) { return (v.Value); });})							
							]);
							
				opacity.domain([
							d3.min(cities, function (c) { return d3.min(c.values, function (v) { return (v.Value); });}),
							d3.max(cities, function (c) { return d3.max(c.values, function (v) { return (v.Value); });})							
							]);
							
			if(options.textRotate){
				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis)
					.attr("stroke-width", "1.5px")
					.selectAll("text")
					.style("text-anchor", "end")
					.attr("dx", "-.8em")
					.attr("dy", ".15em")
					.attr("transform", function (d) {
						return "rotate("+textRotate+")"
					});
				} else {
					svg.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + height + ")")
						.call(xAxis)
						.attr("stroke-width", "1.5px")
						.selectAll("text")
						.style("text-anchor", "end");
				}

				svg.append("g")
					.attr("class", "y axis")
					.call(yAxis)
					.attr("stroke-width", "1.5px")
				.append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", 6)
					.attr("dy", ".71em")
					.style("text-anchor", "end")
					.text(labelY);;
		
				var city = svg.selectAll(".dot")
					.data(cities)
					.enter().append("g")
					.attr("class", "dot");
					
					city.append("node")
						.attr("class", "group")
						.attr("d", function (d) {
							return d.values;
						})
					
				city.selectAll("circle")
					.data(function (d) {
						return d.values;
					})
					.enter()
					.append("circle")
					.attr("opacity", function(d){ return opacity(d.Value); })
					.attr("r", function(d){ return scale(d.Value); })
					.attr("cx", function (d) {
						return x(d.key);
					})
					.attr("cy", function (d) {
						return y(d.Value);
					})
					.style("fill", function (d) {
						return color(d.color);
					})
					.style("pointer-events", "all")
					.style("cursor", "poiter")
					.on("mouseover", tip.show)
					.on("mouseout", tip.hide);
					
				var legend = svg.selectAll(".legend")
							.data(color.domain().slice().reverse())
						  .enter().append("g")
							.attr("class", "legend")
							.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

						legend.append("rect")
							.attr("x", width - 18+legend_width)
							.attr("width", 18)
							.attr("height", 18)
							.style("fill", color);

						legend.append("text")
							.attr("x", width - 24+legend_width)
							.attr("y", 9)
							.attr("dy", ".35em")
							.style("text-anchor", "end")
							.text(function(d) { return d; });
				
				}
				if (this.data.length) this.generate();
					else AJAX(options.data, this);
		}
		
		return ScatterplotWithBubble;
			
	})();

	DD3.StaticTopTree = (function(){
		function StaticTopTree(options){

			if (!(this instanceof DD3.StaticTopTree)) {
				return new DD3.StaticTopTree(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
		 
			var div = this.el[0];			
			var _this = this;
				
			StaticTopTree.prototype.data = typeof options.data === "string" ? {} : options.data;
			StaticTopTree.prototype.generate = function () {
				var maxTopWidth = typeof options.width ==="undefined"? $(div).parent().width(): options.width,
					expandTopIx =0,
					maxTopHeight = typeof options.height === "undefined"? 50 : options.height;	
							// container div is  empty...
				$(div).scrollLeft(0);
				var mh = 100;
				var margin = {
								top: typeof options.margin_top === "undefined" ? -30 : options.margin_top,
								right: typeof options.margin_right === "undefined" ? 120 : options.margin_right,
								bottom: typeof options.margin_bottom === "undefined" ? 20 : options.margin_bottom,
								left: typeof options.margin_left === "undefined" ? 120 : options.margin_left
							}, width = $(div).parent().width(),
						height = mh;
				var topdata = _this.data;
					
				var i = 0;

				var tree = d3.layout.tree()
					.size([height, width]);
							// convert tree link expandation in diagonal layout
				var diagonal = d3.svg.diagonal()
						.projection(function(d) {
							return [d.y, d.x];
						});
					
							// select the  container div and append svg static mutiple indexing tree construct..
					d3.select(div).select("svg").remove();
				var svg = d3.select(div).append("svg")
							.attr("width", maxTopHeight)
							.attr("height", maxTopWidth)
							.append("g")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
						
						// compute the index positioning from root...
						
				var tip = d3.tip()
							.attr('class', 'd3-tip')
							.offset([-10, 0])
							.html(function (d) {
								var result = "<span style='color : #fff';>"+d.property+"</span>";
								return result;
							}).style("font-size", "12px");
						
					svg.call(tip);
						
					for (var itime in topdata) {
						root = topdata[itime];
						
						d3.select(div).select("svg")
							.attr("width", maxTopWidth)
							.attr("height", maxTopHeight);
						maxTopWidth += 30;
						maxTopHeight += 30;
						expandTopIx += 1;
						update(root, itime);
					}
						// update all the info.. of static constructed tree on mouseover and out...
			function update(source, ix) {
				// Compute the new tree layout.
				var nodes = tree.nodes(root).reverse(),
					links = tree.links(nodes);

				// Normalize for fixed-depth.
				nodes.forEach(function(d) {
					d.y = d.depth * 180;
				});

				// Normalize for fixed-depth.
				nodes.forEach(function(d) {
					d.x = d.x + 20 * ix;
					 // console.log(d.x + "," + d.y);
				});

				// Declare the nodes
				var node = svg.selectAll("g.node")
					.data(nodes, function(d) {
						return d.id || (d.id = ++i);
					});
					
				// Enter the nodes.
				var nodeEnter = node.enter().append("g")
					.attr("class", "node")
					.attr("transform", function(d) {
						return "translate(" + d.y + "," + d.x + ")";
					})
					.on("mouseover", tip.show)
					.on("mouseout", tip.hide);
					
					// inside node append circle..
					nodeEnter.append("circle")
						.attr("r", 5)
						.style("fill", "#fff");
						
					// inside node and append text
					
					nodeEnter.append("text")
						.attr("x", function(d) {
							return d.children || d._children ? -13 : 13;
						})
						.attr("dy", ".35")
						.attr("text-anchor", function(d) {
							return d.children || d._children ? "end" : "start";
						})
						.text(function(d) {
							return d.name;
						})
		//                .call(wrap, 120)
						.style("fill-opacity", 1);
					
					
					nodeEnter.selectAll("circle")
						.append("svg:title")
						.text(function(d) {
							return d.property
						})
					
					// Declare the links
				var link = svg.selectAll("path.link")
					.data(links, function(d) {
						return d.target.id;
					});
				
					// Enter the links.
					link.enter().insert("path", "g")
						.attr("class", "link")
						.attr("d", diagonal);
				
				function wrap(text, width) {
						
					  text.each(function() {
						var text = d3.select(this),
							words = text.text().split(/\s+/).reverse(),
							word,
							line = [],
							lineNumber = 0,
							lineHeight = 1.1, // ems
							y = text.attr("y"),
							dy = parseFloat(text.attr("dy")),
							tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
					
						while (word = words.pop()) {
						  line.push(word);
						  tspan.text(line.join(" "));
						  if (tspan.node().getComputedTextLength() > width) {
							line.pop();
							tspan.text(line.join(" "));
							line = [word];
							tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
						  }
						}
					  });
				}	
			
			}

			}
			if (this.data.length) this.generate();
					else AJAX(options.data, this);
		}
		
		return StaticTopTree;
			
	})();
	
	DD3.Horizontal_Grouped_Histogram = (function() {
	
		function Horizontal_Grouped_Histogram(options){

			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.Horizontal_Grouped_Histogram)) {
				return new DD3.Horizontal_Grouped_Histogram(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
				Horizontal_Grouped_Histogram.prototype.data = typeof options.data === "string" ? {} : options.data;
				Horizontal_Grouped_Histogram.prototype.generate = function () {
				
				
				    //var data=_this.data;
				    				
					//var colors = options.color;
					//var Y_AXIS_LABEL = options.yAxisLabel;
					//var grid = options.grid;
					/*var grid = options.grid !== undefined ? options.grid : false,					
					barHeight = options.height !== undefined ? options.height : 20,
					Y_AXIS_LABEL = options.yAxisLabel !== undefined ? options.yAxisLabel : " ",	
                    chartWidth  = options.width !== undefined ? options.width : 120, 
                   gapBetweenGroups  = options.gapBetweenGroups !== undefined ? options.gapBetweenGroups : 10, 
                   spaceForLabels  = options.spaceForLabels !== undefined ? options.spaceForLabels : 120, 
                   spaceForLabels  = options.spaceForLabels !== undefined ? options.spaceForLabels : 120,				   
				   
					textRotate = options.rotateX !== undefined ? options.rotateX : "-65",
					rotation = options.rotation !== undefined ? options.rotation : true,
					xCategories = options.xCategory !== undefined ? options.xCategory : "xCategory";
					var color = options.color !== undefined ? d3.scale.ordinal().range(options.color) : d3.scale.category10();*/
					var barHeight = typeof options.height === "undefined" ? 20 : options.height,
                    chartWidth  = typeof options.width === "undefined" ? 120 : options.width, 
                   gapBetweenGroups  = typeof options.gapBetweenGroups === "undefined" ? 10 : options.gapBetweenGroups, 
                   spaceForLabels  = typeof options.spaceForLabels === "undefined" ? 120 : options.spaceForLabels, 
				   Y_AXIS_LABEL = typeof options.yAxisLabel === "undefined" ? "yAxisLabel" : options.yAxisLabel,	
				   xCategories = typeof options.xCategory === "undefined" ? "xCategory" : options.xCategory,
				   mainLabel = typeof options.mainLabel === "undefined" ? "mainLabel": options.mainLabel,
				   mainSeries = typeof options.mainSeries === "undefined" ? "mainSeries" : options.mainSeries,
				   
                   spaceForLegend   = typeof options.spaceForLegend  === "undefined" ? 650 : options.spaceForLegend;	
					
					
					
				    var data=_this.data;
				    console.log(mainSeries);
					var //chartWidth       = 120,
						//barHeight        = 20,
						groupHeight      = barHeight * data[0][mainSeries].length;//60
						//gapBetweenGroups = 10,
						//spaceForLabels   = 120,
						//spaceForLegend   = 650;
					 console.log(barHeight * data[0][mainSeries].length);
					// Zip the series data together (first values, second values, etc.)
					var zippedData = [];
					for (var i=0; i<data[0][Y_AXIS_LABEL].length; i++) {
					  for (var j=0; j<data[0][mainSeries].length; j++) {
						zippedData.push(data[0][mainSeries][j][xCategories][i]);
					  }
					}
					

					// Color scale
					var color = d3.scale.category20();
					var chartHeight = barHeight * zippedData.length + gapBetweenGroups * data[0][Y_AXIS_LABEL].length; //420
					console.log(zippedData);

					var x = d3.scale.linear()
						.domain([0, d3.max(zippedData)])  //73
						.range([0, chartWidth]);

					var y = d3.scale.linear()
						.range([chartHeight , 0]);

					var yAxis = d3.svg.axis()
						.scale(y)
						.tickFormat('')
						.tickSize(0)
						.orient("left");

					// Specify the chart area and dimensions
					/*d3.select(div).select("svg").remove();
					var svg = d3.select(div)
                        .append('svg')
                        .attr('class', 'stackchart')
						.attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.top + margin.bottom)
					  .append("g")*/
					
					
					var chart = d3.select(div)
					    .append("svg")
						.attr("width", spaceForLabels + chartWidth + spaceForLegend)
						.attr("height", chartHeight);

					// Create bars
					var bar = chart.selectAll("g")
						.data(zippedData)
						.enter().append("g")
						.attr("transform", function(d, i) {
						console.log(data[0][mainSeries].length);
						  return "translate(" + spaceForLabels + "," + (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i/data[0][mainSeries].length))) + ")";
						});

					// Create rectangles of the correct width
					bar.append("rect")
					    .style('fill', function (d, i) { return color(i % data[0][mainSeries].length); })
						
						
						//.attr("fill", function(d,i) { return color(i % data[0].series.length); })
						.attr("class", "bar")
						.attr("width", x)
						.attr("height", barHeight - 1);

					// Add text label in bar
					bar.append("text")
						.attr("x", function(d) { return x(d) - 2; })
						.attr("y", barHeight / 2)
						.attr("fill", "black")
						.attr("dy", ".35em")
						.text(function(d) { return d; });

					// Draw labels
					bar.append("text")
						.attr("class", "label")
						.attr("x", function(d) { return -80; })
						.attr("y", groupHeight/2)
						.attr("dy", ".35em")
						.text(function(d,i) {
						  if (i % data[0][mainSeries].length === 0)
							return data[0][Y_AXIS_LABEL][Math.floor(i/data[0][mainSeries].length)];
						  else
							return ""});

					chart.append("g")
						  .attr("class", "y axis")
						  .attr("transform", "translate(" + spaceForLabels + ", " + -gapBetweenGroups/2 + ")")
						  .call(yAxis);

					// Draw legend
					var legendRectSize = 20,
						legendSpacing  = 5;

					var legend = chart.selectAll('.legend')
						.data(data[0][mainSeries])
						.enter()
						.append('g')
						.attr('transform', function (d, i) {
							var height = legendRectSize + legendSpacing;
							var offset = -gapBetweenGroups/2;
							var horz = spaceForLegend;
							var vert = i * height - offset;
							return 'translate(' +spaceForLegend+',' + vert + ')';
						});

					legend.append('rect')
						.attr('width', legendRectSize)
						.attr('height', legendRectSize)
						.style('fill', function (d, i) { return color(i); })
						.style('stroke', function (d, i) { return color(i); });

					legend.append('text')
						.attr('class', 'legend')
						.attr('x', legendRectSize + legendSpacing)
						.attr('y', legendRectSize - legendSpacing)
						.text(function (d) { return d[mainLabel]; });


					
				}
					if (this.data.length) this.generate();
					else AJAX(options.data, this);
		}
		
		return Horizontal_Grouped_Histogram;
	})();
	
	DD3.BulletChart = (function(){
		function BulletChart(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.BulletChart)) {
				return new DD3.BulletChart(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
			BulletChart.prototype.data = typeof options.data === "string" ? {} : options.data;
			BulletChart.prototype.generate = function () {
				
				var margin = {
								top: typeof options.margin_top ==="undefined" ? 5 : options.margin_top,
								right: typeof options.margin_right ==="undefined" ? 40 : options.margin_right,
								bottom: typeof options.margin_bottom ==="undefined" ? 20 : options.margin_bottom,
								left: typeof options.margin_left ==="undefined" ? 120 : options.margin_left
							},
					title_label = typeof options.title === "undefined" ? "title": options.title,
					subtitle = typeof options.subtitle === "undefined" ? "subtitle": options.subtitle,
					main_width = typeof options.width ==="undefined" ? $(div).parent().width() : options.width,
					main_height = typeof options.height ==="undefined" ? 50 : options.height,
					width = main_width - margin.left - margin.right,
					height = main_height - margin.top - margin.bottom;
					
					
				var measureLabels = typeof options.measureLabels === "undefined" ? ["measure"] : options.measureLabels;
				var markerLabels = typeof options.markerLabels === "undefined" ? ["forecast"] : options.markerLabels;
				
				var data = _this.data;
				
				var chart = d3.bullet()
					.width(width)
					.height(height)
					.measureLabels(measureLabels)
					.markerLabels(markerLabels);
				
				 // if (error) throw error;
							d3.select(div).selectAll(svg).remove();
				  var svg = d3.select(div).selectAll("svg")
					  .data(data)
					.enter().append("svg")
					  .attr("class", "bullet")
					  .attr("width", width + margin.left + margin.right)
					  .attr("height", height + margin.top + margin.bottom)
					.append("g")
					  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
					  .call(chart);

				  var title = svg.append("g")
					  .style("text-anchor", "end")
					  .attr("transform", "translate(-6," + height / 2 + ")");

				  title.append("text")
					  .attr("class", "title")
					  .text(function(d) { return d[title_label]; });

			    if(options.subtitle){
				  title.append("text")
					  .attr("class", "subtitle")
					  .attr("dy", "1em")
					  .text(function(d) { return d[subtitle]; });
				} else{
					return ;
				}
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
			return BulletChart
	})();
	
	// DD3 CrossTab Construct ...
	DD3.CrossTab = (function(){
		function CrossTab(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.CrossTab)) {
				return new DD3.CrossTab(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
			CrossTab.prototype.data = typeof options.data === "string" ? {} : options.data;
			CrossTab.prototype.generate = function () {
				var columns = typeof options.columns === "undefined" ? ["Name", "Father Name", "Roll-No."] : options.columns;
				var keys = typeof options.keys === "undefined" ? ["name", "father_name", "roll-no."] : options.keys;
				var valueFormatter = typeof options.valueFormatter === "undefined" ? d3.format(",") : d3.format(options.valueFormatter);
				var data = _this.data;
					
					$(div).empty();
				var table = d3.select(div).append("table").attr("class", "table table-bordered").style("border", 3),
						thead = table.append("thead"),
						tbody = table.append("tbody").style("text-align", "center");
						
					thead.append("tr")
						.selectAll("th")
						.data(columns)
						.enter()
						.append("th").attr("class", "bg-success").style("text-align", "center")
						.text(function(column){ return column; });
						
					var rows = tbody.selectAll("tr")
								.data(data)
								.enter()
								.append("tr");
								
					var cells = rows.selectAll("td")
								.data(function(row){ 
									return keys.map(function(column){
											return { column: column, value: row[column] };
									});
								})
								.enter()
								.append("td")
								.text(function(d){ 
									//var value = d.value;
								//return d.value;
									if(typeof d.value === "string"){
										return d.value;
									}else{
										return valueFormatter(d.value);
									}
								
								});
						
				return table;
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
			return CrossTab;
	})();
	
	DD3.BoxPlot = (function(){
		function BoxPlot(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.BoxPlot)) {
				return new DD3.BoxPlot(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
			BoxPlot.prototype.data = typeof options.data === "string" ? {} : options.data;
			BoxPlot.prototype.generate = function(){
				var height = typeof options.height ==="undefined" ? 400 : options.height;
				//var width = typeof options.width === "undefined" ? $(div).parent().width() : options.width;
				var xkey = typeof options.xkey === "undefined" ? "label" : options.xkey;
				var	ykey = typeof options.ykey === "undefined" ? "Q3" : options.ykey;
				var max_boxWidth = typeof options.max_boxWidth === "undefined" ? 75 : parseInt(options.max_boxWidth);
				var yMax = typeof options.yMax === "undefined" ? 500 : options.yMax;
				var staggerLabel = typeof options.staggerLabel === "undefined" ? true : options.staggerLabel;
			var data = _this.data;
			
				nv.addGraph(function() {
				  var chart = nv.models.boxPlotChart()
					  .x(function(d) { return d[xkey] })
					  .y(function(d) { return d.values[ykey] })
					  .staggerLabels(staggerLabel)
					  .maxBoxWidth(max_boxWidth) // prevent boxes from being incredibly wide 
					  .yDomain([0, yMax]);
				  
				  d3.select(div).append("svg")
					  .attr("height", height)
					  .datum(data)
					  .call(chart);

				  nv.utils.windowResize(chart.update);

				  return chart;
				});
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return BoxPlot;
	})();
	
	DD3.ParallelCoordinates = (function(){
		function ParallelCoordinates(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.ParallelCoordinates)) {
				return new DD3.ParallelCoordinates(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
			ParallelCoordinates.prototype.data = typeof options.data === "string" ? {} : options.data;
			ParallelCoordinates.prototype.generate = function(){
				var height = typeof options.height === "undefined" ? 400 : options.height;
				var colors = typeof options.color === "unddefined" ? d3.scale.category20c().range() : options.color;
				var dimensionName = typeof options.dimensionName === "undefined" ? [] : options.dimensionName;
				var dimensionFormat = typeof options.dimensionFormat === "undefined" ? [] : options.dimensionFormat;
				var data = _this.data;
				
				var chart;
					nv.addGraph(function() {

						chart = nv.models.parallelCoordinates()	
							.color(colors)
							.dimensionNames(dimensionName)		//["economy (mpg)", "cylinders", "displacement (cc)", "power (hp)", "weight (lb)", "0-60 mph (s)", "year"]
							.dimensionFormats(dimensionFormat)  //["0.5f", "e", "g", "d", "", "%", "p"]
							.lineTension(0.85);

						d3.select(div).append("svg")
								.attr("height", height)
								.datum(data)
								.call(chart);

						nv.utils.windowResize(chart.update);

						return chart;
					});
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return ParallelCoordinates;
	})();
	
	DD3.CandlestickChart = (function(){
		function CandlestickChart(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.CandlestickChart)) {
				return new DD3.CandlestickChart(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
			CandlestickChart.prototype.data = typeof options.data === "string" ? {} : options.data;
			CandlestickChart.prototype.generate = function(){
				 var height = typeof options.height === "undefined" ? 400 : options.height;
				// var colors = typeof options.color === "undefined" ? d3.scale.category20c().range() : options.color;
				// var dimensionName = typeof dimensionName === "undefined" ? [] : options.dimensionName;
				// var dimensionFormat = typeof dimensionFormat === "undefined" ? [] : options.dimensionFormat;
				var data = [];
				var myobj= {};
				myobj.values = _this.data;
				data.push(myobj);
				
				var chart;
					nv.addGraph(function() {
				        var chart = nv.models.candlestickBarChart()
				            .x(function(d) { return d['date'] })
				            .y(function(d) { return d['close'] })
				            .duration(250)
				            .margin({left: 75, bottom: 50})	;

				        // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
				        chart.xAxis
				                .axisLabel("Dates")
				                .tickFormat(function(d) {
				                    // I didn't feel like changing all the above date values
				                    // so I hack it to make each value fall on a different date
				                    return d3.time.format('%x')(new Date(new Date()-5656000384783));
				                });
							
				        chart.yAxis
				                .axisLabel('Stock Price')
				                .tickFormat(function(d,i){ return '$' + d3.format(',.1f')(d); });


				        d3.select(div).append("svg")
				        		.attr("height", height)
				                .datum(data)
				                .transition().duration(500)
				                .call(chart);

				        nv.utils.windowResize(chart.update);
				        return chart;
				    });
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return CandlestickChart;
	})();
	
	DD3.ComulativeLineChart = (function(){
		function ComulativeLineChart(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.ComulativeLineChart)) {
				return new DD3.ComulativeLineChart(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
			ComulativeLineChart.prototype.data = typeof options.data === "string" ? {} : options.data;
			ComulativeLineChart.prototype.generate = function(){
				 var height = typeof options.height === "undefined" ? 400 : options.height;
				 var colors = typeof options.color === "undefined" ? d3.scale.category20c().range() : options.color;
				 var IntractiveLine = typeof options.intractiveTip === "undefined" ? true : options.intractiveTip;
				// var dimensionName = typeof dimensionName === "undefined" ? [] : options.dimensionName;
				// var dimensionFormat = typeof dimensionFormat === "undefined" ? [] : options.dimensionFormat;
				var data = _this.data;
				nv.addGraph(function() {
					var chart = nv.models.cumulativeLineChart()
						.useInteractiveGuideline(IntractiveLine)
						.x(function(d) { return d[0] })
						.y(function(d) { return d[1]/100 })
						.color(colors)
						.average(function(d) { return d.mean/100; })
						.duration(300)
						.clipVoronoi(false);
						
					chart.dispatch.on('renderEnd', function() {
						console.log('render complete: cumulative line with guide line');
					});

					chart.xAxis.tickFormat(function(d) {
						return d3.time.format('%m/%d/%y')(new Date(d))
					});

					chart.yAxis.tickFormat(d3.format(',.1%'));

					d3.select(div).append("svg")
						.attr("height", height)
						.datum(data)
						.call(chart);

					//TODO: Figure out a good way to do this automatically
					nv.utils.windowResize(chart.update);

					chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });
					chart.state.dispatch.on('change', function(state){
						nv.log('state', JSON.stringify(state));
					});

					return chart;
				});
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return ComulativeLineChart;
	})();
	
	DD3.HistoricalBarchart = (function(){
		function HistoricalBarchart(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.HistoricalBarchart)) {
				return new DD3.HistoricalBarchart(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
			HistoricalBarchart.prototype.data = typeof options.data === "string" ? {} : options.data;
			HistoricalBarchart.prototype.generate = function(){
				 var height = typeof options.height === "undefined" ? 400 : options.height;
				// var colors = typeof options.color === "unddefined" ? d3.scale.category20c().range() : options.color;
				var key = typeof options.group === "undefined" ? [] : options.group;
				var colors = typeof options.colors === "undefined" ? d3.scale.category10().range() : options.colors;
				var xkey = typeof options.xkey === "undefined" ? "" : options.xkey;
				var ykey = typeof options.ykey === "undefined" ? "" : options.ykey;
				var interactiveTip = typeof options.interactiveTip === "undefined" ? true : options.interactiveTip;
				var data = _this.data;
				
				for(var i=0;i<data.length;i++)
				{
					data[i].color = colors[i];
					data[i].key = key[i];
				}
				var chart;
			    nv.addGraph(function() {
			        chart = nv.models.historicalBarChart();
			        chart
			            .margin({left: 100, bottom: 100})
			            .useInteractiveGuideline(interactiveTip)
			            .duration(250)
			            ;

			        // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
			        chart.xAxis
			            .axisLabel(xkey)
			            .tickFormat(d3.format(',.1f'));

			        chart.yAxis
			            .axisLabel(ykey)
			            .tickFormat(d3.format(',.2f'));

			        chart.showXAxis(true);
					
			        d3.select(div).append("svg")
			        		.attr("height", height)
			                .datum(data)
			                .transition()
			                .call(chart);

			        nv.utils.windowResize(chart.update);
			        chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });
			        return chart;
			    });
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return HistoricalBarchart;
	})();
	
	DD3.LineWithArea = (function(){
		function LineWithArea(options){
		
			if (!(this instanceof DD3.LineWithArea)) {
				return new DD3.LineWithArea(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
			LineWithArea.prototype.data = typeof options.data === "string" ? {} : options.data;
			LineWithArea.prototype.generate = function(){
				var height = typeof options.height === "undefined" ? 400 : options.height;
			    var colors = typeof options.color === "undefined" ? d3.scale.category10().range() : options.color;
				var labelX = typeof options.labelX === "undefined" ? "Label X" : options.labelX;
				var labelY = typeof options.labelY === "undefined" ? "Label X" : options.labelY;
				var yFormater = typeof options.yFormater === "undefined" ? d3.format(',.2f') : d3.format(options.yFormater);
				var xFormater = typeof options.xFormater === "undefined" ? d3.format(',.1f') : d3.format(options.xFormater);
				var interactiveTip = typeof options.interactiveTip === "undefined" ? true : options.interactiveTip;
				var area = typeof options.area === "undefined" ? [] : options.area;
				var keys = typeof options.group === "undefined" ? "" : options.group;
				var dashed = typeof options.dashed === "undefined" ? [] : options.dashed;
				var areaOpacity = typeof options.areaOpacity === "undefined" ? 0.1 : options.areaOpacity;
				var dateTime = typeof options.dateTime === "undefined" ? false : options.dateTime;
				var areaStrokeWidth = typeof options.strokeWidth === "undefined" ? 1.5 : options.strokeWidth;
				var chart;
				var data = _this.data;
				
				for(var i=0;i<data.length; i++)
				{
					
					data[i].key = keys[i];
					if(area[i]=== 1){
						data[i].area =  true 
						data[i].fillOpacity = areaOpacity;
						data[i].strokeWidth = areaStrokeWidth;
					}
					if(dashed[i]=== 1){
					data[i].classed = "dashed";		
					}
					
				}
				
				/*
				// data.sort(function(a, b){
						// return a[xKey] - b[xKey];
				 // });
				 
				// var keyset = d3.keys(data[0]).filter(function (key) {
					// return key !== xKey;
				// });
				// console.log(keyset);
				
				// var areaKey, dashedKey;
				// var cities = keyset.map(function (name) {
					
					// return {
						// key: name,
						// values: data.map(function (d) {
							// return {
								// x: d[xKey],
								// y: +d[name] 
							// };
						// }),
					// };
				// });
				*/
				nv.addGraph(function() {
					chart = nv.models.lineChart()
						.color(colors)			//d3.scale.category10().range()
						.options({
							transitionDuration: 300,
							useInteractiveGuideline: interactiveTip
						});

					// chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
				
					chart.xAxis
						.axisLabel(labelX)
						.tickFormat(function(d){ 
								if (dateTime) {
									return d3.time.format('%x')(new Date(d)) ;
								} 
								return xFormater(d); })
						.staggerLabels(true)
					;
				// if(xKey =="data" || xKey == "Date"){  
										// return d3.time.format('%x')(new Date(d));
									// } else { 
					chart.yAxis
						.axisLabel(labelY)
						.tickFormat(function(d) {
							if (d == null) {
								return 'N/A';
							}
							return 	yFormater(d);				//d3.format(',.2f')(d);
						})
					;

					//data = sinAndCos();
					
					
					d3.select(div).append('svg')
						.attr("height", height)
						.datum(data)
						.call(chart);

					nv.utils.windowResize(chart.update);

					return chart;
				});
				
				
			   
			
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return LineWithArea;
	})();
	
	DD3.MultiBarChart2 = (function(){
		function MultiBarChart2(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.MultiBarChart2)) {
				return new DD3.MultiBarChart2(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];
			var _this = this;
				
			MultiBarChart2.prototype.data = typeof options.data === "string" ? {} : options.data;
			MultiBarChart2.prototype.generate = function(){
				var height = typeof options.height === "undefined" ? 400 : options.height;				
				var colors = typeof options.color === "unddefined" ? d3.scale.category20c().range() : options.color;
				var keys = typeof options.group === "undefined" ? [] : options.group;
				var stackable = typeof options.stackable === "undefined" ? [] : options.stackable;
				// var xkey = typeof options.xkey === "undefined" ? "" : options.xkey;
				var data = _this.data;
				for(var i=0;i<data.length;i++)
				{
					data[i].key = keys[i];
					data[i].nonStackable = !stackable[i];
				}
				
				var chart;
				nv.addGraph(function() {
			            chart = nv.models.multiBarChart()
							.color(colors)
			                //.width(width)
			                .height(height)
			                .stacked(true)
			                ;

			            chart.dispatch.on('renderEnd', function(){
			                console.log('Render Complete');
			            });
						
			            var svg = d3.select(div).append("svg")
			            	//.attr('width', width)
		                    .attr('height', height)
		                    .datum(data)
		                    .transition().duration(0)
			            	.call(chart);
			            console.log('calling chart');
			            //svg.transition().duration(0).call(chart);

			            return chart;
			        
			    });
			    
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return MultiBarChart2;
	})();
	
	DD3.LinePlusBarChart = (function(){
		function LinePlusBarChart(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.LinePlusBarChart)) {
				return new DD3.LinePlusBarChart(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
			LinePlusBarChart.prototype.data = typeof options.data === "string" ? {} : options.data;
			LinePlusBarChart.prototype.generate = function(){
				var height = typeof options.height === "undefined" ? 400 : options.height;
				// var colors = typeof options.color === "unddefined" ? d3.scale.category20c().range() : options.color;
				var keys = typeof options.group === "undefined" ? [] : options.group;
				var bar = typeof options.bar === "undefined" ? 1 : options.bar;
				// var xkey = typeof options.xkey === "undefined" ? "" : options.xkey;
				
				var data = _this.data;
				
				for(var i=0;i<data.length;i++)
				{
					if(bar == (i+1))
					{
						data[i].bar = true;
					}
					data[i].key = keys[i];
				}
				var chart;
			    nv.addGraph(function() {
			        chart = nv.models.linePlusBarChart()
			            .margin({top: 50, right: 60, bottom: 30, left: 70})
			            .legendRightAxisHint(' [Using Right Axis]')
			            .color(d3.scale.category10().range());
			        //chart.brushExtent([min,max]);
			        chart.xAxis.tickFormat(function(d) {
			                return d3.time.format('%x')(new Date(d))
			            })
			            .showMaxMin(false);

			        chart.y1Axis.tickFormat(function(d) { return '$' + d3.format(',f')(d) });
			        chart.bars.forceY([0]).padData(false);

			        chart.x2Axis.tickFormat(function(d) {
			            return d3.time.format('%x')(new Date(d))
			        }).showMaxMin(false);
			        d3.select(div).append("svg")
			        	.attr("height", height)
			            .datum(data)
			            .transition().duration(500).call(chart);

			        nv.utils.windowResize(chart.update);

			        chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

			        return chart;
			    });
			    
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return LinePlusBarChart;
	})();

	
	DD3.AreaWithFocusChart = (function(){
		function AreaWithFocusChart(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.AreaWithFocusChart)) {
				return new DD3.AreaWithFocusChart(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
			AreaWithFocusChart.prototype.data = typeof options.data === "string" ? {} : options.data;
			AreaWithFocusChart.prototype.generate = function(){
				 var height = typeof options.height === "undefined" ? 400 : options.height;
				// var colors = typeof options.color === "unddefined" ? d3.scale.category20c().range() : options.color;
				var areaKey = typeof options.areaKey === "undefined" ? [] : options.areaKey;
				var xLabel = typeof options.xLabel === "undefined" ? "" : options.xLabel;
				var xFormatter = typeof options.xFormatter === "undefined" ? ",f" : options.xFormatter;
				var yFormatter = typeof options.yFormatter === "undefined" ? ",.2f" : options.yFormatter;
				
				
				var min = typeof options.min === "undefined" ? 0 : options.min;
				var max = typeof options.max === "undefined" ? 10 : options.max;
				 var data = _this.data;
				for(var i=0;i<data.length;i++)
				{
					data[i].area = AreaMatch(data[i].key, areaKey);	
				}
				function AreaMatch(key, area){
					var area_key;
					area.forEach(function(d){
						if(key === d){
							area_key = key;
						}
					});
					var trim_key = $.trim(key);
					if(area_key === trim_key){
						return true;
					} else {
						return false;
					}
				}
				
				var chart;
			    nv.addGraph(function() {
			        var chart = nv.models.lineWithFocusChart();

					if(typeof options.color){
						chart.color(options.color);
					}
					
					if(options.onLoadFocus){
						chart.brushExtent([min,max]);
					}
					
			        //chart.brushExtent([min,max]);

			        chart.xAxis.tickFormat(d3.format(xFormatter)).axisLabel(xLabel);
			        chart.x2Axis.tickFormat(d3.format(xFormatter));
			        chart.yAxis.tickFormat(d3.format(yFormatter));
			        chart.y2Axis.tickFormat(d3.format(yFormatter));
			        chart.useInteractiveGuideline(true);
					
			        d3.select(div).append("svg")
			        	.attr("height", height)
			            .datum(data)
			            .call(chart);

			        nv.utils.windowResize(chart.update);

			        return chart;
			    });
			    
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return AreaWithFocusChart;
	})();

	DD3.MultiBarChart = (function(){
		function MultiBarChart(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.MultiBarChart)) {
				return new DD3.MultiBarChart(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];
			var _this = this;
				
			MultiBarChart.prototype.data = typeof options.data === "string" ? {} : options.data;
			MultiBarChart.prototype.generate = function(){
				var height = typeof options.height === "undefined" ? 400 : options.height;
				var keys = typeof options.group === "undefined" ? [] : options.group;
				var labelX = typeof options.labelX === "undefined" ? "" : options.labelX;
				var labelY = typeof options.labelY === "undefined" ? "" : options.labelY;
				var colors = typeof options.color === "undefined" ? d3.scale.category20().range() : options.color;
				var rotateLabelX = typeof options.rotateLabelX === "undefined" ? 45 : options.rotateLabelX;
				var data = _this.data;
				for(var i=0;i<data.length;i++)
				{
					data[i].key = keys[i];
				}
				
				var chart;
				nv.addGraph(function() {
			        chart = nv.models.multiBarChart()
			            .barColor(colors)
			            .duration(300)
			            .margin({bottom: 100, left: 70})
			            .rotateLabels(rotateLabelX)
			            .groupSpacing(0.1)
			            .errorBarColor(function() { return 'red'; })
			        ;

			        chart.reduceXTicks(false).staggerLabels(true);

			        chart.xAxis
			            .axisLabel(labelX)
			            .axisLabelDistance(35)
			            .showMaxMin(false)
			            .tickFormat(d3.format(',.6f'))
			        ;

			        chart.yAxis
			            .axisLabel(labelY)
			            .axisLabelDistance(-5)
			            .tickFormat(d3.format(',.01f'))
			        ;

			        chart.dispatch.on('renderEnd', function(){
			            nv.log('Render Complete');
			        });
			        
			        d3.select(div).append("svg")
			        	.attr('height', height)
			            .datum(data)
			            .call(chart);

			        return chart;
			    });
			    
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return MultiBarChart;
	})();

	DD3.MultiBarHorizontalChart = (function(){
		function MultiBarHorizontalChart(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.MultiBarHorizontalChart)) {
				return new DD3.MultiBarHorizontalChart(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];
			var _this = this;
				
			MultiBarHorizontalChart.prototype.data = typeof options.data === "string" ? {} : options.data;
			MultiBarHorizontalChart.prototype.generate = function(){
				var height = typeof options.height === "undefined" ? 400 : options.height;
				var keys = typeof options.group === "undefined" ? [] : options.group;
				var labelX = typeof options.labelX === "undefined" ? "" : options.labelX;
				var labelY = typeof options.labelY === "undefined" ? "" : options.labelY;
				var colors = typeof options.color === "undefined" ? d3.scale.category20().range() : options.color;
				//var rotateLabelX = typeof options.rotateLabelX === "undefined" ? 45 : options.rotateLabelX;
				
				var data = _this.data;
				for(var i=0;i<data.length;i++)
				{
					data[i].key = keys[i];
				}
				
				var chart;
				nv.addGraph(function() {
			        chart = nv.models.multiBarHorizontalChart()
			            .barColor(colors)
			            .duration(250)
			            .margin({left: 100})
			            .stacked(true)
			            .errorBarColor(function() { return 'red'; });

			        chart.yAxis.tickFormat(d3.format(',.2f'));

			        chart.yAxis.axisLabel(labelY);
			        chart.xAxis.axisLabel(labelX).axisLabelDistance(20);

			        d3.select(div).append("svg")
			        	.attr('height', height)
			            .datum(data)
			            .call(chart);

			        
			        return chart;
			    });
			    
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return MultiBarHorizontalChart;
	})();

	DD3.OhlcChart = (function(){
		function OhlcChart(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.OhlcChart)) {
				return new DD3.OhlcChart(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];
			var _this = this;
				
			OhlcChart.prototype.data = typeof options.data === "string" ? {} : options.data;
			OhlcChart.prototype.generate = function(){
				var height = typeof options.height === "undefined" ? 400 : options.height;
				var keys = typeof options.group === "undefined" ? [] : options.group;
				var labelX = typeof options.labelX === "undefined" ? "" : options.labelX;
				var labelY = typeof options.labelY === "undefined" ? "" : options.labelY;
				var colors = typeof options.color === "undefined" ? d3.scale.category20().range() : options.color;
				
				var data = _this.data;
				// for(var i=0;i<data.length;i++)
				// {
				// 	data[i].key = keys[i];
				// }
				
				var chart;
				nv.addGraph(function() {
			        var chart = nv.models.ohlcBarChart()
			            .x(function(d) { return d['date'] })
			            .y(function(d) { return d['close'] })
			            .duration(250)
			            .margin({left: 75, bottom: 50});
					 chart.xAxis
			                .axisLabel(labelX)
			                .tickFormat(function(d) {
			                    return d3.time.format('%x')(new Date(new Date()-(d*(Math.random()*100000))));
			                });

			        chart.yAxis
			                .axisLabel(labelY)
			                .tickFormat(function(d,i){ return '$' + d3.format(',.1f')(d); });



			        d3.select(div).append("svg")
			        	.attr('height', height)
			            .datum(data)
		                .transition().duration(500)
		                .call(chart);

			        nv.utils.windowResize(chart.update);
			        return chart;
			    });
			    
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return OhlcChart;
	})();

	DD3.MultiChart = (function(){
		function MultiChart(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.MultiChart)) {
				return new DD3.MultiChart(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];
			var _this = this;
				
			MultiChart.prototype.data = typeof options.data === "string" ? {} : options.data;
			MultiChart.prototype.generate = function(){
				var height = typeof options.height === "undefined" ? 400 : options.height;
				var keys = typeof options.group === "undefined" ? [] : options.group;
				var types = typeof options.type === "undefined" ? "" : options.type;
				var yAxis = typeof options.yAxis === "undefined" ? "" : options.yAxis;
				var colors = typeof options.color === "undefined" ? d3.scale.category10().range() : options.color;
				var xformater = typeof options.xformater === "undefined" ? d3.format(",f") : d3.format(options.xformater);
				var yformater1 = typeof options.yformater1 === "undefined" ? d3.format(",.1f") : d3.format(options.yformater1);
				var yformater2 = typeof options.yformater2 === "undefined" ? d3.format(",.1f") : d3.format(options.yformater2);
				var margin_top = typeof options.margin_top === "undefined"? 30: options.margin_top,
					margin_right = typeof options.margin_right === "undefined"? 60: options.margin_right,
					margin_bottom =  typeof options.margin_bottom === "undefined"? 50: options.margin_bottom,
					margin_left = typeof options.margin_left === "undefined"? 70 : options.margin_left;
	
				var data = _this.data;
				for(var i=0;i<data.length;i++)
				{
					data[i].key = keys[i];
					data[i].type = types[i];
					data[i].yAxis = yAxis[i];
				}
				
				var chart;
				nv.addGraph(function() {
			        var chart = nv.models.multiChart()
			            .margin({top: margin_top, right: margin_right, bottom: margin_bottom, left: margin_left})
			            .color(colors);

			        chart.xAxis.tickFormat(function(d){ return xformater(d); });
			        chart.yAxis1.tickFormat(function(d){ return yformater1(d); });
			        chart.yAxis2.tickFormat(function(d){ return yformater2(d); });
					//chart.useInteractiveGuideline(true);
					
			        d3.select(div).append("svg")
			        	.attr('height', height)
			            .datum(data)
			            .transition().duration(500).call(chart);
						
					nv.utils.windowResize(chart.update);
			        return chart;
			    });
			    
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return MultiChart;
	})();

	DD3.ScatterPlusLine = (function(){
		function ScatterPlusLine(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.ScatterPlusLine)) {
				return new DD3.ScatterPlusLine(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];
			var _this = this;
				
			ScatterPlusLine.prototype.data = typeof options.data === "string" ? {} : options.data;
			ScatterPlusLine.prototype.generate = function(){
				var height = typeof options.height === "undefined" ? 400 : options.height;
				var xformater = typeof options.xformater === "undefined" ? d3.format(",.02f") : d3.format(options.xformater);
				var yformater = typeof options.yformater === "undefined" ? d3.format(",.02f") : d3.format(options.yformater);
				var showPosition = typeof options.showPosition === "undefined" ? false : options.showPosition;
				
				var data = _this.data;
				
				var chart;
				nv.addGraph(function() {
			        chart = nv.models.scatterChart()
			            .showDistX(showPosition)
						.showDistY(showPosition)
						//.useVoronoi(true)
			            .duration(300)
			            .color(d3.scale.category10().range());

			        chart.dispatch.on('renderEnd', function(){
			            console.log('render complete');
			        });

			        chart.xAxis.tickFormat(function(d){ return xformater(d); });  			//d3.format('.02f')
			        chart.yAxis.tickFormat(function(d){ return yformater(d); });			//d3.format('.02f')
			        
					//console.log(JSON.stringify(randomData(4,40)));
			       
				   d3.select(div).append("svg")
			        	.attr('height', height)
			            .datum(nv.log(data))
			            .call(chart);
					
					nv.utils.windowResize(chart.update);
					chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });	
					
			        return chart;
			    });
				
				
			    
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return ScatterPlusLine;
	})();
	
	DD3.LineWithFocus = (function(){
		function LineWithFocus(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.LineWithFocus)) {
				return new DD3.LineWithFocus(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];
			var _this = this;
				
			LineWithFocus.prototype.data = typeof options.data === "string" ? {} : options.data;
			LineWithFocus.prototype.generate = function(){
				var grid = typeof options.grid === "undefined" ? false : options.grid,
					Y_AXIS_LABEL = typeof options.yAxisLabel === "undefined" ? "" : options.yAxisLabel,
					main_height = typeof options.height === "undefined" ? 500 : options.height,
					lineType = typeof options.type === "undefined" ? "cardinal" : optons.type,
					yFormater = typeof options.yFormater === "undefined" ? d3.format(",.2s") : d3.format(options.yFormater),
					textRotate = typeof options.rotateX === "undefined" ? "-65" : options.rotateX,
					rotation = typeof options.rotation === "undefined" ? true : options.rotation,
					xCategories = typeof options.xCategory === "undefined" ? "xCategory" : options.xCategory;
				
				
				
				var legend_width = typeof options.legend_width === "undefined" ? 120 : options.legend_width;						
				var color = typeof options.color === "undefined" ? d3.scale.category10() : d3.scale.ordinal().range(options.color);
					
				var mainWidth = typeof options.width === "undefined" ? $(div).parent().width() : options.width;
				var margin = {
						top: typeof options.margin_top === "undefined" ? 20 : options.margin_top,
						right:  typeof options.margin_right === "undefined" ? 20 : options.margin_right,
						bottom:  typeof options.margin_bottom === "undefined" ? 250 : options.margin_bottom,
						left:  typeof options.margin_left === "undefined" ? 80 : options.margin_left
					},
					 margin2 = {
						top: typeof options.margin_top_mini === "undefined" ? 400 : options.margin_top_mini,
						right:  typeof options.margin_right_mini === "undefined" ? 20 : options.margin_right_mini,
						bottom:  typeof options.margin_bottom_mini === "undefined" ? 120 : options.margin_bottom_mini,
						left:  typeof options.margin_left_mini === "undefined" ? 80 : options.margin_left_mini
					}
					width = mainWidth - margin.left - margin.right-legend_width,
					height = main_height - margin.top - margin.bottom,
					height2 = main_height - margin2.top - margin2.bottom;

				
				var xZoom = d3.scale.linear()
                    .range([0, width])
                    .domain([0, width]);
					
				var x = d3.scale.ordinal().rangeRoundBands([0, width], 1),
					x2 = d3.scale.ordinal().rangeRoundBands([0, width], 1),
					y = d3.scale.linear().range([height, 0]),
					y2 = d3.scale.linear().range([height2, 0])
					xCircle = d3.scale.ordinal(),
					xCircleMini = d3.scale.ordinal();

			 _this.data.sort(function(a, b){
					if(xCategories == "date"||xCategories=="Date"){
						a = a[xCategories].split("-");
						b = b[xCategories].split("-");
						var ad = new Date(a[2], a[1], a[0]);
						var bd = new Date(b[2], b[1], b[0]);
							return ad - bd;
					}else{
						return a[xCategories] - b[xCategories];
					}					
				});


				if(grid){
					var xAxis = d3.svg.axis().scale(x).orient("bottom").innerTickSize(-height).outerTickSize(0).tickPadding(10),
						xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),			//.innerTickSize(-height).outerTickSize(0).tickPadding(10)
					yAxis = d3.svg.axis().scale(y).orient("left").innerTickSize(-width).outerTickSize(0).tickPadding(10).tickFormat(function(d){ return yFormater(d); });
				var	yAxis2 = d3.svg.axis().scale(y2).orient("left").tickFormat(function(d){ return yFormater(d); });
				} else{
					var xAxis = d3.svg.axis().scale(x).orient("bottom"),
						xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
					 yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(function(d){ return yFormater(d); });
				var	yAxis2 = d3.svg.axis().scale(y2).orient("left").tickFormat(function(d){ return yFormater(d); });
				
				}	
				
				var brush = d3.svg.brush()
							.x(x2)
							.on("brush", brushed);
		
				color.domain(d3.keys(_this.data[0]).filter(function (key) {
					return key !== xCategories;
				}));

				var cities = color.domain().map(function (name) {
					return {
						name: name,
						values: _this.data.map(function (d) {
							return {
								key: d[xCategories],
								Value: +d[name],
								color: name
							};
						})
					};
				});

				var line = d3.svg.line()
					.interpolate(lineType)
					.x(function (d) {
						return x(d.key);
					})
					.y(function (d) {
						return y(d.Value);
					});
					
				var line2 = d3.svg.line()
					.interpolate(lineType)
					.x(function (d) {
						return x2(d.key);
					})
					.y(function (d) {
						return y2(d.Value);
					});

				d3.select(div).select("svg").remove();
				var svg = d3.select(div).append("svg")
					.attr("width", width + margin.left + margin.right+legend_width)
					.attr("height", height + margin.top + margin.bottom);
					//.append("g")
					//.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
					
					svg.append("defs").append("clipPath")
							.attr("id", "clip")
						  .append("rect")
							.attr("width", width)
							.attr("height", height)
							.attr("overflow-x", "none");
							
						
				var tip = d3.tip()
					.attr('class', 'd3-tip')
					.offset([-10, 0])
					.html(function (d) {
						
					 return "<center><span>"+xCategories+" : "+d.key+"</span><br /><span>"+d.color+" : "+yFormater(d.Value)+"</span></center>";
					});
				
				svg.call(tip);
					
				var focus = svg.append("g")
						.attr("class", "focus")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
							
				var context = svg.append("g")
						.attr("class", "context")
						.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
						
				var yMin = d3.min(cities, function (c) {
					return d3.min(c.values, function (v) {
						return (v.Value);
					});
				});
				var yMax = d3.max(cities, function (c) {
					return d3.max(c.values, function (v) {
						return v.Value;
					});
				});

				var d_f = (yMax - yMin)/8;
				yMin = yMin - 2*d_f;
				yMin = yMin < 100000 ? yMin : 100000;

				x.domain(_this.data.map(function (d) {
					return d[xCategories];
				}));
				x2.domain(x.domain());
				y.domain([yMin, yMax]);
				y2.domain(y.domain());
				
				xCircle.domain(_this.data.map(function (d) {
					return d.name;
				}))
					.rangeRoundBands([0, x.rangeBand()], 0);
				xCircleMini.domain(_this.data.map(function (d) {
					return d.name;
				}))
					.rangeRoundBands([0, x.rangeBand()], 0);

				if(rotation){
				focus.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis)
					.attr("stroke-width", "1.5px")
					.selectAll("text")
					.style("text-anchor", "end")
					.attr("dx", "-.8em")
					.attr("dy", ".15em")
					.attr("transform", function (d) {
						return "rotate("+textRotate+")"
					});
				} else {
					focus.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + height + ")")
						.call(xAxis)
						.attr("stroke-width", "1.5px")
						.selectAll("text")
						.style("text-anchor", "end");
				}

				focus.append("g")
					.attr("class", "y axis")
					.call(yAxis)					
					.attr("stroke-width", "1.5px")
					.append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", 6)
					.attr("dy", ".71em")
					.style("text-anchor", "end")
					.text(Y_AXIS_LABEL);

				if(rotation){
				context.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height2 + ")")
					.call(xAxis2)
					.attr("stroke-width", "1.5px")
					.selectAll("text")
					.style("text-anchor", "end")
					.attr("dx", "-.8em")
					.attr("dy", ".15em")
					.attr("transform", function (d) {
						return "rotate("+textRotate+")"
					});
				} else {
					context.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + height2 + ")")
						.call(xAxis2)
						.attr("stroke-width", "1.5px")
						.selectAll("text")
						.style("text-anchor", "end");
				}
				
				var city = focus.selectAll(".city")
					.data(cities)
					.enter().append("g")
					.attr("class", "city");


				city.append("path")
					.attr("class", "line")
					.attr("clip-path", "url(#clip)")
				// .attr("transform",function(d){ return "translate(" + xCircle(d.date) + ")"; })
				.attr("d", function (d) {
					return line(d.values);
				})
					.style("stroke", function (d) {
						return color(d.name);
					})
					.attr("stroke-width", "1.5px");

				city.selectAll("circle")
					.data(function (d) {
						return d.values;
					})
					.enter()
					.append("circle")
					.attr("r", 5)
					.attr("cx", function (d) {
						return x(d.key);
					})
					.attr("cy", function (d) {
						return y(d.Value);
					})
					.style("fill", function (d) {
						return color(d.color);
					})
					.style("stroke", "none")
					.style("pointer-events", "all")
					.style("cursor", "poiter")
					.on("mouseover", tip.show)
					.on("mouseout", tip.hide);
					
				var city2 = context.selectAll(".city")
					.data(cities)
					.enter().append("g")
					.attr("class", "city");


				city2.append("path")
					.attr("class", "line")
					.attr("clip-path", "url(#clip)")
				// .attr("transform",function(d){ return "translate(" + xCircle(d.date) + ")"; })
				.attr("d", function (d) {
					return line2(d.values);
				})
					.style("stroke", function (d) {
						return color(d.name);
					})
					.attr("stroke-width", "1.5px");

				city2.selectAll("circle")
					.data(function (d) {
						return d.values;
					})
					.enter()
					.append("circle")
					.attr("r", 5)
					.attr("cx", function (d) {
						return x2(d.key);
					})
					.attr("cy", function (d) {
						return y2(d.Value);
					})
					.style("fill", function (d) {
						return color(d.color);
					})
					.style("stroke", "none")
					.style("pointer-events", "all")
					.style("cursor", "poiter");
					// .on("mouseover", tip.show)
					// .on("mouseout", tip.hide);
				
				context.append("g")
					  .attr("class", "x brush")
					  .call(brush)
					.selectAll("rect")
					  .attr("y", -6)
					  .attr("height", height2 + 7);
		
		function brushed(){
			var	originalRange = xZoom.range();
				xZoom.domain(brush.empty() ? originalRange : brush.extent());
				x.rangeRoundBands([xZoom(originalRange[0]), xZoom(originalRange[1])], 1);
				
				xCircle.rangeRoundBands([0, x.rangeBand()], 0);
				
				city.select("path").attr("d", function(d){
										return line(d.values);
									});
				city.selectAll("circle")
					.data(function(d){ return d.values; })
					.attr("cx", function(d) { return x(d.key); })
					.attr("cy", function(d) { return y(d.Value); })
					.on("mouseenter", tip.show)
					.on("mouseout", tip.hide);
				
				focus.select("g.x.axis").call(xAxis)
										.selectAll("text")  
										.style("text-anchor", "end")
										.attr("dx", "-.8em")
										.attr("dy", ".15em")
										.attr("transform", function(d) {
											return "rotate(-65)" 
											});
											
				if(rotation){
					focus.select("g.x.axis").call(xAxis)
					.attr("stroke-width", "1.5px")
					.selectAll("text")
					.style("text-anchor", "end")
					.attr("dx", "-.8em")
					.attr("dy", ".15em")
					.attr("transform", function (d) {
						return "rotate("+textRotate+")"
					});
				} else {
					focus.select("g.x.axis").call(xAxis)
						.attr("stroke-width", "1.5px")
						.selectAll("text")
						.style("text-anchor", "end");
				}
				
		}
				
				
				var legend = svg.selectAll(".legend")
							.data(color.domain().slice().reverse())
						  .enter().append("g")
							.attr("class", "legend")
							.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

						legend.append("rect")
							.attr("x", width - 18+legend_width)
							.attr("width", 18)
							.attr("height", 18)
							.style("fill", color);

						legend.append("text")
							.attr("x", width - 24+legend_width)
							.attr("y", 9)
							.attr("dy", ".35em")
							.style("text-anchor", "end")
							.text(function(d) { return d; });

			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return LineWithFocus;
	})();
	
	DD3.InteractivePie = (function(){
		function InteractivePie(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.InteractivePie)) {
				return new DD3.InteractivePie(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];
			var _this = this;
				
			InteractivePie.prototype.data = typeof options.data === "string" ? {} : options.data;
			InteractivePie.prototype.generate = function(){
				var key = typeof options.key === "undefined" ? "key" : options.key,
					value = typeof options.value === "undefined" ? "value" : options.value;
				var height = typeof options.height === "undefined" ? 300: options.height,
					width = typeof options.width === "undefined" ? $(div).parent().width() : options.width;
				var innerRadius = typeof options.inner === "undefined" ? [] : options.inner;
				var outerRadius = typeof options.outer === "undefined" ? [] : options.outer;
				var colors = typeof options.color === "unddefined" ? d3.scale.category20c().range() : options.color;
				var showLabel = typeof options.showLabel === "undefined" ? true : options.showLabel;
				var outsideLabel = typeof options.outsideLabel === "undefined" ? true : options.outsideLabel;
				var donut = typeof options.donut === "undefined" ? true : options.donut;
				var data = _this.data;	
				var arc_Radius = [];
				var dict = {};
				
				for (var i=0; i<=data.length; i++){
					if(innerRadius.length === 0 && outerRadius.length === 0){
						dict = { inner : 0.8, outer : 1};
						arc_Radius.push(dict);
					}else if(innerRadius.length === 0 && outerRadius.length !==0){
						dict = { inner : 0, outer : outerRadius[i] };
						arc_Radius.push(dict);
					} else if(innerRadius.length !== 0 && outerRadius.length ===0){
						dict = { inner : innerRadius[i], outer : 1 };
						arc_Radius.push(dict);
					} else{
						dict = { inner : innerRadius[i], outer : outerRadius[i] };
						arc_Radius.push(dict);
					}
				}
			
				var chart;
				nv.addGraph(function () {
				
					chart = nv.models.pieChart()
						.x(function (d) { return d[key] })
						.y(function (d) { return d[value] })
						.donut(donut)
						.color(colors)
						.height(height)
						.width(width)
						.showLabels(showLabel)
						.arcsRadius(arc_Radius)
						.donutLabelsOutside(outsideLabel)
						.labelSunbeamLayout(outsideLabel);
						//.id('donut2'); // allow custom CSS for this one svg

					d3.select(div).append("svg")
						.datum(data)
						//.transition().duration(1200)
						.attr('width', width)
						.attr('height', height)
						.call(chart);
						
					return chart;

				});
				
			    
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return InteractivePie;
	})();
	
	DD3.StackHistogramWithDonut = (function() {
	
		function StackHistogramWithDonut(options){

			//getElement(this, DD3.Bubble, options);
			if (!(this instanceof DD3.StackHistogramWithDonut)) {
				return new DD3.StackHistogramWithDonut(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
			StackHistogramWithDonut.prototype.data = typeof options.data === "string" ? {} : options.data;
				
			StackHistogramWithDonut.prototype.generate = function() {
					var height = typeof options.height === "undefined"? 400: options.height;
					var width = typeof options.width === "undefined"? $(div).parent().width() : options.width;
					var textRotate = typeof options.textRotate === "undefined" ? "0": options.textRotate;
					var labelY = typeof options.labelY === "undefined"? "Y Label": options.labelY;
					var xCategory = typeof options.xCategory === "undefined"? "State": options.xCategory;
					var yFormater = typeof options.yFormater === "undefined" ? d3.format(",.2s") : d3.format(options.yFormater);
					var color = typeof options.color === "undefined"? d3.scale.category10() : d3.scale.ordinal().range(options.color);
					var legend_width = typeof options.legend_width === "undefined" ? 120 : options.legend_width;
					var distance_X = typeof options.distance_X === "undefined"? 20: options.distance_X;
					var labelX = typeof options.labelX === "undefined" ? "" : options.labelX;
					var div2 = typeof options.div2 === "undefined"? "" : options.div2,
						donut_width = typeof options.donut_width === "undefined"? $(div2).parent().width() : options.donut_width,
					    donut_height = typeof options.donut_height === "undefined"? 200: options.donut_height,
						innerRadius = typeof options.innerRadius === "undefined"? 50: options.innerRadius;
					var legendRectSize = 18,
						legendSpacing = 4,						
						appendText = typeof options.appendText === "undefined" ?  " " : options.appendText,
						labelHeading = typeof options.labelHeading === "undefined" ? " ": options.labelHeading,
						labelFont = typeof options.labelFont === "undefined" ? "14px": options.labelFont,
						valuePercent = typeof options.valuePercent === "undefined" ? "" : options.valuePercent,
						valueFormater = typeof options.valueFormater === "undefined" ? d3.format(",") : d3.format(options.valueFormater);
					var sortedKeys = typeof options.sortedKeys === "undefined"? [] : options.sortedKeys;	
					
						//legend_X = typeof options.legend_X === "undefined" ? -2 : options.legend_X;
					
					
					
				    var data = _this.data;
					
					data.sort(function(a, b){
							if(xCategory == "Date" || xCategory == "date"){
								a = a[xCategory].split("-");
								b = b[xCategory].split("-");
								var ad = new Date(a[2], a[1], a[0]);
								var bd = new Date(b[2], b[1], b[0]);
									return ad - bd;
							}else{
								return a[xCategory] - b[xCategory];
							}					
					});
					
					var margin = {top: typeof options.margin_top === "undefined"? 20 : options.margin_top,
								  right:typeof options.margin_right === "undefined"? 20: options.margin_right,
								  bottom:typeof options.margin_bottom === "undefined"? 30: options.margin_bottom,
								  left: typeof options.margin_left === "undefined"?120: options.margin_left},
						width = width - margin.left - margin.right - legend_width,
						height = height - margin.top - margin.bottom;

					var x = d3.scale.ordinal()
						.rangeRoundBands([0, width], .1);

					var y = d3.scale.linear()
						.rangeRound([height, 0]);

					var xAxis = d3.svg.axis()
						.scale(x)
						.orient("bottom");

					var yAxis = d3.svg.axis()
						.scale(y)
						.orient("left")
						.tickFormat(function(d){ return yFormater(d); });
							
							d3.select(div).select("svg").remove();
					var svg = d3.select(div)
                        .append('svg')
                        .attr('class', 'stackchart')
						.attr("width", width + margin.left + margin.right+legend_width) 				//+legend_width
						.attr("height", height + margin.top + margin.bottom)
					  .append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
						
					var tip = d3.tip()
						.attr('class', 'd3-tip')
						.offset([-10, 0])
						.html(function (d) {
								return "<center><span>"+xCategory+" : "+d.key+"</span><br /><span>"+d.name+" : "+yFormater(d.value)+"</span></center>";							
						});
					
					
					 // make condition for sort Labels of json keys according to index sequence of external sortedKeys[]
					  if(sortedKeys.length == 0){
							color.domain(d3.keys(data[0]).filter(function(key) { return key !== xCategory; }));					
					 } else {
							color.domain(options.sortedKeys);
					 }
					 
					 // make Structure for stack Histogram..
					  data.forEach(function(d) {
						var y0 = 0;
						d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name], value: +d[name], key: d[xCategory]}; });
						d.total = d.ages[d.ages.length - 1].y1;
					  });

					  svg.call(tip);
					 // data.sort(function(a, b) { return b.total - a.total; });

					  x.domain(data.map(function(d) { return d[xCategory]; }));
					  y.domain([0, d3.max(data, function(d) { return d.total; })]);

					if(options.textRotate){
					  svg.append("g")
						  .attr("class", "x axis")
						  .attr("transform", "translate(0," + height + ")")
						  .call(xAxis)
						.attr("stroke-width", "1.5px")
						  .selectAll("text")  
								.style("text-anchor", "end")
								.attr("dx", "-.8em")
								.attr("dy", ".15em")
								.attr("transform", function(d) {
									return "rotate("+textRotate+")" 
								});
								
						svg.append("g")
							.attr("class", "labels")
							.attr("transform", "translate(0," + height + ")")
							.attr("stroke-width", "1.5px")
							.append("text")
							.attr("x", width/2)
							  .attr("y", margin.right + distance_X)
							  .attr("dy", ".71em")
							  .style("text-anchor", "end")
							  .text(labelX);
							
					} else {
						svg.append("g")
						  .attr("class", "x axis")
						  .attr("transform", "translate(0," + height + ")")
						  .call(xAxis)
						  .attr("stroke-width", "1.5px")
						  .append("text")
							  .attr("x", width/2)
							  .attr("y", margin.right + distance_X)
							  .attr("dy", ".71em")
							  .style("text-anchor", "end")
							  .text(labelX);
					}
					
					  svg.append("g")
						  .attr("class", "y axis")
						  .call(yAxis)
					      .attr("stroke-width", "1.5px")
						.append("text")
						  .attr("transform", "rotate(-90)")
						  .attr("y", 6)
						  .attr("dy", ".71em")
						  .style("text-anchor", "end")
						  .text(labelY);

					  var state = svg.selectAll(".state")
						  .data(data)
						.enter().append("g")
						  .attr("class", "g")
						  .attr("transform", function(d) { return "translate(" + x(d[xCategory]) + ",0)"; });
					
						state.on("click", function(d){ 								
								var dataset = PieJson(d);
										// calculate sum here
								var sum = d3.sum(dataset, function(d){ return d.value; });
								makeDonut(dataset, d[xCategory]+appendText, labelHeading, sum);								
						  });
						  
						  function makeDonut(dataset, textStatus, labelHeading, Aggregation){
							var radius = Math.min(donut_width, donut_height) / 2;
								var arc = d3.svg.arc()
									.innerRadius(radius - innerRadius)
									.outerRadius(radius);
									
								var pie = d3.layout.pie()
								.sort(null)
								.value(function(d) { return d["value"]; });
								
							var donutTip = d3.tip()
									.attr('class', 'd3-tip')
									//.offset([-10, 0])
									.html(function (d) {
										if(options.valuePercent){
												return "<center><span>"+d.data["key"]+" : "+valueFormater(d.data["value"])+" ( "+d3.round(d.data["value"]*100/Aggregation, 2)+options.valuePercent+" )</span></center>";
										}else{
											return "<center><span>"+d.data["key"]+" : "+valueFormater(d.data["value"])+ "</span></center>";	
										}
									});
									
								
								d3.select(div2).select("svg").remove();
								var donut = d3.select(div2).append("svg")
									.attr("width", donut_width)
									.attr("height", donut_height).append("g")
									.attr("transform", "translate(" + donut_width / 2 + "," + donut_height / 2 + ")");
									
								donut.call(donutTip);
								
								var path = donut.selectAll('g.path')
								  .data(pie(dataset))
								  .enter()
								  .append('path')
								  .attr('d', arc)	
								  .attr('fill', function(d, i) { 
									return color(d.data["key"]);
								  }) 
								  .on("mousemove", function(d){ 
										var mouseVal = d3.mouse(this);
												donutTip.style("left", (d3.event.pageX-100) + "px")
												.style("top", (d3.event.pageY-50) + "px")
												.style("opacity", 1)
												.style("display","block");
										
									})										
								  .on("mouseover", donutTip.show)
								  .on("mouseout", donutTip.hide);
								  
								  donut.append("text")
										.attr("dy", ".0em")
										.style("text-anchor", "middle")
										.attr("class", "inside")
										.style("font-size", labelFont)
										.style("font-weight", "bold")
										.text(labelHeading);
								donut.append("text")
										.attr("dy", "1.20em")
										.style("text-anchor", "middle")
										.attr("class", "inside")
										.style("font-size", labelFont)
										.style("font-weight", "bold")
										.text(textStatus);
								// var legend = donut.selectAll('.legend')                     // NEW
									  // .data(color.domain())                                   // NEW
									  // .enter()                                                // NEW
									  // .append('g')                                            // NEW
									  // .attr('class', 'legend')                                // NEW
									  // .attr('transform', function(d, i) {                     // NEW
										// var height = legendRectSize + legendSpacing;          // NEW
										// var offset =  height * color.domain().length / 2;     // NEW
										// var horz = legend_X * legendRectSize;                       // NEW
										// var vert = i * height - offset; 
										// return 'translate(' + horz + ',' + vert + ')';        // NEW
									  // });                                                     // NEW

									// legend.append('rect')                                     // NEW
									  // .attr('width', legendRectSize)                          // NEW
									  // .attr('height', legendRectSize)                         // NEW
									  // .style('fill', color)                                   // NEW
									  // .style('stroke', color);                                // NEW
									  
									// legend.append('text')                                     // NEW
									  // .attr('x', legendRectSize + legendSpacing)              // NEW
									  // .attr('y', legendRectSize - legendSpacing)              // NEW
									  // .text(function(d) { return d; });                       // NEW

					
						  }
						  
						

					state.selectAll("rect")
						  .data(function(d) { return d.ages; })
						.enter().append("rect")
						  .attr("width", x.rangeBand())
						  .attr("y", function(d) { return y(d.y1); })
						  .attr("height", function(d) { return y(d.y0) - y(d.y1); })
						  .style("fill", function(d){ return color(d.name); })
						  .attr("id",function(d) {return d.name})
						  .attr("class", "relative");
						 
					state.selectAll("rect")
							.style("cursor", "pointer")
							.on("mouseover", tip.show)
							.on("mouseout", tip.hide);
							
						function PieJson(d){
							var arr = [];
								var keys = d3.keys(d).filter(function(e){ return (e !== xCategory && e !== "ages" && e !== "total"); });								
								keys.forEach(function(e){
									var json = {"key": e, "value": d[e], "state": d[xCategory] };
									arr.push(json);
								});
							return arr;
						}
			
					
					  var legend = svg.selectAll(".legend")
						  .data(color.domain().slice().reverse())
						.enter().append("g")
						  .attr("class", "legend")
						  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

					  legend.append("rect")
						  .attr("x", width - 18+legend_width)
						  .attr("width", 18)
						  .attr("height", 18)
						  .style("fill", color);

					  legend.append("text")
						  .attr("x", width - 24+legend_width)
						  .attr("y", 9)
						  .attr("dy", ".35em")
						  .style("text-anchor", "end")
						  .text(function(d) { return d; });
									
								
					
			}

			if (this.data.length) this.generate();
				else AJAX(options.data, this);
		}
		
		return StackHistogramWithDonut;
	})();
	
	DD3.PadigreeTree = (function() {
	
		function PadigreeTree(options){

			//getElement(this, DD3.Bubble, options);
			if (!(this instanceof DD3.PadigreeTree)) {
				return new DD3.PadigreeTree(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			
				
			PadigreeTree.prototype.data = typeof options.data === "string" ? {} : options.data;
				
			PadigreeTree.prototype.generate = function(){				
					var main_height = typeof options.height === "undefined"? 400: options.height;
					var main_width = typeof options.width === "undefined"? $(div).parent().width() : options.width;					
					var margin = {top: typeof options.margin_top === "undefined"? 0 : options.margin_top,
								  right:typeof options.margin_right === "undefined"? 320: options.margin_right,
								  bottom:typeof options.margin_bottom === "undefined"? 0: options.margin_bottom,
								  left: typeof options.margin_left === "undefined"? 0: options.margin_left},
						width = main_width - margin.left - margin.right,
						height = main_height - margin.top - margin.bottom;
					var title = typeof options.title === "undefined" ? "title": options.title,
						valueFormatter = typeof options.valueFormatter === "undefined" ? d3.format(",.s") : d3.format(options.valueFormatter),
						wildFormatter = typeof options.wildFormatter === "undefined" ? d3.format(",.s") : d3.format(options.wildFormatter),
						wildMenu = typeof options.wildMenu === "undefined" ? {} : options.wildMenu;
						subMenu = typeof options.subMenu === "undefined" ? [] : options.subMenu;
						
					var tree = d3.layout.tree()
						.separation(function(a, b) { return a.parent === b.parent ? 1 : .5; })
						.children(function(d) { return d.parents; })
						.size([height, width]);
						
										
					var svg = d3.select(div).append("svg")
						.attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.top + margin.bottom)
					  .append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
						
					$(div).scrollTop(height*.25);
						
					var json = this.data[0];
						
					var nodes = tree.nodes(json);
					var link = svg.selectAll(".link")
						  .data(tree.links(nodes))
						.enter().append("path")
						  .attr("class", "link")
						  .attr("d", elbow);

					var node = svg.selectAll(".node")
						  .data(nodes)
						.enter().append("g")
						  .attr("class", "node")
						  .style( "font-family", "'Helvetica Neue', Helvetica, sans-serif")
						  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

						node.append("text")
						  .attr("class", "name")
						  .style("font-weight", "bold")
						  .style("font-size", "12px")
						  .attr("x", 8)
						  .attr("y", -6)
						  .text(function(d) { return d[title]; });
					
					for (var i=0; i<= subMenu.length-1; i++){
					
						//var size = .71+(i*1.51);
						node.append("text")
						  .attr("x", 8)
						  .attr("y", 8)
						  .attr("dy", 
						  function(d){
						  
							var size = 0;
								if(typeof d[subMenu[i]]!=="undefined" && d[subMenu[i]] !== "NaN"){
									size = .71+(i*1.51);
								} 
								return size+"em";
						  })
						  .attr("class", "about key"+i)						  
						  .style("font-size", "12px")
						  .text(function(d) { 
									if(typeof d[subMenu[i]]!=="undefined" && d[subMenu[i]] !== "NaN"){
										var text ; 
										if(typeof options.wildMenu[i] !== "undefined"){
											text = subMenu[i]+" : "+valueFormatter(d[subMenu[i]])+ " ( "+wildFormatter(d[wildMenu[i]])+" ) ";
										}else{
											text = subMenu[i]+" : "+valueFormatter(d[subMenu[i]]);
										}
										return text;
									}
						  });
						  	
					}
			

					function elbow(d, i) {
						return "M" + d.source.y + "," + d.source.x
						   + "H" + d.target.y + "V" + d.target.x
						   + (d.target.children ? "" : "h" + margin.right);
					}
			}
			if (this.data.length) this.generate();
				else AJAX(options.data, this);
		}
		
		return PadigreeTree;
	})();
	
	DD3.TransitionTree = (function() {
	
		function TransitionTree(options){

			//getElement(this, DD3.Bubble, options);
			if (!(this instanceof DD3.TransitionTree)) {
				return new DD3.TransitionTree(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];	
							
			TransitionTree.prototype.data = typeof options.data === "string" ? {} : options.data;
			TransitionTree.prototype.generate = function(){
				var dataset = this.data;
				//var states = typeof options.states === "undefined" ? [] : options.states;
				var specialNodes = typeof options.specialNodes === "undefined"? []: options.specialNodes;
				var keys = typeof options.keys ==="undefined" ? ["start", "end", "label"]: options.keys;
				var color = typeof options.color ==="undefined"? ["red", "Green", "Blue"] : options.color;
				var height = typeof options.height === "undefined" ? 900 : options.height;
				var width = typeof options.width === "undefined" ? 1000: options.width;
				var initialScale = typeof options.initialScale === "undefined" ? .75 : options.initialScale;
				var zoomLimit = typeof options.zoomLimit === "undefined" ? 20 : options.zoomLimit;
				
				var states = [];				
				var set = new Set();				
				dataset.forEach(function(d){
					set.add(d[keys[0]]);
					set.add(d[keys[1]]);
				});
				set.forEach(function(value){
					states.push(value);
				});
				
				
				$(div).empty();
				d3.select(div).append("svg").attr("height", height).attr("width", width).append("g");
				//$(div).scrollTop(height/10);
				$(div).scrollLeft(width/10);
				var g = new dagreD3.graphlib.Graph().setGraph({});

				// States and transitions from RFC 793
				//var states = [ "CLOSED", "LISTEN", "SYN RCVD", "SYN SENT", "ESTAB", "FINWAIT-1", "CLOSE WAIT", "FINWAIT-2", "CLOSING", "LAST-ACK", "TIME WAIT" ];

				// Automatically label each of the nodes
				states.forEach(function(state) { g.setNode(state, { label: state }); });

				// Set up the edges
				dataset.forEach(function(d){
					g.setEdge(d[keys[0]], d[keys[1]],     { label: d[keys[2]] , rx: 5, ry: 5 });
				});
				

				// Add some custom colors based on state
				if(options.specialNodes){
					for(var i=0; i<=specialNodes.length-1; i++){
						set.forEach(function(value){
							if(value === specialNodes[i]){
								g.node(specialNodes[i]).style = "fill:"+color[i];
							}
						});
					}
				}
				
				var svg = d3.select(div).select("svg"),
					inner = svg.select("g");

				// Set up zoom support
				var zoom = d3.behavior.zoom().on("zoom", function() {
					  inner.attr("transform", "translate(" + d3.event.translate + ")" +
												  "scale(" + d3.event.scale + ")");
					}).scaleExtent([0.75, zoomLimit]);
				svg.call(zoom);
				
				// Create the renderer
				var render = new dagreD3.render();
				
				// Run the renderer. This is what draws the final graph.
				render(inner, g);

				// Center the graph
				//var initialScale = options.initialScale;
				zoom
				  .translate([(svg.attr("width") - g.graph().width*initialScale) / 2, (svg.attr("height") - g.graph().height*initialScale) / 2])
				  .scale(initialScale)
				  .event(svg);
				  
				//svg.attr('height', height);	//g.graph().height*initialScale + 40

				
			}
			if (this.data.length) this.generate();
				else CSV_AJAX(options.data, this);
		}
		 return TransitionTree;
	})();
	
	DD3.CoOccuranceMatrix = (function() {
		function CoOccuranceMatrix(options){

			//getElement(this, DD3.Bubble, options);
			if (!(this instanceof DD3.CoOccuranceMatrix)) {
				return new DD3.CoOccuranceMatrix(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];	
			CoOccuranceMatrix.prototype.data = typeof options.data === "string" ? {} : options.data;
			CoOccuranceMatrix.prototype.generate = function(){
				var width = typeof options.width === "undefined" ? $(div).parent().width() : options.width,    //720,
					height = typeof options.height === "undefined" ? $(div).parent().width() : options.height;   //720;
				var margin = typeof options.margin === "undefined" ? 50 : options.margin;
						// {
							// top: typeof options.margin_top === "undefined" ? 80 : options.margin_top,
							// right:  typeof options.margin_right === "undefined" ? 0 : options.margin_right,
							// bottom:  typeof options.margin_bottom === "undefined" ? 10 : options.margin_bottom,
							// left:  typeof options.margin_left === "undefined" ? 80 : options.margin_left
						// };
					
				var sorting = typeof options.sorting === "undefined" ? "name" : options.sorting;
				var colors = typeof options.color === "undefined" ? d3.scale.category10().domain(d3.range(10)) : d3.scale.ordinal().range(options.color);
				var updateSorting = typeof options.updateSorting === "undefined" ? "#order" : options.updateSorting;
				var tipTitle = typeof options.tipTitle === "undefined" ? "value" : options.tipTitle;
					
				var miserables = this.data[0];
					
					var x = d3.scale.ordinal().rangeBands([0, width - (margin*2)]),
						z = d3.scale.linear().domain([0, 4]).clamp(true),
						c = colors;
						
												
						d3.select(div).select("svg").remove();
					var svg = d3.select(div).append("svg")
						.attr("width", width)				// + margin.left + margin.right
						.attr("height", height)				// + margin.top + margin.bottom
						//.style("margin-left", -margin.left + "px")
					  .append("g")
						.attr("transform", "translate(" + margin + "," + margin + ")");		// + margin.left + "," + margin.top + 
						
					var tip = d3.tip()
						.attr('class', 'd3-tip')
						.style("border-radius", "10px")
						.offset([-10, 0])
						.html(function (d) {
								return "<center><span> "+nodes[d.x].name+" - "+nodes[d.y].name+"</span><br /><span>"+tipTitle+" : "+d.z+"</span></center>";
						});
					
					svg.call(tip);
						
					var matrix = [],
						nodes = miserables.nodes,
						n = nodes.length;
					  
						nodes.forEach(function(node, i) {
							node.index = i;
							node.count = 0;
							matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
						});
						
						// Convert links to matrix; count character occurrences.
					  miserables.links.forEach(function(link) {
						matrix[link.source][link.target].z += link.value;
						matrix[link.target][link.source].z += link.value;
						matrix[link.source][link.source].z += link.value;
						matrix[link.target][link.target].z += link.value;
						nodes[link.source].count += link.value;
						nodes[link.target].count += link.value;
					  });
						
					  // Precompute the orders.
					var orders = {
						name: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
						count: d3.range(n).sort(function(a, b) { return nodes[b].count - nodes[a].count; }),
						group: d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; })
					};
						
					x.domain(orders[sorting]);
					
					svg.append("rect")
					  .attr("class", "background")
					  .attr("width",  width - margin - margin)			//width
					  .attr("height", height- margin - margin);		//height
					  
					var row = svg.selectAll(".row")
							  .data(matrix)
							.enter().append("g")
							  .attr("class", "row")
							  .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
							  .each(row);

						row.append("line")
							.attr("x2", width - (margin*2));	//width

						row.append("text")
							  .attr("x", -6)
							  .attr("y", x.rangeBand() / 2)
							  .attr("dy", ".32em")
							  .attr("text-anchor", "end")
							  .text(function(d, i) { return nodes[i].name; });
						
					var column = svg.selectAll(".column")
							  .data(matrix)
							.enter().append("g")
							  .attr("class", "column")
							  .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

						column.append("line")
							.attr("x1", -width + (margin*2));		//-width

						column.append("text")
							  .attr("x", 6)
							  .attr("y", x.rangeBand() / 2)
							  .attr("dy", ".32em")
							  .attr("text-anchor", "start")
							  .text(function(d, i) { return nodes[i].name; });
							  
				function row(row) {
					var cell = d3.select(this).selectAll(".cell")
						.data(row.filter(function(d) { return d.z; }))
					  .enter().append("rect")
						.attr("class", "cell")
						.attr("x", function(d) { return x(d.x); })
						.attr("width", x.rangeBand())
						.attr("height", x.rangeBand())
						.style("fill-opacity", function(d) { return z(d.z); })
						.style("fill", function(d) { return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : "#fff"; })		//null
						.on("mouseover", function(d){
							mouseover(d);
							tip.show(d);
						})
						.on("mouseout", function(d){
							mouseout();	//mouseover(d);
							tip.hide();
						});
				}

				function mouseover(p) {
					d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
					d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
				}

				function mouseout() {
					d3.selectAll("text").classed("active", false);
				}
				
			if(options.updateSorting){
					 d3.select(updateSorting).on("change", function() {
						clearTimeout(timeout);
						order(this.value);
					  });
					
				// 	used for sorting transition...
					function order(value) {
						x.domain(orders[value]);

						var t = svg.transition().duration(2500);

						t.selectAll(".row")
							.delay(function(d, i) { return x(i) * 4; })
							.attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
						  .selectAll(".cell")
							.delay(function(d) { return x(d.x) * 4; })
							.attr("x", function(d) { return x(d.x); });

						t.selectAll(".column")
							.delay(function(d, i) { return x(i) * 4; })
							.attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
					}
					
					 var timeout = setTimeout(function() {
						order(sorting);
						d3.select(updateSorting).property("selected").node().focus();
					  }, 5000);
				}	
			};
			if (this.data.length) this.generate();
				else AJAX(options.data, this);
		}
			return CoOccuranceMatrix;
	})();
	
	DD3.NetworkGraph = (function() {
	
		function NetworkGraph(options){

			//getElement(this, DD3.Bubble, options);
			if (!(this instanceof DD3.NetworkGraph)) {
				return new DD3.NetworkGraph(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];	
							
			NetworkGraph.prototype.data = typeof options.data === "string" ? {} : options.data;
			NetworkGraph.prototype.generate = function(){
			
				var height = typeof options.height === "undefined" ? 800 : options.height;
				var width = typeof options.width === "undefined" ? $(div).parent().width() : options.width;			
				var fill = typeof options.color === "undefined" ? d3.scale.category20() : d3.scale.ordinal().range(options.color);
				var tipTitle = typeof options.tipTitle === "undefined" ? " " : options.tipTitle;
				var lineWidth = typeof options.lineWidth === "undefined" ? "1.5px" : options.lineWidth;
				var json = this.data[0];
				
				// some distance related arguments which you can set externally.
				var charge = typeof options.charge === "undefined" ? -425 : options.charge;
				var chargeDistance = typeof options.chargeDistance === "undefined" ? 600 : options.chargeDistance;
				var gravity = typeof options.gravity === "undefined" ? .15 : options.gravity;		
				var friction = typeof options.friction === "undefined" ? .8 : options.friction;		
				var linkDistance = typeof options.linkDistance === "undefined" ? 100 : options.linkDistance;	
				
					d3.select(div).select("svg").remove();
				var vis = d3.select(div)
				  .append("svg:svg")
					.style("background-color", "rgb(240, 240, 240)")
					.attr("width", width)
					.attr("height", height);

				
				  var force = d3.layout.force()
					  .charge(charge) // -425
					  .chargeDistance(chargeDistance)	//600
					  .gravity(gravity)	//.15
					  .chargeDistance(chargeDistance)	//600
					  .friction(friction)	//.8
					  .linkStrength(1)
					  .linkDistance(linkDistance)	//100
					  .nodes(json.nodes)
					  .links(json.links)
					  .size([width, height])
					  //.chargeDistance(110)
					  .start();
							
				  var link = vis.selectAll("line.link")
					  .data(json.links)
					  .enter().append("svg:line")
					  .attr("class", "link")
					  .style("stroke-width", lineWidth)				//function(d) { return Math.round(Math.sqrt(d.value/2)); }
					  .attr("x1", function(d) { return d.source.x; })
					  .attr("y1", function(d) { return d.source.y; })
					  .attr("x2", function(d) { return d.target.x; })
					  .attr("y2", function(d) { return d.target.y; });

				  var node = vis.selectAll("g.node-network")
					  .data(json.nodes)
					  .enter().append("svg:g")
					  .attr("class", "node-network")
					  .on("click", click)
					  .on("dblclick", dblclick)
					  .call(force.drag);

					  node.append("svg:circle")
					  .attr("r", function(d) {return Math.sqrt(1.5*d.nodeSize)+2}) //2})
					  .style("fill", function(d) {
							if(options.color){
								return options.color[d.group];
							} else{
								return fill(d.group);
							}
					  })
					  //.call(force.drag)
					  .on("mouseover", fade(.15))
					  .on("mouseout", fade(1));
					  
					  
					  
					  var linkedByIndex = {}; 
					json.links.forEach(function(d) {
						linkedByIndex[d.source.index + "," + d.target.index] = 1;
					});
					
					var slider = vis.select("svg")
					.append("#citation_menu");
					
					function isConnected(a, b) {
						return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
					}

					
					function fade(opacity) {
						
						return function(d) {
							
							d3.select("#metatdata").text("");
							d3.select("#metadata").html("<p id=\"metadata\"> "+d.meta) + "</p>"; 
							
								node.style("stroke-opacity", function(o) {
								thisOpacity = isConnected(d, o) ? 1 : opacity;
								this.setAttribute('fill-opacity', thisOpacity);
								return thisOpacity;
								});
						
								link.style("stroke-opacity", function(o) {
								return o.source === d || o.target === d ? 1 : opacity;
								});
							};
					}
					
					function dblclick(d) {
					  d3.select(this).classed("fixed", d.fixed = false);
					  d3.select(this).select("circle").classed("fixed_circle", false);
					  force.resume();
					}
					
					function click(d) {
					  d3.select(this).classed("fixed", d.fixed = true);
							d3.select(this).select("circle").classed("fixed_circle", true);

					  force.resume();
					  
					};
					
				  node.append("svg:text")
					.attr("class", "nodetext")
					.attr("dx", 10)
					.attr("dy", "-.15em")
					.text(function(d) { return d.name; })
					

				  node.append("svg:title")
					.text(function(d) { return tipTitle+" : "+d.nodeValue; });

				  vis.style("opacity", 1e-6)
					.transition()
					  .duration(1000)
					  .style("opacity", 1);

				  force.on("tick", function() {
					link.attr("x1", function(d) { return d.source.x; })
						.attr("y1", function(d) { return d.source.y; })
						.attr("x2", function(d) { return d.target.x; })
						.attr("y2", function(d) { return d.target.y; });
					
					node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
				  });

				

			}
			if (this.data.length) this.generate();
				else AJAX(options.data, this);
		}
		 return NetworkGraph;
	})();
	
	DD3.Box_Plot = (function(){
		function Box_Plot(options){
			//getElement(this, DD3.Grouped_Histogram, options);
			if (!(this instanceof DD3.Box_Plot)) {
				return new DD3.Box_Plot(options);
			}
			if (typeof options.element === 'string') {
				this.el = $(document.getElementById(options.element));
			} else {
				this.el = $(options.element);
			}
			if (this.el === null || this.el.length === 0) {
				throw new Error("Graph placeholder not found.");
			}
			
			var div = this.el[0];			
			var _this = this;
				
			Box_Plot.prototype.data = typeof options.data === "string" ? {} : options.data;
			Box_Plot.prototype.generate = function(){
				var height = typeof options.height ==="undefined" ? 400 : options.height;
				//var width = typeof options.width === "undefined" ? $(div).parent().width() : options.width;
				var colors = typeof options.color === "undefined" ? d3.scale.category20c().range() : options.color;
				var xkey = typeof options.xkey === "undefined" ? "label" : options.xkey;
				//var	ykey = typeof options.ykey === "undefined" ? "Q3" : options.ykey;
				var max_boxWidth = typeof options.max_boxWidth === "undefined" ? 75 : parseInt(options.max_boxWidth);
				var yMax = typeof options.yMax === "undefined" ? 500 : options.yMax;
				var staggerLabel = typeof options.staggerLabel === "undefined" ? true : options.staggerLabel;
				var showXAxis = typeof options.showXAxis === "undefined" ? false : options.showXAxis,
					showYAxis = typeof options.showYAxis === "undefined" ? false : options.showYAxis;
			var data = _this.data;
			
				nv.addGraph(function() {
				  var chart = nv.models.boxPlotChart()
								.x(function(d) { return d[xkey] })
								.staggerLabels(staggerLabel)
								.color(colors)
								.showYAxis(showYAxis)	// showing y-axis	
								.showXAxis(showXAxis);	// showing x-axis
								
								
					if(options.yMax){
						chart.yDomain([0, yMax]);
					}
					
					if(options.max_boxWidth){
						chart.maxBoxWidth(max_boxWidth);	// preventing boxes from incredibly wide..
					}
					
					if(options.valueFormatter){						
						chart.yAxis.tickFormat(valueFormatter);	
					}
					
				  d3.select(div).append("svg")
					  .attr("height", height)
					  .datum(data)
					  .call(chart);

				  nv.utils.windowResize(chart.update);

				  return chart;
				});
			}
			if (this.data.length) this.generate();
			else AJAX(options.data, this);
		}
		return Box_Plot;
	})();
	
	
}).call(this);