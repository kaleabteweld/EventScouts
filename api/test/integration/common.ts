import { ethers } from "hardhat";

export function dollarsToWei(dollars: number) {
    // Define the exchange rate in wei per dollar
    const weiPerDollar = ethers.utils.parseUnits('0.00028', 'ether'); // 1 ether = 1e18 wei

    // Convert dollars to wei
    const wei = ethers.utils.parseUnits((dollars * 1e18).toString(), 'wei');

    return wei.div(weiPerDollar); // Divide by the wei per dollar rate to get the result
}