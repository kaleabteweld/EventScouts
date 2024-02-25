import { IPagination, IResponseType } from "../Common/types";
import { Route, Tags, Post, Get, Delete, Patch } from "tsoa";
import { INewReviewFrom } from "./types";
import { IUser } from "../../Schema/Types/user.schema.types";
import { IReview } from "../../Schema/Types/review.schema.types";
import ReviewModel from "../../Schema/review.schema";
import { newReviewSchema } from "./validation";
import EventModel from "../../Schema/event.schema";


@Route("/review")
@Tags("Review")
export default class ReviewController {
    @Post("/")
    static async createReview(_review: INewReviewFrom, user: IUser): Promise<IResponseType<IReview>> {

        await ReviewModel.validator(_review, newReviewSchema);

        _review = {
            ..._review, user: {
                username: user.userName,
                profilePic: user.profilePic,
                user: user.id,
            }
        } as any;

        const review = await new ReviewModel((_review));
        await review.save();

        return { body: review.toJSON() }
    }

    @Get("/list/{eventId}/{skip}/{limit}")
    static async list({ skip, limit }: IPagination, eventId: string): Promise<IResponseType<{ reviews: IReview[], total: number }>> {
        const event = await EventModel.getEventWithReviews({ skip, limit }, eventId)
        return {
            body: { reviews: (event.reviews as IReview[]), total: (event as any).total }
        }
    }

    @Get("/byId/{reviewId}")
    static async getById(reviewId: string): Promise<IResponseType<IReview | null>> {
        return { body: ((await ReviewModel.getById(reviewId))?.toJSON() as any) };
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
