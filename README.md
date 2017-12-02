# @effco/zoho-crm

Another _WORK IN PROGESS_ tool from us!

Wrapper around Zoho CRM API. Built with the intention of abstracting the
limitations of Zoho API in Node environment. Should work with any module
although targeted and tested for 'Deals'.

It takes and returns plain standard JSON objects, retrieves more than 200
results by iterating through the module data and is promise based so async/await
ready.

_Due to some of the latest features of ES6 being used it requires Node v8.6+_

# Install

```
yarn add @effco/zoho-crm
```

or

```
npm i -S @effco/zoho-crm
```

# Usage

Example

```
const zoho = require('@effco/zoho-crm')

zoho.init({
  authToken: 'AUTH_TOKEN',
  host: 'crm.zoho.eu'
})

// Retrieve all active Users
const users = await zoho.get('Users')
// Retrieve all Deals
const deals = await zoho.get('Deals')
// Retrieve all Deals - select columns returned (DEALID is always returned)
const deals = await zoho.get('Deals', {}, ['Column 1', 'Column 2'])
// Retrieve all Deals owned by a User
const deals = await zoho.get('Deals', { ownerId: 'OWNER_ID' })
// Retrieve one Deal byId
const deal = await zoho.get('Deals', { id: 'DEAL_ID' })
// Retrieve one Deal byId - select columns returned (DEALID is always returned)
const deal = await zoho.get('Deals', { id: 'DEAL_ID' }, ['Column 1', 'Column 2'])
// Retrieve multiple Deals
const deal = await zoho.get('Deals', { id: ['DEAL_ID1', 'DEAL_ID2'] })
// Retrieve multiple Deals byId - select columns returned (DEALID is always returned)
const deal = await zoho.get('Deals', { id: ['DEAL_ID1', 'DEAL_ID2'], ['Column 1', 'Column 2'] })
// Update one Deal
zoho.update('Deals', {
  id: 'DEAL_ID'
  Stage: 'Qualification',
  'Custom field': 'New Value'
})
// Update multiple Deals
zoho.update('Deals', [{
  id: 'DEAL_ID1'
  Stage: 'Qualification',
},
  { id: 'DEAL_ID2',
  'Custom field': 'New Value'
}])
```
