/* eslint-disable prefer-rest-params */
var proxyquire = require('proxyquire');

describe('Fields', function() {
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

    it('should fetch fields list from API', function() {
        var sheetId = 'test-sheet-id';
        
        return client.fields.list(sheetId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/fields',
                jasmine.objectContaining({
                    method: 'GET',
                    headers: jasmine.objectContaining({
                        'Authorization': 'Bearer test-api-key'
                    })
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should reject when sheetId is missing', function() {
        expect(function() {
            client.fields.list();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should reject when sheetId is not a string', function() {
        expect(function() {
            client.fields.list(123);
        }).toThrowError('sheetId is required and must be a string');

        expect(function() {
            client.fields.list(null);
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should create a field with required properties', function() {
        var sheetId = 'test-sheet-id';
        var payload = {
            label: 'Test Field',
            format: 'string'
        };
        
        return client.fields.create(sheetId, payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/fields',
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

    it('should create a field with index in payload', function() {
        var payload = { label: 'Test Field', format: 'text', index: 2 };

        return client.fields.create('test-sheet-id', payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/fields',
                jasmine.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should create a field with all optional properties', function() {
        var sheetId = 'test-sheet-id';
        var payload = {
            label: 'Test Field',
            format: 'string',
            required: true,
            placeholder: 'Enter test value',
            autofocus: true,
            autoselect: true,
            emptyOnEdit: true,
            emptyOnScan: true,
            hiddenMobile: false,
            hiddenWeb: false,
            readonlyWeb: false,
            readonlyMobile: false,
            useInMobileSearch: true,
            useValueInList: true
        };
        
        return client.fields.create(sheetId, payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/fields',
                jasmine.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should throw error when creating field without sheetId', function() {
        expect(function() {
            client.fields.create();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when creating field without payload', function() {
        expect(function() {
            client.fields.create('test-sheet-id');
        }).toThrowError('payload is required and must be an object');
    });

    it('should throw error when creating field with non-object payload', function() {
        expect(function() {
            client.fields.create('test-sheet-id', 'invalid');
        }).toThrowError('payload is required and must be an object');

        expect(function() {
            client.fields.create('test-sheet-id', null);
        }).toThrowError('payload is required and must be an object');
    });

    it('should throw error when creating field without label', function() {
        expect(function() {
            client.fields.create('test-sheet-id', {
                format: 'string'
            });
        }).toThrowError('payload.label is required and must be a string');
    });

    it('should throw error when creating field without format', function() {
        expect(function() {
            client.fields.create('test-sheet-id', {
                label: 'Test Field'
            });
        }).toThrowError('payload.format is required and must be a string');
    });

    it('should throw error when creating field with non-string label', function() {
        expect(function() {
            client.fields.create('test-sheet-id', {
                label: 123,
                format: 'string'
            });
        }).toThrowError('payload.label is required and must be a string');
    });

    it('should throw error when creating field with non-string format', function() {
        expect(function() {
            client.fields.create('test-sheet-id', {
                label: 'Test Field',
                format: 123
            });
        }).toThrowError('payload.format is required and must be a string');
    });

    it('should update a field with new properties', function() {
        var sheetId = 'test-sheet-id';
        var fieldKey = 'test-field';
        var payload = {
            label: 'Updated Field Label',
            required: true
        };
        
        return client.fields.update(sheetId, fieldKey, payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/fields/test-field',
                jasmine.objectContaining({
                    method: 'PUT',
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

    it('should update a field with index in payload', function() {
        var payload = { label: 'Updated Field Label', index: 1 };

        return client.fields.update('test-sheet-id', 'test-field', payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/fields/test-field',
                jasmine.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(payload)
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should throw error when updating field without sheetId', function() {
        expect(function() {
            client.fields.update();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when updating field without fieldKey', function() {
        expect(function() {
            client.fields.update('test-sheet-id');
        }).toThrowError('fieldKey is required and must be a string');
    });

    it('should throw error when updating field without payload', function() {
        expect(function() {
            client.fields.update('test-sheet-id', 'test-field');
        }).toThrowError('payload is required and must be an object');
    });

    it('should throw error when updating field with non-string sheetId', function() {
        expect(function() {
            client.fields.update(123, 'test-field', {});
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when updating field with non-string fieldKey', function() {
        expect(function() {
            client.fields.update('test-sheet-id', 123, {});
        }).toThrowError('fieldKey is required and must be a string');
    });

    it('should throw error when updating field with non-object payload', function() {
        expect(function() {
            client.fields.update('test-sheet-id', 'test-field', 'invalid');
        }).toThrowError('payload is required and must be an object');
    });

    it('should delete a field', function() {
        var sheetId = 'test-sheet-id';
        var fieldKey = 'test-field';
        
        return client.fields.delete(sheetId, fieldKey).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/fields/test-field',
                jasmine.objectContaining({
                    method: 'DELETE',
                    headers: jasmine.objectContaining({
                        'Authorization': 'Bearer test-api-key'
                    })
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should throw error when deleting field without sheetId', function() {
        expect(function() {
            client.fields.delete();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when deleting field without fieldKey', function() {
        expect(function() {
            client.fields.delete('test-sheet-id');
        }).toThrowError('fieldKey is required and must be a string');
    });

    it('should throw error when deleting field with non-string sheetId', function() {
        expect(function() {
            client.fields.delete(123, 'test-field');
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when deleting field with non-string fieldKey', function() {
        expect(function() {
            client.fields.delete('test-sheet-id', 123);
        }).toThrowError('fieldKey is required and must be a string');
    });

    it('should handle fieldKey with special characters in URL encoding', function() {
        var sheetId = 'test-sheet-id';
        var fieldKey = 'test/field:key';
        
        return client.fields.delete(sheetId, fieldKey).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/fields/test%2Ffield%3Akey',
                jasmine.objectContaining({
                    method: 'DELETE'
                })
            );
            expect(result).toBeDefined();
        });
    });
});
