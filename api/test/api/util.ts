import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import dotenv from 'dotenv';

dotenv.config();

export var mongo: MongoMemoryServer;

export const connectDB = async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
};

export const dropDB = async () => {
    if (mongo) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongo.stop();
    }
};

export const dropCollections = async () => {
    if (mongo) {
        const collections = await mongoose.connection.db.collections();

        for (const collection of collections) {
            await collection.drop();
        }
    }
};

export function testPasswordReset(resetOptions: any[], verifiedBy: any) {
    const verifiedByAll = [verifiedBy];
    const ret: any[] = [];

    for (let index = 0; index < verifiedByAll.length; index++) {
        let _verifiedBy = verifiedByAll[index];
        for (let j = 0; j < resetOptions.length; j++) {
            let _resetBy = resetOptions[j];
            ret.push({
                testName: `WHEN user reset password with ${_resetBy} and user is verified with ${_verifiedBy} THEN user password is reset`,
                resetBy: _resetBy,
                verifiedBy: _verifiedBy,
            })

        }

    }
    return ret;
}