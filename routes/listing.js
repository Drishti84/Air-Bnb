const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {storage} = require("../cloudConfig.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, validateListing, isOwner} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require('multer');
const upload = multer({storage});


router.route("/")
.get ( wrapAsync(listingController.index))
.post(isLoggedIn,
    upload.single('listing[image]'),validateListing,
     wrapAsync(listingController.createListing))


router.get("/new", isLoggedIn, listingController.renderNewForm);
    

router.route("/:id")
    .get(wrapAsync(listingController.showListing ))
    .put(isLoggedIn,isOwner, upload.single('listing[image]'),validateListing, wrapAsync(listingController.updateListing))
    .delete( isLoggedIn, isOwner,wrapAsync(listingController.destroyListing));




router.get("/:id/edit", isLoggedIn, isOwner,wrapAsync(listingController.renderEditForm)); 



module.exports = router;
