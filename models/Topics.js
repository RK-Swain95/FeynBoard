const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    topicName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },

    userName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Topics = mongoose.model("Topics", topicSchema);
module.exports = Topics;
