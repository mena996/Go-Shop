const express = require('express');
const BrandModel = require('../models/brand');
const ProductModel = require('../models/product');
const auth = require('./auth');
const multer = require('./multer');
const router = express.Router();

// router.get('/', (req, res, next) => {
//     return PostModel.find({}).populate('auther_id', ['firstName', 'lastName']).exec((err, posts) => {
//         if (err) return res.send(err);
//         res.json(posts);
//     });
// });

//need hook
// router.get('/:id/books', (req, res, next) => {
//     return BrandModel.findById(req.params.id).populate('books').exec((err, author) => {
//         if (err) next(err);
//         res.json(author);
//     });
// });

router.get('/', async(req, res) => {
    try{
        const authors = await BrandModel.find({}).populate('author');
            res.json(authors);
    }catch(err){
        return res.status(404).send({message : "whoops... we can't display authors something wrong."});
    }
});

router.get('/:id', async(req, res) => {
    try{
        const author = await BrandModel.findById(req.params.id);
        res.json({
            message: "author page",
            data: author
        });
    }catch(err){
        return res.status(404).send({message : "whoops... something wrong."});
    }
});


// without hook
router.get('/:id/books', (req, res, next) => {
    return ProductModel.find({}).populate('author').populate('category').where('author').equals(req.params.id).exec((err, books) => {
        if (err) next(err);
        else res.json(books);
    });
});


router.post('/', auth.shouldBe('admin'), multer.upload.single('image'), async(req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    try {
        const { firstName, lastName, birthDate, books } = req.body;
        const author = await BrandModel.create({
            firstName,
            lastName,
            birthDate,
            image: url + '/public/' + req.file.filename,
            books
        });
        res.send(author)
    } catch {
        next("Erorr while adding a author");
    }
});
router.patch('/:id', auth.shouldBe('admin'), multer.upload.single('image'), async(req, res, next) => {  
    const url = req.protocol + '://' + req.get('host');
    if(req.file) req.body.image = url + '/public/' + req.file.filename;
    try {
        const author = await BrandModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
        if (!author) next("author not found");
        else res.json(author);
    } catch {
        next("Error in editing author")
    }
});
router.delete('/:id', auth.shouldBe('admin'), async(req, res, next) => {
    try {
        const author = await BrandModel.findByIdAndDelete(req.params.id);
        if (!author) next("author not found");
        else res.json(author);
    } catch {
        next("Error in removing author")
    }
});

router.use((err, req, res, next) => {
    res.status(500).send("oh no there is some thing wrong happend :( \n" + err);
});

module.exports = router;