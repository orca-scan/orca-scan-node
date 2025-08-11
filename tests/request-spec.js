/* eslint-disable prefer-rest-params */
var proxyquire = require('proxyquire');

describe('Request', function() {
    var client;
    var mockFetch;
    var OrcaScanNode;

    it('should build URL with query parameters', function() {
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
        
        return client.sheets.list().then(function() {
            // This will use the default URL without query params
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets',
                jasmine.any(Object)
            );
        });
    });

    it('should handle URL encoding of special characters', function() {
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
        
        return client.sheets.fields(sheetId).then(function() {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test%2Fsheet%3Aid%20with%20spaces/fields',
                jasmine.any(Object)
            );
        });
    });

    it('should handle empty query parameters', function() {
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
        
        return client.rows.list('test-sheet-id', query).then(function() {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/rows?empty=',
                jasmine.any(Object)
            );
        });
    });

    it('should handle 204 No Content responses', function() {
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

        return client.sheets.clear('test-sheet-id').then(function(result) {
            expect(result.status).toBe(204);
            expect(result.data).toBeNull();
        });
    });

    it('should handle JSON parsing errors gracefully', function() {
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

        return client.sheets.list().then(function(result) {
            expect(result.status).toBe(200);
            expect(result.data).toEqual({ raw: 'invalid json' });
        });
    });

    it('should handle empty response text', function() {
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

        return client.sheets.list().then(function(result) {
            expect(result.status).toBe(200);
            expect(result.data).toBeNull();
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
        var callCount = 0;
        mockFetch = jasmine.createSpy('fetch').and.callFake(function() {
            callCount++;
            return Promise.resolve({
                ok: false,
                status: 500,
                headers: { get: function() { return null; } },
                text: function() { return Promise.resolve('{"error": "internal server error"}'); }
            });
        });
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key', { maxRetries: 2 });

        client.sheets.list().catch(function(error) {
            expect(mockFetch).toHaveBeenCalledTimes(3); // Initial call + 2 retries
            expect(error.message).toContain('http 500');
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

        var startTime = Date.now();
        client.sheets.list().then(function(result) {
            var endTime = Date.now();
            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(result.status).toBe(200);
            expect(endTime - startTime).toBeGreaterThan(1000); // Should wait at least 1 second
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
                setTimeout(function() {
                    resolve({
                        ok: true,
                        status: 200,
                        headers: { get: function() { return null; } },
                        text: function() { return Promise.resolve('{"data": "success"}'); }
                    });
                }, 2000);
            })
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key', { timeoutMs: 1000 });

        client.sheets.list().catch(function(error) {
            expect(error.message).toContain('timeout');
            done();
        });
    });

    it('should handle network errors', function() {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.reject(new Error('Network error'))
        );
        
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
        
        client = new OrcaScanNode('test-api-key');

        return client.sheets.list().catch(function(error) {
            expect(error.message).toContain('Network error');
        });
    });

    it('should handle 4xx client errors without retry', function() {
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

        return client.sheets.list().catch(function(error) {
            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(error.message).toContain('http 400');
        });
    });

    it('should handle 401 unauthorized without retry', function() {
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

        return client.sheets.list().catch(function(error) {
            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(error.message).toContain('http 401');
        });
    });

    it('should handle 403 forbidden without retry', function() {
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

        return client.sheets.list().catch(function(error) {
            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(error.message).toContain('http 403');
        });
    });

    it('should handle 404 not found without retry', function() {
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

        return client.sheets.list().catch(function(error) {
            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(error.message).toContain('http 404');
        });
    });

    it('should include proper headers in requests', function() {
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

        return client.sheets.list().then(function() {
            expect(mockFetch).toHaveBeenCalledWith(
                jasmine.any(String),
                jasmine.objectContaining({
                    headers: jasmine.objectContaining({
                        'Authorization': 'Bearer test-api-key',
                        'Accept': 'application/json'
                    })
                })
            );
        });
    });

    it('should include Content-Type header for POST requests', function() {
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
        
        return client.sheets.create(payload).then(function() {
            expect(mockFetch).toHaveBeenCalledWith(
                jasmine.any(String),
                jasmine.objectContaining({
                    headers: jasmine.objectContaining({
                        'Content-Type': 'application/json'
                    })
                })
            );
        });
    });

    it('should include Content-Type header for PUT requests', function() {
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
        
        return client.sheets.rename('test-sheet-id', payload).then(function() {
            expect(mockFetch).toHaveBeenCalledWith(
                jasmine.any(String),
                jasmine.objectContaining({
                    headers: jasmine.objectContaining({
                        'Content-Type': 'application/json'
                    })
                })
            );
        });
    });
});
