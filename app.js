const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const cors  = require('cors');

const errorController = require('./controllers/error');

const sequelize=require('./util/database');
const Product=require('./models/product');
const User=require('./models/user')
const Cart=require('./models/cart')
const CartItem=require('./models/cart-item')
const Order=require('./models/order')
const OrderItem=require('./models/order-item')

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())
app.use((req,res,next)=>{
    User.findByPk(1)
    .then((user)=>{
        req.user=user;
        next();
    })
    .catch(err=>{
        console.log(err)
    })
})


app.use('/admin', adminRoutes);
app.use(shopRoutes);


app.use(errorController.get404);

Product.belongsTo(User,{constraints:true,onDelete:'CASCADE'})
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product,{through:CartItem})
Product.belongsToMany(Cart,{through:CartItem})
User.hasMany(Order)
Order.belongsTo(User)
Product.belongsToMany(Order,{through:OrderItem})
Order.belongsToMany(Product,{through:OrderItem})




//for first time setting relation we have to override existing table that is done using sync({force:true})
sequelize.sync()
.then((result)=>{
    console.log('result',result);
    return User.findByPk(1)
})
.then((user)=>{
    if(!user){
        return User.create({
                    name:'sunil',
                    email:'sunilrana1730@gmail.com'
            })
        }
        else
        return user;

    })
.then((user)=>{
        user.getCart()
        .then(cart=>{
            if(!cart)
            return user.createCart()
            else
            return cart;
        })
        .catch(err=>{
            console.log(err)
        })
        
    })
.then((cart)=>{
        app.listen(4000)
    })
.catch(err=>{
    console.log(err)
})