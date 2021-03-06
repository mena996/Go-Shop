const express = require('express');
const ProductModel = require('../models/product');
const RateModel = require('../models/rate');
const FavoriteModel = require('../models/favorite');
const router = express.Router();
const auth = require('../middlewares/authorization');
const multer = require('../middlewares/multer');

router.get('/', async (req, res, next) => {
    try {
        const products = await ProductModel.find({}).populate('brand').populate('category')
        if (products) res.send(products);
        else next(err)

    } catch (err) {
        next("couldent fetch products..");
    }
});

router.post('/', auth.shouldBe('admin'), multer.upload.single('image'), async (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    try {
        const { name, category, description, price, brand } = req.body;
        const product = await ProductModel.create({
            name,
            image: url + '/public/images/' + req.file.filename,
            description,
            price,
            category,
            brand
        });
        res.send(product)
    } catch{
        next("Erorr while adding a product");
    }
});

router.patch('/:id', auth.shouldBe('admin'), multer.upload.single('image'), async (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    if (req.file) req.body.image = url + '/public/images/' + req.file.filename;
    try {
        const product = await ProductModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true })
        if (!product) next("product not found");
        else res.json(product);
    } catch{
        next("Error in editing product")
    }
});

router.delete('/:id', auth.shouldBe('admin'), async (req, res, next) => {
    try {
        const product = await ProductModel.findByIdAndDelete(req.params.id);
        if (!product) next("product not found");
        else res.json(product);
    } catch{
        next("Error in removing product")
    }
});

router.post('/favorite', async (req, res, next) => {
    try {
        const { user, product } = req.body;
        // options = { upsert: true, new: true, setDefaultsOnInsert: true };
        productFavorite = await FavoriteModel.find({ user, product });
        if(productFavorite.length>0){
            await FavoriteModel.findByIdAndDelete(productFavorite[0]._id);
            console.log("deleted");
        }else{
            await FavoriteModel.create({
                user, product
            });
            console.log("create");
        }
        res.send(productFavorite)
    } catch (err) {
        next(err);
    }
});

router.post('/rate', async (req, res, next) => {
    try {
        const { rate, user, product } = req.body;
        options = { upsert: true, new: true, setDefaultsOnInsert: true };
        productRate = await RateModel.findOneAndUpdate({ user, product }, { rate, user, product }, options);
        res.send(productRate)
    } catch (err) {
        next(err);
    }
});

router.get('/rate/:user/:product', async (req, res, next) => {
    try {
        const { user, product } = req.params;
        productState = await RateModel.find({ user, product });
        res.send(productState)
    } catch (err) {
        next(err);
    }
});

router.get('/favorite/:user/:product', async (req, res, next) => {
    try {
        const { user, product } = req.params;
        productState = await FavoriteModel.find({ user, product });
        res.send(productState)
    } catch (err) {
        next(err);
    }
});

// router.get('/shelf/:user/:product', async (req, res, next) => {
//     try {
//         const { user, product } = req.params;
//         productState = await CartModel.find({ user, product });
//         res.send(productState)
//     } catch (err) {
//         next(err);
//     }
// });

// router.get('/shelf/:id', async (req, res) => {
//     try {
//         products = await CartModel.find({}).populate({
//             path: 'product',
//             populate: {
//                 path: 'author'
//             }
//         }).where("user").equals(req.params.id);
//         res.send(products);
//     } catch (err) {
//         next(err);
//     }
// });

router.get('/topproducts', async (req, res, next) => {
    try {
        const productState = await RateModel.aggregate(
            [
                {
                    $group:
                    {
                        _id: "$product",
                        rate: { $avg: "$rate" },
                    }
                }
            ]
        ).sort({ rate: -1 }).limit(5);
        const bestProducts = productState.map(productState => productState['_id']);
        let products = await ProductModel.find({ "_id": { "$in": bestProducts } });
        res.send(products);
    } catch (err) {
        console.log(err);
        next(err);
    }
});

router.get('/topcats', async (req, res, next) => {
    try {
        const productState = await RateModel.aggregate(
            [
                {
                    $group:
                    {
                        _id: "$product",
                        rate: { $avg: "$rate" },
                    }
                }
            ]
        ).sort({ rate: -1 });
        const bestProducts = productState.map(productState => productState['_id']);
        let products = await ProductModel.find({ "_id": { "$in": bestProducts } }).populate('category');
        // const bestcats = products.map(product => product['category']['name']);
        const bestcats = products.map(product => {
            let cat = {}
            cat["name"] = product['category']['name'];
            cat["_id"] = product['category']['_id'];
            return cat;
        }
        );
        const bestcatsU = bestcats.map(e => e["_id"])
                            .map((e, i, final) => final.indexOf(e) === i && i)
                            .filter((e) => bestcats[e]).map(e => bestcats[e]);



        // console.log(bestcatsU)
        res.send(bestcatsU.slice(0, 5));
    } catch (err) {
        console.log(err);
        next(err);
    }
});

router.get('/topbrands', async (req, res, next) => {
    try {
        const productState = await RateModel.aggregate(
            [
                {
                    $group:
                    {
                        _id: "$product",
                        rate: { $avg: "$rate" },
                    }
                }
            ]
        ).sort({ rate: -1 }).limit(5);
        const bestProducts = productState.map(productState => productState['_id']);
        let products = await ProductModel.find({ "_id": { "$in": bestProducts } }).populate('brand');
        const bestbrand = products.map(product => {
            let auther = {}
            auther["name"] = product['brand']['name'];
            auther["_id"] = product['brand']['_id'];
            return auther;
        }
        );
        const bestbrandU = bestbrand.map(e => e["_id"])
                                    .map((e, i, final) => final.indexOf(e) === i && i)
                                    .filter((e) => bestbrand[e]).map(e => bestbrand[e]);

        // console.log(bestbrandU.slice(0, 5))
        res.send(bestbrandU.slice(0, 5));
    } catch (err) {
        console.log(err);
        next(err);
    }
});






router.get('/:id', async (req, res, next) => {
    try {
        const product = await ProductModel.findById(req.params.id).populate('author').populate('category')
        if (!product) next("product Not found..");
        else res.send(product);
    } catch (err) {
        next("Error fetching product..");
    }
});

router.use((err, req, res, next) => {
    res.status(500).send("oh no there is some thing wrong happend :( \n" + err);
});

//specific product
router.get('/rate/:id', async (req, res, next) => {
    try {
        rate = await RateModel.aggregate(
            [
                {
                    $group:
                    {
                        _id: "$product",
                        rate: { $avg: "$rate" },
                        count: { $sum: 1 }
                    }
                }
            ]
        )
        const product = rate.find(product => product._id == req.params.id)
        res.send(product ? product : { rate: 0, count: 0 })
    } catch (err) {
        next(err);
    }
});

module.exports = router;