import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { Agency } from "../models/agency.models.js"

export const requireAgencyOwner = asyncHandler(async (req, res, next) => {
    const agency = await Agency.findById(req.user.agencyId)
    if (!agency) throw new ApiError(404, "Agency not found")
    if (agency.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the agency owner can perform this action")
    }
    next()
});