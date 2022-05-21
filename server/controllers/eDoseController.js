require('../models/database');
const { request } = require('express');
const { response } = require('express');
const paypal = require('paypal-rest-sdk');
const req = require('express/lib/request');
const Category=require('../models/Category');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { render } = require('express/lib/response');
const { ObjectId } = require('mongodb');

var user;
//if the user has logged in
var isLogged = false;

//GET 
//homePage
exports.homePage=async(request,response)=>{
    if(isLogged){
        response.render('index',{ title: '💊 eDose.com-Home'  , a:'<i class="bi bi-box-arrow-left"></i>Logout'});
    }
    else{
        response.render('index',{ title: '💊 eDose.com-Home' });
    }
}

//medicinesPage
exports.medicinesPage=async(request,response)=>{
    if(isLogged){
        response.render('medicines',{title: 'eDose.com-Medicines' , a:'<i class="bi bi-box-arrow-left"></i>Logout'});
    }
    else{
        response.render('medicines' , {title:'eDose.com-Health Care'});
    }
}

//healthCarePage
exports.healthcarePage=async(requset,response)=>{
    try{
        const LIMITNUMBER = 10;
        const healthCare = await Category.find({ 'category': 'Health-care' }).limit(LIMITNUMBER);
        if(isLogged){
            response.render('healthcare',{title: 'eDose.com-Health Care',healthCare,a:'<i class="bi bi-box-arrow-left"></i>Logout'});
        }
        else{
            response.render('healthcare',{title: 'eDose.com-Health Care',healthCare});
        }
    }catch(error){
        response.status(500).send({message: error.message || "Error Occured" });
    }
}

//othersPage
exports.otherProductsPage=async(request,response)=>{
    try{
        const LIMITNUMBER = 10;
        const otherProducts = await Category.find({ 'category': 'others' }).limit(LIMITNUMBER);
        if(isLogged){
            response.render('otherproducts',{title: '💊 eDose.com-other products' , a:'<i class="bi bi-box-arrow-left"></i>Logout' , userDetails:user ,otherProducts});
        }
        else{
            response.render('otherproducts',{title: '💊 eDose.com-other products' ,otherProducts});
        }
    }catch(error){
        response.status(500).send({message: error.message || "Error Occured" });
    }
}

//login
exports.loginPage=async(request , response)=>{
    try{
        isLogged = false;
        response.render('login',{title:"eDose.com-login" , href:"/login"});
    }catch(error){
        response.status(500).send({message: error.message || "Error Occured" });
    }
}

//validation
exports.validationPage=async(request , response)=>{
    try{
        let password = request.body.logPassword;
        // console.log(password);
        let mail = request.body.emailID;
        // console.log(mail);

        user = await User.findOne({email:mail});
        // isLogged = true;
        
        bcrypt.genSalt().then(salt => {
            bcrypt.hash(password , salt).then(hash =>{
                bcrypt.compare(password , user.password).then(
                    result => {
                        if(result){
                            isLogged = true;
                            response.render('index',{ title: '💊 eDose.com-Home' , a:'<i class="bi bi-box-arrow-left"></i>Logout', userDetails:user});
                        }
                        else{
                            response.send("wrong password");
                        }
                    }
                );
                // console.log(hash);
            });
        })

    }catch(error){
        console.log(error);
    }
}

//displayItem
exports.itemPage=async(requset , response)=>{
    try{
        let itemId = requset.params.id;
        const item = await Category.findById(itemId);
        if(isLogged){
            response.render('item' , {title: "eDose.com-"+item.name , item , a:'<i class="bi bi-box-arrow-left"></i>Logout',user});
        }
        else{
            response.render('item',{title: "eDose.com-"+item.name,item , user:'undefined'});
        }
    }catch(error){
        response.status(500).send({message: error.message || "Error Occured" });
    }
}

var totalPrice;
var productName;
var count;

//make payment
exports.paymentPage = async(request , response) => {
    try{
        paypal.configure({
            'mode': 'sandbox',
            'client_id': process.env.CLIENT_ID,
            'client_secret': process.env.CLIENT_SECRET
        });
        
        let urlString = request.url;
        let paramString = urlString.split("?")[1];
        let queryString = new URLSearchParams(paramString);
        const id = queryString.get("id");
        const quantity = queryString.get("quantity");
        if(quantity>5){
            throw 404;
        }
        const item = await Category.findById(id);

        totalPrice = item.price.split(".")[1]*quantity;
        productName = item.name;
        count = quantity;

        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:5500/success",
                "cancel_url": "http://localhost:5500/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": item.name,
                        "price": item.price.split(".")[1],
                        "currency": "USD",
                        "quantity": quantity
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": totalPrice
                },
                "description": "paypal payment"
            }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                throw error;
            } else {
                for(let i = 0;i < payment.links.length;i++){
                  if(payment.links[i].rel === 'approval_url'){
                    response.redirect(payment.links[i].href);
                  }
                }
            }
        });

    }catch(error){
        response.status(500).send({message: error.message || "Error Occured" });
    }
}

//post payment , summary page , history-update
exports.successPage = async(request , response)=>{
    const payerId = request.query.PayerID;
    const paymentId = request.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": totalPrice
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            throw error;
        }
    });

    const orderSummary = [totalPrice , productName , count];

    if(isLogged){
        await User.updateOne({_id:Object(user.id)},{$push : {history : productName+count}});

        var name = user.name;
        
        response.render('success',{title:"eDose-payment success" , orderSummary , name });
    }
    else{
        response.render('success',{title:"eDose-payment success",orderSummary , name : 'undefined'});
    }
}

exports.registerPage = async(request , response)=>{
    response.render('registration',{title:'Registration'});
}

exports.insertUserPage = async(request , response)=>{
    var hashedPassword;

    var password = request.body.password;

    async function insertUserData(){
        try{

            await User.insertMany([
                {
                    name: request.body.name,
                    password: hashedPassword,
                    cart:[],
                    history:[],
                    email: request.body.email
                }
            ]);

            response.render('login',{title:"eDose.com-login" , href:"/login"});

        }catch(error){
            console.log(error);
        }
    }


    bcrypt.genSalt().then( salt =>{
        bcrypt.hash(password,salt).then( hash =>{
            hashedPassword = hash;
            insertUserData();
        });
    })
}

exports.detailsPage = async(request , response)=>{
    if(isLogged){

        var historyLimit = 3;
        
        if(user.history.length >= historyLimit){
            await User.updateOne({_id : ObjectId(user.id)} , {$pop : {history : -1}});
        }
        
        var client = await User.findById(user.id);

        response.render('details',{title: '💊 eDose.com-Profile' , client , a:'<i class="bi bi-box-arrow-left"></i>Logout'});
    }
    else{
        response.send("login first");
    }
}

exports.cartPage = async(request , response)=>{
    if(isLogged){
        // console.log(request.url);
        let urlString = request.url;
        let paramString = urlString.split("?")[1];
        let queryString = new URLSearchParams(paramString);
        const item = await Category.findById(queryString.get("id"));
        insertCart();
        async function insertCart(){
            try{
                // console.log(user.cart.includes(item.name));
                if(user.cart.includes(item.name)){
                    await User.updateOne({_id:Object(user.id)},{$pull : {cart:item.name}});
                }
                else{
                    await User.updateOne({_id : ObjectId(user.id)},{$addToSet : {cart:item.name}});
                }
            }catch(error){
                console.log(error);
            }
        }
        var client = await User.findById(user.id);
        
        response.render('details',{title : '💊 eDose.com-Profile' , client , a:'<i class="bi bi-box-arrow-left"></i>Logout'});
    }
    else{
        response.send("login first");
    }
}

//search
exports.searchPage = async(request , response)=>{
    try{
        let itemName = request.query.searchTerm;
        var item = await Category.find({$text:{$search:itemName}});
        item = item[0];
        console.log(item.name);
        if(isLogged){
            response.render('item' , {title: "eDose.com-"+item.name , item , a:'<i class="bi bi-box-arrow-left"></i>Logout',user});
        }
        else{
            response.render('item',{title: "eDose.com-"+item.name,item , user:'undefined'});
        }
    }catch(error){
        response.status(500).send({message: error.message || "Error Occured" });
    }
}








