const { response } = require('../app')
const { adminSession } = require('../middlewares/middleware')
const db = require('../models/connection')
const objectId= require("mongodb").ObjectId

module.exports = {
  //view userlist  
    userView: (page,perpage) => {
        try {
            return new Promise(async (resolve, reject) => {
                let UserDetails = []
                //find all user from user collection
                await db.user.find().skip((page-1)*perpage).limit(perpage).sort({_id:-1}).then((result) => {
                    UserDetails = result
                    resolve(UserDetails)
                })
            })
        } catch (error) {
            throw error;  
        }
        
    },
    //block user
    blockUsers: (userId) => {
        try {
            return new Promise(async (resolve, reject) => {
                //block the user in user collection
                await db.user.updateOne({ _id: userId }, { $set: { blocked: true } }).then((response) => {
                    resolve(response)
                })
            })
        } catch (error) {
            throw error; 
        }
       
    },
    //unblock user
    unblockUsers: (userId) => {
        try {
            return new Promise(async (resolve, reject) => {
                //unblock the user
                await db.user.updateOne({ _id: userId }, { $set: { blocked: false } }).then((response) => {
                    resolve(response)
                })
            })
        } catch (error) {
            throw error;
        }
        
    },
    //list blocked users &active users
    usersList:async(user)=>{
        try {
            let userList
         if(user=='BlockedUsers'){
           userList= await db.user.find({blocked:true}) 
         } else{
            userList=await db.user.find({blocked:false})
         }  
         console.log("userList",userList);
          return userList  

        } catch (error) {
            throw error;

        }
    },
//view products
    getProduct:(page,perpage) => {
        try {
            return new Promise(async (resolve, reject) => {
                let productDetails = []
                //get all product from product collection
                await db.product.find().skip((page-1)*perpage).limit(perpage).then((result) => {
                    productDetails = result
                    resolve(productDetails)
                })
            })  
        } catch (error) {
           throw error; 
        }
    },



    
//get all categories from category collection
    getProcategory: () => {
        try {
            return new Promise(async (resolve, reject) => {
                await db.category.find().exec().then((response) => {
                    resolve(response)
                })
            }) 
        } catch (error) {
           throw error; 
        }
        
    },

//
    postAddProduct: (data, filename) => {
        try {
            return new Promise((resolve, reject) => {

                uploadedImage = new db.product({
                    Productname: data.name,
                    ProductDescription: data.description,
                    Price: data.price,
                    Image: filename,
                    brnad: data.brand,
                    category: data.category,
                    Quantity: data.quantity
                })
                uploadedImage.save().then((result) => {
                    console.log(result);
                    resolve(result)
                })
    
            })
        } catch (error) {
            throw error
        }
       
    },
//set product is unavailable
    blockProducts: (productId) => {
        try {
            return new Promise(async (resolve, reject) => {
                await db.product.updateOne({ _id: productId }, { $set: { blocked: true } })
                
                resolve()
            }) 
        } catch (error) {
            throw error;
        }
       
    },
    //set product is available
    unblockProduct: (productId) => {
        try {
            return new Promise(async (resolve, reject) => {
                await db.product.updateOne({ _id: productId }, { $set: { blocked: false } })
                resolve()
            })  
        } catch (error) {
            throw error;
        }
       
    },
    //list products
    productList: (productStatus) => {
        try {
          let response;
          
          // Check the product status
          if (productStatus === 'Available') {
            // Find products with blocked set to false
            response = db.product.find({ blocked: 'false' });
          } else {
            // Find products with blocked set to true
            response = db.product.find({ blocked: 'true' });
          }
          
          // Return the response
          return response;
        } catch (error) {
          // If an error occurs, throw it to the caller
          throw error;
        }
      },
//edit product
    getEditProduct: (productId) => {
        try {
            return new Promise(async (resolve, reject) => {
                //get the details of that porduct from product collecton
                await db.product.findOne({ _id: productId }).exec().then((response) => {
                    resolve(response)
                })
    
            })   
        } catch (error) {
           throw error; 
        }
       
    },

//update edited product  to product collection
    postEditProductHelper: (productId, data, filename) => {
        try {
            return new Promise(async (resolve, reject) => {
                //update the details to the product collection
                await db.product.updateOne({ _id: productId }, {
                    $set: {
                        Productname: data.name,
                        ProductDescription: data.description,
                        Quantity: data.quantity,
                        Price: data.price,
                        category: data.category,
                        Image: filename
                    }
                }).then((response) => {
                    console.log(response);
                    resolve(response)
                })
            })  
        } catch (error) {
           throw error; 
        }
       
    },
    //get category
    getEditCategoryProduct: () => {
        try {
            return new Promise(async (resolve, reject) => {
                //find all the category from category collection
                await db.category.find().exec().then((response) => {
                    resolve(response)
                })
            })    
        } catch (error) {
            throw error;
        }
       
    },


    postCategoryHelper: (data) => {
        try {
            return new Promise(async (resolve, reject) => {
                // await db.category.insertOne({data})
    
                const Categories = new db.category({CategoryName: data}) 
                    
                
                await Categories.save().then((result) => {
                    resolve(result)
                })
            })  
        } catch (error) {
           throw error; 
        }
        
    },

isCategory :async(data)=>{
    try {
        let cat = await db.category.findOne({CategoryName:data})
        if (cat){
            return true
        }else{
            return false
        }  
    } catch (error) {
       throw error; 
    }
    
},
addCategory :(data)=>{
    try {
        let response={}
    return new Promise(async(resolve, reject) => {
        categoryExist= await db.category.find({
            CategoryName:data.categoryname
        })
        if(categoryExist){
            response={preExist:true}
            resolve(response)
        }else{
            const categoryData = new db.category({
                CategoryName:data.categoryname  
            })
            await (await categoryData.save()).then((data)=>{
                resolve(data)
            })
        }
    })
    } catch (error) {
      throw error;  
    }
    
},


//get all categories from db
    viewCategory: () => {
        try {
            return new Promise(async (resolve, reject) => {
                await db.category.find().exec().then((result) => {
                    resolve(result)
                })
            })  
        } catch (error) {
            throw error;
        }    
    },
    //
    editCategoryHelper: (productId) => {
        try {
            return new Promise(async (resolve, reject) => {
                await db.category.findOne({ _id: productId }).exec().then((response) => {
                    resolve(response)
                })
            })  
        } catch (error) {
          throw error;  
        }
        
    },
    postEditCategoryHelper: (productId, data) => {
        try {
            return new Promise(async (resolve, reject) => {
                await db.category.updateOne({ _id: productId }, { $set: { CategoryName: data.category } }).then((response) => {
                    resolve(response)
                })
            })   
        } catch (error) {
           throw error; 
        }
        
    },
    //delete category
    deletecategory: (productId) => {
        try {
            return new Promise(async (resolve, reject) => {
                await db.category.deleteOne({ _id: productId }).then((response) => {
                    resolve(response)
                })
    
            }) 
        } catch (error) {
           throw error; 
        }
       
    },
    
    blockedUserCheck:(userId)=>{
        try {
            return new Promise(async(resolve, reject) => {
                await db.user.findOne({_id:objectId(userId)}).then((response)=>{
                    console.log("response:",response);
                    resolve(response)
                })
            })   
        } catch (error) {
           throw error; 
        }
       
    },
//get details of a single order
getOrderDetails: (productId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const order = await db.order.findOne({ _id: objectId(productId) }).exec();
        resolve(order);
      } catch (error) {
        reject(error);
      }
    });
  },  
//view order page ,all orders
        getOrder:(page,perpage)=>{
            try {
                return new Promise(async(resolve, reject) => {
                    await db.order.find().skip((page-1)*perpage).limit(perpage).sort({CreatedAt:-1}).then((response)=>{
                     resolve(response)
                    })
                 })  
            } catch (error) {
               throw error; 
            }
           
        },
//view all order that is delivered
getDeliveredOrder:(page,perpage)=>{
    try {
        return new Promise(async(resolve, reject) => {
            await db.order.find({orderStatus:"Delivered"}).skip((page-1)*perpage).limit(perpage).sort({CreatedAt:-1}).then((response)=>{
             resolve(response)
            })
         })
      
    } catch (error) {
       throw error; 
    }
   
},
//list order on the basis of payament
listOrders: async (payment) => {
    try {
      const orders = await db.order.find({ paymentMethod: payment });
      return orders;
    } catch (error) {
      // Handle the error appropriately
      console.log(error);
      throw error;
    }
  },
  //list order by status
  listOrderByStatus:async(status)=>{
    try {
       const orders=await db.order.find({orderStatus:status})
       return orders;
    } catch (error) {
        throw error; 
    }
  },
  
        //get dashbord data
        DashbordhHelper:async(req,res)=>{
        let response={}
        let orderCount= await db.order.countDocuments({})
        let productCount=await db.product.countDocuments({})
        let categoryCount=await db.category.countDocuments({})
        let revenue = await db.order.aggregate([
            {
              $match: {
                orderStatus: "confirmed",
              },
            },
            {
              $group: {
                _id: null,
                totalRevenue: {
                  $sum: "$totalPrice",
                },
              },
            },
          ]);
          
          let monthlyEarnings = await db.order.aggregate([
            {
              $match: {
                orderStatus: "Delivered",
              },
            },
            {
              $group: {
                _id: { $month: "$CreatedAt" },
                totalRevenue: { $sum: "$totalPrice" },
              },
            },
            {
              $sort: {
                _id: 1,
              },
            },
          ]);
    
    let monthlySales = await db.order.aggregate([
        {
          $group: {
            _id: { $month: "$CreatedAt" },
            orders: { $push: "$$ROOT" },
          },
        },
      ]);

      // converting data for graph from aggregate function
      let dataForGraph_Sales = [];
      for (let i = 1; i <= 12; i++) {
        const month = getMonthName(i);
        const orders =
          monthlySales.find((sale) => sale._id === i)?.orders || [];
        const value = orders.length;
        dataForGraph_Sales.push({ month, value });
      }

      function getMonthName(monthNumber) {
        const date = new Date();
        date.setMonth(monthNumber - 1);
        return date.toLocaleString("default", { month: "long" });
      }
        response.orderCount=orderCount
        response.productCount=productCount
        response.categoryCount=categoryCount
        response.monthlyEarnings=monthlyEarnings.pop()
        response.revenue=revenue
        response.graphData= dataForGraph_Sales

        return response
        },
        //get sales report
        salesReport: (fromdate, toDate) => {
            return new Promise(async (resolve, reject) => {
              await db.order
                .find({
                  orderStatus: "confirmed",
                  $expr: {
                    $and: [
                      { $gte: ["$CreatedAt", fromdate] },
                      { $lte: ["$CreatedAt", toDate] }
                    ]
                  }
                })
                .then((result) => {
                    
                  resolve(result);
                })
                .catch((error) => {
                  reject(error);
                });
            });
          }
          
}
