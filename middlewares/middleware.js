const { response } = require('../app');
let helper=require('../helpers/adminHelpers')
module.exports = {
    userSession: (req, res, next) => {
      if (req.session.userLoggedIn) {
        next();
      } else {
        res.render("user/login");
      }
    },
    adminSession: (req, res, next) => {
      
  
      if (req.session.adminLoggedIn) {
       
        next();
      } else {
        
        
        res.render("admin/login");
      }
    },
    blockedStatus:async(req,res,next)=>{
       let userId=req.session.users._id
      let blockeduser= await helper.blockedUserCheck(userId)
      if(blockeduser.blocked===false){
      next()
      }else{
        res.redirect('/logout')
      }

    }
 
  }