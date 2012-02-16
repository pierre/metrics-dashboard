/*
 * Convert a JS Date object to an ISO String
 *
 * @param {Date}  d   The Date object to convert
 */
function ISODateString(d) {
     function pad(n){
         return n < 10 ? '0' + n : n
     }

     return d.getUTCFullYear() + '-'
             + pad(d.getUTCMonth() + 1) + '-'
             + pad(d.getUTCDate()) + 'T'
             + pad(d.getUTCHours()) + ':'
             + pad(d.getUTCMinutes()) + ':'
             + pad(d.getUTCSeconds()) + 'Z'
}

/*
 * Find a query parameter value in a query string
 *
 * @param {String}  name    The query parameter name to look for
 * @param {String}  query   The query parameters string
 */
function getParameterByName(name, query) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(query);

    if (results == null) {
        return null;
    } else {
        return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}

/*
 * Add milliseconds to a date
 *
 * @param {Date}    date            The original date
 * @param {Integer} milliseconds    The number of milliseconds to add
 */
function addMillis(date, milliseconds) {
    date.setTime(date.getTime() + milliseconds);
}

/*
 * Substract milliseconds to a date
 *
 * @param {Date}    date            The original date
 * @param {Integer} milliseconds    The number of milliseconds to substract
 */
function removeMillis(date, milliseconds) {
    date.setTime(date.getTime() - milliseconds);
}