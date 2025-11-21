/* eslint-disable prefer-rest-params */
var proxyquire = require('proxyquire');

describe('Sheets', function() {
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

    it('should list sheets', function() {
        return client.sheets.list().then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets',
                jasmine.objectContaining({
                    method: 'GET',
                    headers: jasmine.objectContaining({
                        'Authorization': 'Bearer test-api-key'
                    })
                })
            );
            expect(result).toEqual({test: 'value'});
        });
    });

    it('should create a sheet with required name', function() {
        var payload = { name: 'Test Sheet' };
        
        return client.sheets.create(payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets',
                jasmine.objectContaining({
                    method: 'POST',
                    headers: jasmine.objectContaining({
                        'Authorization': 'Bearer test-api-key',
                        'Content-Type': 'application/json'
                    }),
                    body: JSON.stringify(payload)
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should create a sheet with name and template', function() {
        var payload = { 
            name: 'Test Sheet',
            templateName: 'inventory'
        };
        
        return client.sheets.create(payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets',
                jasmine.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should throw error when creating sheet without payload', function() {
        expect(function() {
            client.sheets.create();
        }).toThrowError('payload is required and must be an object');
    });

    it('should throw error when creating sheet with non-object payload', function() {
        expect(function() {
            client.sheets.create('invalid');
        }).toThrowError('payload is required and must be an object');

        expect(function() {
            client.sheets.create(null);
        }).toThrowError('payload is required and must be an object');
    });

    it('should throw error when creating sheet without name', function() {
        expect(function() {
            client.sheets.create({});
        }).toThrowError('payload.name is required and must be a string');
    });

    it('should throw error when creating sheet with non-string name', function() {
        expect(function() {
            client.sheets.create({ name: 123 });
        }).toThrowError('payload.name is required and must be a string');

        expect(function() {
            client.sheets.create({ name: null });
        }).toThrowError('payload.name is required and must be a string');
    });

    it('should clear all rows in a sheet', function() {
        var sheetId = 'test-sheet-id';
        
        return client.sheets.clear(sheetId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/clear',
                jasmine.objectContaining({
                    method: 'PUT'
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should throw error when clearing sheet without sheetId', function() {
        expect(function() {
            client.sheets.clear();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when clearing sheet with non-string sheetId', function() {
        expect(function() {
            client.sheets.clear(123);
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should rename a sheet with required name', function() {
        var sheetId = 'test-sheet-id';
        var payload = { name: 'New Sheet Name' };
        
        return client.sheets.rename(sheetId, payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rename',
                jasmine.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(payload)
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should rename a sheet with name and description', function() {
        var sheetId = 'test-sheet-id';
        var payload = { 
            name: 'New Sheet Name',
            description: 'Updated description'
        };
        
        return client.sheets.rename(sheetId, payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rename',
                jasmine.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(payload)
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should throw error when renaming sheet without sheetId', function() {
        expect(function() {
            client.sheets.rename();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when renaming sheet without payload', function() {
        expect(function() {
            client.sheets.rename('test-sheet-id');
        }).toThrowError('payload is required and must be an object');
    });

    it('should throw error when renaming sheet without name in payload', function() {
        expect(function() {
            client.sheets.rename('test-sheet-id', {});
        }).toThrowError('payload.name is required and must be a string');
    });

    it('should delete a sheet', function() {
        var sheetId = 'test-sheet-id';
        
        return client.sheets.delete(sheetId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id',
                jasmine.objectContaining({
                    method: 'DELETE'
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should throw error when deleting sheet without sheetId', function() {
        expect(function() {
            client.sheets.delete();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when deleting sheet with non-string sheetId', function() {
        expect(function() {
            client.sheets.delete(123);
        }).toThrowError('sheetId is required and must be a string');
    });
});
