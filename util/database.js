const Sequelize=require('sequelize')

const sequelize=new Sequelize('rootschema','root','mysql1730@S',{
    dialect: 'mysql',
    host:'localhost'
})

module.exports=sequelize;