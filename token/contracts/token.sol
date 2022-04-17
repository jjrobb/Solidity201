pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/erc20/extensions/ERC20Capped.sol";

contract myToken is  ERC20Capped {

constructor() ERC20("JonToken","JTKN") ERC20Capped(100000){
  _mint(msg.sender, 10000);
}
}