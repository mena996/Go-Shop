const router = require('express').Router;
const auth = require('../middlewares/authorization');
const OrdersModel = require('../models/orders');
router.get('/', (req, res) => {
    try {
        OrdersModel.find({}, (err, orders) => {
            res.json(orders);
        })
    } catch (error) {
        next("Internal server error: Can't get all orders");
    }
})

router.get('/:id', (req, res) => {
    try {
        OrdersModel.findById(req.params.id, (err, order) => {
            res.json(order);
        })
    } catch (error) {
        next("Internal server error: Can't get order details");
    }
})

router.post('/', auth.shouldBe('admin'),  async(req, res, next) => {
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
        const order = await OrdersModel.create({
            date,
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
        const order = await OrdersModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
        if (!order) res.status(404).send("order not found");
        else res.json(order);
    } catch {
        next("Internal server error: Can't update order details");
    }
});
router.delete('/:id', auth.shouldBe('admin'), async(req, res, next) => {
    try {
        const order = await OrdersModel.findByIdAndDelete(req.params.id);
        if (!order) res.status(404).send("order not found");
        else res.json(order);
    } catch {
        next("Internal server error: Can't delete order");
    }
});

module.exports = router;