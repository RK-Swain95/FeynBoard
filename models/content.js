const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    topicName: {
      type: String,
      required: true,
    },

    contentsplit:[{
          sentence:{
            type: String
          },
          value:{
            type:Number
          }
            
          }] 
  },
  {
    timestamps: true,
  }
);

const Content = mongoose.model("Content", contentSchema);
module.exports = Content;