/*
 * Refresh an existing graph
 *
 * @param {Array}       data    Data (in the form [{x:, y:}, {}, ...]) sent from the server (assumed ordered)
 * @param {Integer}     graphNb Graph number
 */
function refreshGraph(data, graphNb) {
    var currentSeries = window.jansky.timeseries[graphNb].data;

    // Find an eventual overlap
    var firstOverlappingPoint = -1;
    for (var i = 0; i < currentSeries.length; i++) {
        if (currentSeries[i].x >= data[0].x) {
            firstOverlappingPoint = i;
            break;
        }
    }

    // Remove overlapping data points - use the new ones instead
    if (firstOverlappingPoint >= 0) {
        currentSeries.splice(firstOverlappingPoint, currentSeries.length - firstOverlappingPoint);
    }

    // Concat the non-overlapping series
    var newSeries = currentSeries.concat(data);

    // Make a moving window by dropping data points if needed
    var to = newSeries[newSeries.length - 1].x;
    var from = newSeries[0].x;
    // TODO: how to configure?
    var delta = 60;
    var toDelete = 0;
    for (var i = 0; i < newSeries.length; i++) {
        if (newSeries[i].x > to - delta) {
            break;
        }
        toDelete++;
    }
    newSeries.splice(0, toDelete);

    if (newSeries.length > 0) {
        // Store the new data points and update the graph
        console.log("Updating graph with " + newSeries.length + " data points");
        window.jansky.timeseries[graphNb].data = newSeries;
    }
    window.jansky.graph.update();
}

/*
 * Create and render a new graph
 *
 * @param {Array}  data     Data (in the form [{x:, y:}, {}, ...]) sent from the server
 */
function addGraph(data, legend) {
    // Store the new time series
    window.jansky.timeseries.push(
        {
            color: window.jansky.graph_palette.color(),
            data: data,
            name: legend
        }
    );

    // Make sure all time series have the same number of data points
    Rickshaw.Series.zeroFill(window.jansky.timeseries);

    // Draw all graphs
    redrawGraphs();
}

/*
 * D3.js magic
 *
 * The data is expected to be stored into window.jansky.timeseries and the graph settings into window.jansky.graph_settings.
 * The graph object will be stored into window.jansky.graph.
 */
function redrawGraphs() {
    console.log("Redrawing the entire Graph");

    $("#chart").children().remove();
    $("#legend").children().remove();
    $("#y_axis").children().remove();
    // Don't clear the slider!

    var graph = new Rickshaw.Graph({
        element: document.getElementById("chart"),
        width: ($('#chart_container').width() - $('#y_axis').width()) * 0.95,
        height: 500,
        renderer: 'line',
        series: window.jansky.timeseries
    });
    graph.render();

    var hoverDetail = new Rickshaw.Graph.HoverDetail({
        graph: graph
    });

    var legend = new Rickshaw.Graph.Legend({
        width: $('#legend_container').width() * 0.95,
        graph: graph,
        element: document.getElementById('legend')
    });

    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
        graph: graph,
        legend: legend
    });

    var axes = new Rickshaw.Graph.Axis.Time({
        graph: graph
    });
    axes.render();

    var yAxis = new Rickshaw.Graph.Axis.Y({
        graph: graph,
        orientation: 'left',
        element: document.getElementById('y_axis'),
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        ticksTreatment: 'glow'
    });
    yAxis.render();

    var slider = new Rickshaw.Graph.RangeSlider({
        graph: graph,
        // Note: document.getElementById won't work here
        element: $('#slider')
    });

    var smoother = new Rickshaw.Graph.Smoother({
        graph: graph,
        element: document.getElementById('smoother')
    });

    var controls = new RenderControls( {
        element: document.getElementById('side_panel'),
        graph: graph
    });

    updateGraphSettings(graph, window.jansky.graph_settings);

    window.jansky.graph = graph;
}

// The following is inspired from http://shutterstock.github.com/rickshaw/examples/js/extensions.js

function updateGraphSettings(graph, settings) {
    graph.setRenderer(settings.renderer);
    graph.interpolation = settings.interpolation;

    if (settings.offset == 'value') {
        graph.renderer.unstack = true;
        graph.offset = 'zero';
    } else {
        graph.renderer.unstack = false;
        graph.offset = settings.offset;
    }
    graph.render();
}

var RenderControls = function(args) {

    this.initialize = function() {
        this.element = args.element;
        this.graph = args.graph;
        this.settings = this.serialize();

        this.inputs = {
            renderer: this.element.elements.renderer,
            interpolation: this.element.elements.interpolation,
            offset: this.element.elements.offset
        };

        this.element.addEventListener('change', function(e) {
            this.settings = this.serialize();

            if (e.target.name == 'renderer') {
                this.setDefaultOffset(e.target.value);
            }

            this.syncOptions();
            this.settings = this.serialize();

            // Update the global settings for the permalink
            window.jansky.graph_settings = this.settings;

            updateGraphSettings(this.graph, this.settings);
        }.bind(this), false);
    }

    this.serialize = function() {
        var values = {};
        var pairs = $(this.element).serializeArray();

        pairs.forEach(function(pair) {
            values[pair.name] = pair.value;
        });

        return values;
    };

    this.syncOptions = function() {
        var options = this.rendererOptions[this.settings.renderer];

        Array.prototype.forEach.call(this.inputs.interpolation, function(input) {
            if (options.interpolation) {
                input.disabled = false;
                input.parentNode.classList.remove('disabled');
            } else {
                input.disabled = true;
                input.parentNode.classList.add('disabled');
            }
        });

        Array.prototype.forEach.call(this.inputs.offset, function(input) {
            if (options.offset.filter(function(o) { return o == input.value }).length) {
                input.disabled = false;
                input.parentNode.classList.remove('disabled');

            } else {
                input.disabled = true;
                input.parentNode.classList.add('disabled');
            }
        }.bind(this));

    };

    this.setDefaultOffset = function(renderer) {
        var options = this.rendererOptions[renderer]; 

        if (options.defaults && options.defaults.offset) {
            Array.prototype.forEach.call(this.inputs.offset, function(input) {
                if (input.value == options.defaults.offset) {
                    input.checked = true;
                } else {
                    input.checked = false;
                }
            }.bind(this));
        }
    };

    this.rendererOptions = {
        area: {
            interpolation: true,
            offset: ['zero', 'wiggle', 'expand', 'value'],
            defaults: { offset: 'value' }
        },
        line: {
            interpolation: true,
            offset: ['expand', 'value'],
            defaults: { offset: 'value' }
        },
        bar: {
            interpolation: false,
            offset: ['zero', 'wiggle', 'expand', 'value'],
            defaults: { offset: 'value' }
        },
        scatterplot: {
            interpolation: false,
            offset: ['value'],
            defaults: { offset: 'value' }
        }
    };

    this.initialize();
};