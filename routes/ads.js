const router = require('express').Router();
const auth = require('../middlewares/authorization');
const AdsModel = require('../models/advertisement');
const multer = require('../middlewares/multer');

router.get('/', async (req, res, next) => {
    try {
        const ads = await AdsModel.find({}).populate('product');
        res.json(ads);
    } catch {
        next("Internal server error: Can't get ads");
    }
});

router.post('/', auth.shouldBe('admin'), multer.upload.single('image'), async (req, res, next) => {
    const path = req.protocol + '://' + req.get('host');
    try {
        const { alt, product } = req.body;
        const ad = await AdsModel.create({
            alt,
            image: path + '/public/images/' + req.file.filename,
            product
        });
        res.send(ad)
    } catch (e){
        console.log(e)
        next("Internal server error: Couldn't add an advertisement");
    }
});

router.patch('/:id', auth.shouldBe('admin'), multer.upload.single('image'), async (req, res, next) => {
    const path = req.protocol + '://' + req.get('host');
    if (req.file) req.body.image = path + '/public/images/' + req.file.filename;
    try {
        const ad = await AdsModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true })
        if (!ad) next("advertisement not found");
        else res.json(ad);
    } catch{
        next("Internal server error: Couldn't edit advertisement")
    }
});

router.delete('/:id', auth.shouldBe('admin'), async(req, res, next) => {
    try {
        const ad = await AdsModel.findByIdAndDelete(req.params.id);
        if (!ad) res.status(404).send("advertisement not found");
        else res.json(ad);
    } catch {
        next("Internal server error: Can't delete advertisement");
    }
});

module.exports = router;