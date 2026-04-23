var setup = require('./setup');

describe('e2e: hooks', function () {

    var client = setup.getClient();
    var hookId = null;
    var eventName = null;

    it('should list available hook events', async function () {
        var events = await client.hooks.events(setup.getSheetId());
        expect(Array.isArray(events)).toBe(true);
        expect(events.length).toBeGreaterThan(0);

        // save for the create test
        eventName = events[0];
    });

    it('should create a hook', async function () {
        var hook = await client.hooks.create(setup.getSheetId(), {
            eventName: eventName,
            targetUrl: 'https://httpbin.org/post'
        });
        expect(hook).toBeDefined();
        expect(hook._id).toBeDefined();

        hookId = hook._id;
    });

    it('should list hooks and include the new one', async function () {
        var hooks = await client.hooks.list(setup.getSheetId());
        expect(Array.isArray(hooks)).toBe(true);

        var found = hooks.find(function (h) { return h._id === hookId; });
        expect(found).toBeDefined();
    });

    it('should get a hook by id', async function () {
        var hook = await client.hooks.get(setup.getSheetId(), hookId);
        expect(hook).toBeDefined();
        expect(hook.targetUrl).toBe('https://httpbin.org/post');
    });

    it('should update a hook', async function () {
        await client.hooks.update(setup.getSheetId(), hookId, {
            eventName: eventName,
            targetUrl: 'https://httpbin.org/put'
        });

        var hook = await client.hooks.get(setup.getSheetId(), hookId);
        expect(hook.targetUrl).toBe('https://httpbin.org/put');
    });

    it('should delete a hook', async function () {
        await client.hooks.delete(setup.getSheetId(), hookId);

        var hooks = await client.hooks.list(setup.getSheetId());
        var found = hooks.find(function (h) { return h._id === hookId; });
        expect(found).toBeUndefined();
    });
});
