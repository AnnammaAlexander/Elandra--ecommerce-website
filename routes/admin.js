var express = require('express');
var router = express.Router();
const controllers=require('../controllers/admincontrollers')
const couponController=require('../controllers/couponController')
const multer=require('../multer/multer')
const  middlewares=require('../middlewares/middleware')
/* GET users listing. */


router.get('/',controllers.getDashboard)

//login
router.get("/login",controllers.getAdminLogin )
router.post("/login",controllers.postAdminLogin)


//product
router.get('/add_product',controllers.addProductGetPage)
router.post('/add_product',multer.uploads,controllers.addProduct)
//view products
router.get('/product',middlewares.adminSession ,controllers.viewProducts)
router.get('/edit-product/:id',middlewares.adminSession,controllers. getEditProducts)
router.post('/edit-product/:id',middlewares.adminSession ,multer.editeduploads,controllers. postEditProducts)
router.get('/block-product/:id',middlewares.adminSession,controllers.blockProducts)
router.get('/unblocked-product/:id',middlewares.adminSession,controllers.unblockProduct)

//category
router.get('/add_category',middlewares.adminSession,controllers.getCategory)
router.get('/addCategoryView',middlewares.adminSession,controllers.getAddCategory)
router.post('/addCategoryView',middlewares.adminSession,controllers.postCategory)
router.get('/edit-category/:id',controllers.getEditCategory)
router.post('/edit-category/:id',controllers.postEditCategory)
router.get('/delete-category/:id',controllers.getDeleteCategory)
router.get('/add_sub/:id',controllers.getSubCategory)


//user
//view userlist
router.get('/view_users',controllers.getViewUsers)
//block user
router.get('/block_users/:id',controllers.blockUsers)
//unblock user
router.get('/unblock_users/:id',controllers.unblockUsers )

//order
router.get('/orders',controllers.viewOrders)

//coupon
//view coupon list
router.get('/add-coupon',couponController.getAddCoupon)
//add coupon 
router.post('/add-coupon',couponController.postCoupon)
router.get('/delete-coupon',couponController.deleteCoupon)

//banner ,view bannerlist
router.get('/banners',controllers.getBanner)
// add banner
router.post('/banners',multer.bannerAdd ,controllers.addBanner)
//delete banner
router.get('/delete-banner',controllers.deleteBanner)
//logout
router.get('/logout',controllers.logOut )

module.exports = router;
