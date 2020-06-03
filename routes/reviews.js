const express = require('express');
const reviewModel = require('../models/review');
const router = express.Router();

// // get all review test 
// router.get('/', (req, res, next) => {
//     return reviewModel.find({}).populate('book').populate('user').exec((err, review) => {
//         if (err) next(err);
//         else res.json(review);
//     });
// });

//get specific book review 
router.get('/:id', (req, res, next) => {
    const data = reviewModel.find().populate('user').where('book').equals(req.params.id).exec((err, review) => {
        if (err) next(err);
        else res.json(review);
    });
    return data
});


//new review
router.post('/', (req, res, next) => {
    const { review, user, book } = req.body;
    reviewModel.create({
        review,
        user,
        book
    }, (err, review) => {
        if (err) next(err);
        
        else {
            reviewModel.findById(review._id).populate('user').exec((err,rev)=>{
                if (err) next(err);
                else res.json(rev);
            })
        }
    })
});



// update review
router.patch('/:id', (req, res, next) => {
    const { body: { review } } = req;
    reviewModel.findByIdAndUpdate(req.params.id,
    {review},
    {new: true , runValidators: true},
    (err,review)=>{
        if(err) next(err);
        else {
            reviewModel.findById(review._id).populate('user').exec((err,rev)=>{
                if (err) next(err);
                else res.json(rev);
            })
        }
    })
});


//delete review
router.delete('/:id', (req, res, next) => {
    return reviewModel.findByIdAndDelete(req.params.id,(err, reviews) => {
        if (err) next(err);
        else res.json(reviews);
    });
});

router.use((err, req, res, next) => {
    res.send("oh no there is some thing wrong happend :( \n" + err);
});


module.exports = router;