const path = require('path');
const morgan = require('morgan');
const express = require('express');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { PORT } = require('./constants'); 
const route = require('./routes');
const db = require('./config/database');

const app = express();
// setup cors
app.use(cors({ origin: true, credentials: true })); // development
// production
const allowOrigins = ['http://localhost:3000'];
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
// HTTP Logger
app.use(morgan('combined'));
// static files
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Cookie parser
app.use(cookieParser());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
// method override
app.use(methodOverride('_method')); 

// connect to db
db.connect();
// test api
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});
// route init
route(app);

// elastic search init
// const initProductIndex = require('./lib/initProductIndex');
// initProductIndex().catch(console.error);


app.listen(PORT, () =>
    console.log(`Example app listening on PORT http://localhost:${PORT}`)
);
