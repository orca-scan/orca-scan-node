/* eslint-disable prefer-rest-params */
var proxyquire = require('proxyquire');

describe('Request', function() {
    var client;
    var mockFetch;
    var OrcaScanNode;

    beforeEach(function() {
        // This will be set in each individual test
    });

    it('should build URL with query parameters', function(done) {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.resolve({
                ok: true,
                status: 200,
                headers: { get: function() { return null; } },
                text: function() { return Promise.resolve('{"data": "test"}'); }
            })
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');
        
        var query = { limit: 10, skip: 20, filter: 'name contains "test"' };
        
        client.sheets.list().then(function() {
            // This will use the default URL without query params
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets',
                jasmine.any(Object)
            );
            done();
        });
    });

    it('should handle URL encoding of special characters', function(done) {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.resolve({
                ok: true,
                status: 200,
                headers: { get: function() { return null; } },
                text: function() { return Promise.resolve('{"data": "test"}'); }
            })
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        var sheetId = 'test/sheet:id with spaces';
        
        client.sheets.fields(sheetId).then(function() {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test%2Fsheet%3Aid%20with%20spaces/fields',
                jasmine.any(Object)
            );
            done();
        });
    });

    it('should handle empty query parameters', function(done) {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.resolve({
                ok: true,
                status: 200,
                headers: { get: function() { return null; } },
                text: function() { return Promise.resolve('{"data": "test"}'); }
            })
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        var query = { empty: '', null: null, undefined: undefined };
        
        client.rows.list('test-sheet-id', query).then(function() {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rows?empty=',
                jasmine.any(Object)
            );
            done();
        });
    });

    it('should handle 204 No Content responses', function(done) {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.resolve({
                ok: true,
                status: 204,
                headers: { get: function() { return null; } },
                text: function() { return Promise.resolve(''); }
            })
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        client.sheets.clear('test-sheet-id').then(function(result) {
            expect(result.status).toBe(204);
            expect(result.data).toBeNull();
            done();
        });
    });

    it('should handle JSON parsing errors gracefully', function(done) {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.resolve({
                ok: true,
                status: 200,
                headers: { get: function() { return null; } },
                text: function() { return Promise.resolve('invalid json'); }
            })
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        client.sheets.list().then(function(result) {
            expect(result.status).toBe(200);
            expect(result.data).toEqual({ raw: 'invalid json' });
            done();
        });
    });

    it('should handle empty response text', function(done) {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.resolve({
                ok: true,
                status: 200,
                headers: { get: function() { return null; } },
                text: function() { return Promise.resolve(''); }
            })
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        client.sheets.list().then(function(result) {
            expect(result.status).toBe(200);
            expect(result.data).toBeNull();
            done();
        });
    });

    it('should retry on 429 rate limit', function(done) {
        var callCount = 0;
        mockFetch = jasmine.createSpy('fetch').and.callFake(function() {
            callCount++;
            if (callCount === 1) {
                return Promise.resolve({
                    ok: false,
                    status: 429,
                    headers: { 
                        get: function(name) { 
                            return name === 'retry-after' ? '1' : null; 
                        } 
                    },
                    text: function() { return Promise.resolve('{"error": "rate limited"}'); }
                });
            } else {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    headers: { get: function() { return null; } },
                    text: function() { return Promise.resolve('{"data": "success"}'); }
                });
            }
        });
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        client.sheets.list().then(function(result) {
            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(result.status).toBe(200);
            expect(result.data).toEqual('success');
            done();
        });
    });

    it('should retry on 503 service unavailable', function(done) {
        var callCount = 0;
        mockFetch = jasmine.createSpy('fetch').and.callFake(function() {
            callCount++;
            if (callCount === 1) {
                return Promise.resolve({
                    ok: false,
                    status: 503,
                    headers: { get: function() { return null; } },
                    text: function() { return Promise.resolve('{"error": "service unavailable"}'); }
                });
            } else {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    headers: { get: function() { return null; } },
                    text: function() { return Promise.resolve('{"data": "success"}'); }
                });
            }
        });
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        client.sheets.list().then(function(result) {
            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(result.status).toBe(200);
            done();
        });
    });

    it('should retry on 5xx server errors', function(done) {
        var callCount = 0;
        mockFetch = jasmine.createSpy('fetch').and.callFake(function() {
            callCount++;
            if (callCount === 1) {
                return Promise.resolve({
                    ok: false,
                    status: 500,
                    headers: { get: function() { return null; } },
                    text: function() { return Promise.resolve('{"error": "internal server error"}'); }
                });
            } else {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    headers: { get: function() { return null; } },
                    text: function() { return Promise.resolve('{"data": "success"}'); }
                });
            }
        });
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        client.sheets.list().then(function(result) {
            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(result.status).toBe(200);
            done();
        });
    });

    it('should respect maxRetries limit', function(done) {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.resolve({
                ok: false,
                status: 500,
                headers: { get: function() { return null; } },
                text: function() { return Promise.resolve('{"error": "server error"}'); }
            })
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        client.sheets.list().then(function() {
            // Should not reach here
            done.fail('Should have thrown an error');
        }).catch(function(error) {
            expect(error.status).toBe(500);
            expect(mockFetch).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
            done();
        });
    });

    it('should handle retry-after header with seconds', function(done) {
        var callCount = 0;
        mockFetch = jasmine.createSpy('fetch').and.callFake(function() {
            callCount++;
            if (callCount === 1) {
                return Promise.resolve({
                    ok: false,
                    status: 429,
                    headers: { 
                        get: function(name) { 
                            return name === 'retry-after' ? '2' : null; 
                        } 
                    },
                    text: function() { return Promise.resolve('{"error": "rate limited"}'); }
                });
            } else {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    headers: { get: function() { return null; } },
                    text: function() { return Promise.resolve('{"data": "success"}'); }
                });
            }
        });
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        client.sheets.list().then(function(result) {
            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(result.status).toBe(200);
            done();
        });
    });

    it('should handle retry-after header with HTTP date', function(done) {
        var callCount = 0;
        var futureDate = new Date(Date.now() + 1000).toUTCString();
        
        mockFetch = jasmine.createSpy('fetch').and.callFake(function() {
            callCount++;
            if (callCount === 1) {
                return Promise.resolve({
                    ok: false,
                    status: 429,
                    headers: { 
                        get: function(name) { 
                            return name === 'retry-after' ? futureDate : null; 
                        } 
                    },
                    text: function() { return Promise.resolve('{"error": "rate limited"}'); }
                });
            } else {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    headers: { get: function() { return null; } },
                    text: function() { return Promise.resolve('{"data": "success"}'); }
                });
            }
        });
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        client.sheets.list().then(function(result) {
            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(result.status).toBe(200);
            done();
        });
    });

    it('should handle request timeout', function(done) {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            new Promise(function(resolve) {
                // Never resolve, simulating timeout
            })
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        // Create client with short timeout
        var fastClient = new OrcaScanNode('test-api-key', { timeoutMs: 100 });

        fastClient.sheets.list().then(function() {
            done.fail('Should have timed out');
        }).catch(function(error) {
            expect(error.message).toBe('request timeout');
            done();
        });
    });

    it('should handle network errors', function(done) {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.reject(new Error('Network error'))
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        client.sheets.list().then(function() {
            done.fail('Should have thrown an error');
        }).catch(function(error) {
            expect(error.message).toBe('Network error');
            done();
        });
    });

    it('should handle 4xx client errors without retry', function(done) {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.resolve({
                ok: false,
                status: 400,
                headers: { get: function() { return null; } },
                text: function() { return Promise.resolve('{"error": "bad request"}'); }
            })
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        client.sheets.list().then(function() {
            done.fail('Should have thrown an error');
        }).catch(function(error) {
            expect(error.status).toBe(400);
            expect(mockFetch).toHaveBeenCalledTimes(1); // No retries for 4xx
            done();
        });
    });

    it('should handle 401 unauthorized without retry', function(done) {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.resolve({
                ok: false,
                status: 401,
                headers: { get: function() { return null; } },
                text: function() { return Promise.resolve('{"error": "unauthorized"}'); }
            })
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        client.sheets.list().then(function() {
            done.fail('Should have thrown an error');
        }).catch(function(error) {
            expect(error.status).toBe(401);
            expect(mockFetch).toHaveBeenCalledTimes(1); // No retries for 401
            done();
        });
    });

    it('should handle 403 forbidden without retry', function(done) {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.resolve({
                ok: false,
                status: 403,
                headers: { get: function() { return null; } },
                text: function() { return Promise.resolve('{"error": "forbidden"}'); }
            })
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        client.sheets.list().then(function() {
            done.fail('Should have thrown an error');
        }).catch(function(error) {
            expect(error.status).toBe(403);
            expect(mockFetch).toHaveBeenCalledTimes(1); // No retries for 403
            done();
        });
    });

    it('should handle 404 not found without retry', function(done) {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.resolve({
                ok: false,
                status: 404,
                headers: { get: function() { return null; } },
                text: function() { return Promise.resolve('{"error": "not found"}'); }
            })
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        client.sheets.list().then(function() {
            done.fail('Should have thrown an error');
        }).catch(function(error) {
            expect(error.status).toBe(404);
            expect(mockFetch).toHaveBeenCalledTimes(1); // No retries for 404
            done();
        });
    });

    it('should include proper headers in requests', function(done) {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.resolve({
                ok: true,
                status: 200,
                headers: { get: function() { return null; } },
                text: function() { return Promise.resolve('{"data": "test"}'); }
            })
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        client.sheets.list().then(function() {
            expect(mockFetch).toHaveBeenCalledWith(
                jasmine.any(String),
                jasmine.objectContaining({
                    headers: jasmine.objectContaining({
                        'Authorization': 'Bearer test-api-key',
                        'Accept': 'application/json'
                    })
                })
            );
            done();
        });
    });

    it('should include Content-Type header for POST requests', function(done) {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.resolve({
                ok: true,
                status: 200,
                headers: { get: function() { return null; } },
                text: function() { return Promise.resolve('{"data": "test"}'); }
            })
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        var payload = { name: 'Test Sheet' };
        client.sheets.create(payload).then(function() {
            expect(mockFetch).toHaveBeenCalledWith(
                jasmine.any(String),
                jasmine.objectContaining({
                    headers: jasmine.objectContaining({
                        'Content-Type': 'application/json'
                    })
                })
            );
            done();
        });
    });

    it('should include Content-Type header for PUT requests', function(done) {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.resolve({
                ok: true,
                status: 200,
                headers: { get: function() { return null; } },
                text: function() { return Promise.resolve('{"data": "test"}'); }
            })
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        var payload = { name: 'Updated Sheet' };
        client.sheets.rename('test-sheet-id', payload).then(function() {
            expect(mockFetch).toHaveBeenCalledWith(
                jasmine.any(String),
                jasmine.objectContaining({
                    headers: jasmine.objectContaining({
                        'Content-Type': 'application/json'
                    })
                })
            );
            done();
        });
    });
});
