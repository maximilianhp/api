window.qd.plotScatterPlot = function(divId, correlateEvents) {
	var s = $(divId).empty();
	s = d3.select(divId);
	var margin = {
			top: 20,
			right: 20,
			bottom: 30,
			left: 40
		},
		width = $(divId).width() - margin.left - margin.right,
		height = (width / 1.61) - margin.top - margin.bottom;

	var _groupCorrelateEvents = function(events) {
		return _.map(events, function(event) {
			return {
				x: event.activeTimeInMinutes,
				y: event.githubPushEventCount,
				date: event.date
			};
		});
	};
	var heightnew = height - 10;
	var xValue = function(d) {
			return d.x;
		},
		xScale = d3.scale.linear().range([0, width]),
		xMap = function(d) {
			return xScale(xValue(d));
		},
		xAxis = d3.svg.axis().scale(xScale).orient("bottom");

	var yValue = function(d) {
			return d.y;
		},
		yScale = d3.scale.linear().range([heightnew, 0]),
		yMap = function(d) {
			return yScale(yValue(d));
		},
		yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);

	var svg = d3.select(divId).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var tooltip = d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

	var _plotGraph = function() {
		var data = _groupCorrelateEvents(correlateEvents);
		// don't want dots overlapping axis, so add in buffer to data domain
		xScale.domain([d3.min(data, xValue) - 1, d3.max(data, xValue) + 1]);
		yScale.domain([d3.min(data, yValue) - 1, d3.max(data, yValue) + 1]);

		// draw dots
		svg.selectAll(".dot")
			.data(data)
			.enter().append("circle")
			.attr("class", "dot")
			.attr("r", 3.5)
			.attr("cx", xMap)
			.attr("cy", yMap)
			.style("fill", function(d) {
				return (d.x === 0 || d.y === 0) ? "lightgrey" : "blue";
			})
			.on("mouseover", function(d) {
				tooltip.transition()
					.duration(200)
					.style("opacity", .9);
				tooltip.html("<br/> (Date: " + d.date + ", IDE Activity: " + xValue(d) + " mins, PushCount: " + yValue(d) + ")")
					.style("left", (d3.event.pageX + 5) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
			})
			.on("mouseout", function(d) {
				tooltip.transition()
					.duration(500)
					.style("opacity", 0);
			});

		// x-axis
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.append("text")
			.attr("class", "label")
			.attr("x", width)
			.attr("y", -6)
			.style("text-anchor", "end")
			.text("IDE Activity In Minutes");

		// y-axis
		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("class", "label")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Push Count");
	};
	_plotGraph();
};