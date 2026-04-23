var setup = require('./setup');

describe('e2e: settings', function () {

    var client = setup.getClient();

    it('should get sheet settings', async function () {
        var settings = await client.settings.get(setup.getSheetId());
        expect(settings).toBeDefined();
        expect(typeof settings).toBe('object');
    });

    it('should update and read back a setting', async function () {
        await client.settings.update(setup.getSheetId(), { allowPublicExport: true });

        var settings = await client.settings.get(setup.getSheetId());
        expect(settings.allowPublicExport).toBe(true);

        // reset it
        await client.settings.update(setup.getSheetId(), { allowPublicExport: false });
    });
});
