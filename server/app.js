const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const passport = require('./Middleware/passportConfig');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const decisionRoutes = require('./routes/decisionRoutes');
const groupRoutes = require('./routes/group.routes');
const skillRoutes = require('./routes/skillRoutes');
const linkRoutes = require('./routes/linkRoutes');
const multigroupRoutes = require('./routes/multigroupRoutes');
const commentRoutes = require('./routes/commentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const advancedProfileRoutes = require('./routes/advancedProfileRoutes');
const advancedLinkRoutes = require('./routes/advancedLinkRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: "*" }));
app.use(morgan('tiny'));
app.use(session({
    secret: 'cats',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', decisionRoutes);
app.use('/group', groupRoutes);
app.use('/skill',skillRoutes);
app.use('/api',linkRoutes);
app.use('/group',multigroupRoutes);
app.use('/group',commentRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api',advancedProfileRoutes);
app.use('/link',advancedLinkRoutes); 
app.use('/api/subscription', subscriptionRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

