
const { expect } = require("chai");
const SafeFactory = artifacts.require("SafeFactory");
const Safe = artifacts.require("Safe");
const Proxy = artifacts.require("Proxy");



describe("Proxy", async () => {  
  let owner, addr1;  
  let token, proxy, logicV1, logicV2;   
  let err=""

  before(async () => {
    [owner, addr1] = await ethers.getSigners();    

    //deploy logic contract V1 (SafeUpgradeable)
    const LogicV1 = await ethers.getContractFactory("SafeUpgradeable");
    logicV1 = await LogicV1.deploy();    
    await logicV1.deployed();     

    //deploy logic contract V2 (SafeUpgradeableV2)
    const LogicV2 = await ethers.getContractFactory("SafeUpgradeableV2");
    logicV2 = await LogicV2.deploy();    
    await logicV2.deployed();     

    //deploy proxy and set implementation to logicV1
    const Proxy = await ethers.getContractFactory("Proxy");
    proxy = await Proxy.deploy(owner.address, logicV1.address);    
    await proxy.deployed();     


  });

  it("should set to the right owner", async () => { 
    expect(await proxy.getProxyOwner()).to.eq(owner.address);
  });

  it("point to an implementation contract", async () => { 
    expect(await proxy.getImplementation()).to.eq(logicV1.address);
  });


  it("proxies call to initialize implementation contract ", async () => { 
    // change the implementation to SafeUpgradeable and call initialize()
    await proxy.setImplementation(logicV1.address);  
    const abi = ["function initialize(address _owner) public",
                 "function getOwner() public view returns (address)",
                 "function getVersion() public view returns (string memory)"]
    
    const proxied = new ethers.Contract(proxy.address, abi, owner);
    await  proxied.initialize(owner.address)  
    
    //the proxied owner should equal to the owner address 
    expect(await proxied.getOwner()).to.eq(owner.address);  
    expect(await proxied.getVersion()).to.eq("v1");   


  });

  
  it("owner should be able to update the implementation of the proxy", async () => { 

    const abi = ["function initialize(address _owner) public",
                 "function getOwner() public view returns (address)",
                 "function getVersion() public view returns (string memory)"]


    // change the implementation to SafeUpgradeableV2
    await proxy.setImplementation(logicV2.address); 
    const proxied = new ethers.Contract(proxy.address, abi, owner);
    expect(await proxy.getImplementation()).to.eq(logicV2.address);  
    expect(await proxied.getVersion()).to.eq("v2"); 

  });

  it("Only the owner of Factory can change the implementation", async () => { 

    // addr1 (not owner) try to call the updateImplementation()
    
    try{ await proxy.connect(addr1).setImplementation(logicV2.address); }
    catch(e){ err = e.message; }
    expect(err).to.equal("VM Exception while processing transaction: reverted with reason string 'Proxy: caller is not the owner'");   
    
  });

  it("New implementation address should be a contract", async () => { 

    // new implementation address should  be a contract
    try{ await proxy.connect(owner).setImplementation(addr1.address); }
    catch(e){ err = e.message; }
    expect(err).to.equal("VM Exception while processing transaction: reverted with reason string 'New implementation address should be a contract'");   
  });

});

