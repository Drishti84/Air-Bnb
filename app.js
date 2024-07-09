if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const expressError = require("./utils/expressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const user = require("./models/user.js");
const Review = require("./models/review.js");
const Listing = require("./models/listing.js");
const wrapAsync = require("./utils/wrapAsync.js");


const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL ;

const store = MongoStore.create(
    {mongoUrl : dbUrl,
        crypto : {
            secret : process.env.SECRET,
        },
    touchAfter : 24*3600 , 
    }
);

store.on("error" , () => {
    console.log(":eeror in mongo session store", err);
})

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookies: {
        expires : Date.now() *7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly : true
    }
};




app.get("/" , (req, res) => {
    res.redirect("/listings");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    
    next();
});


//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust1";




main()
    .then(() => {
       return console.log("connected to db");

    })
    .catch((err) => {
       return console.log(err);
    });

async function main (){
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));





app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/",userRouter);


app.all("*", (req, res, next) => {
    next(new expressError(404, "page not found"));
}
);

app.use((err, req, res, next) => {
    let {statusCode = 500, message="something went wrong"} = err;
    //res.status(statusCode).send(message);
    res.status(statusCode).render("listings/error.ejs", {message});
});

app.listen(8080, () => {
    console.log("server is listenting");
});