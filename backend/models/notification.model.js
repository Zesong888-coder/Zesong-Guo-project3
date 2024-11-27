import mongoose from "mongoose";

const notifySchema = new mongoose.Schema(
	{
		type: {
			type: String,
			required: true,
			enum: ["follow", "like"],
		},
		read: {
			type: Boolean,
			default: false,
		},
        from: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		to: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

const Notification = mongoose.model("Notification", notifySchema);

export default Notification;