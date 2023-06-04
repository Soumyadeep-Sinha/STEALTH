const express = require("express");
const router = express.Router();
const Post = require("./newpostSchema")
const session = require('express-session');
const User = require("./userSchema");

router.post('/performAction', (req, res) => {
    const { postId, action } = req.body;
    const userId = req.session._id;

    Post.findById(postId)
        .then(async (post) => {
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            let responseSent = false; // Flag to track if the response has been sent
            const search = await User.findOne({ UserName: post.UploaderName });

            if (action === 'like') {
                // console.log("action --> liked");
                if (!post.LikedBy.includes(userId)) {
                    post.Likes++;

                    let totalLikes = search.TotalLikes;
                    totalLikes++;
                    await User.findByIdAndUpdate(
                        search._id,
                        { $set: { TotalLikes: totalLikes } },
                        { new: true }
                    );

                    if ((post.DislikedBy.includes(userId))) {
                        post.Dislikes--;
                    }
                    post.LikedBy.push(userId);
                    post.DislikedBy.pop(userId);
                } else {
                    //console.log("already liked");
                    responseSent = true;
                }
            } else if (action === 'dislike') {
                // console.log("action --> disliked");
                if (!post.DislikedBy.includes(userId)) {
                    post.Dislikes++;
                    if ((post.LikedBy.includes(userId))) {
                        post.Likes--;
                    }
                    post.DislikedBy.push(userId);
                    post.LikedBy.pop(userId);
                } else {
                    //console.log("already disliked");
                    responseSent = true;
                }
            } else if (action === 'award') {
                // console.log("action --> award");
                if (!post.AwardedBy.includes(userId)) {
                    post.Awards++;
                    let totalAwards = search.TotalAwards;
                    totalAwards++;

                    await User.findByIdAndUpdate(
                        search._id,
                        { $set: { TotalAwards: totalAwards } },
                        { new: true }
                    );

                    post.AwardedBy.push(userId);
                } else {
                    //console.log("already awarded")
                    responseSent = true;
                }
            }

            if (!responseSent) {
                post.save()
                    .then(() => {
                        res.json({
                            likes: post.Likes,
                            dislikes: post.Dislikes,
                            awards: post.Awards
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).json({ error: 'Internal Server Error' });
                    });
            }
        });
});

module.exports = router;