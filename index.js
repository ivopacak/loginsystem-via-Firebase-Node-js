const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const pw = "MiciMici2512"
const logger = require('morgan');
const methodOverride = require('method-override')
const cors = require('cors');
const serviceAccount = require('./rushdevs-firebase-adminsdk-15kx1-0694dd2d8c.json')
const app = express()
const fs = require('fs')
const path = require('path')
var uid = ""
const nodemailer = require('nodemailer')
var chatMessages = []
var displayName;
var iGlobal = 0
var iGlobal_ = 0
//So erstellt man einen ordner (dirname ist für der aktuelle ordner , also express-demo)
/*
fs.mkdir(path.join(__dirname, '/test'), {}, (err) => {
    if(err){
        console.log(err)
    }
})*/



//app.use



app.use(function (req, res, next) {

    res.header('Access-Control-Allow-Origin', "http://localhost:5000");
    res.header('Access-Control-Allow-Headers', true);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
  });


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser('awdwda'))
app.use(logger('dev'));
app.use(bodyParser())
app.use(methodOverride());
app.use(cors());
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/public');


//firebase-admin
const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://rushdevs-default-rtdb.firebaseio.com'
});


//firebase
const firebase = require("firebase");
const { firestore } = require('firebase-admin');
const config = {
    apiKey: "AIzaSyAGgXloNepBTQ4facddcf6MVgdv_rkG6WU",
    authDomain: "rushdevs.firebaseapp.com",
    databaseURL: "https://rushdevs-default-rtdb.firebaseio.com",
    projectId: "rushdevs",
    storageBucket: "rushdevs.appspot.com",
    messagingSenderId: "1084202491113",
    appId: "1:1084202491113:web:41e0fb6b841d2188596478",
    measurementId: "G-NEHWTGQ495"
};
firebase.initializeApp(config);
//

//Listen
var port = process.env.PORT || 5000

app.listen(port, () => console.log(`Server läuft auf port ${port}!`));

//Some firebase realtime stuff
const doc = admin.firestore().collection('ticketChat')
doc.onSnapshot((snap) => {
    chatMessages = []
    snap.forEach((e) => {
        var el = e.data()
        
        chatMessages.push(el)
        chatMessages.sort()
        
        
    })
})


//Home
app.get('/', (req, res) => {
    

    
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    let ticketsOpen = []
    var loggedIn = false;
    let ticketsClosed = []

    var collection = admin.firestore().collection('ticketsOpen')


        

        var items = collection.get()
        items.then((e) => {
            
            e.forEach((el) => {
                var data_ = el.data()
                ticketsOpen.push({
                    title: data_.title,
                    pro: data_.pro,
                    userName: data_.userName,
                    uid: data_.uid
                })    

            })
        }).then(()=>{
            var collection_ = admin.firestore().collection('ticketsClosed')
            var items_ = collection_.get()
            items_.then((e) => {
                
                e.forEach((el) => {
                    var data_ = el.data()
                    ticketsClosed.push({
                        title: data_.title,
                        pro: data_.pro,
                        userName: data_.userName,
                        uid: data_.uid
                    })    
    
                })
    
    
            }).then(()=>{
        const sessionCookie = req.cookies.session || '';
           admin
          .auth()
          .verifySessionCookie(sessionCookie, true)
          .then((decodedClaims) => {
            var email
            email = decodedClaims.email
            loggedIn=true



            //Check user role

                //Check user role

            var roles = admin.firestore().collection('userRole').doc(decodedClaims.uid)
            var rolesGet = roles.get()
            rolesGet.then((role) => {
                   var data = role.data()
                
                    if(role.exists){
                        if(data.support){
                    admin.auth().getUser(decodedClaims.uid).then((u)=>{
                        displayName = u.displayName
                        res.render(__dirname + '/index.html', {email: u.email, displayName: u.displayName, ticketsOpen:  ticketsOpen, ticketsClosed: ticketsClosed,loggedIn: loggedIn, uid: decodedClaims.uid, support: true, ticketOpened: false});
                      })
                         }
                         else{
                            admin.auth().getUser(decodedClaims.uid).then((u)=>{
                                
                                admin.firestore().collection('ticketsOpen').doc(decodedClaims.uid).get().then((ev)=>{ 
                                        if(ev.exists){
                                            res.render(__dirname + '/index.html', {email: u.email, displayName: u.displayName, ticketsOpen:  [], ticketsClosed: [],loggedIn: true, uid: decodedClaims.uid, support: false, ticketOpened: true});
                                            
                                        }
                                        else{
                                           res.render(__dirname + '/index.html', {email: u.email, displayName: u.displayName, ticketsOpen:  [], ticketsClosed: [],loggedIn: true, uid: decodedClaims.uid, support: false, ticketOpened: false});
                                                  
                                        }
                                       
                                        
                                   
                                })
                               
                                
                              })
                              
                        }


                      return
                    }
                    else{
                        admin.auth().getUser(decodedClaims.uid).then((u)=>{
                            
                            admin.firestore().collection('ticketsOpen').doc(decodedClaims.uid).get().then((ev)=>{ 
                                    if(ev.exists){
                                        res.render(__dirname + '/index.html', {email: u.email, displayName: u.displayName, ticketsOpen:  [], ticketsClosed: [],loggedIn: true, uid: decodedClaims.uid, support: false, ticketOpened: true});
                                        
                                    }
                                    else{
                                       res.render(__dirname + '/index.html', {email: u.email, displayName: u.displayName, ticketsOpen:  [], ticketsClosed: [],loggedIn: true, uid: decodedClaims.uid, support: false, ticketOpened: false});
                                              
                                    }
                                   
                                    
                               
                            })
                           
                            
                          })
                          
                    }
                    
             })
            //


            //
      
            
            
          })
          .catch((error) => {
            loggedIn=false
    
            res.render(__dirname + '/login.html', { ticketsOpen:  ticketsOpen, ticketsClosed: ticketsClosed, loggedIn: loggedIn, error: false});
            
            
    
            
          });
    
    
            })
            
        })       
});

app.get('/api/ticketChat/', (req, res) => {
    const sessionCookie = req.cookies.session || '';
           admin
          .auth()
          .verifySessionCookie(sessionCookie, true)
          .then((decodedClaims) => {
            admin.auth().getUser(decodedClaims.uid).then((u)=>{

            


                var ticket = admin.firestore().collection('ticketsOpen').doc(decodedClaims.uid).get().then((data)=>{
                    var data_ = data.data()
                    if(data.exists){
                        res.render(__dirname + '/ticketchat.html', {loggedIn: true, error: false, displayName: u.displayName, title: data_.title, chat: chatMessages});
                    }
                    else{
                        res.redirect('/')
                    }
                
                })
                
               
                       // res.render(__dirname + '/ticketchat.html', {loggedIn: true, error: false, displayName: u.displayName, title: data_.title, chat: chatMessages});
            
          }).catch((err) => {
            res.redirect('/')
          })
      })      
})
    
    


app.post('/api/update', (req, res) => {

     admin.auth().getUser(uid).then((user) => {
        res.render(__dirname + '/ticketchat.html', {loggedIn: true, error: false, displayName: user.displayName, chat: chatMessages, title: "ja ka"})
   
    })

   


})


//logout
app.get('/api/user/logout', function(req , res){
    res.clearCookie('session')
    
    const sessionCookie = req.cookies.session || '';
  res.clearCookie('session');
  admin
    .auth()
    .verifySessionCookie(sessionCookie)
    .then((decodedClaims) => {
      return admin.auth().revokeRefreshTokens(decodedClaims.sub);
    })
    .then(() => {
      res.redirect('/');
    })
    .catch((error) => {
      res.redirect('/');
    });
 });

//CheckRole
app.post('/api/user/checkRole', (req, res) => {
    if(req.body.uid != ""){
        var pfad = admin.firestore().collection('userRole').doc(req.body.uid)
        var doc = pfad.get().then((data)=>{
            if(!data.exists){
                console.log(data, 'dont exist!')
                res.send({
                    message: 'Data dont exist' 
                })
            }
            else{
                res.send(data.data())
            }
        res.send(data.data())
        }).catch((err)=>{
            res.send({
                error: 'Error: ' + err.message
            })
        })
    }
    else{
        console.log(req.body.uid)
        res.send(req.body)
    }
})


//Login system
app.post('/api/login', (req, res, next) => {
    //Auth firebase
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);


firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(user => {
  
  return user.user.getIdToken().then(idToken => {
    

    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    admin
      .auth()
      .createSessionCookie(idToken, { expiresIn })
      .then(
        (sessionCookie) => {
          const options = { maxAge: expiresIn, httpOnly: true, secure: true };
          res.cookie('session', sessionCookie, options);
          res.redirect('/')
        },
        (error) => {
          res.status(401).send('UNAUTHORIZED REQUEST!');
        }
      );
  });
}).then(() => {
  
  return firebase.auth().signOut();
}).catch((err)=>{
    res.render(__dirname + '/login.html', {error: true, message: 'Die angegebenen Daten stimmen nicht!'})
})
      
    
});

//Go pw reset link
app.get('/api/sendResetLink', (req, res) => {
    res.render(__dirname + '/forgot-pw.html', {error: false, success: false})
})

//Send reset link

app.post('/api/sendResetLink', (req, res) => {
    if(req.body.email == ""){
        res.render(__dirname + '/forgot-pw.html', {error: true, success: false, message: "Du musst alle Felder ausfüllen!"})
    }
    else{
        firebase.auth().sendPasswordResetEmail(req.body.email).then(()=>{
            res.render(__dirname + '/forgot-pw.html', {error: false, success: true, message: "Die Email wurde gesendet!"})
        }).catch((error) => {
            if(error.code="auth/email-not-found"){
            res.render(__dirname + '/forgot-pw.html', {error: true, success: false, message: "Die Email existiert nicht!"})
            }
            else{
            res.render(__dirname + '/forgot-pw.html', {error: true, success: false, message: error.code}) 
            }
        })
    }
})

//Go login
app.get('/api/login', (req, res) => {
    res.render(__dirname + '/login.html', {error: false})
})

//Go register
app.get('/api/register', (req, res) => {
    res.render(__dirname + '/register.html', {error: false})
})

//registersystem
app.post('/api/register', (req,res,next) => {

        if(req.body.password != req.body.password2){
            res.render(__dirname + '/register.html', {error: true, message: 'Die Passwörter stimmen nich überein!'})
            return
        }
        else if(req.body.nutzername.length > 10){
            res.render(__dirname + '/register.html', {error: true, message: 'Der Nutzername hat über 10 Charackter'})
            return
        }
        
        if(req.body.password != "" && req.body.password2 != "" && req.body.email != "" && req.body.nutzername != ""){
        
            var userName = req.body.nutzername
        firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password).then((user)=> {
            
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'sandrostross310@gmail.com',
                  pass: pw
                }
              });
              
              var mailOptions = {
                  
              }
              transporter.sendMail({
                from: "styxstvspammer bot",
                to: user.user.email,
                subject: "Die Spaßti Registrierung (PurpleCode) Dein dummer bot!",
                html: "<h1>Du Idiot!!!! Warum registrierst du dich!!!! FICK DICH WEHE DU ERSTELLST EIN TICKET!!!!</h1>"
              }, function(error, info){
                if (error) {
                  res.send({
                    error: "Error! " + error.message
                  })
                } else {
                  console.log('Email sent: ' + info.response);
                  res.send({
                      message: "Email sent!"
                  })
                }
              });

            admin.auth().updateUser(user.user.uid, {
                displayName: req.body.nutzername
            })
            user.user.updateProfile({
                displayName: userName
              }).catch(function(error) {
              console.log(error);
            });
            user.user.displayName
            user.user.name
            user.user.displayName
            admin.auth().getUser(user.user.uid).then((user) => {
                console.log(user.displayName)
            })
            console.log(user.user.displayName)
            return user.user.getIdToken().then(idToken => {
                

                const expiresIn = 60 * 60 * 24 * 5 * 1000;
                admin
                  .auth()
                  .createSessionCookie(idToken, { expiresIn })
                  .then(
                    (sessionCookie) => {
                      
                      const options = { maxAge: expiresIn, httpOnly: true, secure: true };
                      res.cookie('session', sessionCookie, options)
                      res.redirect('/')
                      return firebase.auth().signOut();
                     
                      
                    },
                    (error) => {
                      res.status(401).send('UNAUTHORIZED REQUEST!');
                    }
                  );
              })
            }).then(() => {
              
              return firebase.auth().signOut();
            }).catch((err) => {
                if(err.code == "auth/weak-password"){
                res.render(__dirname + '/register.html', {error: true, message: 'Die Passwörter sollten mindestens 6 Zeichen haben!'})
                }
                if(err.code == "auth/invalid-email"){
                    res.render(__dirname + '/register.html', {error: true, message: 'Die E-Mail existiert nicht!'})
                }
                if(err.code=="auth/email-already-in-use"){
                    res.render(__dirname + '/register.html', {error: true, message: 'Die E-Mail existiert bereits!'})
                }
            })
        }
        else{
            res.render(__dirname + '/register.html', {error: true, message: 'Fülle alle Felder aus!'})
            return
        }


})


//check User informaion

app.get('/api/username/:uid', (req, res) => {
    admin.auth().getUser(req.params.uid).then((user)=>{
        res.send({
            username: user.displayName
        })
    }).catch((err)=>{
        res.send({
            err: 'Error: ' + err.message
        })
    })
})

app.get('/api/email/:uid', (req, res) => {
    admin.auth().getUser(req.params.uid).then((user)=>{
        res.send({
            email: user.email
        })
    }).catch((err)=>{
        res.send({
            err: 'Error: ' + err.message
        })
    })
})

app.get('/api/uid/:email', (req, res) => {
    admin.auth().getUserByEmail(req.params.email).then((user)=>{
            res.send({
                uid: user.uid
            })
    }).catch((err)=>{
        res.send({
            Err: 'Error: ' + err.message + " The Email: " + req.params.email
        })
    })
})


//Read data from firestore and realtime database
app.post('/api/firestore', (req, res) => {
    if(req.body.collection != "admin" && req.body.collection != "userRole") {
       var collection = admin.firestore().collection(req.body.collection).doc(req.body.doc)
       var doc = collection.get().then((data) => {
           res.send(data.data())
       })
    }
    else{
        res.send({
            err: 'You are not allowed to see this data'
        })
    }
})


//Manage users
app.post('/api/user/ban', (req, res) => {
    if(req.body.pw == "0WkaeWIs6xl4MRo7Aö?"){
        admin.auth().updateUser(req.body.uid, {
            disabled: true
        }).then(()=>{
            res.send({
                message: 'Die uid wurde erfolgreich durch einen Admin gebannt!'
            })
        }).catch((err)=>{
            res.send({
                err: 'Error: ' + err.message
            })
        })
    }
    else{
        res.send({
            err: 'Error: Your password do not match with the admin password!'
        })
    }
})

app.post('/api/user/delete', (req, res) => {
    if(req.body.pw == "Epd6n6MHyKAe6Qrg?@a#"){
        admin.auth().deleteUser(req.body.uid).then(()=>{
            res.send({
                message: 'Die UID wurde durch einen Admin erfolgreich gelöscht!'
            })
        }).catch((err)=>{
            res.send({
                err: 'Error: ' + err.message
            })
        })
    }
    else{
        res.send({
            err: "Error: The password do not match with the admin password!"
        })
    }
})

app.post('/api/user/resetpassword', (req, res) => {
    admin.auth().generatePasswordResetLink(req.body.email).then(()=>{
        res.send({
            message: "Email was sent to " + req.body.email
        })
    }).catch((err) => {
        res.send({
            error: "Error! " + err.message
        })
    })
})

app.post('/api/user/emailAuth', (req, res) => {
    admin.auth().generateEmailVerificationLink(req.body.email).then(()=>{
        res.send({
            message: "Die Email wurde versendet"
        })
        res.end()
    }).catch((err)=>{
        res.send({
            error: "Error: " + err.message
        })
    })
})


//Admin
app.post('/api/admin/sendMail', (req, res) => {
    if(req.body.pw == "AdMinEpd6n6MHyKAe6Qrg?@a#1"){
   
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sandrostross310@gmail.com',
          pass: pw
        }
      });
      
      var mailOptions = req.body.mailOptions;
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          res.send({
            error: "Error! " + error.message
          })
        } else {
          console.log('Email sent: ' + info.response);
          res.send({
              message: "Email sent!"
          })
        }
      });
    }
    else{
        res.send({
            err: "The password do not math with the admin password"
        })
    }
})



function getDisplayName(uid) {
    admin.auth().getUser(uid).then((u)=>{
        return u.displayName
    })
}