# Supply Chain

This Smart Contract creates a Decentralized Supply Chain Management system using Internet Computer. Companies would be able to create a transparent record of activity and product ownership using this system.

# How Does It Work

Company will use the Smart Contract to generate a transparent record for each product they create. Every time the product status is changed on the Supply Chain Process. The company will update the data, which will be recorded transparently by the Smart Contract. The product ownership will then be transfered to the product owner.

## Installation

Clone The Github Respository
```bash
git clone https://github.com/Noobmaster169/secureChat.git
cd secureChat
```

Install The Dependencies
```bash
npm install
```

Deploy The Canister
```bash
dfx deploy
```

## Methods:

- **setowner**: This method will update the manager/owner of the Smart Contract
- **createProduct**: This method will allow manager to create a new product
- **transferOwnership**: This method allows the owner of a product to transfer the ownership to another person
- **updateProductStatus**: This method allows manager & product owner to update the status of the product
- **updateProductName**: This method allows manager & product owner to update the name of the product
- **getManager**: This method will return the current manager of the Smart Contract
- **getAllProducts**: This method will get all the existing products in the Smart Contract
- **getProduct**: This method wil get the data of a product using the Product ID
- **getProductLogs**: This method will get the transparent activity logs of a product
- **getProductStatus**: This method will return the current status of a product
- **getProductOwner**: This method will return the current owner of a product
- **totalProducts**: This method will return the total number of existing products in the Smart Contract