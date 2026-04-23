var setup = require('./setup');

describe('e2e: rows', function () {

    var client = setup.getClient();
    var rowId = null;
    var rowId2 = null;

    it('should add a row', async function () {
        var row = await client.rows.add(setup.getSheetId(), { barcode: 'E2E-001' });
        expect(row).toBeDefined();
        expect(row._id).toBeDefined();

        rowId = row._id;
    });

    it('should get a row by id', async function () {
        var row = await client.rows.get(setup.getSheetId(), rowId);
        expect(row).toBeDefined();
        expect(row._id).toBe(rowId);
    });

    it('should list rows', async function () {
        var rows = await client.rows.list(setup.getSheetId());
        expect(Array.isArray(rows)).toBe(true);
        expect(rows.length).toBeGreaterThanOrEqual(1);
    });

    it('should update a single row', async function () {
        await client.rows.updateOne(setup.getSheetId(), rowId, { barcode: 'E2E-002' });

        var row = await client.rows.get(setup.getSheetId(), rowId);
        expect(row.barcode).toBe('E2E-002');
    });

    it('should count rows', async function () {
        var result = await client.rows.count(setup.getSheetId());
        expect(result).toBeDefined();
        expect(result.count).toBeGreaterThanOrEqual(1);
    });

    it('should add a second row and update many', async function () {
        var row2 = await client.rows.add(setup.getSheetId(), { barcode: 'E2E-003' });
        rowId2 = row2._id;

        await client.rows.updateMany(setup.getSheetId(), [
            { _id: rowId, barcode: 'BATCH-1' },
            { _id: rowId2, barcode: 'BATCH-2' }
        ]);

        var rows = await client.rows.list(setup.getSheetId());
        var r1 = rows.find(function (r) { return r._id === rowId; });
        var r2 = rows.find(function (r) { return r._id === rowId2; });
        expect(r1.barcode).toBe('BATCH-1');
        expect(r2.barcode).toBe('BATCH-2');
    });

    it('should delete a single row', async function () {
        await client.rows.deleteOne(setup.getSheetId(), rowId);

        var result = await client.rows.count(setup.getSheetId());
        expect(result.count).toBe(1);
    });

    it('should delete many rows', async function () {
        await client.rows.deleteMany(setup.getSheetId(), [rowId2]);

        var result = await client.rows.count(setup.getSheetId());
        expect(result.count).toBe(0);
    });
});
