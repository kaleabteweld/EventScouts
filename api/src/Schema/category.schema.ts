import mongoose from 'mongoose'
import { ICategory, ICategoryMethods, ICategoryModel } from './Types/category.schema.types';
import { mongooseErrorPlugin } from './Middleware/errors.middleware';
import { validator, getById, checkIfOwnByOrganizer, removeByID } from './ExtendedFunctions/category.extended'


export const categorySchema = new mongoose.Schema<ICategory, ICategoryModel, ICategoryMethods>({
    name: { type: String, unique: true },
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "Organizer" },
}, {
    timestamps: true,
    methods: {
        checkIfOwnByOrganizer,
    },
    statics: {
        validator,
        getById,
        removeByID,
    }
});

categorySchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret['password']
        ret['id'] = doc['_id']
        delete ret['_id']
        return ret
    }
})
categorySchema.plugin<any>(mongooseErrorPlugin)


const CategoryModel = mongoose.model<ICategory, ICategoryModel>("Category", categorySchema);
export default CategoryModel;