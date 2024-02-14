import { INewCategoryFrom } from "./types";
import { newCategorySchema } from "./validation";
import { IResponseType } from "../Common/types";
import { Route, Tags, Post, Path } from "tsoa";
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

}