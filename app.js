const express = require('express')
const path = require('path')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const nunjucks = require('nunjucks')
const dotenv = require('dotenv')
const ColorHash = require('color-hash').default

dotenv.config()

// -- 라우트 관련
const router = express.Router()

router.get('/', async (req, res, next) => {
    try{
        res.render('index', {user : req.session.color})
        req.app.get('io').emit('join', {user : req.session.color});
    }catch(error){
        console.error(error)
        next(error)
    }
})

//유저에게 post로 데이터 받음.
router.post('/', async (req,res,next) => {
    console.log('#',req.params)
    try{
        const chatData = {
            user : req.session.color,
            message :req.body.message
        }

        // 연결되어있는 다른 user에게 '/chat'경로로 chat데이터를 emit.
        req.app.get('io').emit('chat', chatData);
        res.send('ok')
    }catch (error){
        console.error(error);
        next(error)
    }
})
// -- 라우트 관련 끝

const webSocket = require('./socket')
const { hasUncaughtExceptionCaptureCallback } = require('process')
const app = express();
app.set('port', process.env.PORT || 8005)
app.set('view engine', 'html')
nunjucks.configure('view', {
    express: app,
    watch: true
})

const sessionMiddleware = session({
    resave: false,
    saveUninitialized: false,
    secret : process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    }
})


app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended : false}))
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware)

app.use((req,res,next)=>{
    if (!req.session.color){
        const colorHash = new ColorHash()
        req.session.color = colorHash.hex(req.sessionID)
    }
    next()
})

app.use('/', router)

const server = app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중')
})

// app.listen(app.get('port'), () => {
//     console.log(app.get('port'), '번 포트에서 대기 중')
// })

webSocket(server,app, sessionMiddleware)