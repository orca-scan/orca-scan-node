
# orca-scan-node

The official Node.js client for the [Orca Scan](https://orcascan.com) barcode tracking system.

**Full API Reference:** [Barcode Scanning REST API](https://orcascan.com/guides/barcode-scanning-rest-api-f09a21c3)

## Key concepts

Orca Scan feels like a spreadsheet, but developers should think of each sheet as a database and each column as a strongly typed field.

- **Sheet**: A table that stores rows of data
- **Row**: A single record in a sheet, such as an inventory item
- **Field**: A typed column in a sheet, such as name or quantity
- **Hook**: A webhook that notifies you when data changes

With this Node SDK you can:

- **Sheets**: Create and manage sheets
- **Rows**: Add, update, delete, and count rows
- **Fields**: Manage fields and their properties
- **History**: Track changes to sheets and rows
- **Users**: Manage user access and permissions
- **Hooks**: Configure webhook notifications
## Quick Start

```js
var OrcaScanNode = require('@orca-scan/orca-scan-node');
var orca = new OrcaScanNode('your-api-key');

async function main() {

  // 1. Create a sheet
  var sheet = await orca.sheets.create({ name: 'Inventory' });

  // 2. Add some fields
  await orca.fields.create(sheet._id, { label: 'Product Name', format: 'text' });
  await orca.fields.create(sheet._id, { label: 'Quantity', format: 'number' });

  // 3. Add some rows
  await orca.rows.add(sheet._id, [
    { 'Product Name': 'Laptop', Quantity: 5 },
    { 'Product Name': 'Chair', Quantity: 10 }
  ]);

  // 4. Add a user
  await orca.users.add(sheet._id, { email: 'user@example.com', canUpdate: true });

  // 5. Get the rows
  var rows = await orca.rows.list(sheet._id);

  console.log('Rows:', rows);
}

main().catch(console.error);
```

---

## Install

```bash
npm install @orca-scan/orca-scan-node
```

## Usage

```js
var OrcaScanNode = require('@orca-scan/orca-scan-node');

// get your API key from cloud.orcascan.com > account settings
var orca = new OrcaScanNode('your-api-key', {
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

> **Note:** `create`, `update`, and `delete` require `canAdmin: true` for the API key's user on the sheet. Attempting these without admin rights returns a `403 Forbidden`.

#### Field options

| Name                | Type      | Description                                                                               |
|:--------------------|:----------|:------------------------------------------------------------------------------------------|
| `key`               | `string`  | Internal identifier *(readonly)*                                                          |
| `label`             | `string`  | Title of the field in the app                                                             |
| `type`              | `string`  | Data type                                                                                 |
| `format`            | `string`  | See **Field formats** below ↓                                                             |
| `default`           | `any`     | Default value for the field when empty                                                    |
| `listOptions`       | `array`   | If dropdown, options to present to users                                                  |
| `multiSelect`       | `boolean` | If true, allows multiple selection                                                        |
| `formula`           | `string`  | Calculation for “formula” fields                                                          |
| `currencyType`      | `string`  | Currency code for “currency” fields, following the ISO 4217 standard (e.g. USD, EUR, GBP) |
| `locked`            | `boolean` | Prevent users changing field properties                                                   |
| `minLength`         | `integer` | Minimum number of characters allowed                                                      |
| `maxLength`         | `integer` | Maximum number of characters allowed                                                      |
| `minimum`           | `integer` | Minimum number allowed                                                                    |
| `maximum`           | `integer` | Maximum number allowed                                                                    |
| `placeholder`       | `string`  | Guidance to the user when field is empty                                                  |
| `prefix`            | `string`  | If Unique ID, text before value                                                           |
| `suffix`            | `string`  | If Unique ID, text after value                                                            |
| `length`            | `integer` | If Unique ID, total length of ID                                                          |
| `required`          | `boolean` | User must provide a value *(default: false)*                                              |
| `autofocus`         | `boolean` | Auto select this field first *(default: false)*                                           |
| `autoselect`        | `boolean` | Highlight existing text on focus *(default: false)*                                       |
| `emptyOnEdit`       | `boolean` | Clear value when record edited *(default: false)*                                         |
| `emptyOnScan`       | `boolean` | Remove existing value on scan *(default: false)*                                          |
| `hiddenMobile`      | `boolean` | Hide the field on mobile *(default: false)*                                               |
| `hiddenWeb`         | `boolean` | Hide the field on web *(default: false)*                                                  |
| `readonlyWeb`       | `boolean` | Prevent user input on web *(default: false)*                                              |
| `readonlyMobile`    | `boolean` | Prevent user input on mobile *(default: false)*                                           |
| `useInMobileSearch` | `boolean` | Include value in mobile search *(default: false)*                                         |
| `useValueInList`    | `boolean` | Show field value in mobile list *(default: false)*                                        |
| `index`             | `integer` | Display order of the field *(default: -1)*                                                |

#### Field formats

| Format                           | Description                                       |
|:---------------------------------|:--------------------------------------------------|
| `text`                           | Plain text                                        |
| `barcode`                        | Barcode value populated on scan                   |
| `number`                         | Stores a number (integer or decimal)              |
| `number (auto increase on scan)` | Number that auto increases on scan                |
| `number (auto decrease on scan)` | Number that auto decreases on scan                |
| `date`                           | Date field the user can set manually              |
| `date (automatic)`               | Date field that auto sets on scan                 |
| `date time`                      | Date and Time field the user can set manually     |
| `date time (automatic)`          | Date and Time that auto sets on scan              |
| `time`                           | Time field the user can set manually              |
| `email`                          | Capture an email address                          |
| `gps location`                   | User assigned GPS location                        |
| `gps location (automatic)`       | Auto assigned GPS location on scan                |
| `true/false`                     | True or False toggle field                        |
| `currency`                       | Stores a monetary value                           |
| `drop-down list`                 | List of options to present to users               |
| `formula`                        | Calculates the value of two or more fields        |
| `signature`                      | Captures a signature with date, time and location |
| `unique id`                      | Generates a unique ID per record                  |
| `photo`                          | Allows a user to add a photo                      |
| `attachment`                     | Allows a user to upload a file                    |
| `url`                            | Allows a user to enter a URL                      |
| `created by`                     | Auto email of user who created the record         |
| `created date`                   | Auto date/time the record was created             |
| `last modified by`               | Auto email of user who last modified the record   |
| `last modified date`             | Auto date/time the record was last updated        |

### Rows

```js
var options = { withTitles: true };

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

// update one row (partial: true updates only provided fields, leaving others intact)
orca.rows.updateOne('sheet-id', 'row-id', {
    quantity: 15
}, { partial: true })
.then(function(row) {
    console.log('Row updated:', row);
});

// update many rows
orca.rows.updateMany('sheet-id', [
    { _id: 'row1', quantity: 15 },
    { _id: 'row2', quantity: 20 }
], { partial: true })
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

Each rows method accepts an optional `options` object. Supported options:

- **withTitles**: Return field titles instead of field keys
- **partial**: Update only the provided fields and leave all others unchanged _(supported by `add`, `updateOne`, and `updateMany`)_

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

The SDK automatically unwraps API responses. If the API returns `{ data: ... }`, your `.then(...)` handler receives the inner value directly. Here's how you can handle errors in your code:

```js
orca.sheets.list().then(function(sheets) {

    // Success! 'sheets' contains the list of sheets
    console.log('Success!', sheets);
})
.catch(function(error) {

    // All errors have a 'message'.
    console.error('Error message:', error.message);

    // If the error is from the API (like 400, 401, 404), these will also be set:
    if (error.status) {
        console.error('HTTP Status:', error.status); // e.g. 404
    }
    if (error.body) {
        console.error('Response body:', error.body); // More details from the server
    }

    // For network errors or timeouts, 'status' and 'body' may be undefined
});

// Example error object for a 404:
// {
//   message: 'HTTP 404',
//   status: 404,
//   body: { error: 'Resource not found' }
// }
```

## Errors

| Error                | What it means      | How to fix                            |
|:---------------------|:-------------------|:--------------------------------------|
| `apiKey is required` | Missing API key    | Add your API key when creating client |
| `http 401`           | Invalid API key    | Check your API key is correct         |
| `http 403`           | Permission denied  | Verify your access rights             |
| `http 429`           | Too many requests  | Requests are automatically retried    |
| `http 404`           | Resource not found | Check sheet/row/field ID is correct   |
| `http 400`           | Bad request        | Check required fields and data types  |

## Automatic Retries

The client will automatically retry on:
- Rate limits (429)
- Service unavailable (503) 
- Server errors (5xx)

Default: 3 retry attempts with linear backoff (500ms, 1000ms, 1500ms), or respects the `Retry-After` header if present

## Request Timeouts

Use `timeoutMs` to control how long the SDK waits before rejecting a request. The timeout is applied to the SDK promise. If the timeout is reached, the promise rejects with `request timeout`, but the underlying HTTP request is not actively aborted.

## File Uploads

The client supports file uploads for photo and attachment fields:

- **Photos**: .jpg, .png, .gif, .bmp, .webp, .tiff, .svg
- **Attachments**: .doc, .docx, .csv, .txt, .ppt, .pptx, .pdf, .xls, .xlsx, .mp4

Files should be provided as base64 strings with appropriate data URI format.

## Rate Limits

API rate limit: 15 requests per second. The client automatically handles rate limiting with retries and respects the `Retry-After` header when provided.

## Running Tests

```bash
npm test
```

## Need Help?

- 📚 [API Reference](https://orcascan.com/guides/barcode-scanning-rest-api-f09a21c3)
- 💬 [Live Chat Support](https://orcascan.com/#chat)
- 🐛 [GitHub Issues](https://github.com/orca-scan/orca-scan-node/issues)

## License

Licensed under [MIT License](LICENSE) &copy; Orca Scan -> [Barcode Tracking Software](https://orcascan.com).
