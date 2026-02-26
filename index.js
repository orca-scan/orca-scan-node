/* eslint-disable prefer-rest-params */
var fetch = require('node-fetch');

/**
 * Orca Scan node client
 * Simple ES5 SDK that mirrors the rest api structure using namespaces
 * 
 * @param {string} apiKey - your orca scan api key
 * @param {object} [options] - optional configuration
 * @param {string} [options.endpoint] - override api base url defaults to https://api.orcascan.com/v1
 * @param {number} [options.timeoutMs] - request timeout in milliseconds defaults to 30000
 * @param {number} [options.maxRetries] - retries on 429 503 and 5xx defaults to 3
 * @returns {object} instance with sheets, rows, fields, history, users, and hooks namespaces
 * 
 * @description
 * API rate limit: 15 requests per second
 * Automatic retry on 429 (Too Many Requests), 503 (Service Unavailable), and 5xx errors
 * Retry delay respects the Retry-After header
 */
function OrcaScanNode(apiKey, options) {
    
    if (!apiKey) throw new Error('apiKey is required');
    if (typeof apiKey !== 'string') throw new Error('apiKey must be a string');

    options = options || {};

    this.endpoint = options.endpoint || 'https://api.orcascan.com/v1';
    this.timeoutMs = typeof options.timeoutMs === 'number' ? options.timeoutMs : 30000;
    this.maxRetries = typeof options.maxRetries === 'number' ? options.maxRetries : 3;
    this.defaultHeaders = {
        'Authorization': 'Bearer ' + apiKey,
        'Accept': 'application/json'
    };

    /* ---------------- public namespaces only ---------------- */

    var self = this;

    self.settings = {
        /**
         * get sheet settings
         * @param {string} sheetId - target sheet id
         * @returns {Promise<object>} promise resolving to result
         *   {object} data - sheet settings
         *   {boolean} data.allowPublicExport - allow public export
         *   {string} data.publicExportUrl - public export url
         *   {boolean} data.allowPublicEntry - allow public entry
         *   {string} data.publicEntryUrl - public entry url
         *   {boolean} data.allowWebHookIn - allow webhook in
         *   {string} data.webHookInUrl - webhook in url
         *   {string} data.lookupUrl - lookup url
         *   {string} data.validationUrl - validation url
         *   {string} data.webHookOutUrl - webhook out url
         *   {string} data.secret - secret
         */
        get: function (sheetId) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');

            return request.call(self, 'GET', '/sheets/' + encodeURIComponent(sheetId) + '/settings');
        },

        /**
         * update sheet settings
         * @param {string} sheetId - target sheet id
         * @param {object} settings - sheet settings
         * @param {boolean} settings.allowPublicExport - allow public export
         * @param {boolean} settings.allowPublicEntry - allow public entry
         * @param {boolean} settings.allowWebHookIn - allow webhook in
         * @param {string} settings.lookupUrl - lookup url
         * @param {string} settings.validationUrl - validation url
         * @param {string} settings.webHookOutUrl - webhook out url
         * @returns {Promise<object>} promise resolving to result
         */
        update: function (sheetId, settings) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');

            return request.call(self, 'PUT', '/sheets/' + encodeURIComponent(sheetId) + '/settings', null, settings);
        },
    }

    /**
     * sheets namespace
     * @returns {object} sheet methods
     */
    self.sheets = {

        /**
         * Get a list of sheets
         * @returns {Promise<object>} Promise resolving to an array of sheet objects, each containing:
         *   {array} data - list of sheet objects
         *   {string} data[]._id - Sheet ID
         *   {string} data[].name - Sheet name
         *   {boolean} data[].isOwner - Indicates if the user is the owner
         *   {boolean} data[].canAdmin - Indicates if the user can administer the sheet
         *   {boolean} data[].canUpdate - Indicates if the user can update the sheet
         *   {boolean} data[].canDelete - Indicates if the user can delete the sheet
         *   {boolean} data[].canExport - Indicates if the user can export the sheet
         */
        list: function () {
            return request.call(self, 'GET', '/sheets');
        },

        /**
         * Create a sheet
         * @param {object} payload - sheet input
         * @param {string} payload.name - sheet name
         * @param {string} [payload.templateName] - optional template name
         * @returns {Promise<object>} promise resolving to result
         *   {object} data - created sheet
         *   {string} data._id - sheet id
         *   {string} data.name - sheet name
         *   {number} data.rows - number of rows
         */
        create: function (payload) {
            if (!payload || typeof payload !== 'object') throw new Error('payload is required and must be an object');
            if (!payload.name || typeof payload.name !== 'string') throw new Error('payload.name is required and must be a string');

            return request.call(self, 'POST', '/sheets', null, payload);
        },

        /**
         * clear all rows in a sheet
         * @param {string} sheetId - target sheet id
         * @returns {Promise<object>} promise resolving to result
         *   {object|null} data - api response or null
         */
        clear: function (sheetId) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');

            return request.call(self, 'PUT', '/sheets/' + encodeURIComponent(sheetId) + '/clear');
        },

        /**
         * rename a sheet
         * @param {string} sheetId - target sheet id
         * @param {object} payload - rename input
         * @param {string} payload.name - new sheet name
         * @param {string} [payload.description] - optional description
         * @returns {Promise<object>} promise resolving to result
         *   {object|null} data - api response or null
         */
        rename: function (sheetId, payload) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!payload || typeof payload !== 'object') throw new Error('payload is required and must be an object');
            if (!payload.name || typeof payload.name !== 'string') throw new Error('payload.name is required and must be a string');

            return request.call(self, 'PUT', '/sheets/' + encodeURIComponent(sheetId) + '/rename', null, payload);
        },

        /**
         * delete a sheet
         * @param {string} sheetId - target sheet id
         * @returns {Promise<object>} promise resolving to result
         *   {object|null} data - api response or null
         */
        delete: function (sheetId) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');

            return request.call(self, 'DELETE', '/sheets/' + encodeURIComponent(sheetId));
        }
    };

    /**
     * rows namespace
     * @returns {object} row methods
     */
    self.rows = {

        /**
         * get all rows in a sheet
         * @param {string} sheetId - target sheet id
         * @param {object} [options] - optional call options
         * @param {boolean} [options.withTitle=false] - if true, returns field titles rather than keys
         * @returns {Promise<object>} promise resolving to result
         *   {array} data - list of row objects with arbitrary properties
         */
        list: function (sheetId, options) {
            if (!sheetId || typeof sheetId !== 'string') {
                throw new Error('sheetId is required and must be a string');
            }

            options = options || {};
            var query = {};

            if (options && options.withTitle === true) {
                query.withTitles = true;
            }

            return request.call(self, 'GET', '/sheets/' + encodeURIComponent(sheetId) + '/rows', query);
        },

        /**
         * get a single row
         * @param {string} sheetId - target sheet id
         * @param {string} rowId - row id
         * @param {object} [options] - optional call options
         * @param {boolean} [options.withTitle=false] - if true, returns field titles rather than keys
         * @returns {Promise<object>} promise resolving to result
         *   {object} data - row object with arbitrary properties
         */
        get: function (sheetId, rowId, options) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!rowId || typeof rowId !== 'string') throw new Error('rowId is required and must be a string');

            options = options || {};
            var query = {};

            if (options && options.withTitle === true) {
                query.withTitles = true;
            }

            return request.call(self, 'GET', '/sheets/' + encodeURIComponent(sheetId) + '/rows/' + encodeURIComponent(rowId), query);
        },

        /**
         * add one row or many rows
         * @param {string} sheetId - target sheet id
         * @param {object|array} data - row object or array of row objects supports special fields such as photo or attachment as base64
         * @param {object} [options] - optional call options
         * @param {boolean} [options.withTitle=false] - if true, returns field titles rather than keys
         * @returns {Promise<object>} promise resolving to result
         *   {object|array} data - created row or list of created rows with server assigned fields
         * 
         * @description
         * Photo fields support: .jpg, .png, .gif, .bmp, .webp, .tiff, .svg
         * Attachment fields support: .doc, .docx, .csv, .txt, .ppt, .pptx, .pdf, .xls, .xlsx, .mp4
         * Files should be provided as base64 strings
         */
        add: function (sheetId, data, options) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (typeof data !== 'object' || data === null) throw new Error('data is required and must be an object or array');

            options = options || {};
            var query = {};

            if (options && options.withTitle === true) {
                query.withTitles = true;
            }

            return request.call(self, 'POST', '/sheets/' + encodeURIComponent(sheetId) + '/rows', query, data);
        },

        /**
         * update a single row
         * @param {string} sheetId - target sheet id
         * @param {string} rowId - row id
         * @param {object} data - fields to update
         * @param {object} [options] - optional call options
         * @param {boolean} [options.withTitle=false] - if true, returns field titles rather than keys
         * @returns {Promise<object>} promise resolving to result
         *   {object} data - updated row with arbitrary properties
         */
        updateOne: function (sheetId, rowId, data, options) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!rowId || typeof rowId !== 'string') throw new Error('rowId is required and must be a string');
            if (!data || typeof data !== 'object') throw new Error('data is required and must be an object');

            options = options || {};
            var query = {};

            if (options && options.withTitle === true) {
                query.withTitles = true;
            }

            return request.call(self, 'PUT', '/sheets/' + encodeURIComponent(sheetId) + '/rows/' + encodeURIComponent(rowId), query, data);
        },

        /**
         * update many rows
         * @param {string} sheetId - target sheet id
         * @param {array} rows - array of row objects
         * @param {object} [options] - optional call options
         * @param {boolean} [options.withTitle=false] - if true, returns field titles rather than keys
         * @param {boolean} [options.partial=false] - if true, update only changed fields while all other fields remain intact
         * @returns {Promise<object>} promise resolving to result
         *   {array} data - updated rows
         */
        updateMany: function (sheetId, rows, options) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!rows || Object.prototype.toString.call(rows) !== '[object Array]') throw new Error('rows is required and must be an array of objects');

            options = options || {};
            var query = {};

            if (options && options.withTitle === true) {
                query.withTitles = true;
            }

            if (options && options.partial === true) {
                query.partial = true;
            }

            return request.call(self, 'PUT', '/sheets/' + encodeURIComponent(sheetId) + '/rows', query, rows);
        },

        /**
         * delete a single row
         * @param {string} sheetId - target sheet id
         * @param {string} rowId - row id
         * @returns {Promise<object>} promise resolving to result
         *   {object|null} data - api response or null
         */
        deleteOne: function (sheetId, rowId) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!rowId || typeof rowId !== 'string') throw new Error('rowId is required and must be a string');

            return request.call(self, 'DELETE', '/sheets/' + encodeURIComponent(sheetId) + '/rows/' + encodeURIComponent(rowId));
        },

        /**
         * delete many rows
         * @param {string} sheetId - target sheet id
         * @param {array} rowIds - array of row id strings
         * @returns {Promise<object>} promise resolving to result
         *   {object|null} data - api response or null
         */
        deleteMany: function (sheetId, rowIds) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!rowIds || Object.prototype.toString.call(rowIds) !== '[object Array]') throw new Error('rowIds is required and must be an array of strings');

            return request.call(self, 'DELETE', '/sheets/' + encodeURIComponent(sheetId) + '/rows', null, rowIds);
        },

        /**
         * get the total number of rows in a sheet
         *
         * @param {string} sheetId - target sheet id
         * @returns {Promise<object>} promise resolving to result
         *   {object} data - count result
         *   {number} data.count - total number of rows
         *
         * @example
         * // get total number of rows in a sheet
         * orca.rows.count('SHEET_ID')
         *     .then(function (result) {
         *         // result.data.count contains the total number of rows
         *         console.log('Total rows:', result.data.count);
         *     })
         *     .catch(function (err) {
         *         // handle error
         *         console.error(err);
         *     });
         */
        count: function (sheetId) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');

            return request.call(self, 'GET', '/sheets/' + encodeURIComponent(sheetId) + '/rows/count');
        }
    };

    /**
     * fields namespace
     * @returns {object} field methods
     */
    self.fields = {

        /**
         * Get a list of fields in a sheet
         * @param {string} sheetId - target sheet id
         * @returns {Promise<object>} promise resolving to result
         *   {array} data - list of fields
         *   {string} data[].key - field key
         *   {string} data[].label - field label
         *   {string} data[].type - field type (string, integer, datetime, photo, attachment, uniqueId, barcode, location, signature, checkbox, select, multiselect, number, email, phone, url, date, time)
         *   {boolean} data[].required - is required
         *   {string} data[].placeholder - guidance text when field is empty
         *   {boolean} data[].autofocus - if true, UI auto selects this field first
         *   {boolean} data[].autoselect - if true, existing text is highlighted on focus
         *   {boolean} data[].emptyOnEdit - if true, value is cleared when record edited
         *   {boolean} data[].emptyOnScan - if true, existing value is removed on scan
         *   {boolean} data[].hiddenMobile - if true, field is hidden on mobile
         *   {boolean} data[].hiddenWeb - if true, field is hidden on web
         *   {boolean} data[].readonlyWeb - if true, field is read-only on web
         *   {boolean} data[].readonlyMobile - if true, field is read-only on mobile
         *   {boolean} data[].useInMobileSearch - if true, field is searchable in mobile list
         *   {boolean} data[].useValueInList - if true, field is visible in mobile list
         */
        list: function (sheetId) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');

            return request.call(self, 'GET', '/sheets/' + encodeURIComponent(sheetId) + '/fields');
        },

        /**
         * Get a single field by key
         * @param {string} sheetId - target sheet id
         * @param {string} fieldKey - field key
         * @returns {Promise<object>} promise resolving to result
         *   {object} data - field object with all properties
         */
        get: function (sheetId, fieldKey) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!fieldKey || typeof fieldKey !== 'string') throw new Error('fieldKey is required and must be a string');

            return request.call(self, 'GET', '/sheets/' + encodeURIComponent(sheetId) + '/fields/' + encodeURIComponent(fieldKey));
        },

        /**
         * Create a new field in a sheet
         * @param {string} sheetId - target sheet id
         * @param {object} payload - field definition
         * @param {string} payload.label - field label (display name)
         * @param {string} payload.format - field format (text, date time, etc)
         * @param {boolean} [payload.required=false] - is field required
         * @param {string} [payload.placeholder] - guidance text when field is empty
         * @param {boolean} [payload.autofocus=false] - if true, UI auto selects this field first
         * @param {boolean} [payload.autoselect=false] - if true, existing text is highlighted on focus
         * @param {boolean} [payload.emptyOnEdit=false] - if true, value is cleared when record edited
         * @param {boolean} [payload.emptyOnScan=false] - if true, existing value is removed on scan
         * @param {boolean} [payload.hiddenMobile=false] - if true, field is hidden on mobile
         * @param {boolean} [payload.hiddenWeb=false] - if true, field is hidden on web
         * @param {boolean} [payload.readonlyWeb=false] - if true, field is read-only on web
         * @param {boolean} [payload.readonlyMobile=false] - if true, field is read-only on mobile
         * @param {boolean} [payload.useInMobileSearch=true] - if true, field is searchable in mobile list
         * @param {boolean} [payload.useValueInList=true] - if true, field is visible in mobile list
         * @returns {Promise<object>} promise resolving to result
         *   {object} data - created field with all properties
         */
        create: function (sheetId, payload) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!payload || typeof payload !== 'object') throw new Error('payload is required and must be an object');
            if (!payload.label || typeof payload.label !== 'string') throw new Error('payload.label is required and must be a string');
            if (!payload.format || typeof payload.format !== 'string') throw new Error('payload.format is required and must be a string');

            return request.call(self, 'POST', '/sheets/' + encodeURIComponent(sheetId) + '/fields', null, payload);
        },

        /**
         * Update an existing field in a sheet
         * @param {string} sheetId - target sheet id
         * @param {string} fieldKey - field key to update
         * @param {object} payload - field update data
         * @param {string} [payload.label] - new field label
         * @param {string} [payload.type] - new field type
         * @param {boolean} [payload.required] - is field required
         * @param {string} [payload.placeholder] - guidance text when field is empty
         * @param {boolean} [payload.autofocus] - if true, UI auto selects this field first
         * @param {boolean} [payload.autoselect] - if true, existing text is highlighted on focus
         * @param {boolean} [payload.emptyOnEdit] - if true, value is cleared when record edited
         * @param {boolean} [payload.emptyOnScan] - if true, existing value is removed on scan
         * @param {boolean} [payload.hiddenMobile] - if true, field is hidden on mobile
         * @param {boolean} [payload.hiddenWeb] - if true, field is hidden on web
         * @param {boolean} [payload.readonlyWeb] - if true, field is read-only on web
         * @param {boolean} [payload.readonlyMobile] - if true, field is read-only on mobile
         * @param {boolean} [payload.useInMobileSearch] - if true, field is searchable in mobile list
         * @param {boolean} [payload.useValueInList] - if true, field is visible in mobile list
         * @returns {Promise<object>} promise resolving to result
         *   {object} data - updated field with all properties
         */
        update: function (sheetId, fieldKey, payload) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!fieldKey || typeof fieldKey !== 'string') throw new Error('fieldKey is required and must be a string');
            if (!payload || typeof payload !== 'object') throw new Error('payload is required and must be an object');

            return request.call(self, 'PUT', '/sheets/' + encodeURIComponent(sheetId) + '/fields/' + encodeURIComponent(fieldKey), null, payload);
        },

        /**
         * Delete a field from a sheet
         * @param {string} sheetId - target sheet id
         * @param {string} fieldKey - field key to delete
         * @returns {Promise<object>} promise resolving to result
         *   {object|null} data - api response or null
         */
        delete: function (sheetId, fieldKey) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!fieldKey || typeof fieldKey !== 'string') throw new Error('fieldKey is required and must be a string');

            return request.call(self, 'DELETE', '/sheets/' + encodeURIComponent(sheetId) + '/fields/' + encodeURIComponent(fieldKey));
        }
    };

    /**
     * history namespace
     * @returns {object} history methods
     */
    self.history = {

        /**
         * get sheet history
         * @param {string} sheetId - target sheet id
         * @returns {Promise<object>} promise resolving to result
         *   {array} data - list of history items
         *   {string} data[]._id - history id
         *   {string} data[].barcode - barcode value
         *   {string} data[].name - name value
         *   {number} data[].quantity - quantity value
         *   {string} data[]._change - add update or delete
         *   {string} data[]._changedBy - who changed
         *   {string} data[]._changedOn - iso date string
         *   {string} data[]._changedUsing - client info
         */
        sheet: function (sheetId) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');

            return request.call(self, 'GET', '/sheets/' + encodeURIComponent(sheetId) + '/history');
        },

        /**
         * get row history
         * @param {string} sheetId - target sheet id
         * @param {string} rowId - row id
         * @returns {Promise<object>} promise resolving to result
         *   {array} data - list of history items
         *   {string} data[]._id - history id
         *   {string} data[].barcode - barcode value
         *   {string} data[].name - name value
         *   {number} data[].quantity - quantity value
         *   {string} data[]._change - add update or delete
         *   {string} data[]._changedBy - who changed
         *   {string} data[]._changedOn - iso date string
         *   {string} data[]._changedUsing - client info
         */
        row: function (sheetId, rowId) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!rowId || typeof rowId !== 'string') throw new Error('rowId is required and must be a string');

            return request.call(self, 'GET', '/sheets/' + encodeURIComponent(sheetId) + '/' + encodeURIComponent(rowId) + '/history');
        }
    };

    /**
     * users namespace
     * @returns {object} user methods
     */
    self.users = {

        /**
         * get users on a sheet
         * @param {string} sheetId - target sheet id
         * @returns {Promise<object>} promise resolving to result
         *   {array} data - list of users
         *   {string} data[]._id - user id
         *   {string} data[].email - user email
         *   {boolean} data[].owner - owner flag
         *   {boolean} data[].canUpdate - can update
         *   {boolean} data[].canDelete - can delete
         *   {boolean} data[].canExport - can export
         *   {boolean} data[].canAdmin - can admin
         */
        list: function (sheetId) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');

            return request.call(self, 'GET', '/sheets/' + encodeURIComponent(sheetId) + '/users');
        },

        /**
         * add a user to a sheet
         * @param {string} sheetId - target sheet id
         * @param {object} payload - user input
         * @param {string} payload.email - user email
         * @param {boolean} [payload.canUpdate] - can update
         * @param {boolean} [payload.canDelete] - can delete
         * @param {boolean} [payload.canExport] - can export
         * @param {boolean} [payload.canAdmin] - can admin
         * @returns {Promise<object>} promise resolving to result
         *   {object} data - created user
         *   {string} data._id - user id
         *   {string} data.email - user email
         *   {boolean} data.canUpdate - can update
         *   {boolean} data.canDelete - can delete
         *   {boolean} data.canExport - can export
         *   {boolean} data.canAdmin - can admin
         */
        add: function (sheetId, payload) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!payload || typeof payload !== 'object') throw new Error('payload is required and must be an object');
            if (!payload.email || typeof payload.email !== 'string') throw new Error('payload.email is required and must be a string');

            return request.call(self, 'POST', '/sheets/' + encodeURIComponent(sheetId) + '/users', null, payload);
        },

        /**
         * update a user in a sheet
         * @param {string} sheetId - target sheet id
         * @param {string} userId - user id
         * @param {object} payload - user update input
         * @returns {Promise<object>} promise resolving to result
         *   {object} data - updated user
         *   {string} data._id - user id
         *   {string} data.email - user email
         *   {boolean} data.canUpdate - can update
         *   {boolean} data.canDelete - can delete
         *   {boolean} data.canExport - can export
         *   {boolean} data.canAdmin - can admin
         */
        update: function (sheetId, userId, payload) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!userId || typeof userId !== 'string') throw new Error('userId is required and must be a string');
            if (!payload || typeof payload !== 'object') throw new Error('payload is required and must be an object');

            return request.call(self, 'PUT', '/sheets/' + encodeURIComponent(sheetId) + '/users/' + encodeURIComponent(userId), null, payload);
        },

        /**
         * remove a user from a sheet
         * @param {string} sheetId - target sheet id
         * @param {string} userId - user id
         * @returns {Promise<object>} promise resolving to result
         *   {object|null} data - api response or null
         */
        remove: function (sheetId, userId) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!userId || typeof userId !== 'string') throw new Error('userId is required and must be a string');

            return request.call(self, 'DELETE', '/sheets/' + encodeURIComponent(sheetId) + '/users/' + encodeURIComponent(userId));
        }
    };

    /**
     * hooks namespace
     * @returns {object} hook methods
     */
    self.hooks = {

        /**
         * get supported hook events
         * @param {string} sheetId - target sheet id
         * @returns {Promise<object>} promise resolving to result
         *   {array} data - list of event names
         */
        events: function (sheetId) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');

            return request.call(self, 'GET', '/sheets/' + encodeURIComponent(sheetId) + '/hook-events');
        },

        /**
         * get all hooks on a sheet
         * @param {string} sheetId - target sheet id
         * @returns {Promise<object>} promise resolving to result
         *   {array} data - list of hooks
         *   {string} data[]._id - hook id
         *   {string} data[].eventName - event name
         *   {string} data[].sheetId - sheet id
         *   {string} data[].targetUrl - target url
         */
        list: function (sheetId) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');

            return request.call(self, 'GET', '/sheets/' + encodeURIComponent(sheetId) + '/hooks');
        },

        /**
         * get a single hook
         * @param {string} sheetId - target sheet id
         * @param {string} hookId - hook id
         * @returns {Promise<object>} promise resolving to result
         *   {object} data - hook object
         *   {string} data._id - hook id
         *   {string} data.eventName - event name
         *   {string} data.sheetId - sheet id
         *   {string} data.targetUrl - target url
         */
        get: function (sheetId, hookId) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!hookId || typeof hookId !== 'string') throw new Error('hookId is required and must be a string');

            return request.call(self, 'GET', '/sheets/' + encodeURIComponent(sheetId) + '/hooks/' + encodeURIComponent(hookId));
        },

        /**
         * create a hook
         * @param {string} sheetId - target sheet id
         * @param {object} payload - hook input
         * @param {string} payload.eventName - event name
         * @param {string} payload.targetUrl - target url
         * @returns {Promise<object>} promise resolving to result
         *   {object} data - created hook
         *   {string} data._id - hook id
         *   {string} data.eventName - event name
         *   {string} data.sheetId - sheet id
         *   {string} data.targetUrl - target url
         */
        create: function (sheetId, payload) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!payload || typeof payload !== 'object') throw new Error('payload is required and must be an object');
            if (!payload.eventName || typeof payload.eventName !== 'string') throw new Error('payload.eventName is required and must be a string');
            if (!payload.targetUrl || typeof payload.targetUrl !== 'string') throw new Error('payload.targetUrl is required and must be a string');

            return request.call(self, 'POST', '/sheets/' + encodeURIComponent(sheetId) + '/hooks', null, payload);
        },

        /**
         * update a hook
         * @param {string} sheetId - target sheet id
         * @param {string} hookId - hook id
         * @param {object} payload - hook update input
         * @returns {Promise<object>} promise resolving to result
         *   {object} data - updated hook
         *   {string} data._id - hook id
         *   {string} data.eventName - event name
         *   {string} data.sheetId - sheet id
         *   {string} data.targetUrl - target url
         */
        update: function (sheetId, hookId, payload) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!hookId || typeof hookId !== 'string') throw new Error('hookId is required and must be a string');
            if (!payload || typeof payload !== 'object') throw new Error('payload is required and must be an object');

            return request.call(self, 'PUT', '/sheets/' + encodeURIComponent(sheetId) + '/hooks/' + encodeURIComponent(hookId), null, payload);
        },

        /**
         * delete a hook
         * @param {string} sheetId - target sheet id
         * @param {string} hookId - hook id
         * @returns {Promise<object>} promise resolving to result
         *   {object|null} data - api response or null
         */
        delete: function (sheetId, hookId) {
            if (!sheetId || typeof sheetId !== 'string') throw new Error('sheetId is required and must be a string');
            if (!hookId || typeof hookId !== 'string') throw new Error('hookId is required and must be a string');

            return request.call(self, 'DELETE', '/sheets/' + encodeURIComponent(sheetId) + '/hooks/' + encodeURIComponent(hookId));
        }
    };
}

/* --- helpers --- */

/**
 * build a url with optional query
 * @param {string} endpoint - api endpoint
 * @param {string} path - path beginning with slash
 * @param {object} [qs] - query key value pairs
 * @returns {string} full request url
 */
function buildUrl(endpoint, path, qs) {
    var url = endpoint + path;

    if (qs && typeof qs === 'object') {
        var first = true;
        for (var k in qs) {
            if (Object.prototype.hasOwnProperty.call(qs, k)) {
                var v = qs[k];
                if (typeof v !== 'undefined' && v !== null) {
                    url += first ? '?' : '&';
                    url += encodeURIComponent(k) + '=' + encodeURIComponent(String(v));
                    first = false;
                }
            }
        }
    }

    return url;
}

/**
 * parse response text into json if possible
 * @param {object} res - fetch response
 * @returns {Promise<object|null>} parsed json or null
 */
function parseJson(res) {

    return res.text().then(function (text) {

        if (!text) return null;

        try {
            return JSON.parse(text);
        }
        catch (e) {
            return { raw: text };
        }
    });
}

/**
 * internal request with timeout and basic retry
 * @param {string} method - HTTP method
 * @param {string} path - request path
 * @param {object} [qs] - query params
 * @param {object|array} [body] - JSON body
 * @returns {Promise<object>} response data
 */
function request(method, path, qs, body) {
    var self = this; // OrcaScanNode instance
    var attempt = 0;

    function makeRequest() {
        var url = buildUrl(self.endpoint, path, qs);
        var opts = {
            method: method,
            headers: self.defaultHeaders
        };

        if (body !== undefined) {
            opts.headers['Content-Type'] = 'application/json';
            opts.body = JSON.stringify(body);
        }

        return Promise.race([
            fetch(url, opts),
            new Promise(function (_, reject) {
                setTimeout(function () {
                    reject(new Error('request timeout'));
                }, self.timeoutMs);
            })
        ])
        .then(function (res) {
            if (res.status === 204) return null;

            return parseJson(res).then(function (json) {
                if (res.ok) {
                    return json?.data !== undefined ? json.data : json;
                }

                if (shouldRetry(res.status) && attempt < self.maxRetries) {
                    attempt++;
                    var retryDelay = calculateRetryDelay(res, attempt);
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(makeRequest());
                        }, retryDelay);
                    });
                }

                var err = new Error('HTTP ' + res.status);
                err.status = res.status;
                err.body = json;
                throw err;
            });
        });
    }

    return makeRequest();
}

/**
 * Determines if a request should be retried based on status code.
 * @param {number} status - HTTP status code
 * @returns {boolean} true if retryable
 */
function shouldRetry(status) {
    return status === 429 || status === 503 || (status >= 500 && status < 600);
}

/**
 * Calculates retry delay based on response headers or attempt count.
 * @param {object} res - fetch response
 * @param {number} attempt - current retry attempt
 * @returns {number} delay in milliseconds
 */
function calculateRetryDelay(res, attempt) {
    var retryAfter = res.headers?.get('retry-after');
    if (retryAfter) {
        var parsed = parseInt(retryAfter, 10);
        if (!isNaN(parsed)) return parsed * 1000;

        var date = Date.parse(retryAfter);
        if (!isNaN(date)) return Math.max(0, date - Date.now());
    }
    return attempt * 500;
}

module.exports = OrcaScanNode;
