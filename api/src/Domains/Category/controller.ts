import { INewCategoryFrom } from "./types";
import { newCategorySchema } from "./validation";
import { IPagination, IResponseType } from "../Common/types";
import { Route, Tags, Post, Path, Get } from "tsoa";
import { ICategory } from "../../Schema/Types/category.schema.types";
import CategoryModel from "../../Schema/category.schema";


@Route("/category")
@Tags("Category")
export default class CategoryController {
    @Post("/")
    static async createCategory(_Category: INewCategoryFrom): Promise<IResponseType<ICategory>> {

        await CategoryModel.validator(_Category, newCategorySchema);
        const Category = await new CategoryModel((_Category));
        await Category.save();

        return { body: Category.toJSON() }
    }

    @Get("/list/{skip}/{limit}")
    static async list({ skip, limit }: IPagination): Promise<IResponseType<ICategory[]>> {
        return {
            body: await CategoryModel.find()
                .skip(skip ?? 0)
                .limit(limit ?? 0)
                .exec()
        }
    }

    @Get("/byId/{categoryId}")
    static async getById(categoryId: string): Promise<IResponseType<ICategory | null>> {
        return { body: ((await CategoryModel.getById(categoryId))?.toJSON() as any) };
    }

}