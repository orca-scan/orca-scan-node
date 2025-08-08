/* eslint-disable prefer-rest-params */
var proxyquire = require('proxyquire');

describe('Rows', function() {
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

    it('should list rows without query parameters', function(done) {
        var sheetId = 'test-sheet-id';
        
        client.rows.list(sheetId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rows',
                jasmine.objectContaining({
                    method: 'GET'
                })
            );
            expect(result.status).toBe(200);
            done();
        });
    });

    it('should list rows with query parameters', function(done) {
        var sheetId = 'test-sheet-id';
        var query = { limit: 10, skip: 20 };
        
        client.rows.list(sheetId, query).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rows?limit=10&skip=20',
                jasmine.objectContaining({
                    method: 'GET'
                })
            );
            expect(result.status).toBe(200);
            done();
        });
    });

    it('should throw error when listing rows without sheetId', function() {
        expect(function() {
            client.rows.list();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when listing rows with non-string sheetId', function() {
        expect(function() {
            client.rows.list(123);
        }).toThrowError('sheetId is required and must be a string');

        expect(function() {
            client.rows.list(null);
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should get a single row', function(done) {
        var sheetId = 'test-sheet-id';
        var rowId = 'test-row-id';
        
        client.rows.get(sheetId, rowId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rows/test-row-id',
                jasmine.objectContaining({
                    method: 'GET'
                })
            );
            expect(result.status).toBe(200);
            done();
        });
    });

    it('should throw error when getting row without sheetId', function() {
        expect(function() {
            client.rows.get();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when getting row without rowId', function() {
        expect(function() {
            client.rows.get('test-sheet-id');
        }).toThrowError('rowId is required and must be a string');
    });

    it('should throw error when getting row with non-string rowId', function() {
        expect(function() {
            client.rows.get('test-sheet-id', 123);
        }).toThrowError('rowId is required and must be a string');
    });

    it('should add a single row', function(done) {
        var sheetId = 'test-sheet-id';
        var data = { name: 'Test Item', quantity: 5 };
        
        client.rows.add(sheetId, data).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rows',
                jasmine.objectContaining({
                    method: 'POST',
                    headers: jasmine.objectContaining({
                        'Content-Type': 'application/json'
                    }),
                    body: JSON.stringify(data)
                })
            );
            expect(result.status).toBe(200);
            done();
        });
    });

    it('should add multiple rows', function(done) {
        var sheetId = 'test-sheet-id';
        var data = [
            { name: 'Item 1', quantity: 5 },
            { name: 'Item 2', quantity: 10 }
        ];
        
        client.rows.add(sheetId, data).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rows',
                jasmine.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(data)
                })
            );
            expect(result.status).toBe(200);
            done();
        });
    });

    it('should add row with special fields like photo', function(done) {
        var sheetId = 'test-sheet-id';
        var data = { 
            name: 'Test Item', 
            photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...'
        };
        
        client.rows.add(sheetId, data).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rows',
                jasmine.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(data)
                })
            );
            expect(result.status).toBe(200);
            done();
        });
    });

    it('should throw error when adding row without sheetId', function() {
        expect(function() {
            client.rows.add();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when adding row without data', function() {
        expect(function() {
            client.rows.add('test-sheet-id');
        }).toThrowError('data is required and must be an object or array');
    });

    it('should throw error when adding row with null data', function() {
        expect(function() {
            client.rows.add('test-sheet-id', null);
        }).toThrowError('data is required and must be an object or array');
    });

    it('should throw error when adding row with non-object data', function() {
        expect(function() {
            client.rows.add('test-sheet-id', 'invalid');
        }).toThrowError('data is required and must be an object or array');
    });

    it('should update a single row', function(done) {
        var sheetId = 'test-sheet-id';
        var rowId = 'test-row-id';
        var data = { quantity: 15 };
        
        client.rows.updateOne(sheetId, rowId, data).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rows/test-row-id',
                jasmine.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(data)
                })
            );
            expect(result.status).toBe(200);
            done();
        });
    });

    it('should throw error when updating row without sheetId', function() {
        expect(function() {
            client.rows.updateOne();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when updating row without rowId', function() {
        expect(function() {
            client.rows.updateOne('test-sheet-id');
        }).toThrowError('rowId is required and must be a string');
    });

    it('should throw error when updating row without data', function() {
        expect(function() {
            client.rows.updateOne('test-sheet-id', 'test-row-id');
        }).toThrowError('data is required and must be an object');
    });

    it('should throw error when updating row with non-object data', function() {
        expect(function() {
            client.rows.updateOne('test-sheet-id', 'test-row-id', 'invalid');
        }).toThrowError('data is required and must be an object');
    });

    it('should update many rows', function(done) {
        var sheetId = 'test-sheet-id';
        var rows = [
            { _id: 'row1', quantity: 15 },
            { _id: 'row2', quantity: 20 }
        ];
        
        client.rows.updateMany(sheetId, rows).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rows',
                jasmine.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(rows)
                })
            );
            expect(result.status).toBe(200);
            done();
        });
    });

    it('should throw error when updating many rows without sheetId', function() {
        expect(function() {
            client.rows.updateMany();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when updating many rows without rows array', function() {
        expect(function() {
            client.rows.updateMany('test-sheet-id');
        }).toThrowError('rows is required and must be an array of objects');
    });

    it('should throw error when updating many rows with non-array', function() {
        expect(function() {
            client.rows.updateMany('test-sheet-id', 'invalid');
        }).toThrowError('rows is required and must be an array of objects');

        expect(function() {
            client.rows.updateMany('test-sheet-id', null);
        }).toThrowError('rows is required and must be an array of objects');
    });

    it('should delete a single row', function(done) {
        var sheetId = 'test-sheet-id';
        var rowId = 'test-row-id';
        
        client.rows.deleteOne(sheetId, rowId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rows/test-row-id',
                jasmine.objectContaining({
                    method: 'DELETE'
                })
            );
            expect(result.status).toBe(200);
            done();
        });
    });

    it('should throw error when deleting row without sheetId', function() {
        expect(function() {
            client.rows.deleteOne();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when deleting row without rowId', function() {
        expect(function() {
            client.rows.deleteOne('test-sheet-id');
        }).toThrowError('rowId is required and must be a string');
    });

    it('should delete many rows', function(done) {
        var sheetId = 'test-sheet-id';
        var rowIds = ['row1', 'row2', 'row3'];
        
        client.rows.deleteMany(sheetId, rowIds).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rows',
                jasmine.objectContaining({
                    method: 'DELETE',
                    body: JSON.stringify(rowIds)
                })
            );
            expect(result.status).toBe(200);
            done();
        });
    });

    it('should throw error when deleting many rows without sheetId', function() {
        expect(function() {
            client.rows.deleteMany();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when deleting many rows without rowIds array', function() {
        expect(function() {
            client.rows.deleteMany('test-sheet-id');
        }).toThrowError('rowIds is required and must be an array of strings');
    });

    it('should throw error when deleting many rows with non-array', function() {
        expect(function() {
            client.rows.deleteMany('test-sheet-id', 'invalid');
        }).toThrowError('rowIds is required and must be an array of strings');

        expect(function() {
            client.rows.deleteMany('test-sheet-id', null);
        }).toThrowError('rowIds is required and must be an array of strings');
    });

    it('should handle query parameters with special characters', function(done) {
        var sheetId = 'test-sheet-id';
        var query = { 
            filter: 'name contains "test"',
            sort: 'name asc'
        };
        
        client.rows.list(sheetId, query).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rows?filter=name%20contains%20%22test%22&sort=name%20asc',
                jasmine.objectContaining({
                    method: 'GET'
                })
            );
            expect(result.status).toBe(200);
            done();
        });
    });

    it('should handle rowId with special characters in URL encoding', function(done) {
        var sheetId = 'test-sheet-id';
        var rowId = 'test/row:id';
        
        client.rows.get(sheetId, rowId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rows/test%2Frow%3Aid',
                jasmine.objectContaining({
                    method: 'GET'
                })
            );
            expect(result.status).toBe(200);
            done();
        });
    });
});
