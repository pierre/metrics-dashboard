// PUBLIC API

/*
 * Perform an asynchronous call to a remote server to retrieve data points and update the graphs.
 * A new graph is created if it doesn't exist.
 * This will:
 * + stop the current periodic refreshes
 * + get new data from the server
 * + refresh the graph
 * + restart the periodic refreshes
 *
 * @param {String}  uri             The server URI, e.g. http://127.0.0.1:8080
 * @param {String}  callback        The callback function to parse the data. This callback must return by calling createOrUpdateGraph(data)
 */
function getDataAndCreateOrUpdateGraph(uri, callback) {
    // Take the lock - it will be released once the data is retrieved and rendered (see createOrUpdateGraph)
    if (window.jansky.graph_lock > 0) {
        setTimeout(function() {
            console.log("Waiting on lock - consider increasing the delay between refreshes");
            getDataAndCreateOrUpdateGraph(uri, callback);
        }, 1000);
        return;
    }
    window.jansky.graph_lock = 1;
    console.log("Graph lock acquired");

    // Update the permalink
    // TODO
    //addGraphToPermalink(kind, scale)

    // Populate the data
    $.ajax({
        url: uri,
        dataType: "jsonp",
        cache : false,
        jsonp : "callback",
        jsonpCallback: callback
    });
}

/*
 * Data has been received from the server and parsed by the application. We're ready to render it.
 *
 * @param {Array}       data    Data (in the form [{x:, y:}, {}, ...]) sent from the server
 */
function createOrUpdateGraph(data) {
    if (data.length == 0) {
        console.log("Got no data from the server!");
        exitFromCallback();
        return;
    }

    try {
        if (window.jansky.timeseries.length == 0) {
            // TODO - legend?
            console.log("Adding new graph");
            addGraph(data, 'TODO-leged');
        } else {
            // TODO - graph number?
            var graphNb = 0
            console.log("Refreshing graph nb " + graphNb);
            refreshGraph(data, graphNb);
        }
    } catch (e) {
        console.log("Error rending graph: " + e);
    }

    exitFromCallback();
}

function exitFromCallback() {
    // Update the progress bar
    window.jansky.permalink_loads_done++;
    var load_pct = window.jansky.permalink_loads_done * (100/window.jansky.permalink_loads);
    $('#loadingBar').css('width', load_pct + '%');
    // Hide the progress bar when we're done
    if (load_pct >= 99) {
        $('#loadingDiv').hide();
    }

    // Release the lock (acquired before calling the collector)
    window.jansky.graph_lock = 0;
    console.log("Graph lock released");
}