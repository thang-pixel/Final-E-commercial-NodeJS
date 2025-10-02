const path = require('path');
const morgan = require('morgan');
const express = require('express');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const { PORT } = require('./constants');

const allowOrigins = ['http://localhost:5173'];
app.use(
    cors({
        origin: (origin, callback) => {
            // Cho phép request không có origin (Postman, server-to-server)
            if (!origin) return callback(null, true);

            if (allowOrigins.includes(origin)) {
                callback(null, true); // cho phép
            } else {
                callback(new Error('Not allowed by CORS'), false); // chặn
            }
        },
        credentials: true, // nếu cần gửi cookie/session
    })
);

// routes
const route = require('./routes');
// Database
const db = require('./config/database');

// HTTP Logger
app.use(morgan('combined'));

// Template engine
// app.engine('hbs',
//     engine({
//         extname: '.hbs',
//         helpers: require('./helpers/handlebars.js'),
//     })
// );
// app.set('view engine', 'hbs');
// app.set('views', path.join(__dirname, 'resource/views'));

// static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// method override
app.use(methodOverride('_method'));

// query
app.use(
    express.urlencoded({
        extended: true,
    })
);

// connect to db
db.connect();

// route init
route(app);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

app.listen(PORT, () =>
    console.log(`Example app listening on PORT http://localhost:${PORT}`)
);
