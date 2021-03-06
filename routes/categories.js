const express = require('express');
const CategoryModel = require('../models/categories');
const BookModel = require('../models/product')
const router = express.Router();
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

router.get('/:id/books', (req, res) => {
    id = req.params.id
    BookModel.find({ category: id }, (err, category_book) => {
        if (err) return res.send(err)
        res.json(category_book)
    })
})



router.post('/', auth.shouldBe('admin'),  async(req, res, next) => {
    try {
        const { name } = req.body;
        const category = await CategoryModel.create({
            name,
        });
        res.send(category)
    } catch {
        next("Erorr while adding a category");
    }
});
router.patch('/:id', auth.shouldBe('admin'), async(req, res, next) => {
    try {
        const category = await CategoryModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
        if (!category) next("category not found");
        else res.json(category);
    } catch {
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