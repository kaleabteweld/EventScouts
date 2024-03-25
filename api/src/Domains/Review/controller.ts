import { IPagination, IResponseType } from "../Common/types";
import { INewReviewFrom } from "./types";
import { IUser } from "../../Schema/Types/user.schema.types";
import { IReview, TReactionType } from "../../Schema/Types/review.schema.types";
import ReviewModel from "../../Schema/review.schema";
import { newReviewSchema } from "./validation";
import EventModel from "../../Schema/event.schema";
import User from "../../Schema/user.schema";


export default class ReviewController {
    static async createReview(_review: INewReviewFrom, _user: IUser): Promise<IResponseType<IReview>> {

        await ReviewModel.validator(_review, newReviewSchema);
        await User.checkIfUserHasTicket(_review.event, _user.id);
        _review = {
            ..._review, user: _user.id
        } as any;

        const review = await new ReviewModel((_review));
        await review.save();

        return { body: (review.toJSON() as any) }
    }

    static async list({ skip, limit }: IPagination, eventId: string): Promise<IResponseType<{ reviews: IReview[], total: number }>> {
        const event = await EventModel.getEventWithReviews({ skip, limit }, eventId)
        return {
            body: { reviews: (event.reviews as IReview[]), total: (event as any).total }
        }
    }

    static async getById(reviewId: string): Promise<IResponseType<IReview | null>> {
        return { body: ((await ReviewModel.getById(reviewId))?.toJSON() as any) };
    }

    static async react(reviewId: string, reaction: TReactionType, _user: IUser): Promise<IResponseType<IReview | null>> {
        const user = await User.getUserById(_user.id);
        const review = await ReviewModel.getById(reviewId);

        return { body: ((await review?.react(reaction, (user as IUser)))?.toJSON() as any) };
    }

    // @Delete("/remove/{reviewId}")
    // static async removeById(reviewId: string, organizer: IOrganizer): Promise<IResponseType<IReview | null>> {
    //     const Review = await ReviewModel.getById(reviewId);
    //     Review?.checkIfOwnByOrganizer(organizer.id);
    //     await ReviewModel.removeByID(Review?.id)

    //     return { body: (Review?.toJSON() as any) };

    // }

    // @Patch("/update/{reviewId}")
    // static async update(_from: IReviewUpdateFrom, reviewId: string, organizer: IOrganizer): Promise<IResponseType<IReview | null>> {
    //     const Review = await ReviewModel.getById(reviewId);
    //     Review?.checkIfOwnByOrganizer(organizer.id);

    //     const validationCheckTicketType: any = Review?.ticketTypes.map((ticketType) => copyObjectWithout(ticketType.toJSON(), ["createdAt", "updatedAt", "id"]))
    //     await ReviewModel.validator({
    //         endDate: Review?.endDate,
    //         ticketTypes: validationCheckTicketType,
    //         ..._from
    //     }, updateReviewSchema);

    //     const newReview = await ReviewModel.update(Review?.id, _from, "categorys")


    //     return { body: (newReview?.toJSON() as any) };
    // }
}
