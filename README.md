# orca-scan-code

The official node client for the [Orca Scan API](https://orcascan.com/guides/barcode-scanner-api-f09a21c3). Manage sheets, rows, users, hooks, and history.

## Installation

```bash
npm install orca-scan-node
```

## Usage

```js
var OrcaScan = require('orca-scan-node');

// create instance
var orca = new OrcaScan('your-api-key', {
    endpoint: 'https://api.orcascan.com/v1', // default endpoint
    timeoutMs: 30000,                        // default: 30 seconds
    maxRetries: 3                            // default: 3 retries
});
```

## API

### Sheets

Manage your Orca Scan sheets.

#### List Sheets

```js
orca.sheets.list().then(function(result) {
    // result.data contains array of sheets
    // Each sheet has: _id, name, isOwner, canAdmin, canUpdate, canDelete, canExport
});
```

#### Create Sheet

```js
orca.sheets.create({
    name: 'My New Sheet',
    templateName: 'inventory'  // Optional
})
.then(function(result) {
    // result.data contains the created sheet
});
```

#### Get Fields

```js
orca.sheets.fields('sheet-id').then(function(result) {
    // result.data contains array of fields
    // Each field has: key, label, type, required
});
```

#### Get Settings

```js
orca.sheets.settings('sheet-id').then(function(result) {
    // result.data contains sheet settings
});
```

#### Clear Sheet

```js
orca.sheets.clear('sheet-id').then(function(result) {
    // All rows in the sheet have been deleted
});
```

#### Rename Sheet

```js
orca.sheets.rename('sheet-id', {
    name: 'New Sheet Name',
    description: 'Optional description'
})
.then(function(result) {
    // Sheet has been renamed
});
```

#### Delete Sheet

```js
orca.sheets.delete('sheet-id').then(function(result) {
    // Sheet has been deleted
});
```

### Rows

Manage rows within sheets.

#### Get All Rows

```js
// Get all rows
orca.rows.list('sheet-id').then(function(result) {
    // result.data contains array of rows
});

// Get rows with pagination
orca.rows.list('sheet-id', {
    limit: 10,
    skip: 20
})
.then(function(result) {
    // result.data contains paginated rows
});
```

#### Get Single Row

```js
orca.rows.get('sheet-id', 'row-id').then(function(result) {
    // result.data contains the row
});
```

#### Add Rows

```js
// Add single row
orca.rows.add('sheet-id', {
    name: 'Item Name',
    quantity: 5,
    photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...'
})
.then(function(result) {
    // result.data contains the created row
});

// Add multiple rows
orca.rows.add('sheet-id', [
    { name: 'Item 1', quantity: 5 },
    { name: 'Item 2', quantity: 10 }
])
.then(function(result) {
    // result.data contains array of created rows
});
```

#### Update Rows

```js
// Update single row
orca.rows.updateOne('sheet-id', 'row-id', {
    quantity: 15
})
.then(function(result) {
    // result.data contains the updated row
});

// Update multiple rows
orca.rows.updateMany('sheet-id', [
    { _id: 'row1', quantity: 15 },
    { _id: 'row2', quantity: 20 }
])
.then(function(result) {
    // result.data contains array of updated rows
});
```

#### Delete Rows

```js
// Delete single row
orca.rows.deleteOne('sheet-id', 'row-id').then(function(result) {
    // Row has been deleted
});

// Delete multiple rows
orca.rows.deleteMany('sheet-id', ['row1', 'row2', 'row3']).then(function(result) {
    // Rows have been deleted
});
```

### History

Track changes to sheets and rows.

#### Get Sheet History

```js
orca.history.sheet('sheet-id').then(function(result) {
    // result.data contains array of history items
    // Each item has: _id, barcode, name, quantity, _change, _changedBy, _changedOn, _changedUsing
});
```

#### Get Row History

```js
orca.history.row('sheet-id', 'row-id').then(function(result) {
    // result.data contains array of history items for this row
});
```

### Users

Manage user access to sheets.

#### List Users

```js
orca.users.list('sheet-id').then(function(result) {
    // result.data contains array of users
    // Each user has: _id, email, owner, canUpdate, canDelete, canExport, canAdmin
});
```

#### Add User

```js
orca.users.add('sheet-id', {
    email: 'user@example.com',
    canUpdate: true,
    canDelete: false,
    canExport: true,
    canAdmin: false
})
.then(function(result) {
    // result.data contains the created user
});
```

#### Update User

```js
orca.users.update('sheet-id', 'user-id', {
    canUpdate: true,
    canDelete: true
})
.then(function(result) {
    // result.data contains the updated user
});
```

#### Remove User

```js
orca.users.remove('sheet-id', 'user-id').then(function(result) {
    // User has been removed from the sheet
});
```

### Hooks

Manage webhooks for sheet events.

#### Get Supported Events

```js
orca.hooks.events('sheet-id').then(function(result) {
    // result.data contains array of supported event names
});
```

#### List Hooks

```js
orca.hooks.list('sheet-id').then(function(result) {
    // result.data contains array of hooks
    // Each hook has: _id, eventName, sheetId, targetUrl
});
```

#### Get Single Hook

```js
orca.hooks.get('sheet-id', 'hook-id').then(function(result) {
    // result.data contains the hook
});
```

#### Create Hook

```js
orca.hooks.create('sheet-id', {
    eventName: 'row.add',
    targetUrl: 'https://example.com/webhook'
})
.then(function(result) {
    // result.data contains the created hook
});
```

#### Update Hook

```js
orca.hooks.update('sheet-id', 'hook-id', {
    targetUrl: 'https://new-example.com/webhook'
})
.then(function(result) {
    // result.data contains the updated hook
});
```

#### Delete Hook

```js
orca.hooks.delete('sheet-id', 'hook-id').then(function(result) {
    // Hook has been deleted
});
```

## Error Handling

All methods return promises that can be handled with `.then()` and `.catch()`:

```js
orca.sheets.list().then(function(result) {
    // Success - result contains: { status, headers, data }
    console.log('Status:', result.status);
    console.log('Data:', result.data);
})
.catch(function(error) {
    // Error - error contains: { message, status, body }
    console.error('Error:', error.message);
    console.error('Status:', error.status);
});
```

## Common Error Messages

| Error Message                                      | Description                              |
|----------------------------------------------------|------------------------------------------|
| `apiKey is required and must be a string`          | Missing or invalid API key               |
| `sheetId is required and must be a string`         | Missing or invalid sheet ID              |
| `payload is required and must be an object`        | Missing or invalid payload               |
| `http 400`                                         | Bad request (check your payload)         |
| `http 401`                                         | Unauthorized (check your API key)        |
| `http 403`                                         | Forbidden (check your permissions)       |
| `http 404`                                         | Not found (check your IDs)               |
| `http 429`                                         | Rate limited (will retry automatically)  |
| `http 500`                                         | Server error (will retry automatically)  |
| `request timeout`                                  | Request timed out                        |

## Retry Logic

Requests are automatically retried on:

- **429 (Rate Limit)** - waits for `retry-after` header or uses exponential backoff
- **503 (Service Unavailable)** - uses exponential backoff
- **5xx Server Errors** - uses exponential backoff

Retries are limited by the `maxRetries` option (default: 3).

## Examples

### Complete Workflow

```js
var OrcaScan = require('orca-scan-node');
var orca = new OrcaScan('your-api-key');

// 1. create a sheet
orca.sheets.create({
    name: 'Inventory Sheet'
})
.then(function(result) {

    var sheetId = result.data._id;
    
    // 2. add rows
    return orca.rows.add(sheetId, [
        { name: 'Laptop', quantity: 5, category: 'Electronics' },
        { name: 'Desk Chair', quantity: 10, category: 'Furniture' }
    ]);
})
.then(function(result) {
    
    // 3. get all rows
    return orca.rows.list(sheetId);
})
.then(function(result) {
    console.log('All rows:', result.data);
})
.catch(function(error) {
    console.error('Error:', error.message);
});
```

### Error Handling Example

```js
orca.sheets.list().then(function(result) {
    if (result.data.length === 0) {
        console.log('No sheets found');
        return;
    }
    
    var firstSheet = result.data[0];
    console.log('First sheet:', firstSheet.name);
})
.catch(function(error) {
    if (error.status === 401) {
        console.error('Invalid API key');
    }
    else if (error.status === 404) {
        console.error('Resource not found');
    }
    else {
        console.error('Unexpected error:', error.message);
    }
});
```

## Support

For issues and questions:
- Check the [Orca Scan API documentation](https://orcascan.com/docs)
- Review error messages and status codes
- Ensure your API key has the necessary permissions
- Verify all required parameters are provided
