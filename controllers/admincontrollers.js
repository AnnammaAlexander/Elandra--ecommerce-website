const { response } = require('../app')
const adminHelper = require('../helpers/adminHelpers')
const bannerHelper=require('../helpers/bannerHelper')
const user = require('../models/connection')
const db=require('../models/connection')
const adminCredential = {
    name: 'admin',
    email: 'admin@gmail.com',
    password: 'admin123'
}

let adminStatus
module.exports = {
    

    getDashboard: async(req, res) => {
        let variable = req.session.admin
       await adminHelper.DashbordhHelper().then((response)=>{
        console.log("tttttttttttttttttttttt:",response);
        if (adminStatus) {
            res.render("admin/adminDashboard", { layout: "adminLayout", variable, adminStatus, loggedIn: true,response});
        } else {
            res.redirect('/admin/login')
        }

       })
       
    },
    getAdminLogin: (req, res) => {
        if (req.session.adminLoggedIn) {
            res.render("admin/adminDashboard", { layout: "adminLayout", adminStatus})
        } else {

            res.render("admin/adminLog", { layout: "adminLayout", adminStatus})
        }
    },
    postAdminLogin: (req, res) => {
        if (req.body.email == adminCredential.email && req.body.password == adminCredential.password) {
            req.session.admin = adminCredential;
            req.session.adminLoggedIn = true;
            loggedIn = true;
            adminStatus = req.session.adminLoggedIn
            res.redirect('/admin')
        } else {
            adminloginErr = true

            res.redirect('/admin/login')
        }
    },
    addProductGetPage: (req, res) => {
        adminHelper.getProcategory().then((response) => {
            var procategory = response
            
            res.render('admin/addProduct', { layout: "adminLayout", adminStatus, loggedIn: true, procategory })
        })

    }
    ,

    addProduct: (req, res) => {
        const filename = req.files.map(elem => elem.filename)

        adminHelper.postAddProduct(req.body, filename).then((response) => {
            res.redirect('/admin/product')
        })



    },
    viewProducts:async(req, res) => {
        //pagination 
    const page=req.query.page||1;
    const perpage=10;
    const count=await db.product.countDocuments({})
    const orderListCount=count
        adminHelper.getProduct(page,perpage).then((response) => {
            console.log(response);
            res.render('admin/viewProducts', { layout: "adminLayout", adminStatus, loggedIn: true,response,
            pages:Math.ceil(orderListCount/perpage)});
        })

    },
    getEditProducts: (req, res) => {
        adminHelper.getEditCategoryProduct().then((response) => {
            var procategory = response
            adminHelper.getEditProduct(req.params.id).then((response) => {
                editproduct = response
                res.render('admin/editProducts', { layout: "adminLayout", adminStatus, loggedIn: true, editproduct, procategory })
            })


        })

    },
    postEditProducts: async (req, res) => {
        let id = req.params.id
        let imageArray = []
        console.log("annnnnnnna",req.body.image3[0]);
        if (req.files.image1) {

            imageArray.push(req.files.image1[0].filename)
            // imageArray.push(req.files.image2[0].filename)
            // imageArray.push(req.files.image3[0].filename)
            // imageArray.push(req.files.image4[0].filename)

        } else {
            imageArray.push(req.body.image1)
        }
        if (req.files.image2) {

            imageArray.push(req.files.image2[0].filename)
        } else {
            imageArray.push(req.body.image2)
        }


         if (req.files.image3) {

                imageArray.push(req.files.image3[0].filename)
        } else {
                imageArray.push(req.body.image3)
        }


             if (req.files.image4) {

                    imageArray.push(req.files.image4[0].filename)
             } else {
                    imageArray.push(req.body.image4)
             }

        // console.log("aaaaaaaa",req.body);
        await adminHelper.postEditProductHelper(id, req.body, imageArray).then((response) => {
            res.redirect('/admin/product')
        })
    
},
    blockProducts: (req, res) => {
        adminHelper.blockProducts(req.params.id).then((response) => {
            res.redirect('/admin/product')
        })
    },
    unblockProduct: (req, res) => {
        adminHelper.unblockProduct(req.params.id).then((response) => {
            res.redirect('/admin/product')
        })
    },


    getCategory: (req, res) => {
        adminHelper.viewCategory().then((response) => {
            res.render('admin/CategoryList', { layout: "adminLayout", adminStatus, loggedIn: true, response,preExist:false })
        })
    },
    // postCategory:(req,res)=>{
    //     adminHelper.addCategory(req.body).then((responsse)=>{
    //         res.redirect('/admin/add_category')
    //     })

    // },
    getAddCategory:(req,res)=>{
        res.render('admin/AddCategory',{layout: "adminLayout", adminStatus, loggedIn: true,preExist:false })
    },


    postCategory:async (req, res) => {


        try {
            let categoryExist=  await adminHelper.isCategory(req.body.categoryname);


       
       console.log("aaaaaaaaaaaaaa",req.body.categoryname);
        if( categoryExist){
            console.log("bbbbbbbbbbbbbb");
            await adminHelper.viewCategory().then((response)=>{
                adminIn=req.session.adminLoggedIn
                res.render('admin/CategoryView',{ layout: "adminLayout", adminStatus, loggedIn: true, response, preExist:true})
                
            })
        }else{
            preExist=false
            adminHelper.postCategoryHelper(req.body.categoryname)
            .then((result)=>{
                res.redirect('/admin/add_category')  
            })
            
        }
     } catch (error) {
            console.log(`The operation failed with error:${error.message}`);

            
        }
       
            
        




    },

    // let categoryExist=    adminHelper.postCategoryHelper(req.body).then((response) => {
    //         res.redirect('/admin/add_category')
    //     })

    // },

//edit categry get
    getEditCategory: (req, res) => {
        adminHelper.editCategoryHelper(req.params.id).then((response) => {
            let data = response
            res.render('admin/editCategory', { layout: "adminLayout", adminStatus, loggedIn: true, data })
        })
    },
//edit category post
    postEditCategory :(req, res) => {
        adminHelper.postEditCategoryHelper(req.params.id, req.body).then((response) => {
            res.redirect('/admin/add_category')
        })
    },
//delete category 
    getDeleteCategory: (req, res) => {
        adminHelper.deletecategory(req.params.id).then((response) => {
            res.redirect('/admin/add_category')
        })
    },

    getSubCategory: (req, res) => {
        res.render('admin/addSubCategory', { layout: "adminLayout", adminStatus, loggedIn: true })
    },
    postSubCategory: (req, res) => {
        adminHelper.postSubCategoryHelper(req.body).then()
    },

//get view users
    getViewUsers: async(req, res) => {
     //pagination 
    const page=req.query.page||1;
    const perpage=10;
    const count=await db.user.countDocuments({})
    const orderListCount=count
        adminHelper.userView(page,perpage).then((user) => {
            console.log(user);

            res.render('admin/viewUsers', { layout: "adminLayout", adminStatus, user, loggedIn: true,pages:Math.ceil(orderListCount/perpage) })
        })
    },
    //block user
    blockUsers: (req, res) => {
        adminHelper.blockUsers(req.params.id).then((response) => {
            res.redirect("/admin/view_users")
        })
    },
    //unblock user
    unblockUsers: (req, res) => {
        adminHelper.unblockUsers(req.params.id).then((response) => {
            res.redirect("/admin/view_users")
        })
    },
    //list ,view orders
    viewOrders:async(req,res)=>{
   //pagination 
    const page=req.query.page||1;
    const perpage=10;
    const count=await db.order.countDocuments({})
    const orderListCount=count
        let order= await adminHelper.getOrder(page,perpage)
        res.render('admin/orderList', { layout: "adminLayout", adminStatus,loggedIn: true,order ,pages:Math.ceil(orderListCount/perpage)})
    },
    //get,view  Banner Page 
    getBanner:async(req,res)=>{
    //pagination 
    const page=req.query.page||1;
    const perpage=10;
    const count=await db.banner.countDocuments({})
    const orderListCount=count
    let bannerDetails= await bannerHelper.getBanner(page,perpage)
    console.log("banner:",bannerDetails);
    res.render('admin/banner',{layout: "adminLayout", adminStatus,loggedIn: true,bannerDetails,pages:Math.ceil(orderListCount/perpage)})
     },
//Add Banner
addBanner:async(req,res)=>{
    console.log("req.body.................",req.body);
   await bannerHelper.addBanner(req.body,req.file.filename)

  res.redirect("/admin/banners")
},
//delete banner
deleteBanner:async(req,res)=>{
    let id=req.query.id
    await bannerHelper.bannerDelete(id)
    res.json(true)


},



//logOut
    logOut: (req, res) => {
        loggedIn = false;
        req.session.adminLoggedIn = false;
        adminStatus = false

        res.redirect("/admin/login",)
    }

}