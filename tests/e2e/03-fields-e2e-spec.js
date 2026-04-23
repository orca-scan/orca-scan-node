var setup = require('./setup');

describe('e2e: fields', function () {

    var client = setup.getClient();
    var fieldKey = null;

    it('should create a field', async function () {
        var field = await client.fields.create(setup.getSheetId(), {
            label: 'E2E Notes',
            format: 'text'
        });
        expect(field).toBeDefined();
        expect(field.key).toBeDefined();
        expect(field.label).toBe('E2E Notes');

        fieldKey = field.key;
    });

    it('should list fields and include the new one', async function () {
        var fields = await client.fields.list(setup.getSheetId());
        expect(Array.isArray(fields)).toBe(true);

        var found = fields.find(function (f) { return f.key === fieldKey; });
        expect(found).toBeDefined();
    });

    it('should update the field label', async function () {
        await client.fields.update(setup.getSheetId(), fieldKey, {
            label: 'E2E Notes Updated'
        });

        var fields = await client.fields.list(setup.getSheetId());
        var found = fields.find(function (f) { return f.key === fieldKey; });
        expect(found.label).toBe('E2E Notes Updated');
    });

    it('should delete the field', async function () {
        await client.fields.delete(setup.getSheetId(), fieldKey);

        var fields = await client.fields.list(setup.getSheetId());
        var found = fields.find(function (f) { return f.key === fieldKey; });
        expect(found).toBeUndefined();
    });
});
