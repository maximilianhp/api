window.charts = window.charts || {};

var addUnits = function(svg, units, graphHeight) {
    if (units !== undefined) {
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", 55)
            .attr("y", 4)
            .attr('class', 'overlay')
            .text(units);
    }
}


var addYaxis = function(svg, yAxis){
    svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis)
            .style("filter", "url(#overlay-shadow)");
}

var createOverlayDropshadow = function(svg){
    var filter = svg.append("svg:defs")
            .append("filter")
            .attr("x", "-10%")
            .attr("y", "-100%")
            .attr("id", "overlay-shadow")
            .attr("height", "200%")
            .attr("width", "180%");

        var comptransf = filter.append("feComponentTransfer");
        comptransf.append("feFuncA")
            .attr("type", "linear")
            .attr("slope", "0.5")
        comptransf.append("feFuncR")
            .attr("type", "linear")
            .attr("slope", "0")
        comptransf.append("feFuncG")
            .attr("type", "linear")
            .attr("slope", "0")
        comptransf.append("feFuncB")
            .attr("type", "linear")
            .attr("slope", "0")

        var blur = filter.append("feGaussianBlur")
            .attr("stdDeviation", 0);
        blur.transition().delay(5000).attr("stdDeviation", 4);

        var feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode");
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");
}

var addNowLine = function(svg, x, graphHeight) {
    var lineFunction = d3.svg.line()
        .x(function(d) {
            return d.x;
        })
        .y(function(d) {
            return d.y;
        })
        .interpolate('linear');

    var now = Date.now();
    var xGraphNowLocation = x(now);
    console.log(xGraphNowLocation);

    var lineData = [{
        x: xGraphNowLocation,
        y: 5
    }, {
        x: xGraphNowLocation,
        y: graphHeight - 5
    }];

    var lineGraph = svg.append('path')
        .attr('d', lineFunction(lineData))
        .attr('stroke', 'rgba(255, 255, 255, 0.8')
        .attr('stroke-dasharray', [5, 5])
        .attr('stroke-width', 1)
        .attr('fill', 'none')
        .style("filter", "url(#overlay-shadow)");

    var nowLabel = svg.append('text')
        .attr('text-anchor', 'end')
        .attr('x', xGraphNowLocation - 3)
        .attr('y', 12)
        .attr('class', 'overlay')
        .text('now');
};

var addGradients = function(svg){
    var gradient = svg.append("svg:defs")
            .append("svg:linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%")
            .attr("spreadMethod", "reflect");

        gradient.append("svg:stop")
            .attr("offset", "5%")
            .attr("stop-color", "#fff")
            .attr("stop-opacity", 0.8);

        gradient.append("svg:stop")
            .attr("offset", "100%")
            .attr("stop-color", "#fff")
            .attr("stop-opacity", 0.4);

        var gradient_highlight = svg.append("svg:defs")
            .append("svg:linearGradient")
            .attr("id", "gradient_highlight")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%")
            .attr("spreadMethod", "reflect");

        gradient_highlight.append("svg:stop")
            .attr("offset", "5%")
            .attr("stop-color", "#fff")
            .attr("stop-opacity", 0.9);

        gradient_highlight.append("svg:stop")
            .attr("offset", "100%")
            .attr("stop-color", "#fff")
            .attr("stop-opacity", 0.7);
}

var addFilter = function(svg){
    var filter = svg.append("svg:defs")
            .append("filter")
            .attr("x", "-70%")
            .attr("y", "-300%")
            .attr("id", "drop-shadow")
            .attr("height", "500%")
            .attr("width", "380%");

        var comptransf = filter.append("feComponentTransfer");
        comptransf.append("feFuncA")
            .attr("type", "linear")
            .attr("slope", "10.7")
        comptransf.append("feFuncR")
            .attr("type", "linear")
            .attr("slope", "-10.7")
        comptransf.append("feFuncG")
            .attr("type", "linear")
            .attr("slope", "0")
        comptransf.append("feFuncB")
            .attr("type", "linear")
            .attr("slope", "0")

        var blur = filter.append("feGaussianBlur")
            .attr("stdDeviation", 0);
        blur.transition().delay(1500).attr("stdDeviation", 5);

        var feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode");
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");
}

var setStartToCollapsed = function(chart, xScale, height, xWidth){
    chart.attr('x', function(d) {
            return xScale(new Date(d.date));
        })
    .attr('y', height)
    .attr('width', xWidth)
    .attr('height', 0);
}

var addAnimation = function(bars){
    var result  = bars.transition('grow-in')
            .delay(
                function(d, i) {
                    return i * 130 + 30;
                })
            .ease('cubic')
            .duration(240);
    return result;
}

var setBarHeightUsingData = function(bars, yScale, innerGraphHeight){
    var result = bars.attr('height', function(dataPoint) {
        return innerGraphHeight - yScale(dataPoint.value);
    })
    .attr('y', function(dataPoint) {
        return innerGraphHeight - (innerGraphHeight - yScale(dataPoint.value));
    });

    return result;
}

var addXaxis = function(svg, xAxis, innerGraphHeight){
    svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0, ' + (innerGraphHeight) + ')')
            .call(xAxis);
}

var calculateBarWidth = function(x){
    var now = new Date(moment());
    var oneDayAgo = new Date(moment().subtract('days', 1));
    var from = x(oneDayAgo);
    var to = x(now);
    var result = to - from;
    return result;
}

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

var selectedBar;
var renderSelected = function(bar){
    bar         .style('filter', 'url(#drop-shadow)')
                .style("stroke", null)
                .style('stroke-width', '3px')
                .style('fill', 'url(#gradient_highlight)')
                .style('background-color', 'rgba(0, 0, 0, 0.22)');
    bar.moveToFront();
}

charts.plotBarChart = function(divId, events, fromTime, tillTime, units) {
    events = _.sortBy(events, function(e) {
        return e.date;
    })
    setTimeout(function() {
        $(divId).empty();
        var margin = {
            top: 20,
            right: 0,
            bottom: 0,
            left: 0
        };
        var width = window.innerWidth;
        var height = width / 1.61;
        var weekAgo = new Date(moment().subtract('days', 22).format("MM/DD/YYYY"));
        var tomorrow = new Date(moment().add('day', 1).format("MM/DD/YYYY"));

        var x = d3.time.scale()
            .domain([weekAgo, tomorrow])
            .rangeRound([0, width - margin.left - margin.right]);
            

        var xWidth = calculateBarWidth(x);

        var maxDataValue = d3.max(events, function(d) {
            return d.value;
        });

        var innerGraphHeight = height - margin.top - margin.bottom;

        var y = d3.scale.linear()
            .domain([0, maxDataValue])
            .range([innerGraphHeight, 0])
            .nice(4);

        var xAxis = d3.svg.axis()
            .scale(x);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('right')
            .ticks(5);

        var svg = d3.select(divId).append('svg')
            .attr('class', 'chart')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('id', 'bars')
            .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
        
        addGradients(svg);
        addFilter(svg);

        var chart = svg.selectAll('.chart');

        var bars = chart.data(events)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .on("click", function(clickedBar) {
                var oldSelection = selectedBar;
                if(oldSelection !== undefined){
                    oldSelection.transition()
                    .style('filter', 'none')
                    .style('stroke', null)
                    .style('stroke-width', '0px')
                    .style('fill', 'url(#gradient)');
                }

                selectedBar = d3.select(this);
                renderSelected(selectedBar);
            });

        bars.style("fill", "url(#gradient)");
        setStartToCollapsed(bars, x, height, xWidth);
        bars = addAnimation(bars);
        bars = setBarHeightUsingData(bars, y, innerGraphHeight);
        
        var lastBar = d3.selectAll('.bar').filter(':last-of-type');
        renderSelected(lastBar);
        
        addYaxis(svg, yAxis);
        addXaxis(svg, xAxis, innerGraphHeight);
        createOverlayDropshadow(svg);
        addNowLine(svg, x, innerGraphHeight);
        addUnits(svg, units, innerGraphHeight);

        var getDatesForEvents = function() {
            return _.map(events, function(event) {
                return moment(event.date);
            });
        };

        var getLatestDataPointDate = function() {
            var datesForDataPoints = getDatesForEvents();
            return new Date(Math.max.apply(null, datesForDataPoints));
        };

        var getDataPointDescription = function(eventValue) {
            //get the operation
            var operation_string = operation.split('('),
                operation_type = operation_string[0],
                value_unit = "";

            if ("count" !== operation_type) {
                value_unit = operation_string[1].slice(0, -1).replace(/-/g, " ");
            }

            if ("duration" === value_unit) {
                var str = humanizeDuration(eventValue * 1000, {
                    units: ["hours", "minutes", "seconds"]
                })
                var ind = str.length;
                if (str.search("milli") > 0 && str.lastIndexOf(',') > 0) {
                    ind = str.lastIndexOf(',');
                }
                return str.substring(0, ind);
            } else {
                return parseFloat(eventValue).toFixed(1) + "  " + value_unit;
            }
        };

    }, 1000);
};