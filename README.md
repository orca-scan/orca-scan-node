# orca-scan-node

The official Node.js client for the [Orca Scan](https://orcascan.com) barcode tracking system. Allows you to:

- **Sheets** - Create and manage sheets
- **Rows** - Add, update, delete rows 
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
orca.sheets.list().then(function(result) {
    console.log(result); // May be result.data or result depending on API response
});

// create new sheet
orca.sheets.create({
    name: 'Inventory',
    templateName: 'inventory'  // optional
}).then(function(result) {
    console.log('Sheet created:', result); // May be result.data or result depending on API response
});

// get sheet fields
orca.fields.list('sheet-id').then(function(result) {
    console.log('Sheet fields:', result); // May be result.data or result depending on API response
});

// get sheet settings
orca.sheets.settings('sheet-id').then(function(result) {
    console.log('Sheet settings:', result); // May be result.data or result depending on API response
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

### Fields

```js
// list all fields in a sheet
orca.fields.list('sheet-id').then(function(result) {
    console.log('Sheet fields:', result); // May be result.data or result depending on API response
});

// get a single field
orca.fields.get('sheet-id', 'field-key').then(function(result) {
    console.log('Field:', result); // May be result.data or result depending on API response
});

// create a new field
orca.fields.create('sheet-id', {
    key: 'product_code',
    label: 'Product Code',
    type: 'string',
    required: true,
    placeholder: 'Enter product code'
})
.then(function(result) {
    console.log('Field created:', result); // May be result.data or result depending on API response
});

// create field with advanced options
orca.fields.create('sheet-id', {
    key: 'product_photo',
    label: 'Product Photo',
    type: 'photo',
    required: false,
    hiddenWeb: true,
    useInMobileSearch: false,
    useValueInList: true
})
.then(function(result) {
    console.log('Advanced field created:', result); // May be result.data or result depending on API response
});

// update a field
orca.fields.update('sheet-id', 'field-key', {
    label: 'Updated Label',
    required: false
})
.then(function(result) {
    console.log('Field updated:', result); // May be result.data or result depending on API response
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
// list all rows in a sheet
orca.rows.list('sheet-id').then(function(result) {
    console.log(result); // May be result.data or result depending on API response
});

// get a single row
orca.rows.get('sheet-id', 'row-id').then(function(result) {
    console.log(result); // May be result.data or result depending on API response
});

// add single row
orca.rows.add('sheet-id', {
    name: 'Laptop',
    quantity: 5
})
.then(function(result) {
    console.log('Row added:', result); // May be result.data or result depending on API response
});

// add row with photo (base64 encoded)
orca.rows.add('sheet-id', {
    name: 'Product with Photo',
    photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
    quantity: 1
})
.then(function(result) {
    console.log('Row with photo added:', result); // May be result.data or result depending on API response
});

// add row with attachment (base64 encoded)
orca.rows.add('sheet-id', {
    name: 'Product with Manual',
    manual: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwo...',
    quantity: 1
})
.then(function(result) {
    console.log('Row with attachment added:', result); // May be result.data or result depending on API response
});

// add multiple rows
orca.rows.add('sheet-id', [
    { name: 'Item 1', quantity: 5 },
    { name: 'Item 2', quantity: 10 }
])
.then(function(result) {
    console.log('Rows added:', result); // May be result.data or result depending on API response
});

// update one row
orca.rows.updateOne('sheet-id', 'row-id', {
    quantity: 15
})
.then(function(result) {
    console.log('Row updated:', result); // May be result.data or result depending on API response
});

// update many rows
orca.rows.updateMany('sheet-id', [
    { _id: 'row1', quantity: 15 },
    { _id: 'row2', quantity: 20 }
])
.then(function(result) {
    console.log('Rows updated:', result); // May be result.data or result depending on API response
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

All rows methods also accept an optional options object. Currently supported options:

- **withTitle**: When true, appends `?withTitles=true` to the request.

**Note:** Photo and attachment fields support base64 encoding. Photos support: .jpg, .png, .gif, .bmp, .webp, .tiff, .svg. Attachments support: .doc, .docx, .csv, .txt, .ppt, .pptx, .pdf, .xls, .xlsx, .mp4.

### History

```js
// get sheet history
orca.history.sheet('sheet-id').then(function(result) {
    console.log(result); // May be result.data or result depending on API response
});

// get row history
orca.history.row('sheet-id', 'row-id').then(function(result) {
    console.log(result); // May be result.data or result depending on API response
});
```

### Users

```js
// list users on a sheet
orca.users.list('sheet-id').then(function(result) {
    console.log(result); // May be result.data or result depending on API response
});

// add a user to a sheet
orca.users.add('sheet-id', {
    email: 'user@example.com',
    canUpdate: true,
    canDelete: false,
    canExport: true,    // optional
    canAdmin: false     // optional
})
.then(function(result) {
    console.log('User added:', result); // May be result.data or result depending on API response
});

// update a user on a sheet
orca.users.update('sheet-id', 'user-id', {
    canUpdate: false,
    canDelete: true
})
.then(function(result) {
    console.log('User updated:', result); // May be result.data or result depending on API response
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
    console.log(result); // May be result.data or result depending on API response
});

// list all hooks on a sheet
orca.hooks.list('sheet-id').then(function(result) {
    console.log(result); // May be result.data or result depending on API response
});

// get a single hook
orca.hooks.get('sheet-id', 'hook-id').then(function(result) {
    console.log(result); // May be result.data or result depending on API response
});

// create a hook
orca.hooks.create('sheet-id', {
    eventName: 'rows:add',
    targetUrl: 'https://example.com/webhook'
})
.then(function(result) {
    console.log('Hook created:', result); // May be result.data or result depending on API response
});

// update a hook
orca.hooks.update('sheet-id', 'hook-id', {
    targetUrl: 'https://example.com/new-webhook'
})
.then(function(result) {
    console.log('Hook updated:', result); // May be result.data or result depending on API response
});

// delete a hook
orca.hooks.delete('sheet-id', 'hook-id').then(function(result) {
    console.log('Hook deleted');
});
```

## Error Handling

```js
orca.sheets.list().then(function(result) {
    console.log('Success!', result); // May be result.data or result depending on API response
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
