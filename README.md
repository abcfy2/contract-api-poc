# contract-api-poc

## How to run

Setup the `.env`:

```sh
CHAIN_NAME=polygon
CONTRACT_NAME=RPS
CONTRACT_ADDRESS=0x91E042C908ef3eF501EF69eddDB8daD02c2D24a9
INFURA_API_KEY=<your_infura_api_key>
```

```sh
npm ci
npm run generate
npm start
```

Then open `http://localhost:3006/documents`
