const Product = require('../models/product');
const Cart=require('../models/cart')
const Order=require('../models/order')

const items_per_page=1;

exports.getProducts = (req, res, next) => {
  Product.findAll()
  .then((products)=>{
   res.json({products, sucess :true})
  })
  .catch(err=>{
    console.log(err)
  })
};

exports.getProduct = (req,res,next)=>{
  const prodId=req.params.productId;
  Product.findByPk(prodId)
  .then((product)=>{
    res.render('shop/product-detail',{
      path:'/products',
      pageTitle:product.title,
      product:product
    })
  })
}

exports.getIndex = (req, res, next) => {
  let page= +req.query.page;
  let total_items;
  if(!page)
  page=1;
  //findAndCountAll returns count and rows where row is an array of objects
  Product.findAndCountAll({
    offset:(page-1)*items_per_page,
    limit:items_per_page
  })
  .then((response)=>{
    total_items=response.count;
    return response.rows
  })
  .then((products)=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      currentPage:page,
      hasPreviousPage:page>1,
      hasNextPage:(page*items_per_page)<total_items,
      previousPage:page-1,
      nextPage:page+1,
      lastPage: (Math.ceil(total_items/items_per_page))
    });
  })
  .catch(err=>{
    console.log(err)
  })
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
  .then((cart)=>{
    return cart.getProducts();
  })
  .then((products)=>{
      res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products:products

    });
  })
  .catch(err=>{
    console.log(err)
  })

};

exports.postCart =(req, res, next) => {
  const prodId=req.body.productId;
  let fetchedCart;
  req.user.getCart()
  .then((cart)=>{
      fetchedCart=cart;
      return cart.getProducts({where:{id:prodId}})
  })
  .then((products)=>{
      let product;
      if(products.length>0){
        product=products[0]
      }
      let newQuantity=1;
      if(product){  
        const oldQuantity=product.cartItem.quantity;
        newQuantity=oldQuantity+1;
        return fetchedCart.addProduct(product,{through:{quantity: newQuantity}})
      }
      else{
         return Product.findByPk(prodId)
        .then((product)=>{
          return fetchedCart.addProduct(product,{through:{quantity: newQuantity}})
        })
        .catch(err=>{console.log(err)})
      }
})
.then(()=>{
  res.redirect('/cart');
})
  .catch(err=>{console.log(err)})

}

exports.postDelete=(req,res,next)=>{
  const prodId=req.body.productId;
  req.user.getCart()
  .then((cart)=>{
    return cart.getProducts({where:{id:prodId}})
  })
  .then((products)=>{
    const product=products[0];
    product.cartItem.destroy();
    res.redirect('/cart')
  })
  .catch(err=>{console.log(err)})
}

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({include: ['products']})
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};

exports.postOrders=(req, res, next) =>{
  let total_amount=0;
  let orderId;
  let fetchedOrder;
  req.user.createOrder()
  .then(order=>{
      fetchedOrder=order;
      orderId=order.id
      return req.user.getCart()
              .then(cart=>{
                return cart.getProducts()
              })
              .then(products=>{
                products.forEach((prod)=>{
                  order.addProduct(prod,{through:{quantity:prod.cartItem.quantity}});
                  total_amount+=(prod.cartItem.quantity*prod.price)
                  prod.cartItem.destroy();

                })
              })
  })
  .then(()=>{
    fetchedOrder.set({amount:total_amount})
    fetchedOrder.save()
    res.redirect('/orders')
  })
  .catch((err)=>{
    console.log(err)
  })
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
