/*
 * Initialize the whole UI
 */
function initializeUI() {
    // Hide the progress bar (used when loading permalinks)
    $('#loadingDiv').hide();

    // Setup the error messages alert for Ajax calls
    $('#errorDiv')
        .hide()  // hide it initially
        .ajaxError(function(event, request, settings) {
            $(this).show();
            $(this).append("<p>Error requesting " + settings.url + ", error is:" + request.responseText + "<p>");
            event.preventDefault();
        });
}