import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getMessaging, Message, TopicMessage } from "firebase-admin/messaging";

process.env.GOOGLE_APPLICATION_CREDENTIALS;
initializeApp({
    credential: applicationDefault()
});

export async function sendPushNotification(message: Message) {
    try {
        const response = await getMessaging().send(message);
        return response
    } catch (error) {
        console.log("[-] sendPushNotification error ", error);
        throw error;
    }
}

export async function sendEach(messages: Message[]) {
    try {
        const responses = await Promise.all(
            messages.map(message => sendPushNotification(message))
        );
        return responses;
    } catch (error) {
        console.error("[-] sendEach error ", error);
        throw error;
    }
}


export class PushMessageBuilder {
    protected message: Message;

    constructor(token: string) {
        this.message = {
            token: token,
        };
    }

    setTitle(title: string): this {
        this.message.notification = this.message.notification || {};
        this.message.notification.title = title;
        return this;
    }

    setBody(body: string): this {
        this.message.notification = this.message.notification || {};
        this.message.notification.body = body;
        return this;
    }

    setData(data: { [key: string]: string }): this {
        this.message.data = data;
        return this;
    }

    build(): Message {
        return this.message;
    }
}

export class TopicMessageBuilder {

    protected message: Message;

    constructor(topic: string) {
        this.message = {
            topic: topic,
        };
    }

    setTitle(title: string): this {
        this.message.notification = this.message.notification || {};
        this.message.notification.title = title;
        return this;
    }

    setBody(body: string): this {
        this.message.notification = this.message.notification || {};
        this.message.notification.body = body;
        return this;
    }

    setData(data: { [key: string]: string }): this {
        this.message.data = data;
        return this;
    }

    build(): Message {
        return this.message;
    }
}
