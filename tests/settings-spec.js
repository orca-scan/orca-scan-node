/* eslint-disable prefer-rest-params */
var proxyquire = require('proxyquire');

describe('Settings', function() {
    var client;
    var mockFetch;
    var OrcaScanNode;

    beforeAll(function() {
        // Create a base mock that can be customized per test
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.resolve({
                ok: true,
                status: 200,
                headers: {
                    get: function() { return null; }
                },
                text: function() { return Promise.resolve('{"data": {"test": "value"}}'); }
            })
        );
        
        // Load the module once for all tests
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
    });

    beforeEach(function() {
        // Reset the spy and create a fresh client for each test
        mockFetch.calls.reset();
        client = new OrcaScanNode('test-api-key');
    });

    it('should get settings for a sheet', function() {
        var sheetId = 'test-sheet-id';
        return client.settings.get(sheetId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/settings',
                jasmine.objectContaining({
                    method: 'GET'
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should update settings for a sheet', function() {
        var sheetId = 'test-sheet-id';
        var settings = { allowPublicExport: true, allowPublicEntry: false };
        mockFetch.and.returnValue(Promise.resolve({
            ok: true,
            status: 200,
            headers: { get: function() { return null; } },
            text: function() { return Promise.resolve('{"data": {"allowPublicExport": true, "allowPublicEntry": false}}'); }
        }));
        return client.settings.update(sheetId, settings).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/settings',
                jasmine.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(settings)
                })
            );
            expect(result).toBeDefined();
            expect(result.allowPublicExport).toBe(true);
            expect(result.allowPublicEntry).toBe(false);
        });
    });

    it('should throw error when updating settings without sheetId', function() {
        expect(function() {
            client.settings.update();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when updating settings with non-string sheetId', function() {
        expect(function() {
            client.settings.update(123, {});
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should handle sheetId with special characters in URL encoding', function() {
        var sheetId = 'test/sheet:id';
        var settings = { allowPublicExport: false };
        mockFetch.and.returnValue(Promise.resolve({
            ok: true,
            status: 200,
            headers: { get: function() { return null; } },
            text: function() { return Promise.resolve('{"data": {"allowPublicExport": false}}'); }
        }));
        return client.settings.update(sheetId, settings).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test%2Fsheet%3Aid/settings',
                jasmine.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(settings)
                })
            );
            expect(result).toBeDefined();
            expect(result.allowPublicExport).toBe(false);
        });
    });

    it('should throw error when getting settings without sheetId', function() {
        expect(function() {
            client.settings.get();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when getting settings with non-string sheetId', function() {
        expect(function() {
            client.settings.get(123);
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should handle sheetId with special characters in URL encoding', function() {
        var sheetId = 'test/sheet:id';
        
        return client.settings.get(sheetId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test%2Fsheet%3Aid/settings',
                jasmine.objectContaining({
                    method: 'GET'
                })
            );
            expect(result).toBeDefined();
        });
    });


});
