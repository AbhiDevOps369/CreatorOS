import { ApiError } from "./apiError.js"

export const checkAgencyOwnership = (resource, agencyId) => {
    if (!resource) throw new ApiError(404, "Resource not found")
    if (resource.agencyId.toString() !== agencyId.toString()) {
        throw new ApiError(403, "Access denied")
    }
}