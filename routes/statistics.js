const express = require('express');
let UserModel = require('../models/users');
const ProductModel = require('../models/product');
const BrandModel = require('../models/brand');
const CategoryModel = require('../models/categories');
const OrderModel = require('../models/order');
const auth = require('../middlewares/authorization');
const router = express.Router();

router.get('/', auth.shouldBe('admin'), async(req, res) => {
    try {
        const allUsersCount = await UserModel.count({});
        const adminsCount = await UserModel.count({isadmin: true});
        const usersCount = allUsersCount - adminsCount;
        const productsCount = await ProductModel.count({});
        const brandsCount = await BrandModel.count({});
        const categoriesCount = await CategoryModel.count({});
        const allOrdersCount = await OrderModel.count({});
        const pendingOrdersCount = await OrderModel.count({status: 0});
        const deliverdOrdersCount = allOrdersCount - pendingOrdersCount;
        const sales = await OrderModel.aggregate([ {$unwind: "$products"},{ 
            $group: { 
                _id: null, 
                total: { $sum: { $multiply: [ "$products.price", "$products.quantity", 1.14 ] } }
            } 
        } ] )
        res.json({
            allUsersCount,
            adminsCount,
            usersCount,
            productsCount,
            categoriesCount,
            brandsCount,
            allOrdersCount,
            pendingOrdersCount,
            deliverdOrdersCount,
            totalSales: sales[0]?sales[0].total:0
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send("Internal server error: Can't get statistics");
        
    }
} )

module.exports = router;