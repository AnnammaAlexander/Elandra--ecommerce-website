var express = require('express');
var router = express.Router();
const controllers=require('../controllers/admincontrollers')
const couponController=require('../controllers/couponController')
const offerHelpeer=require('../helpers/adminOfferHelper')
const multer=require('../multer/multer')
const  middlewares=require('../middlewares/middleware');
const middleware = require('../middlewares/middleware');
/* GET users listing. */

//view dashbord
router.get('/',controllers.getDashboard)
//view sales report page
router.get("/report",controllers.viewSalesReport)
//sales report
router.post('/sales-report',middlewares.adminSession,controllers.salesReport)


//login
router.get("/login",controllers.getAdminLogin )
router.post("/login",controllers.postAdminLogin)


//product
router.get('/add_product',middleware.adminSession, controllers.addProductGetPage)
router.post('/add_product',multer.uploads,middleware.adminSession, controllers.addProduct)
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
router.get('/edit-category/:id', middleware.adminSession,controllers.getEditCategory)
router.post('/edit-category/:id',controllers.postEditCategory)
router.get('/delete-category/:id',controllers.getDeleteCategory)
router.get('/add_sub/:id',controllers.getSubCategory)


//user
//view userlist
router.get('/view_users',middleware.adminSession, controllers.getViewUsers)
//block user
router.get('/block_users/:id',middleware.adminSession ,controllers.blockUsers)
//unblock user
router.get('/unblock_users/:id', middleware.adminSession,controllers.unblockUsers )

//order
router.get('/orders',middleware.adminSession,controllers.viewOrders)
//view order details of each order
router.get('/order-detail/:id',controllers.getOrderDetails)
//change order status
router.put('/change-orderStatus',controllers.getOrderStatusChange)

//coupon
//view coupon list
router.get('/add-coupon',middleware.adminSession,couponController.getAddCoupon)
//add coupon 
router.post('/add-coupon',middleware.adminSession,couponController.postCoupon)
router.get('/delete-coupon',middleware.adminSession,couponController.deleteCoupon)
//view offerpage
router.get("/offers",controllers.getOffers)
//add offer
router.post("/AddOffers",controllers.addOffer)
//disable offer
router.get('/removeOffer',controllers.removeOffer)

//banner ,view bannerlist
router.get('/banners',controllers.getBanner)
// add banner
router.post('/banners',multer.bannerAdd ,controllers.addBanner)
//delete banner
router.get('/delete-banner',controllers.deleteBanner)

//filter the order
router.get('/orders-Payment',controllers.ordersByPayment)

//logout
router.get('/logout',controllers.logOut )

module.exports = router;
