import 'dotenv/config';
import { ethers } from 'ethers';

// Подключение к провайдеру
const provider = new ethers.JsonRpcProvider("https://linea-mainnet.infura.io/v3/7fff85ac97ca4ba082ab78f7008391cd");
const signer = new ethers.Wallet(process.env.ALICE_PRIVATE_KEY as string, provider);

// Адреса контрактов
const WrappedTokenGatewayV3 = "0x5d50bE703836C330Fc2d147a631CDd7bb8D7171c"; // Замените на реальный адрес контракта
const zEtherAddress = "0xB4FFEf15daf4C02787bC5332580b838cE39805f5";
const zUSDCAddress = "0x2E207ecA8B6Bf77a6ac82763EEEd2A94de4f081d";
const PoolProxylinea = "0x2f9bB73a8e98793e26Cb2F6C4ad037BDf1C6B269";
const usdc = "0x176211869cA2b568f2A7D4EE941E073a821EE1ff";
const eth = "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f"


// ABI контрактов
const ZeroLendABI = require('./ZerolendAbi.json');
const OTokenABI = require('./TokenAbi.json');
const PoolABI = require('./PoolABI.json');

// Настройка контрактов
const zeroLendContract = new ethers.Contract(WrappedTokenGatewayV3, ZeroLendABI, signer);
const zEtherContract = new ethers.Contract(zEtherAddress, OTokenABI, signer);
const zUSDContract = new ethers.Contract(zUSDCAddress, OTokenABI, signer);
const zPoolContract = new ethers.Contract(PoolProxylinea, PoolABI, signer);


async function main() {
    Balance(signer.address)
    //await deposit(PoolProxylinea,signer.address,"0.0001");
    //await lend(usdc,"0.1",6,signer.address);
    //await borrowETH(PoolProxylinea,"0.00009",2,0);
    //await repay(PoolProxylinea,signer.address,2,zPoolContract,zEtherAddress);
      await withdraw(zEtherAddress,"0.0001",signer.address);
}
async function Balance(to:string){
    const balance = await provider.getBalance(signer.address);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
}


async function deposit(PoolProxyLinea: string,public_key: string,value: string) {
    const depTx = await zeroLendContract.depositETH(PoolProxyLinea, public_key, 0, {
        value: ethers.parseUnits(value, 18)
    });
    await depTx.wait();
    console.log("Deposit complete.");
}

async function lend(token:string,value: string,unit: number,to: string) {
    const lendTx = await zPoolContract.supply(token, ethers.parseUnits(value, unit), to, 0);
    await lendTx.wait();
    console.log("Lending complete.");
}

async function borrowETH(PoolProxyLinea: string, value: string, rateType: number, index: number) {
    const borrowTx = await zeroLendContract.borrowETH(PoolProxyLinea, { value: ethers.parseUnits(value, 18) }, rateType, index);
    await borrowTx.wait();
    console.log("Borrow complete.");
}

async function repay(PoolProxylinea: string, accountAddress: string, rateType: number,poolContract:any,tokenAddress: string) {
    const userData = await poolContract.getUserAccountData(accountAddress);
    console.log(userData.totalDebtBase)
    // const repayTx = await zeroLendContract.repayETH(PoolProxylinea, userData.totalDebtBase, rateType, accountAddress, { value: userData.totalDebtBase });
    // await repayTx.wait();
    const tx = await poolContract.repay(tokenAddress, userData.totalDebtBase, 1, accountAddress);
    await tx.wait();
    console.log("Repay complete.");
}

async function withdraw(zEtherAddress: string, value: string, to: string) {
    const withdrawTx = await zeroLendContract.withdrawETH(zEtherAddress, ethers.parseEther(value), to);
    await withdrawTx.wait();
    console.log("Withdraw complete.");
}



main().catch(console.error);
