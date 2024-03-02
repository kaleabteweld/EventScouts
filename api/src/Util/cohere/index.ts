import { CohereClient } from "cohere-ai";
import { TModels } from "./type";
import { EmbedInputType } from "cohere-ai/api";

export default class CohereAI {
    private static instance: CohereAI; // Static property to hold the single instance
    private _cohereClient: CohereClient | null = null;

    private constructor(token?: string) {
        this._cohereClient = new CohereClient({
            token: token || "",
        });
    }
    // Static method to access the single instance
    public static getInstance(token?: string): CohereAI {
        if (!CohereAI.instance) {
            CohereAI.instance = new CohereAI(token);
        }
        return CohereAI.instance;
    }

    async embed(text: String | string[], model: TModels = "embed-english-v3.0", inputType: EmbedInputType | undefined = "classification"): Promise<number[]> {
        var texts: string[] = []
        if (typeof text === 'string' || text instanceof String) texts = text.split(" ");
        try {
            const embed = await this._cohereClient?.embed({
                texts,
                model,
                inputType,
            });
            return embed?.embeddings as number[];
        } catch (error) {
            console.log("embedding error", error);
            throw error
        }
    }
}

