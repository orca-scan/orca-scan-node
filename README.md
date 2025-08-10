# orca-scan-node

The official Node.js client for the [Orca Scan](https://orcascan.com) barcode tracking system. Allows you to:

- **Sheets** - Create and manage sheets
- **Rows** - Add, update, delete rows 
- **History** - Track changes to sheets and rows
- **Users** - Control user access permissions
- **Hooks** - Set up webhook notifications

## Install

```bash
npm install orca-scan-node
```

## Usage

```js
var OrcaScan = require('orca-scan-node');

var orca = new OrcaScan('your-api-key', {
    endpoint: 'https://api.orcascan.com/v1', // Custom API endpoint
    timeoutMs: 30000,                        // Request timeout (30 sec)
    maxRetries: 3                            // Max retry attempts
});
```

## API

### Sheets

```js
// list all sheets
orca.sheets.list().then(function(result) {
    console.log(result.data);
});

// create new sheet
orca.sheets.create({
    name: 'Inventory',
    templateName: 'inventory'  // optional
}).then(function(result) {
    console.log('Sheet created:', result.data);
});

// get sheet fields
orca.sheets.fields('sheet-id').then(function(result) {
    console.log('Sheet fields:', result.data);
});

// get sheet settings
orca.sheets.settings('sheet-id').then(function(result) {
    console.log('Sheet settings:', result.data);
});

// clear all rows in a sheet
orca.sheets.clear('sheet-id').then(function(result) {
    console.log('Sheet cleared');
});

// rename a sheet
orca.sheets.rename('sheet-id', { name: 'New Sheet Name' }).then(function(result) {
    console.log('Sheet renamed');
});

// delete sheet
orca.sheets.delete('sheet-id').then(function(result) {
    console.log('Sheet deleted');
});
```

### Rows

```js
// list all rows in a sheet
orca.rows.list('sheet-id').then(function(result) {
    console.log(result.data);
});

// get a single row
orca.rows.get('sheet-id', 'row-id').then(function(result) {
    console.log(result.data);
});

// add single row
orca.rows.add('sheet-id', {
    name: 'Laptop',
    quantity: 5
})
.then(function(result) {
    console.log('Row added:', result.data);
});

// add multiple rows
orca.rows.add('sheet-id', [
    { name: 'Item 1', quantity: 5 },
    { name: 'Item 2', quantity: 10 }
])
.then(function(result) {
    console.log('Rows added:', result.data);
});

// update one row
orca.rows.updateOne('sheet-id', 'row-id', {
    quantity: 15
})
.then(function(result) {
    console.log('Row updated:', result.data);
});

// update many rows
orca.rows.updateMany('sheet-id', [
    { _id: 'row1', quantity: 15 },
    { _id: 'row2', quantity: 20 }
])
.then(function(result) {
    console.log('Rows updated:', result.data);
});

// delete one row
orca.rows.deleteOne('sheet-id', 'row-id').then(function(result) {
    console.log('Row deleted');
});

// delete multiple rows
orca.rows.deleteMany('sheet-id', ['row1', 'row2']).then(function(result) {
    console.log('Rows deleted');
});
```

### History

```js
// get sheet history
orca.history.sheet('sheet-id').then(function(result) {
    console.log(result.data);
});

// get row history
orca.history.row('sheet-id', 'row-id').then(function(result) {
    console.log(result.data);
});
```

### Users

```js
// list users on a sheet
orca.users.list('sheet-id').then(function(result) {
    console.log(result.data);
});

// add a user to a sheet
orca.users.add('sheet-id', {
    email: 'user@example.com',
    canUpdate: true,
    canDelete: false
})
.then(function(result) {
    console.log('User added:', result.data);
});

// update a user on a sheet
orca.users.update('sheet-id', 'user-id', {
    canUpdate: false,
    canDelete: true
})
.then(function(result) {
    console.log('User updated:', result.data);
});

// remove a user from a sheet
orca.users.remove('sheet-id', 'user-id').then(function(result) {
    console.log('User removed');
});
```

### Hooks

```js
// get supported hook events
orca.hooks.events('sheet-id').then(function(result) {
    console.log(result.data);
});

// list all hooks on a sheet
orca.hooks.list('sheet-id').then(function(result) {
    console.log(result.data);
});

// get a single hook
orca.hooks.get('sheet-id', 'hook-id').then(function(result) {
    console.log(result.data);
});

// create a hook
orca.hooks.create('sheet-id', {
    eventName: 'row.added',
    targetUrl: 'https://example.com/webhook'
})
.then(function(result) {
    console.log('Hook created:', result.data);
});

// update a hook
orca.hooks.update('sheet-id', 'hook-id', {
    targetUrl: 'https://example.com/new-webhook'
})
.then(function(result) {
    console.log('Hook updated:', result.data);
});

// delete a hook
orca.hooks.delete('sheet-id', 'hook-id').then(function(result) {
    console.log('Hook deleted');
});
```

## Error Handling

```js
orca.sheets.list().then(function(result) {
    console.log('Success!', result.data);
})
.catch(function(error) {
    console.error('Error:', error.message);
    console.error('Status:', error.status);
});
```

## Errors

 Error                | What it means     | How to fix                            
----------------------|-------------------|---------------------------------------
 `apiKey is required` | Missing API key   | Add your API key when creating client 
 `http 401`           | Invalid API key   | Check your API key is correct         
 `http 403`           | Permission denied | Verify your access rights             
 `http 429`           | Too many requests | Requests are automatically retried    

## Automatic Retries

The client will automatically retry on:
- Rate limits (429)
- Service unavailable (503) 
- Server errors (5xx)

Default: 3 retry attempts with exponential backoff

## Complete Example

```js
var orca = new OrcaScan('your-api-key');

// Create sheet -> Add rows -> List rows
orca.sheets.create({ name: 'Inventory' }).then(function(result) {

    var sheetId = result.data._id;

    return orca.rows.add(sheetId, [
        { name: 'Laptop', quantity: 5 },
        { name: 'Chair', quantity: 10 }
    ]);
})
.then(function() {
    console.log('Items added successfully!');
})
.catch(function(err) {
    console.error('Something went wrong:', err.message);
});
```

## Need Help?

- 📚 [API Documentation](https://orcascan.com/docs)
- 💬 [Live Chat Support](https://orcascan.com/#chat)
- 🐛 [GitHub Issues](https://github.com/orca-scan/orca-scan-node/issues)
