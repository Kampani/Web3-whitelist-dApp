const { ethers } = require('hardhat')

async function main(){
    
    const whitelistContract = await ethers.getContractFactory('Whitelist')

    const deployedContract = await whitelistContract.deploy(25)

    await deployedContract.deployed()

    console.log(
        'address of whitelist contract:',
        deployedContract.address
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })