import express, { response } from 'express'
import {readPosts, readUser, insertPost, insertUser, likeFunction, shareFunction, deleteFunction} from './operations.js'
import hbs from 'hbs'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose'



 const __filename = fileURLToPath(import.meta.url)

 const __dirname = path.dirname(__filename);

const app = express()

app.set('view engine', 'hbs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cookieParser())

app.use(express.static(path.join(__dirname,"public")))

app.get('/',(req, res)=>{
    res.render("login")
})

app.post('/login', async (req,res)=>{
  
    const output = await readUser(req.body.profile)
    const password = output[0].password
    if(password === req.body.password)
    {
        const secret = "b0d9c7787591ca730ffab34d19651c5e757934917a6bd334029ee5f6c162690fd10b27a8917d98976ffe18e839b4f7fd0fd3ee8dd6c85e6426a64aabe3c00131"
        const payload = {"profile":output[0].profile,"name":output[0].name, "headline":output[0].headline}
        const token = jwt.sign(payload, secret)
        console.log("token=", token)
        res.cookie("token", token)
        res.redirect("/posts")

    }
    else{
        res.send("Incorrect UserName or Password")
        res.render("login")
    }
})

app.get('/posts',verifyLogin, async (req,res)=>{
    const output = await readPosts()
    res.render("posts", {
        data: output,
        userInfo: req.payload
    })
})

app.post('/like',async (req,res) =>{
    await likeFunction(req.body.content)
    res.redirect('/posts')

})

app.post('/share',async (req,res) =>{
    await shareFunction(req.body.content)
    res.redirect('/posts')

})

app.post('/delete',async (req,res) =>{
    await deleteFunction(req.body.content)
    res.redirect('/posts')

})

app.post('/addposts', async (req,res)=>{
    await insertPost(req.body.profile, req.body.content)
    res.redirect("/posts")
})

function verifyLogin(req, res, next){
    const secret = "b0d9c7787591ca730ffab34d19651c5e757934917a6bd334029ee5f6c162690fd10b27a8917d98976ffe18e839b4f7fd0fd3ee8dd6c85e6426a64aabe3c00131"
    const token = req.cookies.token
    jwt.verify(token, secret, (err,payload)=>{
        if(err) return res.sendStatus(403)
        req.payload = payload

    })
    next()

}

app.post('/addusers',async (req,res)=>{
    if(req.body.password === req.body.cnfpassword)
    {
        await insertUser(req.body.name, req.body.profile, req.body.password, req.body.headline,)
        res.redirect('/')
    }
    else{
        res.send("Password and confirm Password did not match")
    }
    
})

app.get('/register',(req,res)=>{
    res.render("register")
})

// ****************** booking application code ********************//

app.get('/cinema',(req,res)=>{
    res.render("cinema",{
        movies: moviesRes,
        screen1: screen1Res,
        screen2: screen2Res,
        screen3: screen3Res
    })
})

mongoose.connect("mongodb://127.0.0.1:27017/cinema",{
    // useNewUrlParser: true,
    useUnifiedTopology: true
})

const screen1Model = mongoose.model('screen1',{
    seatno: {type: Number},
    status: {type: String}
})

const screen2Model = mongoose.model('screen2',{
    seatno: {type: Number},
    status: {type: String}
})

const screen3Model = mongoose.model('screen3',{
    seatno: {type: Number},
    status: {type: String}
})

const moviesModel = mongoose.model('movies',{
    name: {type: String},
    rate: {type: Number},
    screenNo: {type: Number}
})

var screen1Res
screen1Model.find().then(function(output){
    screen1Res = output
})
.catch(function (err){
    console.log(err)
})

var screen2Res
screen1Model.find().then(function(output){
    screen2Res = output
})
.catch(function (err){
    console.log(err)
})

var screen3Res
screen1Model.find().then(function(output){
    screen3Res = output
})
.catch(function (err){
    console.log(err)
})

var moviesRes
moviesModel.find().then(function(output){
    moviesRes = output
})
.catch(function (err){
    console.log(err)
})

app.listen(3000,()=>{
    console.log("Listening...")
})