const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app=express();

const port=process.env.PORT || 5500;

require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));//in order to specify path with ease
app.use(expressLayouts);

app.set('layout','./layouts/main');
app.set('view engine','ejs');

const routes=require('./server/routes/eDoseRoutes.js');

app.use('/',routes);

app.listen(port, ()=>console.log(`listening to port ${port}`));