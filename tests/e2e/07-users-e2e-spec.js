var setup = require('./setup');

describe('e2e: users', function () {

    var client = setup.getClient();

    it('should list users on the sheet', async function () {
        var users = await client.users.list(setup.getSheetId());
        expect(Array.isArray(users)).toBe(true);
    });
});
