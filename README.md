# orca-scan-node

The official Node.js client for [Orca Scan](https://orcascan.com) barcode tracking system

## Quick Start

1. Install the package:

```bash
npm install orca-scan-node
```

2. Create a client:
```js
const OrcaScan = require('orca-scan-node');
const orca = new OrcaScan('your-api-key');
```

3. Make your first API call:
```js
orca.sheets.list()
  .then(result => console.log('My sheets:', result.data))
  .catch(err => console.error('Oops:', err.message));
```

## Options

```js
const orca = new OrcaScan('your-api-key', {
    endpoint: 'https://api.orcascan.com/v1', // Custom API endpoint
    timeoutMs: 30000,                        // Request timeout (30 sec)
    maxRetries: 3                            // Max retry attempts
});
```

## Features

- **Sheets** - Create and manage sheets
- **Rows** - Add, update, delete sheet rows 
- **History** - Track changes to sheets and rows
- **Users** - Control user access permissions
- **Hooks** - Set up webhook notifications

## API

### Working with Sheets

```js
// List all sheets
orca.sheets.list()
  .then(result => console.log(result.data));

// Create new sheet
orca.sheets.create({
    name: 'Inventory',
    templateName: 'inventory'  // Optional
});

// Delete sheet
orca.sheets.delete('sheet-id');
```

### Managing Rows

```js
// Add single row
orca.rows.add('sheet-id', {
    name: 'Laptop',
    quantity: 5
});

// Add multiple rows
orca.rows.add('sheet-id', [
    { name: 'Item 1', quantity: 5 },
    { name: 'Item 2', quantity: 10 }
]);

// Update row
orca.rows.updateOne('sheet-id', 'row-id', {
    quantity: 15
});
```

## Error Handling

```js
orca.sheets.list().then(result => {
    console.log('Success!', result.data);
})
.catch(error => {
    console.error('Error:', error.message);
    console.error('Status:', error.status);
});
```

## Common Errors

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
const orca = new OrcaScan('your-api-key');

// Create sheet -> Add rows -> List rows
orca.sheets.create({ name: 'Inventory' }).then(result => {
    const sheetId = result.data._id;
    return orca.rows.add(sheetId, [
        { name: 'Laptop', quantity: 5 },
        { name: 'Chair', quantity: 10 }
    ]);
})
.then(() => {
    console.log('Items added successfully!');
})
.catch(err => {
    console.error('Something went wrong:', err.message);
});
```

## Need Help?

- 📚 [API Documentation](https://orcascan.com/docs)
- 💬 [Live Chat Support](https://orcascan.com/#chat)
- 🐛 [GitHub Issues](https://github.com/orca-scan/orca-scan-node/issues)
