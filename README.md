# @effco/zoho-crm

Another _WORK IN PROGRESS_ tool from us!

## _v0.2 works with V2 of Zoho API, for V1 use v0.1 of the library_

Wrapper around Zoho CRM API. Built with the intention of abstracting the
limitations of Zoho API in Node environment. Should work with any module
although targeted and tested for 'deals'.

It takes and returns plain standard JSON objects, retrieves more than 200
results by iterating through the module data and is promise based so async/await
ready.

# Install

```
yarn add @effco/zoho-crm
```

or

```
npm i -S @effco/zoho-crm
```

# Usage

### Environmental variables

In order to satisfy OAuth2 requirements of Zoho API few values are required to be provided via env. Available from accounts.zoho.com/developerconsole

- ZOHO_CLIENT_ID
- ZOHO_CLIENT_SECRET
- ZOHO_GRANT_TOKEN - only needed once, to generate access & refresh token. Generated in the Self Client menu (click the ... button to the right once application is created). Enter 'aaaserver.profile.READ,ZohoCRM.users.all,ZohoCRM.settings.all,ZohoCRM.modules.all' as scope
- API_URL - only needed once, to generate access & refresh token. In developer console enter API_URL/oauth/zoho, here just API_URL
- ZOHO_LOCATION - Zoho instance, default is 'com' - other options currently are: 'eu', 'com.cn'

### Example

#### Require lib

```
const zoho = require('@effco/zoho-crm')
```

#### Users

```
// Retrieve all active Users
const users = await zoho.get('users')
```

#### Deals (or any other module)

##### get()

```
// Retrieve all Deals
const deals = await zoho.get('deals')

// Retrieve all Deals - select columns returned (id is always returned)
const deals = await zoho.get('deals', {}, ['Column 1', 'Column 2'])

// Retrieve all Deals owned by a User
const deals = await zoho.get('deals', { ownerId: 'ownerId' })

// Retrieve one Deal byId
const deal = await zoho.get('deals', { id: 'dealId' })

// Retrieve one Deal byId - select columns returned (id is always returned)
const deal = await zoho.get('deals', { id: 'dealId' }, ['Column 1', 'Column 2'])

// Retrieve multiple Deals
const deal = await zoho.get('deals', { id: ['dealId1', 'dealId2'] })

// Retrieve multiple Deals byId - select columns returned (id is always returned)
const deal = await zoho.get('deals', { id: ['dealId1', 'dealId2']}, ['Column 1', 'Column 2'] )
```

##### update()

```
// Update one Deal
zoho.update('Deals', {
  id: 'dealId'
  Stage: 'Qualification',
  'Custom field': 'New Value'
})

// Update multiple Deals
zoho.update('Deals', [{
  id: 'dealId1'
  Stage: 'Qualification',
},
  { id: 'DEAL_ID2',
  'Custom field': 'New Value'
}])
```
