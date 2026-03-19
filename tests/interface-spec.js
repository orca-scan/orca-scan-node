/* eslint-disable prefer-rest-params */
var proxyquire = require('proxyquire');

describe('Interface', function() {
    var client;
    var OrcaScanNode;

    beforeAll(function() {
        // Load the module once for all tests
        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': function() {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    headers: { get: function() { return null; } },
                    text: function() { return Promise.resolve('{"data": {"test": "value"}}'); }
                });
            }
        });
    });

    beforeEach(function() {
        // Create a fresh client for each test
        client = new OrcaScanNode('test-api-key');
    });

    it('should expose the correct namespaces', function() {
        expect(client.sheets).toBeDefined();
        expect(client.rows).toBeDefined();
        expect(client.fields).toBeDefined();
        expect(client.history).toBeDefined();
        expect(client.users).toBeDefined();
        expect(client.hooks).toBeDefined();
    });

    it('should expose sheet methods', function() {
        expect(typeof client.sheets.list).toBe('function');
        expect(typeof client.sheets.create).toBe('function');
        expect(typeof client.sheets.clear).toBe('function');
        expect(typeof client.sheets.rename).toBe('function');
        expect(typeof client.sheets.delete).toBe('function');
    });

    it('should expose settings methods', function() {
        expect(typeof client.settings.get).toBe('function');
        expect(typeof client.settings.update).toBe('function');
    });

    it('should expose rows methods', function() {
        expect(typeof client.rows.list).toBe('function');
        expect(typeof client.rows.get).toBe('function');
        expect(typeof client.rows.add).toBe('function');
        expect(typeof client.rows.updateOne).toBe('function');
        expect(typeof client.rows.updateMany).toBe('function');
        expect(typeof client.rows.deleteOne).toBe('function');
        expect(typeof client.rows.deleteMany).toBe('function');
        expect(typeof client.rows.count).toBe('function');
    });

    it('should expose fields methods', function() {
        expect(typeof client.fields.list).toBe('function');
        expect(typeof client.fields.get).toBe('function');
        expect(typeof client.fields.create).toBe('function');
        expect(typeof client.fields.update).toBe('function');
        expect(typeof client.fields.delete).toBe('function');
    });

    it('should expose history methods', function() {
        expect(typeof client.history.sheet).toBe('function');
        expect(typeof client.history.row).toBe('function');
    });

    it('should expose users methods', function() {
        expect(typeof client.users.list).toBe('function');
        expect(typeof client.users.add).toBe('function');
        expect(typeof client.users.update).toBe('function');
        expect(typeof client.users.remove).toBe('function');
    });

    it('should expose hooks methods', function() {
        expect(typeof client.hooks.events).toBe('function');
        expect(typeof client.hooks.list).toBe('function');
        expect(typeof client.hooks.get).toBe('function');
        expect(typeof client.hooks.create).toBe('function');
        expect(typeof client.hooks.update).toBe('function');
        expect(typeof client.hooks.delete).toBe('function');
    });

    it('should not expose internal methods or properties', function() {
        // These should not be exposed on the public interface
        expect(client.request).toBeUndefined();
        expect(client.buildUrl).toBeUndefined();
        expect(client.parseJson).toBeUndefined();
        expect(client.shouldRetry).toBeUndefined();
        expect(client.calculateRetryDelay).toBeUndefined();
        expect(client.barcodeRequest).toBeUndefined();
        
        // These are internal properties that are exposed for configuration purposes
        // but should not be used by consumers
        expect(client.endpoint).toBeDefined();
        expect(client.timeoutMs).toBeDefined();
        expect(client.maxRetries).toBeDefined();
        expect(client.defaultHeaders).toBeDefined();
        
        // Verify these are the expected values
        expect(client.endpoint).toBe('https://api.orcascan.com/v1');
        expect(client.timeoutMs).toBe(30000);
        expect(client.maxRetries).toBe(3);
        expect(client.defaultHeaders).toEqual({
            'Authorization': 'Bearer test-api-key',
            'Accept': 'application/json'
        });
    });

    it('should have consistent method signatures across namespaces', function() {
        // All methods should be functions
        var namespaces = ['sheets', 'rows', 'fields', 'history', 'users', 'hooks'];
        
        namespaces.forEach(function(namespace) {
            var methods = Object.keys(client[namespace]);
            methods.forEach(function(method) {
                expect(typeof client[namespace][method]).toBe('function');
            });
        });
    });

    it('should have consistent error handling across all methods', function() {
        // Test that all methods throw errors for missing required parameters
        expect(function() { client.sheets.create(); }).toThrow();
        expect(function() { client.rows.add(); }).toThrow();
        expect(function() { client.fields.create(); }).toThrow();
        expect(function() { client.users.add(); }).toThrow();
        expect(function() { client.hooks.create(); }).toThrow();
    });

    it('should maintain consistent API structure', function() {
        // All namespaces should be objects
        var namespaces = ['sheets', 'rows', 'fields', 'history', 'users', 'hooks'];
        
        namespaces.forEach(function(namespace) {
            expect(typeof client[namespace]).toBe('object');
            expect(client[namespace]).not.toBeNull();
            expect(Array.isArray(client[namespace])).toBe(false);
        });
    });

    it('should have consistent method names across namespaces where appropriate', function() {
        
        // Verify that common methods exist where they make sense
        expect(typeof client.sheets.list).toBe('function');
        expect(typeof client.rows.list).toBe('function');
        expect(typeof client.fields.list).toBe('function');
        expect(typeof client.users.list).toBe('function');
        expect(typeof client.hooks.list).toBe('function');
        
        expect(typeof client.rows.get).toBe('function');
        expect(typeof client.fields.get).toBe('function');
        expect(typeof client.hooks.get).toBe('function');
        
        expect(typeof client.sheets.create).toBe('function');
        expect(typeof client.rows.add).toBe('function'); // Note: rows uses 'add' instead of 'create'
        expect(typeof client.fields.create).toBe('function');
        expect(typeof client.users.add).toBe('function'); // Note: users uses 'add' instead of 'create'
        expect(typeof client.hooks.create).toBe('function');
        
        expect(typeof client.fields.update).toBe('function');
        expect(typeof client.hooks.update).toBe('function');
        
        expect(typeof client.sheets.delete).toBe('function');
        expect(typeof client.fields.delete).toBe('function');
        expect(typeof client.hooks.delete).toBe('function');
    });

    it('should have methods that return promises', function() {
        // Test that async methods return promises
        var promise = client.sheets.list();
        expect(promise).toBeDefined();
        expect(typeof promise.then).toBe('function');
        expect(typeof promise.catch).toBe('function');
    });

    it('should maintain consistent parameter validation', function() {
        // All methods should validate their first parameter (usually sheetId)
        expect(function() { client.settings.get(); }).toThrow();
        expect(function() { client.rows.list(); }).toThrow();
        expect(function() { client.fields.list(); }).toThrow();
        expect(function() { client.history.sheet(); }).toThrow();
        expect(function() { client.users.list(); }).toThrow();
        expect(function() { client.hooks.list(); }).toThrow();
    });

    it('should have consistent method naming conventions', function() {
        // Method names should follow consistent patterns
        var namespaces = ['sheets', 'rows', 'fields', 'history', 'users', 'hooks'];
        
        namespaces.forEach(function(namespace) {
            var methods = Object.keys(client[namespace]);
            methods.forEach(function(method) {
                // Method names should be camelCase
                expect(method).toMatch(/^[a-z][a-zA-Z0-9]*$/);
                // Method names should not contain underscores
                expect(method).not.toContain('_');
            });
        });
    });

    it('should expose the correct number of methods per namespace', function() {
        // Verify expected method counts for each namespace
        expect(Object.keys(client.sheets).length).toBe(5); // list, create, clear, rename, delete
        expect(Object.keys(client.rows).length).toBe(8); // list, get, add, updateOne, updateMany, deleteOne, deleteMany, count
        expect(Object.keys(client.fields).length).toBe(5); // list, get, create, update, delete
        expect(Object.keys(client.history).length).toBe(2); // sheet, row
        expect(Object.keys(client.users).length).toBe(4); // list, add, update, remove
        expect(Object.keys(client.hooks).length).toBe(6); // events, list, get, create, update, delete
        expect(Object.keys(client.settings).length).toBe(2); // get, update
    });

    it('should not expose any additional unexpected namespaces', function() {
        var expectedNamespaces = ['sheets', 'rows', 'fields', 'history', 'users', 'hooks', 'settings'];
        var actualNamespaces = Object.keys(client).filter(function(key) {
            // Filter out any non-namespace properties
            // Only include properties that are objects with methods
            var prop = client[key];
            return typeof prop === 'object' && 
                   prop !== null && 
                   !Array.isArray(prop) && 
                   Object.keys(prop).length > 0 && // Has properties
                   Object.keys(prop).some(function(method) { // Has at least one method
                       return typeof prop[method] === 'function';
                   });
        });
        
        expect(actualNamespaces.sort()).toEqual(expectedNamespaces.sort());
    });

    it('should maintain consistent error message format', function() {
        // All error messages should follow the same pattern
        try {
            client.sheets.create();
        } catch (e) {
            expect(e.message).toMatch(/is required and must be/);
        }
        
        try {
            client.rows.add();
        } catch (e) {
            expect(e.message).toMatch(/is required and must be/);
        }
        
        try {
            client.fields.create();
        } catch (e) {
            expect(e.message).toMatch(/is required and must be/);
        }
    });
});
