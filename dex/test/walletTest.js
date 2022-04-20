const Dex = artifacts.require("Dex")
const Link = artifacts.require("Link")
const truffleAssert = require('truffle-assertions')
contract.skip("Dex", accounts => {

    it("should allow ETH deposit", async() => {
        
        let dex = await Dex.deployed()
        //await dex.addToken(web3.utils.fromUtf8("ETH"),)
        await dex.depositETH({from: accounts[0],value: 10})
        let balance = await dex.balances(accounts[0],web3.utils.fromUtf8("ETH"))
        assert.equal(balance.toNumber(), 10)
           
    })
    it("should only be possible for owner to add tokens", async() => {
    
        let link = await Link.deployed()
        let dex = await Dex.deployed()
        await truffleAssert.passes(
            dex.addToken(web3.utils.fromUtf8("LINK"),link.address, {from:accounts[0]})
        )
        await truffleAssert.reverts(
            dex.addToken(web3.utils.fromUtf8("LINK"),link.address, {from:accounts[1]})
        )
    })
    it("should handle deposits correctly", async() => {
        
        let link = await Link.deployed()
        let dex = await Dex.deployed()
        await link.approve(dex.address,500)
        await dex.deposit(100,web3.utils.fromUtf8("LINK"))
        let balance = await dex.balances(accounts[0],web3.utils.fromUtf8("LINK"))
        assert.equal(balance.toNumber(), 100)
    
    })
    it("should handle faulty withdrawls", async() => {
        
        let link = await Link.deployed()
        let dex = await Dex.deployed()
        await truffleAssert.reverts(dex.withdraw(500, web3.utils.fromUtf8("LINK")))
    
    })
    it("should only allow buy order if the user has deposited ETH >= the amount of the buy order", async() => {
        let link = await Link.deployed();
        let dex = await Dex.deployed();

        await truffleAssert.reverts(
            dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 10, 1))
        
        await dex.depositETH({from: accounts[0],value: 10})
        await truffleAssert.passes(
            dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 10, 1)
        )
        
        
    })
    it("should only allow sell order if the user has deposited LINK >= the amount of the buy order", async() => {
        let link = await Link.deployed()
        let dex = await Dex.deployed()

        await truffleAssert.reverts(
            dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 10, 1))

        await link.approve(dex.address,500)
        await dex.addToken(web3.utils.fromUtf8("LINK"),link.address,{from: accounts[0]})  
        await dex.deposit(10, web3.utils.fromUtf8("LINK"), {from: accounts[0]})

        await truffleAssert.passes(
            dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 10, 1, {from: accounts[0]})
        )
        
    })
        
    it("BUY order book should be ordered on price from highest to lowest starting at index 0", async() => {
        
        let link = await Link.deployed()
        let dex = await Dex.deployed()
        await link.approve(dex.address,800);
        //await dex.deposit(10, web3.utils.fromUtf8("ETH"), {from: accounts[0]})
        await dex.depositETH({from: accounts[0],value: 2500})
        await dex.createLimitOrder(0,web3.utils.fromUtf8("LINK"), 1, 300)
        await dex.createLimitOrder(0,web3.utils.fromUtf8("LINK"), 1, 600)
        await dex.createLimitOrder(0,web3.utils.fromUtf8("LINK"), 1, 500)

        let book = await dex.getOrderBook(web3.utils.fromUtf8("LINK"),0);
        assert(book.length > 0);
        for(let i=0;i<book.length-1;i++){
            truffleAssert.passes(book[i].price > book[i+1].price);
        }       
    
    })
      
      it("Sell order book should be ordered on price from lowest to highest starting at index 0", async() => {
        
        let dex = await Dex.deployed()
        let link = await Link.deployed()
        await link.approve(dex.address,100);
        await dex.addToken(web3.utils.fromUtf8("LINK"),link.address,{from: accounts[0]})  
        await dex.deposit(10, web3.utils.fromUtf8("LINK"), {from: accounts[0]})
        await dex.createLimitOrder(1,web3.utils.fromUtf8("LINK"), 1, 300)
        await dex.createLimitOrder(1,web3.utils.fromUtf8("LINK"), 1, 100)
        await dex.createLimitOrder(1,web3.utils.fromUtf8("LINK"), 1, 200)
      
        let book = await dex.getOrderBook(web3.utils.fromUtf8("LINK"),1);
        console.log(book);
        assert(book.length > 0);
        for(let i=0;i<book.length-1;i++){
            assert(book[i].price < book[i+1].price);

        } 
        
    
    })
}
)

