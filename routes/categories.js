const express = require('express');
const CategoryModel = require('../models/categories');
const ProductModel = require('../models/product')
const router = express.Router();
const multer = require('../middlewares/multer');
const auth = require('../middlewares/authorization');
// const express = require('express');
// const categoryModel = require('../models/categories')


// router.get('/', (req, res, next) => {
//     return PostModel.find({}).populate('auther_id', ['firstName', 'lastName']).exec((err, posts) => {
//         if (err) return res.send(err);
//         res.json(posts);
//     });
// });
// router.get('/:id', (req, res, next) => {
//     return PostModel.findById(req.params.id).populate('auther_id', ['firstName', 'lastName']).exec((err, posts) => {
//         if (err) next(err);
//         res.json(posts);
//     });
// });


router.get('/', (req, res) => {
    CategoryModel.find({}, (err, categories) => {
        if (err) return res.send(err)
        res.json(categories)
    })
})


router.get('/:id', (req, res) => {
    CategoryModel.findById(req.params.id, (err, categories) => {
        if (err) res.send(err)
        res.json(categories)
    })
})

router.get('/:id/products', (req, res) => {
    id = req.params.id
    ProductModel.find({ category: id }, (err, category_product) => {
        if (err) return res.send(err)
        res.json(category_product)
    })
})



router.post('/', auth.shouldBe('admin'),multer.upload.single('image'),  async(req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    console.log(req.body);
    try {
        const { name } = req.body;
        const category = await CategoryModel.create({
            name,
            image: url + '/public/images/' + req.file.filename,
        });
        res.send(category)
    } catch (e){
        console.log(e);
        
        next("Erorr while adding a category");
    }
});
router.patch('/:id', auth.shouldBe('admin'), multer.upload.single('image'), async(req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    if (req.file) req.body.image = url + '/public/images/' + req.file.filename;    
    try {
        const category = await CategoryModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
        if (!category) next("category not found");
        else res.json(category);
    } catch  {
        next("Error in editing category")
    }
});
router.delete('/:id', auth.shouldBe('admin'), async(req, res, next) => {
    try {
        const category = await CategoryModel.findByIdAndDelete(req.params.id);
        if (!category) next("category not found");
        else res.json(category);
    } catch {
        next("Error in removing category")
    }
});


router.use((err, req, res, next) => {
    res.status(500).send("oh no there is some thing wrong happend :( \n" + err);
});

module.exports = router;