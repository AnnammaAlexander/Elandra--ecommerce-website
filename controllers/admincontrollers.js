const { response } = require('../app')
const adminHelper = require('../helpers/adminHelpers')
const adminOfferHelper = require('../helpers/adminOfferHelper')
const bannerHelper=require('../helpers/bannerHelper')
const user = require('../models/connection')
const db=require('../models/connection')
const objectId= require("mongodb").ObjectId
const moment=require("moment")
const adminCredential = {
    name: 'admin',
    email: 'admin@gmail.com',
    password: 'admin123'
}

let adminStatus
module.exports = {
    
//get view Dashbord
    getDashboard: async(req, res) => {
        try {
            let variable = req.session.admin
       await adminHelper.DashbordhHelper().then((response)=>{
        
        if (adminStatus) {
            res.render("admin/adminDashboard", { layout: "adminLayout", variable, adminStatus, loggedIn: true,response});
        } else {
            res.redirect('/admin/login')
        }

       }) 
        } catch (error) {
           throw error; 
        }
       
       
    },
    //view sales report
    viewSalesReport:async(req,res)=>{
        try {
           //pagination 
        const page=req.query.page||1;
        const perpage=10;
        const count=await db.order.countDocuments({})
        const orderListCount=count
    //view all delivered order
        let order= await adminHelper.getDeliveredOrder(page,perpage)
         res.render("admin/salesReport", { layout: "adminLayout", adminStatus,order, loggedIn: true,pages:Math.ceil(orderListCount/perpage) }) 
        } catch (error) {
            throw error;
        }
    },
    //sales report
    salesReport:async(req,res)=>{
       try {
        fromdate=req.body.fromDate
        // toDate=req.body.toDate
        toDate = moment.utc(req.body.toDate).endOf('day').format()
        toDate = moment(toDate).format('YYYY-MM-DD')
        console.log(fromdate,toDate);
        
        await adminHelper.salesReport(fromdate,toDate).then((result)=>{
            res.json(result)
        })
       } catch (error) {
        throw error;
       } 
        

    },
    //view admin login page
    getAdminLogin: (req, res) => {
        try {
            if (req.session.adminLoggedIn) {
                // res.render("admin/adminDashboard", { layout: "adminLayout", adminStatus})
                res.redirect('/admin')
            } else {
    
                res.render("admin/adminLog", { layout: "adminLayout", adminStatus})
            } 
        } catch (error) {
           throw error; 
        }
        
    },
   // post admin login
    postAdminLogin: (req, res) => {
        try {
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
        } catch (error) {
            throw error;
        }
        
    },
    addProductGetPage: (req, res) => {
        try {
            adminHelper.getProcategory().then((response) => {
                var procategory = response
                
                res.render('admin/addProduct', { layout: "adminLayout", adminStatus, loggedIn: true, procategory })
            }) 
        } catch (error) {
           throw error; 
        }
        

    }
    ,

    addProduct: (req, res) => {
        try {
            const filename = req.files.map(elem => elem.filename)

            adminHelper.postAddProduct(req.body, filename).then((response) => {
                res.redirect('/admin/product')
            })  
        } catch (error) {
           throw error; 
        }
    },
    viewProducts:async(req, res) => {
        try {
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
        } catch (error) {
          throw error;  
        }
        

    },
    //  view the product details want to be edited
    getEditProducts:async (req, res) => {
        try {
            // Get all categories
            const procategory = await adminHelper.getEditCategoryProduct();
        
            // Get details of the product to be edited
            const editproduct = await adminHelper.getEditProduct(req.params.id);
        
            res.render('admin/editProducts', {
              layout: "adminLayout",
              adminStatus,
              loggedIn: true,
              editproduct,
              procategory
            });
          } catch (error) {
            console.error(error);
            res.redirect('/admin'); // Handle the error as per your requirement
          }
    },
    //post edited product detail
    postEditProducts: async (req, res) => {
        try {
            const id = req.params.id;
            let imageArray = [];
        
            if (req.files && req.files.image1) {
              imageArray.push(req.files.image1[0].filename);
            } else {
              imageArray.push(req.body.image1);
            }
        
            if (req.files && req.files.image2) {
              imageArray.push(req.files.image2[0].filename);
            } else {
              imageArray.push(req.body.image2);
            }
        
            if (req.files && req.files.image3) {
              imageArray.push(req.files.image3[0].filename);
            } else {
              imageArray.push(req.body.image3);
            }
        
            if (req.files && req.files.image4) {
              imageArray.push(req.files.image4[0].filename);
            } else {
              imageArray.push(req.body.image4);
            }
        
            // Update edited product
            await adminHelper.postEditProductHelper(id, req.body, imageArray);
        
            res.redirect('/admin/product');
          } catch (error) {
            console.error(error);
            res.redirect('/admin'); // Handle the error as per your requirement
          }
    
},

    blockProducts: async(req, res) => {
        try {
            await adminHelper.blockProducts(req.params.id);
            res.redirect('/admin/product');
          } catch (error) {
            console.error(error);
            res.redirect('/admin'); // Handle the error as per your requirement
          }
    },
    unblockProduct: async(req, res) => {
        try {
            await adminHelper.unblockProduct(req.params.id).then((response) => {
                res.redirect('/admin/product')
            }) 
        } catch (error) {
            console.error(error);
            res.redirect('/admin'); // Handle the error as per your requirement 
        }
       
    },
    //list available products
    listProducts: async (req, res) => {
  try {
    // Get the product status from the query parameters
    const productStatus = req.query.status;

    // Call the adminHelper's productList method asynchronously
    let response = await adminHelper.productList(productStatus);

    // Send the response as JSON
    res.json(response);
  } catch (error) {
    // If an error occurs, throw it to the caller
    throw error;
  }
},


    getCategory: (req, res) => {
        try {
            adminHelper.viewCategory().then((response) => {
                res.render('admin/CategoryList', { layout: "adminLayout", adminStatus, loggedIn: true, response,preExist:false })
            })  
        } catch (error) {
            throw error;
        }
        
    },
    
    getAddCategory:(req,res)=>{
        try {
            res.render('admin/AddCategory',{layout: "adminLayout", adminStatus, loggedIn: true,preExist:false })  
        } catch (error) {
           throw error; 
        }
        
    },

     postCategory:async (req, res) => {
         try {
            let categoryExist=  await adminHelper.isCategory(req.body.categoryname);
        if( categoryExist){
            await adminHelper.viewCategory().then((response)=>{
                adminIn=req.session.adminLoggedIn
                 res.render('admin/AddCategory',{ layout: "adminLayout", adminStatus, loggedIn: true, response, preExist:true})
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

//edit categry get
    getEditCategory:async (req, res) => {
        try {
            const response = await adminHelper.editCategoryHelper(req.params.id)
            let data = response
            res.render('admin/editCategory', {
                layout: "adminLayout",
                adminStatus: true,
                loggedIn: true,
                data: data
            })
        } catch (error) {
            console.error(error)
            res.status(500).send("Internal Server Error")
        }
    },
//edit category post
    postEditCategory :async(req, res) => {
        try {
            const response = await adminHelper.postEditCategoryHelper(req.params.id, req.body);
            res.redirect('/admin/add_category');
          } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
          }
    },
//delete category 
    getDeleteCategory: (req, res) => {
        try {
            adminHelper.deletecategory(req.params.id).then((response) => {
                res.redirect('/admin/add_category')
            })  
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error"); 
        }
       
    },

    getSubCategory: (req, res) => {
        res.render('admin/addSubCategory', { layout: "adminLayout", adminStatus, loggedIn: true })
    },
    // postSubCategory: (req, res) => {
    //     adminHelper.postSubCategoryHelper(req.body).then()
    // },

//get view users
    getViewUsers: async(req, res) => {
        try {
           //pagination 
    const page=req.query.page||1;
    const perpage=10;
    const count=await db.user.countDocuments({})
    const orderListCount=count
        adminHelper.userView(page,perpage).then((user) => {
            console.log(user);

            res.render('admin/viewUsers', { layout: "adminLayout", adminStatus, user, loggedIn: true,pages:Math.ceil(orderListCount/perpage) })
        })  
        } catch (error) {
            res.status(500).send("Internal Server Error");   
        }
    
    },
    //block user
    blockUsers: (req, res) => {
        try {
             adminHelper.blockUsers(req.params.id).then((response) => {
                res.redirect("/admin/view_users")
            })  
        } catch (error) {
            res.status(500).send("Internal Server Error");   
 
        }
       
    },
    //unblock user
    unblockUsers: (req, res) => {
        try {
            adminHelper.unblockUsers(req.params.id).then((response) => {
                // res.redirect("/admin/view_users")
                res.json(true)
            })  
        } catch (error) {
            res.status(500).send("Internal Server Error");   
  
        }
       
    },
    //list blocked &active users
    listUsers:async(req,res)=>{
        try {
            let user=req.query.users
            let response=await adminHelper.usersList(user)
            res.json(response)
        } catch (error) {
            throw error;  
        }
    },
    //list ,view orders
    viewOrders:async(req,res)=>{
   //pagination 
    const page=req.query.page||1;
    const perpage=10;
    const count=await db.order.countDocuments({})
    const orderListCount=count
        let order= await adminHelper.getOrder(page,perpage)
        console.log("orders",order);
        res.render('admin/orderList', { layout: "adminLayout", adminStatus,loggedIn: true,order ,pages:Math.ceil(orderListCount/perpage)})
    },
    //get order details of each order
    getOrderDetails: async (req, res) => {
        try {
          // Extract the product ID from the request parameters
          const productId = req.params.id;
       // Retrieve order details asynchronously using adminHelper.getOrderDetails
          const orderDetails = await adminHelper.getOrderDetails(productId);
        // Render the 'admin/orderDetail' view and pass necessary data
          res.render('admin/orderDetail', {
            layout: "adminLayout",
            adminStatus,
            loggedIn: true,
            orderDetails
          });
        } catch (error) {
          // Handle any errors that occur during the execution of the function
          console.error("An error occurred while retrieving order details:", error);
      
          // Render an error page or return an appropriate error response
          res.status(500).render('admin/error', {
            layout: "adminLayout",
            adminStatus,
            loggedIn: true,
            errorMessage: "Failed to retrieve order details. Please try again later."
          });
        }
      }
      ,
    //get changed status from admin
    getOrderStatusChange:async(req,res)=>{
        try {
            let status=req.body.orderStatus
            let orderid=req.body.orderId
            await db.order.updateOne({_id:objectId(orderid)},{orderStatus:status}) 
            res.json(true)
        } catch (error) {
            throw error;  
        }
       
    },
    //get,view  Banner Page 
    getBanner:async(req,res)=>{
    //pagination 
    try {
        const page=req.query.page||1;
    const perpage=10;
    const count=await db.banner.countDocuments({})
    const orderListCount=count
    let bannerDetails= await bannerHelper.getBanner(page,perpage)
    console.log("banner:",bannerDetails);
    res.render('admin/banner',{layout: "adminLayout", adminStatus,loggedIn: true,bannerDetails,pages:Math.ceil(orderListCount/perpage)})
    } catch (error) {
        throw error;   
    }
    
     },
//Add Banner
addBanner:async(req,res)=>{
    try {
        await bannerHelper.addBanner(req.body,req.file.filename)
    } catch (error) {
        throw error;  
    }
  

  res.redirect("/admin/banners")
},
//delete banner
deleteBanner:async(req,res)=>{
    try {
        let id=req.query.id
        await bannerHelper.bannerDelete(id)
        res.json(true)
    } catch (error) {
        throw error;  
    }
   


},
//list order in the basis of payment methord
ordersByPayment:async(req,res)=>{
    try {
        let response= await adminHelper.listOrders(req.query.paymentData)
        console.log("response",response);
        res.json(response)

    } catch (error) {
        // Handle the error appropriately
        console.log(error);
        throw error; 
    }
   

},
//list order by status
orderStatus:async(req,res)=>{
    try {
        const status=req.query.status
        let response=await adminHelper.listOrderByStatus(status)
        res.json(response)
    } catch (error) {
        throw error; 
    }
},

 
// view offer details
getOffers:async(req,res)=>{
    try {
        let categories=await db.category.find()
        let offer= await db.offer.find()
        res.render('admin/AddOffers',{layout: "adminLayout", adminStatus,loggedIn: true,categories,offer})
        
    } catch (error) {
        
    }
},
//add offer
addOffer: async (req, res) => {
  try {
    const result = await adminOfferHelper.addOffer(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
},
//remove offer
removeOffer:async(req,res)=>{
    try {
        category=req.query.category  
      await adminOfferHelper.removeOffers(category)
      res.json()
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });   
    }

},
//list offers
listOffers: async (req, res) => {
    try {
      const status = req.query.status;
      let response = await adminOfferHelper.offerList(status);
      res.json(response);
    } catch (error) {
      throw error;
    }
  },  

//logOut
    logOut: (req, res) => {
        loggedIn = false;
        req.session.adminLoggedIn = false;
        adminStatus = false

        res.redirect("/admin/login",)
    }

}