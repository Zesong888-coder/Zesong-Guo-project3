import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getProfile = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not fuond!"});
        }
        res.status(200).json(user);
    } catch (error){ 
        console.log("Error in getUserProfile: ", error.message);
		res.status(500).json({ error: error.message });
    }
};

// Flip the status of follow
export const followUser = async (req, res) => {
    try {
        const { id } = req.params;  
        const userToModify = await User.findById(id);
        const currUser = await User.findById(req.user._id);

        // Use req.user instead of currUser to avoid redunant database calls
        if (id === req.user._id.toString()) {
            return res.status(404).json({ error: "Invalid: Not allowed"});
        }

        if (!userToModify || !currUser) {
            return res.status(400).json({ error: "User not found" });
        }

        const isFollowing = currUser.following.includes(id);

        if (isFollowing) {
            // Turn it into unfollow; Double direction
            await User.findByIdAndUpdate(id, { $pull: {followers: req.user._id} });
            await User.findByIdAndUpdate(req.user._id, { $pull: {following: id} });

            res.status(200).json({ message: "User unfollowed successfully!"});
        } else {
            // Turn it into follow
            await User.findByIdAndUpdate(id, { $push: {followers: req.user._id} });
            await User.findByIdAndUpdate(req.user._id, { $push: {following: id} });

            // Send notification to the user
            const notification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });

            await notification.save();

            res.status(200).json({ message: "User followed successfully!"});
        }
    } catch (error) {
        console.log("Error in followUser: ", error.message);
		res.status(500).json({ error: error.message });
    }
};


export const getSuggestedUser = async (req, res) => {
    try {
        const currUserId = req.user._id;
        const followedByMe = await User.findById(currUserId).select("following");

        // Random sampling
        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: currUserId },  // exclude self
                }
            },
            { $sample: { size: 10 }},
        ]);

        // Only those not already followed by current user is valid
        const validSuggest = users.filter(user => !followedByMe.following.includes(user._id));
        const suggestedUser = validSuggest.slice(0, 6);

        // Conceal the passwords
        suggestedUser.forEach(user => user.password = null);
        res.status(200).json(suggestedUser);
    } catch (error) {
        console.log("Error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
    }
}

export const updateUser = async (req, res) => {
	const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
	let { profileImg, coverImg } = req.body;

	const userId = req.user._id;

	try {
		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		if (profileImg) {
			if (user.profileImg) {
                // delete the original image
                // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
                // only wants zmxorcxexpdbh8r0bkjb 
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedResponse.secure_url;
		}

		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url;
		}

		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

		user = await user.save();

		// password should be null in response
		user.password = null;

		return res.status(200).json(user);
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};