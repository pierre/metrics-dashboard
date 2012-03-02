/*
 * Initialize the whole UI
 */
function initializeUI() {
    // See http://bugs.jquery.com/ticket/8338 - this is required for the Ajax feedback functions
    jQuery.ajaxPrefilter(function(options) {
        options.global = true;
    });

    // Global variables
    window.jansky = {
        // The actual data
        timeseries: [],
        // Scale factors for all graphs (i.e. mapping between graph number and scale factor)
        scales: {},
        // When reading a permalink, this variable tells us how many graphs have to be retrieved - this is used for the progress bar
        permalink_loads: 0,
        // When reading a permalink, this variable tells us how many graphs have been retrieved already - this is used for the progress bar
        permalink_loads_done: 0,
        // The actual graph object
        graph: null,
        // Settings for the graph, as defined by the left "Rendering" buttons
        graph_settings: {
            interpolation: 'cardinal',
            offset: 'zero',
            renderer: 'line'
        },
        // Permalink temporary data for the graphs.
        graph_permalink: [],
        // The graph palette, used to generate the colors for the different graphs
        graph_palette: new Rickshaw.Color.Palette({ scheme: 'colorwheel' }),
        // Global lock used to serialize the rendering of graphs
        graph_lock: 0
    };

    // Hide the progress bar (used when loading permalinks)
    $('#loadingDiv').hide();

    // Setup the error messages alert for Ajax calls
    $('#errorDiv')
        .hide()  // hide it initially
        .ajaxError(function(event, jqXHR, settings) {var message;
            if (jqXHR.status === 0) {
                message = 'Unable to connect to the remote host.';
            } else if (jqXHR.status == 404) {
                message = 'Requested resource not found [404].';
            } else if (jqXHR.status == 500) {
                message = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                message = 'Unable to parse the JSON response.';
            } else if (exception === 'timeout') {
                message = 'Connection timeout.';
            } else if (exception === 'abort') {
                message = 'Ajax request aborted.';
            } else {
                message = 'Uncaught Error. ' + jqXHR.responseText;
            }

            $(this).show();
            $(this).append("<p>Error requesting " + settings.url + ". " + message + "<p>");
            event.preventDefault();
        });
}