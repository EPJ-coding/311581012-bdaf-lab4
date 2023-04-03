
const { expect } = require("chai");
const SafeFactory = artifacts.require("SafeFactory");
const Safe = artifacts.require("Safe");
const Proxy = artifacts.require("Proxy");



describe("SafeFactory", async () => {  
  let owner, addr1, addr2;  
  let factory, logicV1, logicV2;   
  let err=""

  before(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();    

    //deploy logic contract V1 (SafeUpgradeable)
    const LogicV1 = await ethers.getContractFactory("SafeUpgradeable");
    logicV1 = await LogicV1.deploy();    
    await logicV1.deployed();   

    //deploy logic contract V2 (SafeUpgradeableV2)
    const LogicV2 = await ethers.getContractFactory("SafeUpgradeableV2");
    logicV2 = await LogicV2.deploy();    
    await logicV2.deployed();   

    //deploy Factory and set initial implementation to logicV1 (SafeFactory)
    const Factory = await ethers.getContractFactory("SafeFactory");
    factory = await Factory.deploy(owner.address, logicV1.address);       
    await factory.deployed();     



  });

  it("should set the right owner of factory", async () => { 
    expect(await factory.owner()).to.equal(owner.address);   
  });

  it("the caller of deploySafe is the owner of the deployed Safe contract", async () => { 
    // addr1 call the deploySafe()
    // the Safe contract should be deployed and the owner is addr1
    await factory.connect(addr1).deploySafe();
    const safeAddress = await factory.getDeployedSafes();
    const safe = await Safe.at(safeAddress[0]); 
    expect(await safe.owner()).to.equal(addr1.address);   

  });

  it("the caller of deploySafeProxy is the owner of the deployed Proxy.", async () => { 

    // addr1 call the deploySafeProxy()
    // the SafeProxy contract should be deployed and the owner is addr1
    await factory.connect(addr1).deploySafeProxy();
    const safeProxyAddress = await factory.getDeployedProxies();
    const safeProxy = await Proxy.at(safeProxyAddress[0]); 
    expect(await safeProxy.getProxyOwner()).to.equal(addr1.address);   

    // the implementation should be pointed to logicV1 (SafeFactory)
    expect(await safeProxy.getImplementation()).to.eq(logicV1.address);
    
  });

  it("Only the owner of Factory can change the implementation", async () => { 

    // addr1 (not owner) try to call the updateImplementation()
    
    try{ await factory.connect(addr1).updateImplementation(logicV2.address); }
    catch(e){ err = e.message; }
    expect(err).to.equal("VM Exception while processing transaction: reverted with reason string 'Only owner can call this function'");   
    
  });

  it("New implementation address should be a contract", async () => { 

    // new implementation address should  be a contract
    try{ await factory.connect(owner).updateImplementation(addr2.address); }
    catch(e){ err = e.message; }
    expect(err).to.equal("VM Exception while processing transaction: reverted with reason string 'New implementation address should be a contract'");   
    
    // owner update the implementation to logicV2
    await factory.connect(owner).updateImplementation(logicV2.address);

    // addr1 call the deploySafeProxy()
    await factory.connect(addr1).deploySafeProxy();
    const safeProxyAddress = await factory.getDeployedProxies();
    const safeProxy = await Proxy.at(safeProxyAddress[1]); // this is the second proxy in the safeProxyAddress[]

    // the implementation should be pointed to logicV2 (SafeFactoryV2)
    expect(await safeProxy.getImplementation()).to.eq(logicV2.address);

  });

});
