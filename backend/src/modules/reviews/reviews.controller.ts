import { Request, Response } from 'express';
import { ReviewsService } from './reviews.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { sendSuccess } from '../../utils/response.utils';

const reviewsService = new ReviewsService();

export class ReviewsController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await reviewsService.findAll(req.query as Record<string, string>);
    sendSuccess(res, result.reviews, 'Reviews fetched', 200, result.meta);
  });

  getOne = asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewsService.findOne(req.params.id);
    sendSuccess(res, review);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const review = await reviewsService.create(req.body, req.user!.userId);
    sendSuccess(res, review, 'Review submitted', 201);
  });

  approve = asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewsService.approve(req.params.id);
    sendSuccess(res, review, 'Review approved');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await reviewsService.delete(req.params.id);
    sendSuccess(res, null, 'Review deleted');
  });
}
