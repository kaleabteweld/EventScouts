# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

make sure to add the following to your .env file

INFURA_URL to connect to the blockchain
DATABASE_URL to your database
MONGOMS_SYSTEM_BINARY more for testing but add your local mongodb binary "C:/Program Files/MongoDB/Server/6.0/bin/mongod.exe"

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```
