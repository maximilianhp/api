window.qd.plotComparisonForActiveEvents = function(divId, myActiveEvents, theirActiveEvents) {
	var s = $(divId).empty();
	s = d3.select(divId);

	var w = $(divId).width() * 1;
	var h = w / 1.61;
	var p = [h * 0.05, w * 0.1, h * 0.35, w * 0.05],
		x = d3.scale.ordinal().rangeRoundBands([0, w - p[1] - p[3]]),
		xLinear = d3.scale.linear().range([0, w - p[1] - p[3]]),
		xTicks = d3.scale.linear().range([0, w - p[1] - p[3]]);
	var y = d3.scale.linear().range([0, h - p[0] - p[2]]),
		parse = d3.time.format("%m/%d/%Y").parse,
		format = d3.time.format("%d");
	formatMonth = d3.time.format("%b");
	var xOriginOfSVG = p[3] + 9;

	var svg = d3.select(divId).append("svg:svg")
		.attr("width", w)
		.attr("height", h)
		.append("svg:g")
		.attr("transform", "translate(" + xOriginOfSVG + "," + (h - p[2]) + ")");
	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			return "<strong>" + Math.round(d.y) + " mins</strong> <span style='color:lightgrey'> on " + moment(d.x).format("ddd MMM DD") + "</span>";
		});
	svg.call(tip);
	var _groupActiveEvents = function(eventsMap) {
		return ["totalActiveDuration"].map(function(cause) {
			return eventsMap.map(function(d) {
				return {
					x: parse(d.date),
					y: +d[cause]
				};
			});
		});
	};

	var _yMax = function(arrayOfArrays) {
		return d3.max(arrayOfArrays, function(array) {
			return d3.max(array, function(d) {
				return d.y;
			});
		});
	};
	var _plotLineGraph = function(color, isDashedLine, dataArray) {
		var dashArrayValue = isDashedLine === true ? "2,2" : "0,0";
		 var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
		var lineGraph = d3.svg.line()
			.x(function(d, i) {
				return xLinear(i);
			})
			.y(function(d, i) {
				var curval = +d.y;
				return -y(curval);
			})
			.interpolate("monotone");

		svg.append("path")
			.attr("class", "average")
			.attr("d", lineGraph(dataArray))
			.style("fill", "none")
			.style("stroke", color)
			.style("stroke-dasharray", dashArrayValue)
			.style("stroke-width", 2);

		svg.selectAll("dot")
			.data(dataArray)
			.enter().append("circle")
			.attr("class", "dot-line")
			.attr("r", 4)
			.attr("cx", function(d, i) {
				return xLinear(i);
			})
			.attr("cy", function(d, i) {
				var curval = +d.y;
				return -y(curval);
			})
			.attr("fill", color)
			.on("click", function(d) {
				if ($(window).width() < 768) {
					div.transition()
						.duration(200)
						.style("opacity", .9);
					div.html("<strong>" + Math.round(d.y) + " mins</strong> <span style='color:lightgrey'> on " + moment(d.x).format("ddd MMM DD") + "</span>")
						.style("left", (d3.event.pageX) - 50 + "px")
						.style("top", (d3.event.pageY) + "px");
				}

			})
			.on("mouseover", function(d) {
				if ($(window).width() > 767) {
					tip.show(d)
				}
			})
			.on("mouseout", function() {
				if ($(window).width() > 767) {
					tip.hide();
				} else {
					div.transition()
						.duration(100)
						.style("opacity", 0)
				}
			});
	};
	var _createAxesAndLabels = function() {
		//    Add a label per date
		var label = svg.selectAll("text.month")
			.data(x.domain())
			.enter().append("svg:text")
			.attr("x", function(d) {
				return x(d) + x.rangeBand() / 2;
			})
			.attr("y", 6)
			.attr("text-anchor", "middle")
			.attr("dy", ".71em")
			.text(function(d, i) {
				return (i % 7) ? null : formatMonth(d);
			});

		var filterFormat = format;
		if (w < 800) {
			filterFormat = function(d, i) {
				return (i % 7) ? null : format(d);
			};
		}

		var label = svg.selectAll("text.day")
			.data(x.domain())
			.enter().append("svg:text")
			.attr("x", function(d) {
				return x(d) + x.rangeBand() / 2;
			})
			.attr("y", 19)
			.attr("text-anchor", "middle")
			.attr("dy", ".71em")
			.text(filterFormat);

		// Add y-axis rules.
		var rule = svg.selectAll("g.rule")
			.data(y.ticks(5))
			.enter().append("svg:g")
			.attr("class", "rule")
			.attr("transform", function(d) {
				return "translate(0," + -y(d) + ")";
			});

		rule.append("svg:line")
			.attr("x2", w - p[1] - p[3])
			.style("stroke", function(d) {
				return d ? "#fff" : "#797878";
			})
			.style("stroke-opacity", function(d) {
				return d ? .7 : null;
			});

		rule.append("svg:text")
			.attr("x", -2)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(d3.format(",d"));
		rule.append("svg:text")
			.attr("x", (h - p[2] - p[0] - 66))
			.attr("y", 8)
			.attr("dy", ".35em")
			.attr("transform", "rotate(-90)")
			.style("font-size", "12px")
			.text(function(d) {
				return d !== 0 ? "" : "Duration(mins)";
			});

		var ruleForX = svg.selectAll("g.ruleForX")
			.data(xTicks.ticks(30))
			.enter().append("svg:g")
			.attr("class", "ruleForX")
			.attr("transform", function(d) {
				var xValue = (x.rangeBand() * d);
				return "translate(" + xValue + ",0)";
			});

		ruleForX.append("svg:line")
			.attr("x1", function(d) {
				return d;
			})
			.attr("x2", function(d) {
				return d;
			})
			.attr("y1", function(d) {
				return 0;
			})
			.attr("y2", -(h - p[2] - p[0] + 10))
			.style("stroke", function(d) {
				return d !== 0 ? "#fff" : "#797878";
			})
			.style("stroke-opacity", function(d) {
				return d !== 0 ? 0 : .7;
			});

		ruleForX.append("svg:text")
			.attr("x", w - p[3] - p[1] - 30)
			.attr("y", -10)
			.attr("dy", ".35em")
			.style("font-size", "12px")
			.text(function(d) {
				return d !== 0 ? "" : "Date";
			});
	};
	var myActiveEvents = _groupActiveEvents(myActiveEvents);
	myActiveEvents = myActiveEvents[0];
	if (myActiveEvents.length > 0) {
		x.domain(myActiveEvents.map(function(d) {
			return d.x;
		}));
		xLinear.domain([0, myActiveEvents.length]);
	}
	var theirActiveEvents = _groupActiveEvents(theirActiveEvents);
	theirActiveEvents = theirActiveEvents[0];
	if (theirActiveEvents.length > 0) {
		x.domain(theirActiveEvents.map(function(d) {
			return d.x;
		}));
		xLinear.domain([0, theirActiveEvents.length]);
	}
	y.domain([0, _yMax([myActiveEvents, theirActiveEvents])]);

	var _createLegends = function(legendConfig) {
		var legend = svg.append("g")
			.attr("class", "legend")
			.attr("x", w - 65)
			.attr("y", 25)
			.attr("height", 100)
			.attr("width", 100);


		var yOffset = 40;
		var xOffset = 0;
		legend.selectAll("g").data(legendConfig)
			.enter()
			.append("g")
			.each(function(d, i) {
				var g = d3.select(this);
				if (i === 2) {
					xOffset = 0;
					yOffset = yOffset * 2;
				}
				g.append("rect")
					.attr("x", xOffset)
					.attr("y", yOffset)
					.attr("width", 10)
					.attr("height", 10)
					.style("fill", legendConfig[i][1]);

				g.append("text")
					.attr("x", xOffset + 20)
					.attr("y", yOffset + 8)
					.attr("height", 30)
					.attr("width", 100)
					.attr("class","text-color")
					.text(legendConfig[i][0]);

				xOffset = xOffset + 110;
			});
	};

	_createAxesAndLabels();

	//My Active Events:
	if (myActiveEvents.length > 0) {
		_plotLineGraph("#00a2d4", false, myActiveEvents);
	}
	//Their Active Events:
	if (theirActiveEvents.length > 0) {
		_plotLineGraph("#dd2649", true, theirActiveEvents);
	}
	_createLegends([
		["My Active", "#00a2d4"],
		["Their Active", "#dd2649"]
	]);
};