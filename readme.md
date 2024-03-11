
# EventScouts

Experience the future of event ticketing with Web 3.0 EventScouts, where NFTs serve as tamper-proof, secure, and collectible digital tickets on the blockchain


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`INFURA_URL`  This variable specifies the URL of the Infura node used for interacting with the Ethereum blockchain. In this case, it's set to a local Ganache instance running on http://127.0.0.1:7545.

`DATABASE_URL` This variable contains the connection string for MongoDB, specifying the database URL (mongodb://localhost:27017/EventScouts) where the application data will be stored.

`MONGOMS_SYSTEM_BINARY`: This variable points to the location of the MongoDB system binary (mongod.exe) on your system. It's used for testing

USER_SECRET, ORGANIZER_SECRET, CONTROLLER_SECRET: These are JWT secrets used for signing and verifying JSON Web Tokens for user authentication, organizer authentication, and controller authentication, respectively.

`USER_REfRESH_SECRET`, ORGANIZER_REfRESH_SECRET, CONTROLLER_REfRESH_SECRET: Similar to the previous set of secrets, these are used specifically for generating refresh tokens.

`COHERE_API_KEY`: This variable holds the API key for integrating with the Cohere API, which provides natural language processing functionality.

`CIPHERIV_SECRET_KEY`: This is a secret key used for encryption or decryption operations, used to encrypting shareable ID like shareable event link.

`SHAREABLE_LINK_BASE_URL`: This variable defines the base URL for generating shareable links, typically used for sharing events or content within the application.`


## Run Locally

Clone the project

```bash
  git clone https://github.com/kaleabteweld/EventScouts
```

Go to the project directory

```bash
  cd EventScouts/api
```

Install dependencies

```bash
  npm install
```

Run Solidity Compiler to compile

```bash
  npm run contracts-compile
```

Start the Development server

```bash
  npm run dev
```


## Running Tests

To run tests, run the following command

```bash
  npm run api-test
```


## Deployment

To deploy this project run

Run Test

```bash
  npm run api-test
```

Run Solidity Compiler to compile

```bash
  npm run contracts-compile
```

deploy contracts

```bash
  npm run contracts-deploy
```

```bash
  npm run deploy
```


## API Reference

#### run docs

```http
  GET /docs
```




## Screenshots

![demo](https://github.com/kaleabteweld/EventScouts/.github/image.jpg?raw=true)


## Lessons Learned

What did you learn while building this project? What challenges did you face and how did you overcome them?

- web3
- ethers/hardhat
- solidity
- mongooes
## Tech Stack

**Server:**
 - Node
 - Express
 - mongoose
 - ethers/hardhat
 - joi
 - redis
 - swagger-ui-express
 - cohere-ai


## Authors

- [@kaleabteweld](https://github.com/kaleabteweld)


## Support

For support, email kaleabteweld3@gmail.com or Open an [issue](https://github.com/kaleabteweld/EventScouts/issues).

