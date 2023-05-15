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
      // console.log(req.session.admin);
  
      if (req.session.adminLoggedIn) {
        // console.log(req.session.adminLoggedIn+"adminhi");
        next();
      } else {
        // console.log(req.session.userLoggedIn);
        // console.log(req.session.adminLoggedIn);
        
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
  //     if (req.session.userLoggedIn) { 
  //       let userId=req.session.users._id
  //       console.log(".....",userId);
  //       let blockeduser= await helper.blockedUserCheck(userId)
  //       console.log("///////",blockeduser.blocked);
  //       if(blockeduser.blocked===true){
  //         response.redirect('/login')
  //       }else{
  //     next();
  //     }
      

  //   }
  //   res.render("admin/login");
  // }
    // userSignupSession: (req, res, next) => {
    //   if (req.session.userLoggedIn) {
    //     next();
    //   } else {
    //     res.render("user/signup");
    //   }
    // },
  }