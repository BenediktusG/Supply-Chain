import {
    bool,
    Canister,
    Err,
    ic,
    nat64,
    None,
    Ok,
    Opt,
    Principal,
    query,
    Record,
    Result,
    Some,
    StableBTreeMap,
    text,
    update,
    Variant,
    Vec,
} from 'azle';

const LogData = Record({
    message: text,
    time   : nat64,
});
type LogData = typeof LogData.tsType;

const Product = Record({
    id    : nat64,
    name  : text,
    owner : Principal,
    status: text,
    logs  : Vec(LogData),
});
type Product = typeof Product.tsType;

const Error = Variant({
    NoManager    : text,
    NotFound     : text,
    Unauthorized : text,
});

let manager : Opt<Principal> = None;
const products = StableBTreeMap<nat64, Product>(0);

export default Canister({
    /**
     *  Change The Supply Chain Manager/Controller.
     *  @param  newManager Principal ID of the New Manager
     *  @returns           Success Status or Error Message 
     */
    setOwner: update([Principal], Result(bool, Error), (newManager=>{
        if('None' in manager){
            manager = Some(newManager);
            console.log("Empty Owner");
        }
        else{
            if(ic.caller().toString() === manager.Some.toString()){
                manager = Some(newManager);
            }
            else{
                return Err({Unauthorized: `Only Current Manager can change the Manager Position.`});
            }
        }
        return Ok(true);
    })),

    /**
     *  Create A New Product (Only Allowed For Manager).
     *  @param  name   The Name of the New Product
     *  @param  status The Initial Status of the product
     *  @returns       New Product ID or Error Message 
     */
    createProduct: update([text, text], Result(nat64, Error), (name, status)=>{
        // Check Authorization
        if('None' in manager){
            return Err({NoManager: "No Manager Detected"})
        }
        if(ic.caller().toString() !== manager.Some.toString()){
            return Err({Unauthorized: "Only Manager can create a new product"})
        }
        // Create The New Product Data
        const newLog : LogData = {
            message: `Product with ID #${products.len()} was created`,
            time   : ic.time(),
        };
        const newProduct : Product = {
            id    : products.len(),
            name  : name,
            owner : ic.caller(),
            status: status,
            logs  : [newLog], 
        };
        // Add The New Product
        products.insert(newProduct.id, newProduct);
        return Ok(newProduct.id);
    }),
    
    /**
     *  Transfer Ownership of Product to Another Person (Only Allowed For Product Owner).
     *  @param  id       The ID of the product
     *  @param  newOwner The New Owner of the product
     *  @returns         Success Status or Error Message 
     */
    transferOwnership: update([nat64, Principal], Result(bool, Error), (id, newOwner)=>{
        // Get the current data of the product
        const productData = products.get(id);
        // Check if the data is valid or not
        if('None' in productData){
            return Err({NotFound: `Product with ID #${id} Not Found.`});
        };
        // Check Authorization
        if(ic.caller().toString() !== productData.Some.owner.toString()){
            return Err({Unauthorized: `You are not allowed to change this product's data.`})
        };
        //Add Log Message
        const logs = productData.Some.logs;
        const newLog: LogData = {
            message: `Ownership Transferred to ${newOwner}`,
            time   : ic.time(),
        };
        logs.push(newLog);
        // Update the product data
        const newData: Product = {
            id    : productData.Some.id,
            name  : productData.Some.name,
            owner : newOwner,
            status: productData.Some.status,
            logs  : logs,
        };
        products.insert(id, newData);
        return Ok(true); 
    }),
    
    /** 
     *  Update The Status of The Product (Only Allowed For Product Owner & Manager).
     *  @param  id        ID of the product to be updated
     *  @param  newStatus New Product Status
     *  @returns          Success Status or Error Message 
     */
    updateProductStatus: update([nat64, text], Result(bool, Error), (id, newStatus)=>{
        // Get the current data of the product
        const productData = products.get(id);
        // Check if the data is valid or not
        if('None' in productData){
            return Err({NotFound: `Product with ID #${id} Not Found.`});
        };
        // Check Authorization
        if('None' in manager){
            return Err({NoManager: "No Manager Detected"})
        }
        if(ic.caller().toString() !== productData.Some.owner.toString() && ic.caller().toString() !== manager.Some.toString()){
            return Err({Unauthorized: `You are not allowed to change this product's data.`})
        };
        //Add Log Message
        const logs = productData.Some.logs;
        const newLog: LogData = {
            message: `Product Status Changed To: ${newStatus}`,
            time   : ic.time(),
        };
        logs.push(newLog);
        // Update the product data
        const newData: Product = {
            id    : productData.Some.id,
            name  : productData.Some.name,
            owner : productData.Some.owner,
            status: newStatus,
            logs  : logs,
        };
        products.insert(id, newData);
        return Ok(true);
    }),

    /** 
     *  Update The Name of The Product (Only Allowed For Product Owner & Manager).
     *  @param  id        ID of the product to be updated
     *  @param  newStatus New Product Name
     *  @returns          Success Status or Error Message 
     */
    updateProductName: update([nat64, text], Result(bool, Error), (id, newName) =>{
        // Get the current data of the product
        const productData = products.get(id);
        // Check if the data is valid or not
        if('None' in productData){
            return Err({NotFound: `Product with ID #${id} Not Found.`});
        };
        // Check Authorization 
        if('None' in manager){
            return Err({NoManager: "No Manager Detected"})
        }
        if(ic.caller().toString() !== productData.Some.owner.toString() && ic.caller().toString() !== manager.Some.toString()){
            return Err({Unauthorized: `You are not allowed to change this product's data.`})
        };
        //Add Log Message
        const logs = productData.Some.logs;
        const newLog: LogData = {
            message: `Product Name Changed To: ${newName}`,
            time   : ic.time(),
        };
        logs.push(newLog);
        // Update the product data
        const newData: Product = {
            id    : productData.Some.id,
            name  : newName,
            owner : productData.Some.owner,
            status: productData.Some.status,
            logs  : logs,
        };
        products.insert(id, newData);
        return Ok(true);
    }),

    /**
     *  Get The Current Canister Manager.
     *  @returns  Principal ID of Current Manager 
     */
    getManager: query([], Opt(Principal), ()=>{
        return manager;
    }),
    
    /**
     *  Get All The Existing Products.
     *  @returns  Vec of all 'Product' Data in the Canister
     */
    getAllProducts: query([], Vec(Product), () => {
        const allProducts = products.values();
        return allProducts;
    }),
    
    /**
     *  Find a Product Using the Product ID
     *  @param  id ID of the Searched Product
     *  @returns   The 'Product' Data that has the searched ID
     */
    getProduct: query([nat64], Result(Product, Error), (id: nat64)=>{
        // Get the current data of the product
        const productData = products.get(id);
        // Check if the data is valid or not
        if('None' in productData){
            return Err({NotFound: `Product with ID #${id} Not Found.`});
        };
        // Return the product data
        return Ok(productData.Some);
    }),
    
    /**
     *  Get The Activity Logs of A Product
     *  @param  id ID of the Searched Product
     *  @returns   The Activity Logs of the Product
     */
    getProductLogs: query([nat64], Result(Vec(LogData), Error), (id)=>{
        // Get the current data of the product
        const productData = products.get(id);
        // Check if the data is valid or not
        if('None' in productData){
            return Err({NotFound: `Product with ID #${id} Not Found.`});
        };
        // Return Product Logs
        return Ok(productData.Some.logs);
    }),

    /**
     *  Get The Current Status of A Product
     *  @param  id ID of the Searched Product
     *  @returns   The Current Status of the Product
     */
    getProductStatus: query([nat64], Result(text, Error), (id)=>{
        // Get the current data of the product
        const productData = products.get(id);
        // Check if the data is valid or not
        if('None' in productData){
            return Err({NotFound: `Product with ID #${id} Not Found.`});
        };
        // Return Product's Status
        return Ok(productData.Some.status);
    }),

    /**
     *  Get The Owner of A Product
     *  @param  id ID of the Searched Product
     *  @returns   The Owner of the Product
     */
    getProductOwner: query([nat64], Result(Principal, Error), (id)=>{
       // Get the current data of the product
       const productData = products.get(id);
       // Check if the data is valid or not
       if('None' in productData){
           return Err({NotFound: `Product with ID #${id} Not Found.`});
       };
       // Return Product's Owner
       return Ok(productData.Some.owner); 
    }),

    /**
     *  Get The Total Number of Products in the Canister.
     *  @returns  Nat64 of the Total Number of Products Created 
     */
    totalProducts: query([], nat64, () => {
        return products.len();
    }),
});

