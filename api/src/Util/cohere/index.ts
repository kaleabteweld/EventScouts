import { CohereClient } from "cohere-ai";
import { TModels } from "./type";
import { EmbedInputType } from "cohere-ai/api";

export default class CohereAI {

    private _cohereClient: CohereClient | null = null;

    constructor(token?: string) {
        this._cohereClient = new CohereClient({
            token: token || "",
        });
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