/* eslint-disable prefer-rest-params */
var proxyquire = require('proxyquire');

describe('History', function() {
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
                text: function() { return Promise.resolve('{"data": [{"_id": "hist1", "barcode": "123", "name": "Item", "quantity": 5, "_change": "add", "_changedBy": "user@example.com", "_changedOn": "2023-01-01T00:00:00Z", "_changedUsing": "web"}]}'); }
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

    it('should get sheet history', function() {
        var sheetId = 'test-sheet-id';
        
        return client.history.sheet(sheetId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/history',
                jasmine.objectContaining({
                    method: 'GET',
                    headers: jasmine.objectContaining({
                        'Authorization': 'Bearer test-api-key'
                    })
                })
            );
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
        });
    });

    it('should throw error when getting sheet history without sheetId', function() {
        expect(function() {
            client.history.sheet();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when getting sheet history with non-string sheetId', function() {
        expect(function() {
            client.history.sheet(123);
        }).toThrowError('sheetId is required and must be a string');

        expect(function() {
            client.history.sheet(null);
        }).toThrowError('sheetId is required and must be a string');

        expect(function() {
            client.history.sheet({});
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should get row history', function() {
        var sheetId = 'test-sheet-id';
        var rowId = 'test-row-id';
        
        return client.history.row(sheetId, rowId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rows/test-row-id/history',
                jasmine.objectContaining({
                    method: 'GET',
                    headers: jasmine.objectContaining({
                        'Authorization': 'Bearer test-api-key'
                    })
                })
            );
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
        });
    });

    it('should throw error when getting row history without sheetId', function() {
        expect(function() {
            client.history.row();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when getting row history without rowId', function() {
        expect(function() {
            client.history.row('test-sheet-id');
        }).toThrowError('rowId is required and must be a string');
    });

    it('should throw error when getting row history with non-string sheetId', function() {
        expect(function() {
            client.history.row(123, 'test-row-id');
        }).toThrowError('sheetId is required and must be a string');

        expect(function() {
            client.history.row(null, 'test-row-id');
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when getting row history with non-string rowId', function() {
        expect(function() {
            client.history.row('test-sheet-id', 123);
        }).toThrowError('rowId is required and must be a string');

        expect(function() {
            client.history.row('test-sheet-id', null);
        }).toThrowError('rowId is required and must be a string');

        expect(function() {
            client.history.row('test-sheet-id', {});
        }).toThrowError('rowId is required and must be a string');
    });

    it('should handle sheetId with special characters in URL encoding', function() {
        var sheetId = 'test/sheet:id';
        
        return client.history.sheet(sheetId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test%2Fsheet%3Aid/history',
                jasmine.objectContaining({
                    method: 'GET'
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should handle rowId with special characters in URL encoding', function() {
        var sheetId = 'test-sheet-id';
        var rowId = 'test/row:id';
        
        return client.history.row(sheetId, rowId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rows/test%2Frow%3Aid/history',
                jasmine.objectContaining({
                    method: 'GET'
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should handle both sheetId and rowId with special characters', function() {
        var sheetId = 'test/sheet:id';
        var rowId = 'test/row:id';
        
        return client.history.row(sheetId, rowId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test%2Fsheet%3Aid/rows/test%2Frow%3Aid/history',
                jasmine.objectContaining({
                    method: 'GET'
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should return history data with expected structure', function() {
        var sheetId = 'test-sheet-id';
        
        return client.history.sheet(sheetId).then(function(result) {
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
            
            var historyItem = result[0];
            expect(historyItem._id).toBeDefined();
            expect(historyItem.barcode).toBeDefined();
            expect(historyItem.name).toBeDefined();
            expect(historyItem.quantity).toBeDefined();
            expect(historyItem._change).toBeDefined();
            expect(historyItem._changedBy).toBeDefined();
            expect(historyItem._changedOn).toBeDefined();
            expect(historyItem._changedUsing).toBeDefined();
        });
    });

    it('should return row history data with expected structure', function() {
        var sheetId = 'test-sheet-id';
        var rowId = 'test-row-id';
        
        return client.history.row(sheetId, rowId).then(function(result) {
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
            
            var historyItem = result[0];
            expect(historyItem._id).toBeDefined();
            expect(historyItem.barcode).toBeDefined();
            expect(historyItem.name).toBeDefined();
            expect(historyItem.quantity).toBeDefined();
            expect(historyItem._change).toBeDefined();
            expect(historyItem._changedBy).toBeDefined();
            expect(historyItem._changedOn).toBeDefined();
            expect(historyItem._changedUsing).toBeDefined();
        });
    });

    it('should handle empty history response', function() {
        // Mock empty response
        mockFetch.and.returnValue(
            Promise.resolve({
                ok: true,
                status: 200,
                headers: {
                    get: function() { return null; }
                },
                text: function() { return Promise.resolve('{"data": []}'); }
            })
        );

        var sheetId = 'test-sheet-id';
        
        return client.history.sheet(sheetId).then(function(result) {
            expect(result).toEqual([]);
        });
    });

    it('should handle empty row history response', function() {
        // Mock empty response
        mockFetch.and.returnValue(
            Promise.resolve({
                ok: true,
                status: 200,
                headers: {
                    get: function() { return null; }
                },
                text: function() { return Promise.resolve('{"data": []}'); }
            })
        );

        var sheetId = 'test-sheet-id';
        var rowId = 'test-row-id';
        
        return client.history.row(sheetId, rowId).then(function(result) {
            expect(result).toEqual([]);
        });
    });
});
