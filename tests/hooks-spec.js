/* eslint-disable prefer-rest-params */
var proxyquire = require('proxyquire');

describe('Hooks', function() {
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
                text: function() { return Promise.resolve('{"data": [{"_id": "hook1", "eventName": "row.add", "sheetId": "sheet1", "targetUrl": "https://example.com/webhook"}]}'); }
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

    it('should get supported hook events', function() {
        var sheetId = 'test-sheet-id';
        
        return client.hooks.events(sheetId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/hook-events',
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

    it('should throw error when getting events without sheetId', function() {
        expect(function() {
            client.hooks.events();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when getting events with non-string sheetId', function() {
        expect(function() {
            client.hooks.events(123);
        }).toThrowError('sheetId is required and must be a string');

        expect(function() {
            client.hooks.events(null);
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should list all hooks on a sheet', function() {
        var sheetId = 'test-sheet-id';
        
        return client.hooks.list(sheetId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/hooks',
                jasmine.objectContaining({
                    method: 'GET'
                })
            );
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
        });
    });

    it('should throw error when listing hooks without sheetId', function() {
        expect(function() {
            client.hooks.list();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when listing hooks with non-string sheetId', function() {
        expect(function() {
            client.hooks.list(123);
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should get a single hook', function() {
        var sheetId = 'test-sheet-id';
        var hookId = 'hook1';
        
        return client.hooks.get(sheetId, hookId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/hooks/hook1',
                jasmine.objectContaining({
                    method: 'GET'
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should throw error when getting hook without sheetId', function() {
        expect(function() {
            client.hooks.get();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when getting hook without hookId', function() {
        expect(function() {
            client.hooks.get('test-sheet-id');
        }).toThrowError('hookId is required and must be a string');
    });

    it('should throw error when getting hook with non-string hookId', function() {
        expect(function() {
            client.hooks.get('test-sheet-id', 123);
        }).toThrowError('hookId is required and must be a string');
    });

    it('should create a hook with required fields', function() {
        var sheetId = 'test-sheet-id';
        var payload = { 
            eventName: 'row.add',
            targetUrl: 'https://example.com/webhook'
        };
        
        return client.hooks.create(sheetId, payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/hooks',
                jasmine.objectContaining({
                    method: 'POST',
                    headers: jasmine.objectContaining({
                        'Content-Type': 'application/json'
                    }),
                    body: JSON.stringify(payload)
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should throw error when creating hook without sheetId', function() {
        expect(function() {
            client.hooks.create();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when creating hook without payload', function() {
        expect(function() {
            client.hooks.create('test-sheet-id');
        }).toThrowError('payload is required and must be an object');
    });

    it('should throw error when creating hook with non-object payload', function() {
        expect(function() {
            client.hooks.create('test-sheet-id', 'invalid');
        }).toThrowError('payload is required and must be an object');

        expect(function() {
            client.hooks.create('test-sheet-id', null);
        }).toThrowError('payload is required and must be an object');
    });

    it('should throw error when creating hook without eventName', function() {
        expect(function() {
            client.hooks.create('test-sheet-id', { targetUrl: 'https://example.com' });
        }).toThrowError('payload.eventName is required and must be a string');
    });

    it('should throw error when creating hook without targetUrl', function() {
        expect(function() {
            client.hooks.create('test-sheet-id', { eventName: 'row.add' });
        }).toThrowError('payload.targetUrl is required and must be a string');
    });

    it('should throw error when creating hook with non-string eventName', function() {
        expect(function() {
            client.hooks.create('test-sheet-id', { 
                eventName: 123, 
                targetUrl: 'https://example.com' 
            });
        }).toThrowError('payload.eventName is required and must be a string');
    });

    it('should throw error when creating hook with non-string targetUrl', function() {
        expect(function() {
            client.hooks.create('test-sheet-id', { 
                eventName: 'row.add', 
                targetUrl: 123 
            });
        }).toThrowError('payload.targetUrl is required and must be a string');
    });

    it('should update a hook', function() {
        var sheetId = 'test-sheet-id';
        var hookId = 'hook1';
        var payload = { targetUrl: 'https://new-example.com/webhook' };
        
        return client.hooks.update(sheetId, hookId, payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/hooks/hook1',
                jasmine.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(payload)
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should update hook with both eventName and targetUrl', function() {
        var sheetId = 'test-sheet-id';
        var hookId = 'hook1';
        var payload = { 
            eventName: 'row.update',
            targetUrl: 'https://updated-example.com/webhook'
        };
        
        return client.hooks.update(sheetId, hookId, payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/hooks/hook1',
                jasmine.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(payload)
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should throw error when updating hook without sheetId', function() {
        expect(function() {
            client.hooks.update();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when updating hook without hookId', function() {
        expect(function() {
            client.hooks.update('test-sheet-id');
        }).toThrowError('hookId is required and must be a string');
    });

    it('should throw error when updating hook without payload', function() {
        expect(function() {
            client.hooks.update('test-sheet-id', 'hook1');
        }).toThrowError('payload is required and must be an object');
    });

    it('should throw error when updating hook with non-string hookId', function() {
        expect(function() {
            client.hooks.update('test-sheet-id', 123, {});
        }).toThrowError('hookId is required and must be a string');
    });

    it('should throw error when updating hook with non-object payload', function() {
        expect(function() {
            client.hooks.update('test-sheet-id', 'hook1', 'invalid');
        }).toThrowError('payload is required and must be an object');
    });

    it('should delete a hook', function() {
        var sheetId = 'test-sheet-id';
        var hookId = 'hook1';
        
        return client.hooks.delete(sheetId, hookId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/hooks/hook1',
                jasmine.objectContaining({
                    method: 'DELETE'
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should throw error when deleting hook without sheetId', function() {
        expect(function() {
            client.hooks.delete();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when deleting hook without hookId', function() {
        expect(function() {
            client.hooks.delete('test-sheet-id');
        }).toThrowError('hookId is required and must be a string');
    });

    it('should throw error when deleting hook with non-string hookId', function() {
        expect(function() {
            client.hooks.delete('test-sheet-id', 123);
        }).toThrowError('hookId is required and must be a string');
    });

    it('should handle sheetId with special characters in URL encoding', function() {
        var sheetId = 'test/sheet:id';
        
        return client.hooks.list(sheetId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test%2Fsheet%3Aid/hooks',
                jasmine.objectContaining({
                    method: 'GET'
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should handle hookId with special characters in URL encoding', function() {
        var sheetId = 'test-sheet-id';
        var hookId = 'hook/with:special';
        
        return client.hooks.delete(sheetId, hookId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/hooks/hook%2Fwith%3Aspecial',
                jasmine.objectContaining({
                    method: 'DELETE'
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should return hook data with expected structure', function() {
        var sheetId = 'test-sheet-id';
        
        return client.hooks.list(sheetId).then(function(result) {
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
            
            var hook = result[0];
            expect(hook._id).toBeDefined();
            expect(hook.eventName).toBeDefined();
            expect(hook.sheetId).toBeDefined();
            expect(hook.targetUrl).toBeDefined();
        });
    });

    it('should handle empty hooks response', function() {
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
        
        return client.hooks.list(sheetId).then(function(result) {
            expect(result).toEqual([]);
        });
    });

    it('should handle different event names', function() {
        var sheetId = 'test-sheet-id';
        var payload = { 
            eventName: 'row.delete',
            targetUrl: 'https://example.com/delete-webhook'
        };
        
        return client.hooks.create(sheetId, payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/hooks',
                jasmine.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
            );
            expect(result).toBeDefined();
        });
    });

    it('should handle complex target URLs', function() {
        var sheetId = 'test-sheet-id';
        var payload = { 
            eventName: 'row.add',
            targetUrl: 'https://api.example.com/webhooks/orca-scan?secret=abc123&version=2'
        };
        
        return client.hooks.create(sheetId, payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/hooks',
                jasmine.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
            );
            expect(result).toBeDefined();
        });
    });
});
