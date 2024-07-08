const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview} = require("../middleware.js");
const {isLoggedIn, validateListing, isOwner, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/review.js");



router.post("/"  ,isLoggedIn,validateReview, wrapAsync ( reviewController.createReview ));


 router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));


module.exports = router;