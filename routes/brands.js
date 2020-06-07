const express = require('express');
const BrandModel = require('../models/brand');
const ProductModel = require('../models/product');
const auth = require('../middlewares/authorization');
const multer = require('../middlewares/multer');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const authors = await BrandModel.find({}).populate('brand');
        res.json(authors);
    } catch (err) {
        return res.status(404).send({ message: "whoops... we can't display authors something wrong." });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const brand = await BrandModel.findById(req.params.id);
        res.json({
            message: "brand page",
            data: brand
        });
    } catch (err) {
        return res.status(404).send({ message: "whoops... something wrong." });
    }
});


router.get('/:id/products', (req, res, next) => {
    return ProductModel.find({}).populate('brand').populate('category').where('brand').equals(req.params.id).exec((err, products) => {
        if (err) next(err);
        else res.json(products);
    });
});


router.post('/', auth.shouldBe('admin'), multer.upload.single('image'), async (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    try {
        const { name, description, products } = req.body;
        const author = await BrandModel.create({
            name,
            description,
            image: url + '/public/images/' + req.file.filename,
            products
        });
        res.send(author)
    } catch {
        next("Erorr while adding a brand");
    }
});

router.patch('/:id', auth.shouldBe('admin'), multer.upload.single('image'), async (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    if (req.file) req.body.image = url + '/public/images/' + req.file.filename;
    try {
        const brand = await BrandModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
        if (!brand) next("brand not found");
        else res.json(brand);
    } catch {
        next("Error in editing brand")
    }
});
router.delete('/:id', auth.shouldBe('admin'), async (req, res, next) => {
    try {
        const brand = await BrandModel.findByIdAndDelete(req.params.id);
        if (!brand) next("brand not found");
        else res.json(brand);
    } catch {
        next("Error in removing brand")
    }
});

router.use((err, req, res, next) => {
    res.status(500).send("oh no there is some thing wrong happend :( \n" + err);
});

module.exports = router;