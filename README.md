# orca-scan-node

The official Node.js client for the [Orca Scan](https://orcascan.com) barcode tracking system. Allows you to:

- **Sheets** - Create and manage sheets
- **Rows** - Add, update, delete and count rows 
- **Fields** - Manage sheet fields and their properties
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

// get your API key from cloud.orcascan.com > account settings
var orca = new OrcaScan('your-api-key', {
    endpoint: 'https://api.orcascan.com/v1', // API endpoint (default)
    timeoutMs: 30000,                        // Request timeout (default: 30 sec)
    maxRetries: 3                            // Max retry attempts (default: 3)
});
```

## API

### Sheets

```js
// list all sheets
orca.sheets.list().then(function(sheets) {
    console.log(sheets);
});

// create new sheet
orca.sheets.create({
    name: 'Inventory',
    templateName: 'inventory'  // optional
}).then(function(sheet) {
    console.log('Sheet created:', sheet);
});

// clear all rows in a sheet
orca.sheets.clear('sheet-id').then(function(result) {
    console.log('Sheet cleared');
});

// rename a sheet
orca.sheets.rename('sheet-id', { 
    name: 'New Sheet Name',
    description: 'Optional description'  // optional
}).then(function(result) {
    console.log('Sheet renamed');
});

// delete sheet
orca.sheets.delete('sheet-id').then(function(result) {
    console.log('Sheet deleted');
});
```

### Settings

```js
// get sheet settings
orca.settings.get('sheet-id').then(function(settings) {
    console.log('Sheet settings:', settings);
});

// update sheet settings
orca.settings.update('sheet-id', {}).then(function(settings) {
    console.log('Sheet settings updated:', settings);
});

```

### Fields

```js
// list all fields in a sheet
orca.fields.list('sheet-id').then(function(fields) {
    console.log('Sheet fields:', fields);
});

// get a single field
orca.fields.get('sheet-id', 'field-key').then(function(field) {
    console.log('Field:', field);
});

// create a new field
orca.fields.create('sheet-id', {
    label: 'Product Code',
    format: 'text',
    required: true,
    placeholder: 'Enter product code'
})
.then(function(field) {
    console.log('Field created:', field);
});

// create field with advanced options
orca.fields.create('sheet-id', {
    label: 'Product Photo',
    format: 'photo',
    required: false,
    hiddenWeb: true,
    useInMobileSearch: false,
    useValueInList: true
})
.then(function(field) {
    console.log('Advanced field created:', field);
});

// update a field
orca.fields.update('sheet-id', 'field-key', {
    label: 'Updated Label',
    required: false
})
.then(function(field) {
    console.log('Field updated:', field);
});

// delete a field
orca.fields.delete('sheet-id', 'field-key').then(function(result) {
    console.log('Field deleted');
});
```

### Field Types

The following field types are supported:

- **string** - Text input
- **integer** - Whole numbers
- **number** - Decimal numbers
- **datetime** - Date and time
- **photo** - Image upload (.jpg, .png, .gif, .bmp, .webp, .tiff, .svg)
- **attachment** - File upload (.doc, .docx, .csv, .txt, .ppt, .pptx, .pdf, .xls, .xlsx, .mp4)
- **uniqueId** - Auto-generated unique identifier
- **barcode** - Barcode/QR code scanning
- **location** - GPS coordinates
- **signature** - Digital signature
- **checkbox** - Boolean true/false
- **select** - Single choice dropdown
- **multiselect** - Multiple choice selection
- **email** - Email address validation
- **phone** - Phone number
- **url** - Web URL

### Rows

```js
let options = { withTitles: true };

// list all rows in a sheet
orca.rows.list('sheet-id', options).then(function(rows) {
    console.log(rows);
});

// get a single row
orca.rows.get('sheet-id', 'row-id', options).then(function(row) {
    console.log(row);
});

// add single row
orca.rows.add('sheet-id', {
    name: 'Laptop',
    quantity: 5
}, options)
.then(function(row) {
    console.log('Row added:', row);
});

// add row with photo (base64 encoded)
orca.rows.add('sheet-id', {
    name: 'Product with Photo',
    photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
    quantity: 1
}, options)
.then(function(row) {
    console.log('Row with photo added:', row);
});

// add row with attachment (base64 encoded)
orca.rows.add('sheet-id', {
    name: 'Product with Manual',
    manual: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwo...',
    quantity: 1
}, options)
.then(function(row) {
    console.log('Row with attachment added:', row);
});

// add multiple rows
orca.rows.add('sheet-id', [
    { name: 'Item 1', quantity: 5 },
    { name: 'Item 2', quantity: 10 }
], options)
.then(function(rows) {
    console.log('Rows added:', rows);
});

// update one row
orca.rows.updateOne('sheet-id', 'row-id', {
    quantity: 15
}, options)
.then(function(row) {
    console.log('Row updated:', row);
});


options = { partial: true, withTitles: true };
// update many rows
orca.rows.updateMany('sheet-id', [
    { _id: 'row1', quantity: 15 },
    { _id: 'row2', quantity: 20 }
], options)
.then(function(rows) {
    console.log('Rows updated:', rows);
});

// delete one row
orca.rows.deleteOne('sheet-id', 'row-id').then(function(result) {
    console.log('Row deleted');
});

// delete multiple rows
orca.rows.deleteMany('sheet-id', ['row1', 'row2']).then(function(result) {
    console.log('Rows deleted');
});

// get row count
orca.rows.count('sheet-id').then(function(result) {
    console.log('Total rows:', result.count);
});
```

All rows methods also accept an optional options object. Currently supported options:

- **withTitles**: When true, it returns field titles instead of field keys.
- **partial**: When true, update only changed fields while all other fields remain intact (only available for `updateMany`)

The `options` object is supported by `list`, `get`, `add`, `updateOne`, and `updateMany`.

For backwards compatibility, the SDK also accepts `withTitle`.

**Note:** Photo and attachment fields support base64 encoding. Photos support: .jpg, .png, .gif, .bmp, .webp, .tiff, .svg. Attachments support: .doc, .docx, .csv, .txt, .ppt, .pptx, .pdf, .xls, .xlsx, .mp4.

### History

```js
// get sheet history
orca.history.sheet('sheet-id').then(function(entries) {
    console.log(entries);
});

// get row history
orca.history.row('sheet-id', 'row-id').then(function(entries) {
    console.log(entries);
});
```

### Users

```js
// list users on a sheet
orca.users.list('sheet-id').then(function(users) {
    console.log(users);
});

// add a user to a sheet
orca.users.add('sheet-id', {
    email: 'user@example.com',
    canUpdate: true,
    canDelete: false,
    canExport: true,    // optional
    canAdmin: false     // optional
})
.then(function(user) {
    console.log('User added:', user);
});

// update a user on a sheet
orca.users.update('sheet-id', 'user-id', {
    canUpdate: false,
    canDelete: true
})
.then(function(user) {
    console.log('User updated:', user);
});

// remove a user from a sheet
orca.users.remove('sheet-id', 'user-id').then(function(result) {
    console.log('User removed');
});
```

### Hooks

```js
// get supported hook events
orca.hooks.events('sheet-id').then(function(events) {
    console.log(events);
});

// list all hooks on a sheet
orca.hooks.list('sheet-id').then(function(hooks) {
    console.log(hooks);
});

// get a single hook
orca.hooks.get('sheet-id', 'hook-id').then(function(hook) {
    console.log(hook);
});

// create a hook
orca.hooks.create('sheet-id', {
    eventName: 'rows:add',
    targetUrl: 'https://example.com/webhook'
})
.then(function(hook) {
    console.log('Hook created:', hook);
});

// update a hook
orca.hooks.update('sheet-id', 'hook-id', {
    targetUrl: 'https://example.com/new-webhook'
})
.then(function(hook) {
    console.log('Hook updated:', hook);
});

// delete a hook
orca.hooks.delete('sheet-id', 'hook-id').then(function(result) {
    console.log('Hook deleted');
});
```

## Error Handling

The SDK automatically unwraps API responses. If the API returns `{ data: ... }`, your `.then(...)` handler receives the inner value directly.

```js
orca.sheets.list().then(function(sheets) {
    console.log('Success!', sheets);
})
.catch(function(error) {
    console.error('Error:', error.message);
    console.error('Status:', error.status);
    console.error('Response body:', error.body);  // Additional error details
});
```

## Errors

 Error                | What it means     | How to fix                            
----------------------|-------------------|---------------------------------------
 `apiKey is required` | Missing API key   | Add your API key when creating client 
 `http 401`           | Invalid API key   | Check your API key is correct         
 `http 403`           | Permission denied | Verify your access rights             
 `http 429`           | Too many requests | Requests are automatically retried    
 `http 404`           | Resource not found | Check sheet/row/field ID is correct
 `http 422`           | Validation error   | Check field types and required fields    

## Automatic Retries

The client will automatically retry on:
- Rate limits (429)
- Service unavailable (503) 
- Server errors (5xx)

Default: 3 retry attempts with exponential backoff

## File Uploads

The client supports file uploads for photo and attachment fields:

- **Photos**: .jpg, .png, .gif, .bmp, .webp, .tiff, .svg
- **Attachments**: .doc, .docx, .csv, .txt, .ppt, .pptx, .pdf, .xls, .xlsx, .mp4

Files should be provided as base64 strings with appropriate data URI format.

## Rate Limits

API rate limit: 15 requests per second. The client automatically handles rate limiting with retries and respects the `Retry-After` header when provided.

## Complete Example

```js
var orca = new OrcaScan('your-api-key');

// Create sheet -> Add rows -> List rows
orca.sheets.create({ name: 'Inventory' }).then(function(result) {

    var sheetId = result._id; // May be result.data._id or result._id depending on API response

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

## License

Licensed under [MIT License](LICENSE) &copy; Orca Scan, the [Barcode Scanner app for iOS and Android](https://orcascan.com).
