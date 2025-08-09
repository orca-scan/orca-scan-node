/* eslint-disable prefer-rest-params */
var proxyquire = require('proxyquire');

describe('Users', function() {
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
                text: function() { return Promise.resolve('{"data": [{"_id": "user1", "email": "user@example.com", "owner": false, "canUpdate": true, "canDelete": false, "canExport": true, "canAdmin": false}]}'); }
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

    it('should list users on a sheet', function() {
        var sheetId = 'test-sheet-id';
        
        return client.users.list(sheetId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/users',
                jasmine.objectContaining({
                    method: 'GET',
                    headers: jasmine.objectContaining({
                        'Authorization': 'Bearer test-api-key'
                    })
                })
            );
            expect(result.status).toBe(200);
            expect(result.data).toBeDefined();
            expect(Array.isArray(result.data)).toBe(true);
        });
    });

    it('should throw error when listing users without sheetId', function() {
        expect(function() {
            client.users.list();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when listing users with non-string sheetId', function() {
        expect(function() {
            client.users.list(123);
        }).toThrowError('sheetId is required and must be a string');

        expect(function() {
            client.users.list(null);
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should add a user to a sheet with required email', function() {
        var sheetId = 'test-sheet-id';
        var payload = { email: 'newuser@example.com' };
        
        return client.users.add(sheetId, payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/users',
                jasmine.objectContaining({
                    method: 'POST',
                    headers: jasmine.objectContaining({
                        'Authorization': 'Bearer test-api-key',
                        'Content-Type': 'application/json'
                    }),
                    body: JSON.stringify(payload)
                })
            );
            expect(result.status).toBe(200);
        });
    });

    it('should add a user with all permissions', function() {
        var sheetId = 'test-sheet-id';
        var payload = { 
            email: 'admin@example.com',
            canUpdate: true,
            canDelete: true,
            canExport: true,
            canAdmin: true
        };
        
        return client.users.add(sheetId, payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/users',
                jasmine.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
            );
            expect(result.status).toBe(200);
        });
    });

    it('should add a user with partial permissions', function() {
        var sheetId = 'test-sheet-id';
        var payload = { 
            email: 'viewer@example.com',
            canUpdate: false,
            canDelete: false,
            canExport: true,
            canAdmin: false
        };
        
        return client.users.add(sheetId, payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/users',
                jasmine.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
            );
            expect(result.status).toBe(200);
        });
    });

    it('should throw error when adding user without sheetId', function() {
        expect(function() {
            client.users.add();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when adding user without payload', function() {
        expect(function() {
            client.users.add('test-sheet-id');
        }).toThrowError('payload is required and must be an object');
    });

    it('should throw error when adding user with non-object payload', function() {
        expect(function() {
            client.users.add('test-sheet-id', 'invalid');
        }).toThrowError('payload is required and must be an object');

        expect(function() {
            client.users.add('test-sheet-id', null);
        }).toThrowError('payload is required and must be an object');
    });

    it('should throw error when adding user without email', function() {
        expect(function() {
            client.users.add('test-sheet-id', {});
        }).toThrowError('payload.email is required and must be a string');
    });

    it('should throw error when adding user with non-string email', function() {
        expect(function() {
            client.users.add('test-sheet-id', { email: 123 });
        }).toThrowError('payload.email is required and must be a string');

        expect(function() {
            client.users.add('test-sheet-id', { email: null });
        }).toThrowError('payload.email is required and must be a string');
    });

    it('should update a user in a sheet', function() {
        var sheetId = 'test-sheet-id';
        var userId = 'user1';
        var payload = { canUpdate: true, canDelete: true };
        
        return client.users.update(sheetId, userId, payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/users/user1',
                jasmine.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(payload)
                })
            );
            expect(result.status).toBe(200);
        });
    });

    it('should update user with all permission fields', function() {
        var sheetId = 'test-sheet-id';
        var userId = 'user1';
        var payload = { 
            canUpdate: true,
            canDelete: false,
            canExport: true,
            canAdmin: false
        };
        
        return client.users.update(sheetId, userId, payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/users/user1',
                jasmine.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(payload)
                })
            );
            expect(result.status).toBe(200);
        });
    });

    it('should throw error when updating user without sheetId', function() {
        expect(function() {
            client.users.update();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when updating user without userId', function() {
        expect(function() {
            client.users.update('test-sheet-id');
        }).toThrowError('userId is required and must be a string');
    });

    it('should throw error when updating user without payload', function() {
        expect(function() {
            client.users.update('test-sheet-id', 'user1');
        }).toThrowError('payload is required and must be an object');
    });

    it('should throw error when updating user with non-string userId', function() {
        expect(function() {
            client.users.update('test-sheet-id', 123, {});
        }).toThrowError('userId is required and must be a string');

        expect(function() {
            client.users.update('test-sheet-id', null, {});
        }).toThrowError('userId is required and must be a string');
    });

    it('should throw error when updating user with non-object payload', function() {
        expect(function() {
            client.users.update('test-sheet-id', 'user1', 'invalid');
        }).toThrowError('payload is required and must be an object');

        expect(function() {
            client.users.update('test-sheet-id', 'user1', null);
        }).toThrowError('payload is required and must be an object');
    });

    it('should remove a user from a sheet', function() {
        var sheetId = 'test-sheet-id';
        var userId = 'user1';
        
        return client.users.remove(sheetId, userId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/users/user1',
                jasmine.objectContaining({
                    method: 'DELETE'
                })
            );
            expect(result.status).toBe(200);
        });
    });

    it('should throw error when removing user without sheetId', function() {
        expect(function() {
            client.users.remove();
        }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw error when removing user without userId', function() {
        expect(function() {
            client.users.remove('test-sheet-id');
        }).toThrowError('userId is required and must be a string');
    });

    it('should throw error when removing user with non-string userId', function() {
        expect(function() {
            client.users.remove('test-sheet-id', 123);
        }).toThrowError('userId is required and must be a string');

        expect(function() {
            client.users.remove('test-sheet-id', null);
        }).toThrowError('userId is required and must be a string');
    });

    it('should handle sheetId with special characters in URL encoding', function() {
        var sheetId = 'test/sheet:id';
        
        return client.users.list(sheetId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test%2Fsheet%3Aid/users',
                jasmine.objectContaining({
                    method: 'GET'
                })
            );
            expect(result.status).toBe(200);
        });
    });

    it('should handle userId with special characters in URL encoding', function() {
        var sheetId = 'test-sheet-id';
        var userId = 'user/with:special';
        
        return client.users.remove(sheetId, userId).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/test-sheet-id/users/user%2Fwith%3Aspecial',
                jasmine.objectContaining({
                    method: 'DELETE'
                })
            );
            expect(result.status).toBe(200);
        });
    });

    it('should return user data with expected structure', function() {
        var sheetId = 'test-sheet-id';
        
        return client.users.list(sheetId).then(function(result) {
            expect(result.data).toBeDefined();
            expect(result.data.length).toBeGreaterThan(0);
            
            var user = result.data[0];
            expect(user._id).toBeDefined();
            expect(user.email).toBeDefined();
            expect(user.owner).toBeDefined();
            expect(user.canUpdate).toBeDefined();
            expect(user.canDelete).toBeDefined();
            expect(user.canExport).toBeDefined();
            expect(user.canAdmin).toBeDefined();
        });
    });

    it('should handle empty users response', function() {
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
        
        return client.users.list(sheetId).then(function(result) {
            expect(result.status).toBe(200);
            expect(result.data).toEqual([]);
        });
    });
});
