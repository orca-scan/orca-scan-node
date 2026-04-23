var setup = require('./setup');

describe('e2e: history', function () {

    var client = setup.getClient();
    var rowId = null;

    // create and update a row so history has entries
    beforeAll(async function () {
        var row = await client.rows.add(setup.getSheetId(), { barcode: 'HISTORY-001' });
        rowId = row._id;
        await client.rows.updateOne(setup.getSheetId(), rowId, { barcode: 'HISTORY-002' });
    });

    // clean up after
    afterAll(async function () {
        try {
            await client.rows.deleteOne(setup.getSheetId(), rowId);
        }
        catch (err) { /* already deleted */ }
    });

    it('should get sheet history', async function () {
        var history = await client.history.sheet(setup.getSheetId());
        expect(Array.isArray(history)).toBe(true);
        expect(history.length).toBeGreaterThanOrEqual(1);
    });

    it('should get row history', async function () {
        var history = await client.history.row(setup.getSheetId(), rowId);
        expect(Array.isArray(history)).toBe(true);
        expect(history.length).toBeGreaterThanOrEqual(1);
    });
});
