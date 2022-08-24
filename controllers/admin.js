const query = require('express/lib/middleware/query');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  
  req.user.createProduct({
    title:title,
    price:price,
    imageUrl:imageUrl,
    description:description
  })
  .then(()=>{
    res.redirect('/')
  })
  .catch(err=>{
    console.log(err)
  })
};

exports.getEditProduct= (req,res,next)=>{
  const editMode= req.query.edit;
  if(editMode!=='true'){
    return res.redirect('/')
  }
  const prodId= req.params.productId;
  req.user.getProducts({where:{id:prodId}})
  .then((products)=>{
      const product=products[0]
      if(!product){
        return res.redirect('/')
      }
      res.render('admin/edit-product',{
      pageTitle:'Edit Product',
      path:'/admin/edit-product',
      editing:editMode,
      product:product
    })
  
  })
  
}

exports.postEditProduct=(req,res,next)=>{
  const id=req.body.productId;
  const title=req.body.title;
  const imageUrl=req.body.imageUrl;
  const description=req.body.description;
  const price=req.body.price;
  Product.findByPk(id)
  .then((product)=>{
    product.title=title;
    product.imageUrl=imageUrl;
    product.description=description;
    product.price=price;
    return product.save()
  })
  .then(res.redirect('/admin/products'))
  .catch(err=>{
    console.log(err)
  })
  
}

exports.postDeleteProduct=(req, res, next)=>{
  const id=req.params.productId;
  Product.findByPk(id)
  .then((product)=>{
    product.destroy()
  })
  .then(res.redirect('/admin/products'))
  .catch(err=>{
    console.log(err)
  })
}

exports.getProducts = (req, res, next) => {
  req.user.getProducts()
  .then((products)=>{
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
};
