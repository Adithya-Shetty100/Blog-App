var express=require("express"),
methodOverride=require("method-override"),
sanitizer=require("express-sanitizer"),
bodyParser=require("body-parser"),
mongoose=require("mongoose"),
app=express();

//APP CONFIG.
app.use(bodyParser.urlencoded({extended:true}));
app.use(sanitizer()); //this should come after body-parser
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(methodOverride("_method"));

//Mongoose config.
mongoose.connect("mongodb://localhost:27017/blog_app",{
    //can work even if localhost given without port number(27017)
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false //findOneAndUpdate and findOneAndRemove are deprecated, so set this to false
}).then(()=>{
    console.log("Connected to database");
}).catch((err)=>{
    console.log("Error in database:",err);
});

var sc=new mongoose.Schema({
    title:String,
    img:String,
    desc:String,
    date:{type:Date,default:Date.now},
    like:{type:Number,default:0}
});

var blog=mongoose.model("blog",sc);

//blog.create({title:"My first day",desc:"Hi there having a great time right now!!",
//img:"https://images.unsplash.com/photo-1554521323-da4be034ee97?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"})

//INDEX ROUTE
app.get("/",function(req,res){
    res.redirect("/blogs")
});
// redirect root / to index page

app.get("/blogs",function(req,res){
    blog.find({},(err,read)=>{
        if(err){
            console.log("Error read:",err)
        }else{
            res.render("index",{read:read});
        }
    })
});

//NEW
app.get("/blogs/new",function(req,res){
    res.render("new");
});

//CREATE
app.post("/blogs",(req,res)=>{
    req.body.blog.desc=req.sanitize(req.body.blog.desc);
    blog.create(req.body.blog,(err,blg)=>{
        if(err){
            res.redirect("/blogs/new");
            alert("There was an error while posting your blog :( ");
        }else{
            res.redirect("/blogs");
        }
    });
});

//SHOW
app.get("/blogs/:id",(req,res)=>{
    blog.findById(req.params.id,(err,display)=>{
        if(err){
            res.redirect("/blogs");
            alert("Sorry!! There was some error :( ")
        }else{
            res.render("show",{blog:display});
        }
    })
});

//EDIT
app.get("/blogs/:id/edit",(req,res)=>{
    blog.findById(req.params.id,(err,editor)=>{
        if(err){
            res.redirect("/blogs/"+req.params.id);
            alert("Sorry!! There was some error :( ")
        }else{
            res.render("edit",{blog:editor});
        }
    })
});

//UPDATE
app.put("/blogs/:id",(req,res)=>{
    req.body.blog.desc=req.sanitize(req.body.blog.desc);
    blog.findByIdAndUpdate(req.params.id,req.body.blog,(err,updater)=>{
        if(err){
            res.redirect("/blogs/"+req.params.id+"/edit");
            alert("Sorry!! There was some error :( ")
        }else{
            res.redirect("/blogs/"+req.params.id);
        }
    })
});

//DELETE
// show dialog box confirming delete
app.delete("/blogs/:id",function(req,res){
    blog.findByIdAndRemove(req.params.id,(err)=>{
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs");
        }
    })
});


//port
app.listen(4000,function(){
    console.log("Connected to port 4000")
})