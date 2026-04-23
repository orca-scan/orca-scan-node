var setup = require('./setup');

describe('e2e: sheets', function () {

    var client = setup.getClient();
    var sheetName = 'e2e-test-' + Date.now();

    it('should create a new sheet', async function () {
        var sheet = await client.sheets.create({ name: sheetName });
        expect(sheet).toBeDefined();
        expect(sheet._id).toBeDefined();
        expect(sheet.name).toBe(sheetName);

        // store for other specs
        setup.setSheetId(sheet._id);
    });

    it('should list sheets and include the new one', async function () {
        var sheets = await client.sheets.list();
        expect(Array.isArray(sheets)).toBe(true);

        var found = sheets.find(function (s) { return s._id === setup.getSheetId(); });
        expect(found).toBeDefined();
    });

    it('should rename the sheet without error', async function () {
        var newName = sheetName + '-renamed';
        await client.sheets.rename(setup.getSheetId(), { name: newName });

        // if rename returned without throwing, the API accepted it
    });
});
