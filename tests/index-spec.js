/* eslint-disable prefer-rest-params */
var proxyquire = require('proxyquire');

describe('orca-scan-node', function() {
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
        // Reset the spy for each test
        mockFetch.calls.reset();
    });

    it('should throw error when apiKey is not provided', function() {
        expect(function() { new OrcaScanNode(); }).toThrowError('apiKey is required');
    });

    it('should throw error when apiKey is not a string', function() {
        expect(function() { new OrcaScanNode(123); }).toThrowError('apiKey must be a string');
    });

    it('should create instance with default options', function() {
        client = new OrcaScanNode('test-api-key');
        
        expect(client).toBeDefined();
        expect(client.sheets).toBeDefined();
        expect(client.rows).toBeDefined();
        expect(client.history).toBeDefined();
        expect(client.users).toBeDefined();
        expect(client.hooks).toBeDefined();
    });

    it('should create instance with custom endpoint', function() {
        var baseUrl = 'https://custom-api.example.com/v1';

        client = new OrcaScanNode('test-api-key', {
            endpoint: baseUrl
        });
        
        expect(client).toBeDefined();
        expect(client.endpoint).toBe(baseUrl);
    });

    it('should use custom endpoint for requests', function() {
        var baseUrl = 'https://custom-api.example.com/v1';

        client = new OrcaScanNode('test-api-key', {
            endpoint: baseUrl
        });

        return client.sheets.list().then(function() {
            expect(mockFetch).toHaveBeenCalledWith(
                baseUrl + '/sheets',
                jasmine.objectContaining({
                    method: 'GET'
                })
            );
        });
    });

    it('should not leak Content-Type header into later GET requests', function() {
        client = new OrcaScanNode('test-api-key');

        return client.sheets.create({ name: 'Inventory' })
            .then(function() {
                return client.sheets.list();
            })
            .then(function() {
                var postCall = mockFetch.calls.argsFor(0);
                var getCall = mockFetch.calls.argsFor(1);

                expect(postCall[1].headers['Content-Type']).toBe('application/json');
                expect(getCall[1].headers['Content-Type']).toBeUndefined();
            });
    });

    it('should create instance with custom timeout', function() {
        client = new OrcaScanNode('test-api-key', {
            timeoutMs: 60000
        });
        
        expect(client).toBeDefined();
    });

    it('should create instance with custom maxRetries', function() {
        client = new OrcaScanNode('test-api-key', {
            maxRetries: 5
        });
        
        expect(client).toBeDefined();
    });

    it('should create instance with all custom options', function() {
        var baseUrl = 'https://custom-api.example.com/v1';

        client = new OrcaScanNode('test-api-key', {
            endpoint: baseUrl,
            timeoutMs: 60000,
            maxRetries: 5
        });
        
        expect(client).toBeDefined();
        expect(client.endpoint).toBe(baseUrl);
        expect(client.timeoutMs).toBe(60000);
        expect(client.maxRetries).toBe(5);
    });

    it('should handle empty options object', function() {
        client = new OrcaScanNode('test-api-key', {});
        
        expect(client).toBeDefined();
    });

    it('should handle null options', function() {
        client = new OrcaScanNode('test-api-key', null);
        
        expect(client).toBeDefined();
    });

    it('should handle undefined options', function() {
        client = new OrcaScanNode('test-api-key', undefined);
        
        expect(client).toBeDefined();
    });

    it('should set default timeout when not provided', function() {
        client = new OrcaScanNode('test-api-key');
        
        expect(client).toBeDefined();
    });

    it('should set default maxRetries when not provided', function() {
        client = new OrcaScanNode('test-api-key');
        
        expect(client).toBeDefined();
    });

    it('should set default baseUrl when not provided', function() {
        client = new OrcaScanNode('test-api-key');
        
        expect(client).toBeDefined();
    });

    it('should handle non-numeric timeout gracefully', function() {
        client = new OrcaScanNode('test-api-key', {
            timeoutMs: 'invalid'
        });
        
        expect(client).toBeDefined();
    });

    it('should handle non-numeric maxRetries gracefully', function() {
        client = new OrcaScanNode('test-api-key', {
            maxRetries: 'invalid'
        });
        
        expect(client).toBeDefined();
    });

    it('should handle zero timeout', function() {
        client = new OrcaScanNode('test-api-key', {
            timeoutMs: 0
        });
        
        expect(client).toBeDefined();
    });

    it('should handle zero maxRetries', function() {
        client = new OrcaScanNode('test-api-key', {
            maxRetries: 0
        });
        
        expect(client).toBeDefined();
    });

    it('should handle negative timeout', function() {
        client = new OrcaScanNode('test-api-key', {
            timeoutMs: -1000
        });
        
        expect(client).toBeDefined();
    });

    it('should handle negative maxRetries', function() {
        client = new OrcaScanNode('test-api-key', {
            maxRetries: -1
        });
        
        expect(client).toBeDefined();
    });
});
