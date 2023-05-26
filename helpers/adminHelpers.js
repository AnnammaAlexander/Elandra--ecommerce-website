const { response } = require('../app')
const { adminSession } = require('../middlewares/middleware')
const db = require('../models/connection')
const objectId= require("mongodb").ObjectId

module.exports = {
  //view userlist  
    userView: (page,perpage) => {
         return new Promise(async (resolve, reject) => {
            let UserDetails = []
            //find all user from user collection
            await db.user.find().skip((page-1)*perpage).limit(perpage).sort({_id:-1}).then((result) => {
                UserDetails = result
                resolve(UserDetails)
            })
        })
    },
    //block user
    blockUsers: (userId) => {
        return new Promise(async (resolve, reject) => {
            //block the user in user collection
            await db.user.updateOne({ _id: userId }, { $set: { blocked: true } }).then((response) => {
                resolve(response)
            })
        })
    },
    //unblock user
    unblockUsers: (userId) => {
        return new Promise(async (resolve, reject) => {
            //unblock the user
            await db.user.updateOne({ _id: userId }, { $set: { blocked: false } }).then((response) => {
                resolve(response)
            })
        })
    },
//view products
    getProduct:(page,perpage) => {
        return new Promise(async (resolve, reject) => {
            let productDetails = []
            //get all product from product collection
            await db.product.find().skip((page-1)*perpage).limit(perpage).then((result) => {
                productDetails = result
                resolve(productDetails)
            })
        })

    },



    
//get all categories from category collection
    getProcategory: () => {
        return new Promise(async (resolve, reject) => {
            await db.category.find().exec().then((response) => {
                resolve(response)
            })
        })
    },

//
    postAddProduct: (data, filename) => {
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
    },
//set product is unavailable
    blockProducts: (productId) => {
        return new Promise(async (resolve, reject) => {
            await db.product.updateOne({ _id: productId }, { $set: { blocked: true } })
            
            resolve()
        })
    },
    //set product is available
    unblockProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            await db.product.updateOne({ _id: productId }, { $set: { blocked: false } })
            resolve()
        })
    },
//edit product
    getEditProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            //get the details of that porduct from product collecton
            await db.product.findOne({ _id: productId }).exec().then((response) => {
                resolve(response)
            })

        })
    },

//update edited product  to product collection
    postEditProductHelper: (productId, data, filename) => {
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
    },
    //get category
    getEditCategoryProduct: () => {
        return new Promise(async (resolve, reject) => {
            //find all the category from category collection
            await db.category.find().exec().then((response) => {
                resolve(response)
            })
        })
    },


    postCategoryHelper: (data) => {
        return new Promise(async (resolve, reject) => {
            // await db.category.insertOne({data})

            const Categories = new db.category({CategoryName: data}) 
                
            
            await Categories.save().then((result) => {
                resolve(result)
            })
        })
    },


//     isCategory:(category)=>{
//         let cat={}
//         return new Promise(async(resolve, reject) => {
//              await db.category.findOne({CategoryName:category})
//             .then((categoryExist)=>{
//                 resolve(categoryExist)
//             })
//             .catch(error  =>{
//                 console.log(`The operation faild with the error: ${error.message}`);
//             })
        
//     })
// },
// getAllCategory :()=>{
// return new Promise(async(resolve, reject) => {
//     let categories =await db.category.find().toArray()
//     resolve(categories)
    
// })
// }  , 
isCategory :async(data)=>{

    let cat = await db.category.findOne({CategoryName:data})
    if (cat){
        return true
    }else{
        return false
    }
},
addCategory :(data)=>{
    let response={}
    console.log("aaaaaaaaaaaaaaaaaa",data.categoryname);
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
},





//     let response={}
//     return new Promise(async(resolve, reject) => {
//        let existingategory= await db.category.findOne({
//             CategoryName:data
//         });
//         if(existingategory){
//             response={ categoryStatus:true}
//             resolve(response)
//         }else{
//           const newcategory= new db.category({
//             CategoryName:data

//           })  
//           await newcategory.save()
//           resolve()
//         }

        
//     })

// },

//get all categories from db
    viewCategory: () => {
        return new Promise(async (resolve, reject) => {
            await db.category.find().exec().then((result) => {
                resolve(result)
            })


        })
    },
    //
    editCategoryHelper: (productId) => {
        return new Promise(async (resolve, reject) => {
            await db.category.findOne({ _id: productId }).exec().then((response) => {
                resolve(response)
            })
        })
    },
    postEditCategoryHelper: (productId, data) => {
        return new Promise(async (resolve, reject) => {
            await db.category.updateOne({ _id: productId }, { $set: { CategoryName: data.category } }).then((response) => {
                resolve(response)
            })
        })
    },
    //delete category
    deletecategory: (productId) => {
        return new Promise(async (resolve, reject) => {
            await db.category.deleteOne({ _id: productId }).then((response) => {
                resolve(response)
            })

        })
    },
    
    blockedUserCheck:(userId)=>{
        
        return new Promise(async(resolve, reject) => {
           await db.user.findOne({_id:objectId(userId)}).then((response)=>{
           console.log("response:",response);
            resolve(response)
           })
        })
        },
//get details of a single order
getOrderDetails:(productId)=>{
    return new Promise(async (resolve, reject) => {
        try {
            const order = await db.order.findOne({_id: objectId(productId) }).exec()
            resolve(order)
        } catch (error) {
            reject(error)
        }
    })
},
//view order page ,all orders
        getOrder:(page,perpage)=>{
            return new Promise(async(resolve, reject) => {
               await db.order.find().skip((page-1)*perpage).limit(perpage).sort({CreatedAt:-1}).then((response)=>{
                resolve(response)
               })
            })
        },
//view all order that is delivered
getDeliveredOrder:(page,perpage)=>{
    return new Promise(async(resolve, reject) => {
        await db.order.find({orderStatus:"Delivered"}).skip((page-1)*perpage).limit(perpage).sort({CreatedAt:-1}).then((response)=>{
         resolve(response)
        })
     })

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
          console.log("revenue................",revenue);
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
    console.log("monthlyEarnings..................................",monthlyEarnings);
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
