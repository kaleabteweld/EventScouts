import { ethers } from "hardhat";
import { TransactionResponse } from "@ethersproject/providers";
import { ValidationErrorFactory } from "../Factories";

export async function getTransaction(mintHash: string): Promise<TransactionResponse> {
    var ETHTransaction: unknown = {};
    try {
        const ETHTransaction = await ethers.provider.getTransaction(mintHash);
        if (!ETHTransaction) {
            throw ValidationErrorFactory({
                msg: "Transaction not found",
                statusCode: 404,
                type: "Validation"
            }, "mintHash")
        }
        return ETHTransaction as TransactionResponse
    } catch (error: any) {
        if (error.code == "INVALID_ARGUMENT") {
            throw ValidationErrorFactory({
                msg: error.reason,
                statusCode: 400,
                type: "validation"
            }, "mintHash")
        }
        throw error;
    }

}