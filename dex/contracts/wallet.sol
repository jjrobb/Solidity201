pragma solidity >=0.6.0 ^0.8.0;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Wallet is Ownable {
    using SafeMath for uint256;

    struct Token{
        bytes32 ticker;
        address tokenAddress;
    }

    mapping(bytes32 => Token) public tokenMapping;
    bytes32[] public tokenList;
    mapping(address => mapping(bytes32 => uint256)) public balances;

    modifier tokenExist(bytes32 ticker){
        require(tokenMapping[ticker].tokenAddress != address(0),"Token does not exist");

        _;
    }

    function depositETH() payable external {
         require(msg.value > 0, "DEX: ETH transfer should be greater than 0");
         balances[msg.sender]["ETH"]= balances[msg.sender]["ETH"].add(msg.value);
    }

    function addToken(bytes32 ticker, address tokenAddress) external onlyOwner {
        tokenMapping[ticker] = Token(ticker,tokenAddress);
        tokenList.push(ticker);
    }

    function deposit(uint amount, bytes32 ticker) external tokenExist(ticker){

       IERC20(tokenMapping[ticker].tokenAddress).transferFrom(msg.sender,address(this),amount);
       balances[msg.sender][ticker] = balances[msg.sender][ticker].add(amount);      
        
    }

    function withdraw(uint amount, bytes32 ticker) external tokenExist(ticker) {
        require(balances[msg.sender][ticker] > amount,"Insufficient Balance");
        
        balances[msg.sender][ticker] = balances[msg.sender][ticker].sub(amount);
        IERC20(tokenMapping[ticker].tokenAddress).transfer(msg.sender,amount);
    }


}