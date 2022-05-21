const express = require("express");
const router=express.Router();
const eDoseController=require('../controllers/eDoseController');

//routes
router.get('/',eDoseController.homePage);

router.get('/medicines',eDoseController.medicinesPage);
router.get('/medicines/:id',eDoseController.itemPage);

router.get('/healthcare',eDoseController.healthcarePage);
router.get('/healthcare/:id',eDoseController.itemPage);

router.get('/otherproducts',eDoseController.otherProductsPage);
router.get('/otherProducts/:id',eDoseController.itemPage);

router.get('/payment',eDoseController.paymentPage);
router.get('/success',eDoseController.successPage);
router.get('/cancel',(req,res)=>{res.send("sorry");});

router.get('/login',eDoseController.loginPage);
router.post('/index',eDoseController.validationPage);

router.get('/register',eDoseController.registerPage);
router.post('/login',eDoseController.insertUserPage);

router.get('/details',eDoseController.detailsPage);

router.get('/add%20to%20cart' , eDoseController.cartPage);

//search
router.get('/search' , eDoseController.searchPage);
module.exports=router;