/* eslint-disable prefer-rest-params */
var proxyquire = require('proxyquire');

describe('Triggers', function() {
    var client;
    var mockFetch;
    var OrcaScanNode;

    beforeAll(function() {
        mockFetch = jasmine.createSpy('fetch').and.returnValue(
            Promise.resolve({
                ok: true,
                status: 200,
                headers: { get: function() { return null; } },
                text: function() { return Promise.resolve('{"data": {"_id": "trig1", "name": "low stock"}}'); }
            })
        );

        OrcaScanNode = proxyquire('../index.js', {
            'node-fetch': mockFetch
        });
    });

    beforeEach(function() {
        mockFetch.calls.reset();
        client = new OrcaScanNode('test-api-key');
    });

    it('should get the trigger schema for a sheet', function() {
        return client.triggers.schema('sheet1').then(function() {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/sheet1/trigger-schema',
                jasmine.objectContaining({ method: 'GET' })
            );
        });
    });

    it('should list triggers on a sheet', function() {
        return client.triggers.list('sheet1').then(function() {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/sheet1/triggers',
                jasmine.objectContaining({ method: 'GET' })
            );
        });
    });

    it('should get a single trigger', function() {
        return client.triggers.get('sheet1', 'trig1').then(function() {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/sheet1/triggers/trig1',
                jasmine.objectContaining({ method: 'GET' })
            );
        });
    });

    it('should create a trigger with the payload as the body', function() {
        var payload = {
            name: 'low stock',
            conditionField: 'Quantity',
            conditionType: 'is less than',
            conditionValue: '5',
            actionType: 'notify me',
            notifyMethod: 'email',
            notifyEmails: 'ops@example.com'
        };
        return client.triggers.create('sheet1', payload).then(function(result) {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/sheet1/triggers',
                jasmine.objectContaining({ method: 'POST', body: JSON.stringify(payload) })
            );
            expect(result._id).toBe('trig1');
        });
    });

    it('should update a trigger with only the changed fields', function() {
        var payload = { conditionValue: '10' };
        return client.triggers.update('sheet1', 'trig1', payload).then(function() {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/sheet1/triggers/trig1',
                jasmine.objectContaining({ method: 'PUT', body: JSON.stringify(payload) })
            );
        });
    });

    it('should delete a trigger', function() {
        return client.triggers.delete('sheet1', 'trig1').then(function() {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/sheet1/triggers/trig1',
                jasmine.objectContaining({ method: 'DELETE' })
            );
        });
    });

    it('should url-encode ids', function() {
        return client.triggers.get('a/b', 'c:d').then(function() {
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.orcascan.com/v1/sheets/a%2Fb/triggers/c%3Ad',
                jasmine.objectContaining({ method: 'GET' })
            );
        });
    });

    // validation

    it('should throw when schema/list/get/delete called without sheetId', function() {
        expect(function() { client.triggers.schema(); }).toThrowError('sheetId is required and must be a string');
        expect(function() { client.triggers.list(); }).toThrowError('sheetId is required and must be a string');
        expect(function() { client.triggers.get(); }).toThrowError('sheetId is required and must be a string');
        expect(function() { client.triggers.delete(); }).toThrowError('sheetId is required and must be a string');
    });

    it('should throw when get/delete called without triggerId', function() {
        expect(function() { client.triggers.get('sheet1'); }).toThrowError('triggerId is required and must be a string');
        expect(function() { client.triggers.delete('sheet1'); }).toThrowError('triggerId is required and must be a string');
    });

    it('should throw when creating without required fields', function() {
        expect(function() { client.triggers.create('sheet1', {}); }).toThrowError('payload.name is required and must be a string');
        expect(function() { client.triggers.create('sheet1', { name: 'x' }); }).toThrowError('payload.conditionField is required and must be a string');
        expect(function() { client.triggers.create('sheet1', { name: 'x', conditionField: 'Quantity' }); }).toThrowError('payload.conditionType is required and must be a string');
        expect(function() { client.triggers.create('sheet1', { name: 'x', conditionField: 'Quantity', conditionType: 'equals' }); }).toThrowError('payload.actionType is required and must be a string');
    });

    it('should throw when updating without a payload', function() {
        expect(function() { client.triggers.update('sheet1', 'trig1'); }).toThrowError('payload is required and must be an object');
    });
});
