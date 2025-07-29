const path = require('path')
const express = require('express')
const session = require('express-session')
const config = require('./configs/app.config')
const indexRouter = require('./routes/index.route')
const detailRouter = require('./routes/detail.route')

// app setup
const app = express()
const port = config.web.port
app.listen(port, () => console.log(`Server listening on port ${port}!`))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(express.static(path.join(__dirname, 'public')))

// session setup
app.use(session({
	resave: false, // don't save session if unmodified
	saveUninitialized: false, // don't create session until something stored
	secret: 'keyboard cat'
}))

// routing
app.use('/', indexRouter)
app.use('/pokemon/', detailRouter)

// handle 404 status code
app.all('/{*splat}', (req, res) => {
	res.status(404)
	res.locals.homeUrl = req.protocol + '://' + req.get('host')
    res.locals.crtUrl = res.locals.homeUrl + req.originalUrl
    return res.render('404.pug')
})
