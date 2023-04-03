const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Safe contract", function () {

  async function deploySafeFixture() {
    const Safe = await ethers.getContractFactory("Safe");
    const [Token_owner, Safe_owner, addr1, addr2] = await ethers.getSigners();
    const hardhatSafe = await Safe.connect(Safe_owner).deploy(Safe_owner.address);

    await hardhatSafe.deployed();
    return { Safe, hardhatSafe, Safe_owner, addr1, addr2 };
  } 

  async function deployTokenFixture() {
    const Token = await ethers.getContractFactory("MockDaiToken");
    const [Token_owner, Safe_owner, addr1, addr2] = await ethers.getSigners();
    const hardhatToken = await Token.connect(Token_owner).deploy();

    await hardhatToken.deployed();
    return { Token, hardhatToken, Token_owner, addr1, addr2 };
  }



  describe("Deployment", function () {

    it("Should set the right owner", async function () {
      const { hardhatSafe, Safe_owner } = await loadFixture(deploySafeFixture);
      expect(await hardhatSafe.owner()).to.equal(Safe_owner.address);
    });

  });


  describe("Transactions", function () {

    
    it("Should allow valid deposit and withdraw", async function () {

      const { hardhatSafe, Safe_owner} = await loadFixture(
        deploySafeFixture
      );


      const { hardhatToken, Token_owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      
      // Transfer 5000 tokens to addr1
      await expect(
        hardhatToken.transfer(addr1.address, 5000)
      ).to.changeTokenBalances(hardhatToken, [Token_owner, addr1], [-5000, 5000]);
      
      
      // addr1 approve some allowance to safe contract
      const erc20WithSigner = hardhatToken.connect(addr1);
      const approveTx = await erc20WithSigner.approve(hardhatSafe.address, "100000000");
      await approveTx.wait();

      // addr1 deposit 5000 tokens to safe contract
      // take 0.01 % fee : 5000 * 0.001 = 5
      const SafeWithSigner = hardhatSafe.connect(addr1);
      const depositTx = await SafeWithSigner.deposit(hardhatToken.address, 5000);
      await depositTx.wait();

      // 4995 tokens in addr1 balance
      expect(
        (await SafeWithSigner.balanceOf(hardhatToken.address)).toString()
      ).to.equal("4995");

      
      // addr1 withdraw 95 tokens from safe contract
      const withdrawTx = await SafeWithSigner.withdraw(hardhatToken.address, 95);
      await withdrawTx.wait();


      // 95 tokens in addr1 
      expect(
        (await hardhatToken.connect(addr1).balanceOf(addr1.address)).toString()
      ).to.equal("95");     
      
      // 4900 tokens in addr1 balance
      expect(
        (await SafeWithSigner.balanceOf(hardhatToken.address)).toString()
      ).to.equal("4900");

    });
    


    it('Should forbidden invalid deposit and withdraw', async function() {
      const { hardhatSafe, Safe_owner} = await loadFixture(
        deploySafeFixture
      );

      const { hardhatToken, Token_owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );


      // Transfer 500 tokens to addr1
      await expect(
        hardhatToken.transfer(addr1.address, 500)
      ).to.changeTokenBalances(hardhatToken, [Token_owner, addr1], [-500, 500]);
      
      
      const erc20WithSigner = hardhatToken.connect(addr1);
      const approveTx = await erc20WithSigner.approve(hardhatSafe.address, "100000000");
      await approveTx.wait();
      // try deposit or withdraw with amount < 0 
      const SafeWithSigner = hardhatSafe.connect(addr1);
      let err=""
      try{ await SafeWithSigner.deposit(hardhatToken.address, 0);}
      catch(e){ err = e.message; }
      expect(err).to.equal("VM Exception while processing transaction: reverted with reason string 'Amount must be greater than 0'");

      try{ await SafeWithSigner.withdraw(hardhatToken.address, 0);}
      catch(e){ err = e.message; }
      expect(err).to.equal("VM Exception while processing transaction: reverted with reason string 'Amount must be greater than 0'");

      

      // There's only 500 tokens in addr1, but addr1 try to deposit 1000 tokens to Safe
      try{ await SafeWithSigner.deposit(hardhatToken.address, 1000);}
      catch(e){ err = e.message; }
      expect(err).to.equal("VM Exception while processing transaction: reverted with reason string 'ERC20: transfer amount exceeds balance'");

      // should be 0 tokens in Safe
      expect(
        (await SafeWithSigner.balanceOf(hardhatToken.address)).toString()
      ).to.equal("0");

      // should be 500 tokens in addr1
      expect(
        (await hardhatToken.connect(addr1).balanceOf(addr1.address)).toString()
      ).to.equal("500");     
      
      // There's no balance in the Safe account of addr1, but addr1 try to withdraw 50 tokens from Safe
      try{ await SafeWithSigner.withdraw(hardhatToken.address, 50); }
      catch(e){ err = e.message;}
      expect(err).to.equal("VM Exception while processing transaction: reverted with reason string 'Insufficient balance'");
      // 0 tokens in Safe
      expect(
        (await SafeWithSigner.balanceOf(hardhatToken.address)).toString()
      ).to.equal("0");

      // 500 tokens in addr1
      expect(
        (await hardhatToken.connect(addr1).balanceOf(addr1.address)).toString()
      ).to.equal("500");   

    });



    it('Should only allow owner to take the fee', async function() {
      const { hardhatSafe, Safe_owner} = await loadFixture(
        deploySafeFixture
      );
      const { hardhatToken, Token_owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      // Transfer 5000 tokens to addr1
      await expect(
        hardhatToken.transfer(addr1.address, 5000)
      ).to.changeTokenBalances(hardhatToken, [Token_owner, addr1], [-5000, 5000]);

      // addr1 approve some allowance to safe contract
      const erc20WithSigner = hardhatToken.connect(addr1);
      const approveTx = await erc20WithSigner.approve(hardhatSafe.address, "100000000");
      await approveTx.wait();

      // addr1 deposit 5000 tokens to safe contract
      // take 0.01 % fee : 5000 * 0.001 = 5
      const depositTx = await hardhatSafe.connect(addr1).deposit(hardhatToken.address, 5000);
      await depositTx.wait();

      // addr1 try to take the fee
      try{
        await hardhatSafe.connect(addr1).takeFee(hardhatToken.address);
      }
      catch(e){
        err = e.message;
      }
      expect(err).to.equal("VM Exception while processing transaction: reverted with reason string 'Only owner can transfer out'");

      //  owner try to take the fee
      await hardhatSafe.connect(Safe_owner).takeFee(hardhatToken.address);

      // should be 5 tokens in owner address
      expect(
        (await hardhatToken.connect(Safe_owner).balanceOf(Safe_owner.address)).toString()
      ).to.equal("5");     
      
      
    });

  });
});