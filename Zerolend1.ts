import 'dotenv/config';
import { ethers } from 'ethers';

const main = async () => {
    // Подключение к провайдеру
    const provider = new ethers.JsonRpcProvider("https://linea-mainnet.infura.io/v3/7fff85ac97ca4ba082ab78f7008391cd");
    const signer = new ethers.Wallet(process.env.ALICE_PRIVATE_KEY as string, provider);

    // Адреса контрактов ZeroLend
    const WrappedTokenGatewayV3 = "0x5d50bE703836C330Fc2d147a631CDd7bb8D7171c"; // Замените на реальный адрес контракта
    const zEtherAddress = "0xB4FFEf15daf4C02787bC5332580b838cE39805f5";
    const zUSDCAddress = "0x2E207ecA8B6Bf77a6ac82763EEEd2A94de4f081d";
    const PoolProxylinea = "0x2f9bB73a8e98793e26Cb2F6C4ad037BDf1C6B269";
    //const qwe = "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f"
    const usdc = "0x176211869cA2b568f2A7D4EE941E073a821EE1ff"

    // ABI контрактов
    const ZeroLendABI = require('./ZerolendAbi.json');
    const OTokenABI = require('./TokenAbi.json');
    const PoolABI = require('./PoolABI.json');

    // Настройка контрактов
    const zeroLendContract = new ethers.Contract(WrappedTokenGatewayV3, ZeroLendABI, signer);
    const zEtherContract = new ethers.Contract(zEtherAddress, OTokenABI, signer);
    const zUSDContract = new ethers.Contract(zUSDCAddress, OTokenABI, signer);
    const zPoolContract = new ethers.Contract(PoolProxylinea,PoolABI,signer)


    // Проверка баланса
    const balance = await provider.getBalance(signer.address);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

     const Dep = await zeroLendContract.depositETH(PoolProxylinea,"0x60f9d9EA494B44B38AC44aC8cbA4c81d6b4D0A3d",0,{
         value : ethers.parseUnits('0.001', 18)
     });
     await Dep.wait(); console.log("Dep")

    //  (залог)
    const lendTx = await zPoolContract.supply(usdc, ethers.parseUnits('0.002', 6), signer.address, 0);
    await lendTx.wait();

    // // Взятие займа (1 USDC)
    const borrowTx = await zeroLendContract.borrowETH(PoolProxylinea,{value: ethers.parseUnits('0.001', 18)} , 2 /* Предположим, что это тип процентной ставки (variable или stable) */, 0, signer.address);
    await borrowTx.wait();
    console.log('1 USDC borrowed.');

//     // Проверка health rate
    const [liquidity, shortfall] = await zeroLendContract.getAccountLiquidity(signer.address);
    console.log(`Liquidity: ${liquidity}`);
    console.log(`Shortfall: ${shortfall}`);
//
//
//
//     // Получение текущей суммы долга, включая проценты
     const totalDebt = await zeroLendContract.getTotalDebt(signer.address, PoolProxylinea); // Предположим, что есть такой метод
//
// // Погашение займа в ETH, включая проценты
    const repayAmount = ethers.parseEther(totalDebt.toString()); // Преобразуем в формат для отправки
    const repayTx = await zeroLendContract.repayETH(PoolProxylinea, repayAmount, 2, signer.address, { value: repayAmount });
    await repayTx.wait();
    console.log('ETH loan repaid with interest.');
//
//
//     // Вывод ETH
    const withdrawTx = await zeroLendContract.withdrawETH(zEtherAddress, ethers.parseEther("0.0001"), signer.address);
    await withdrawTx.wait();
    console.log('ETH successfully withdrawn.');
};

main().catch(console.error);
