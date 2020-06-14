const router = require('express').Router();
const auth = require('../middlewares/authorization');
const OrderModel = require('../models/order');
router.get('/', auth.shouldBe('admin'), (req, res) => {
    try {
        OrderModel.find({}).populate('products.product').populate('customer').exec( (err, order) => {
            res.json(order);
        })
    } catch (error) {
        next("Internal server error: Can't get all orders");
    }
})

router.get('/:id', (req, res) => {
    try {
        OrderModel.findById(req.params.id, (err, order) => {
            res.json(order);
        })
    } catch (error) {
        next("Internal server error: Can't get order details");
    }
})

router.post('/', auth.shouldBe('user'), async(req, res, next) => {
    try {
        const { date, products } = req.body;
        /*
        {
            date:
            products: 
                [
                    {
                        product: objectID
                        price: float
                        quantity: int
                    }
                ]
        }
        */
       console.log(date, req.user._id, products)
       const customer = req.user._id;
        const order = await OrderModel.create({
            date,
            customer,
            products,
            status: 0
        });
        res.send(order)
    } catch {
        next("Internal server error: Can't add order");
    }
});
router.patch('/:id', auth.shouldBe('admin'), async(req, res, next) => {
    try {
        const order = await OrderModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
        if (!order) res.status(404).send("order not found");
        else res.json(order);
    } catch {
        next("Internal server error: Can't update order details");
    }
});
router.delete('/:id', auth.shouldBe('admin'), async(req, res, next) => {
    try {
        const order = await OrderModel.findByIdAndDelete(req.params.id);
        if (!order) res.status(404).send("order not found");
        else res.json(order);
    } catch {
        next("Internal server error: Can't delete order");
    }
});

module.exports = router;