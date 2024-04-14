import { createClient } from 'redis';
import { errorResponse } from '../../Types/error';

export default class Cache {
    public static client = createClient({
        url: process.env.REDIS_URL
    });

    static async connect() {
        Cache.client.on('error', (err) => console.log('[+] Redis Client Error', err));
        await Cache.client.connect();
        console.log("[+] Redis Client Connected")
    }

    static async disconnect() {
        await Cache.client.quit();
    }

    static async addRefreshToken(refreshToken: string, userId: string, ttl: number) {
        const temp = await Cache.client.set(userId.toString(), refreshToken, {
            EX: ttl
        });
    }
    static async getRefreshToken(userId: string) {
        return await Cache.client.get(userId.toString());
    }
    static async removeRefreshToken(userId: string) {
        return await Cache.client.del(userId.toString());
    }

    static async addOtp(phoneNumber: string, otp: string, ttl?: number) {
        const temp = await Cache.client.set(phoneNumber, otp, {
            EX: ttl
        });
    }
    static async getOtp(phoneNumber: string) {
        return await Cache.client.get(phoneNumber);
    }
    static async removeOtp(phoneNumber: string) {
        return await Cache.client.del(phoneNumber);
    }

    static async addEmailOtp(email: string, otp: string, ttl?: number) {
        const temp = await Cache.client.set(email, otp, {
            EX: ttl
        });
    }
    static async getEmailOtp(email: string) {
        return await Cache.client.get(email);
    }
    static async removeEmailOtp(email: string) {
        return await Cache.client.del(email);
    }




    static async run(fn: Function, onError?: Function) {
        try {
            return await fn();
        } catch (error: any) {
            if (onError !== undefined) onError(error);
            console.log("[-] Redis Error ", error)
            const _error: errorResponse = {
                msg: error.msg ?? "Redis Error",
                statusCode: 500,
                type: "Redis",
            }
        }
    }
}