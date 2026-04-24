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

    it('should create a field with a specific index', async function () {
        var field = await client.fields.create(setup.getSheetId(), {
            label: 'E2E Indexed Field',
            format: 'text',
            index: 2
        });

        expect(field).toBeDefined();
        expect(field.label).toBe('E2E Indexed Field');
        expect(field.index).toBe(2);

        // clean up
        await client.fields.delete(setup.getSheetId(), field.key);
    });

    it('should update a field index', async function () {
        var updated = await client.fields.update(setup.getSheetId(), fieldKey, {
            index: 1
        });

        expect(updated.index).toBe(1);
    });

    it('should delete the field', async function () {
        await client.fields.delete(setup.getSheetId(), fieldKey);

        var fields = await client.fields.list(setup.getSheetId());
        var found = fields.find(function (f) { return f.key === fieldKey; });
        expect(found).toBeUndefined();
    });
});
