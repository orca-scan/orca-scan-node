var fs = require('fs');
var path = require('path');
var OrcaScanNode = require('../../index');

// load .env file if it exists (no extra dependencies needed)
var envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(function (line) {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        var parts = line.split('=');
        var key = parts[0].trim();
        var val = parts.slice(1).join('=').trim();
        if (!process.env[key]) process.env[key] = val;
    });
}

var apiKey = process.env.ORCA_SCAN_API_KEY;
var endpoint = process.env.ORCA_SCAN_ENDPOINT;

// bail early with a clear message if no API key
if (!apiKey) {
    console.error('\n  E2E tests require ORCA_SCAN_API_KEY env var. See .env.example\n');
    process.exit(1);
}

// create a single client shared by all specs
var options = {};
if (endpoint) {
    options.endpoint = endpoint;
}
var client = new OrcaScanNode(apiKey, options);

// shared state between specs (set by sheets spec, read by everything else)
var sheetId = null;

module.exports = {
    getClient: function () {
        return client;
    },
    getSheetId: function () {
        return sheetId;
    },
    setSheetId: function (id) {
        sheetId = id;
    }
};
