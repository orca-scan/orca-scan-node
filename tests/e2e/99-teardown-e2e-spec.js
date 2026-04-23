var setup = require('./setup');

describe('e2e: teardown', function () {

    var client = setup.getClient();

    it('should delete the test sheet', async function () {
        var sheetId = setup.getSheetId();
        if (!sheetId) {
            return; // nothing to clean up
        }

        await client.sheets.delete(sheetId);

        // confirm it's gone
        var sheets = await client.sheets.list();
        var found = sheets.find(function (s) { return s._id === sheetId; });
        expect(found).toBeUndefined();
    });
});
