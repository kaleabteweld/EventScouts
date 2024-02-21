import mongoose from 'mongoose'
import { ICategory, ICategoryMethods, ICategoryModel } from './Types/category.schema.types';
import { mongooseErrorPlugin } from './Middleware/errors.middleware';
import { validator, getById, checkIfOwnByOrganizer, removeByID } from './ExtendedFunctions/category.extended'
import { getCategoryWithEventCount, getCategorysWithEventCount } from './Aggregate/category.aggregate';
import { IOrganizer } from './Types/organizer.schema.types';


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
        getCategoryWithEventCount,
        getCategorysWithEventCount,
    }
});

categorySchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret['password']
        ret['id'] = doc['_id']
        delete ret['_id']
        return ret
    }
});
categorySchema.post('save', async function (doc) {
    try {
        const organizer: IOrganizer | null = await mongoose.model('Organizer').findById(doc.organizer);
        if (organizer) {
            if (!organizer.categorys.includes(doc._id)) {
                organizer.categorys.push(doc._id);
                await organizer.save();
            }
        }
    } catch (error) {
        console.error("Error updating categories:", error);
    }
});
categorySchema.plugin<any>(mongooseErrorPlugin)


const CategoryModel = mongoose.model<ICategory, ICategoryModel>("Category", categorySchema);
export default CategoryModel;