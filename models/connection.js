var mongoose = require("mongoose");
const objectId = require("mongodb").ObjectId
const db = mongoose.connect("mongodb://0.0.0.0:27017/ecommerce", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("Database connected!"))
  .catch(err => console.log(err));


const userschema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  Password: {
    type: String,
    required: true,
    // minlength: 5,


  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phonenumber: {
    type: Number,
    // minlength:10,
    unique: true,
  },
  blocked: {
    type: Boolean, default: false
  },
  CreatedAt: {
    type: Date,
    deafault: Date.now,
  },
coupons:{
  type:Array
}
})
const categorySchema = new mongoose.Schema({
  CategoryName: {
    type: String
  }

})

const productSchema = new mongoose.Schema({
  Productname: {
    type: String
  },
  ProductDescription: {
    type: String
  },

  Image: {
    type: Array
  },
  Price: {
    type: Number
  },
  Quantity: {
    type: Number
  },
  category: {
    type: String
  },

  brnad: {
    type: String
  },
  blocked: {
    type: Boolean, default: false
  },
})


const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  cartItems: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
    Quantity: { type: Number, default: 1 },
    Price: { type: Number },
    subTotal: { type: Number },


  }],
  totalAmount: Number,
  count: Number


})

const orderSchema = new mongoose.Schema({
  userId: {
    type: objectId,
    ref: 'user'
  },
  name: String,
  productDetails: Object,
  paymentMethod: String,
  paymentStatus: String,
  totalPrice: Number,
  ResonForReturn:String,
   
  shippingAddress: Array,
  orderStatus: String,
  status: {
    type: Boolean,
    default: true
  },
  CreatedAt: {
    type: Date,
    default: new Date()
  },
  hashedId: String

})
const whishlistSchema=new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  wishList: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
 
    Quantity: { type: Number, default: 1 }, 
    Price: { type: Number },

    


  }],
})

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  Address: [
    {
      firstName: { type: String },
      lastName: { type: String },
      street: { type: String },
      building: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: Number },
      mobile: { type: Number },
      email: { type: String }
    }
  ]

})

const couponSchema = new mongoose.Schema({
  couponName: String,
  code:String,
  expiry: {
  type: Date,
  default: new Date(),
  },
  minPurchase: Number,
  discountPercentage: Number,
  maxDiscountValue: Number,
  couponApplied: {
  type: String,
  default: false
  },
  isActive: {
  type: Boolean,
  default: false
  },
  description: String,
  createdAt: {
  type: Date,
  default: new Date(),
  }
})
const bannerSchema= new mongoose.Schema({
  subHeading:String,
  mainHeading:String,
  content:String,
  tagLine1:String,
  tagLine2:String,
  Image:String

})
const walletSchema=new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required:true,
  },
  walletBalance:{
    type:Number,
    required:true
  },
  transaction:{
    type:[Object],
    default:[],
  }
})
const offerSchema=new mongoose.Schema({
  CategoryName:{
    type:String,
    
  },
  offerPercentage:{
    type:Number
  },
  expirDate:{
    type: Date,
    default:new Date()
  },
  offerStatus:{
    type:Boolean,
    default:false
  }
})



module.exports = {
  user: mongoose.model('user', userschema),
  category: mongoose.model('Category', categorySchema),
  product: mongoose.model('product', productSchema),
  cart: mongoose.model('cart', cartSchema),
  order: mongoose.model('order', orderSchema),
  address: mongoose.model('address', addressSchema),
  wishList:mongoose.model('wishLish',whishlistSchema),
  coupon:mongoose.model('coupon',couponSchema ),
  banner:mongoose.model('banner',bannerSchema),
  wallet:mongoose.model('wallet',walletSchema),
  offer:mongoose.model('offer',offerSchema)
}
