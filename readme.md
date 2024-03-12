
## Badges

![mongodb 6.0.2](https://img.shields.io/badge/MongoDB-v6.0.2-green)
![nodeJs 20.9.0](https://img.shields.io/badge/Node.js-20.9.0-yellow)




# EventScouts

Experience the future of event ticketing with Web 3.0 EventScouts, where NFTs serve as tamper-proof, secure, and collectible digital tickets on the blockchain


## Environment Variables

To run this project, you will need to add the following environment variables to your **.env file on /api/.env**

`INFURA_URL`  This variable specifies the URL of the Infura node used for interacting with the Ethereum blockchain. In this case, it's set to a local Ganache instance running on http://127.0.0.1:7545.

`DATABASE_URL` This variable contains the connection string for MongoDB, specifying the database URL (mongodb://localhost:27017/EventScouts) where the application data will be stored.

`MONGOMS_SYSTEM_BINARY`: This variable points to the location of the MongoDB system binary (mongod.exe) on your system. It's used for testing

`USER_SECRET`, `ORGANIZER_SECRET`: These are JWT secrets used for signing and verifying JSON Web Tokens for user authentication, organizer authentication, and controller authentication, respectively.

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

![demo](https://github.com/kaleabteweld/EventScouts/blob/main/.github/image.png?raw=true)


## Lessons Learned

- web3: Understanding how to interact with Ethereum and other blockchain networks using web3 libraries provided valuable insights into decentralized application development.
- ethers/hardhat: Exploring ethers.js and Hardhat allowed for efficient and effective Ethereum smart contract development, testing, and deployment processes.
- solidity: Learning Solidity enabled the creation of smart contracts for various decentralized applications, providing a foundation for blockchain development.
- mongoose: Working with Mongoose provided a deeper understanding of MongoDB integration within Node.js applications, facilitating efficient data modeling and querying capabilities.

### Overall Insights
Decentralized applications (DApps) and web3 technology bring a unique flavor of interesting features to the world of software development. They offer decentralized, trustless, and transparent systems that can revolutionize various industries. However, it's essential to remember that despite their innovative nature, they ultimately serve as decentralized leisure systems. Integrating them with traditional web two systems adds another layer of complexity but is crucial for creating seamless user experiences and unlocking the full potential of decentralized technologies.
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

