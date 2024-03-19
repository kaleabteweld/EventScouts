import { INewCategoryFrom } from "./types";
import { newCategorySchema } from "./validation";
import { IPagination, IResponseType } from "../Common/types";
import { ICategory } from "../../Schema/Types/category.schema.types";
import CategoryModel from "../../Schema/category.schema";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";
import OrganizerModel from "../../Schema/organizer.schema";

export default class CategoryController {
    static async createCategory(_Category: INewCategoryFrom, _organizer: IOrganizer): Promise<IResponseType<ICategory>> {

        await CategoryModel.validator(_Category, newCategorySchema);
        const organizer = await OrganizerModel.getById(_organizer.id);
        const category = await new CategoryModel(({ ..._Category, organizer: organizer?.id }));
        await category.save();

        return { body: (category.toJSON() as any) }
    }

    static async list({ skip, limit }: IPagination, withEventCount?: boolean): Promise<IResponseType<ICategory[]>> {
        if (withEventCount) {
            return {
                body: await CategoryModel.getCategorysWithEventCount({ skip, limit })
            }
        }
        else {
            return {
                body: await CategoryModel.find()
                    .skip(skip ?? 0)
                    .limit(limit ?? 0)
                    .exec()
            }
        }
    }

    static async getById(categoryId: string, withEventCount?: boolean): Promise<IResponseType<ICategory | null>> {
        if (withEventCount) {
            return { body: ((await CategoryModel.getCategoryWithEventCount(categoryId)) as any) };
        } else {
            return { body: ((await CategoryModel.getById(categoryId)) as any) };
        }
    }

    static async removeById(categoryId: string, organizer: IOrganizer): Promise<IResponseType<ICategory | null>> {
        const category = await CategoryModel.getById(categoryId);
        category?.checkIfOwnByOrganizer(organizer.id);
        await CategoryModel.removeByID(category?.id)

        return { body: (category?.toJSON() as any) };

    }

}