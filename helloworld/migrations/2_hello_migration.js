const helloWorld = artifacts.require("helloWorld");

module.exports = function (deployer) {
  deployer.deploy(helloWorld);
};