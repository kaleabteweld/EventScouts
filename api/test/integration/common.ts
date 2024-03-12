import { BigNumber } from "ethers";
import { ethers } from "hardhat";

export function dollarsToWei(dollars: number, amount: number = 1) {
    // Get the precise conversion rate from your contract or source
    const preciseConversionRate = ethers.utils.parseUnits('0.00028', 'ether');

    // Convert dollars to wei using the precise conversion rate
    const wei = ethers.utils.parseUnits(dollars.toString(), 'ether');


    // Divide by the precise conversion rate to get the result
    return wei.div(preciseConversionRate).mul(BigNumber.from(amount));
}

