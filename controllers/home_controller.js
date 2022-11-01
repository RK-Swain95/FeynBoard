const User = require("../models/users");
const Topics = require("../models/Topics");
const Content = require("../models/content");
const jwt = require("jsonwebtoken");

module.exports.home = function (req, res) {
  return res.render("home", {
    title: "home",
  });
};

module.exports.create = function (req, res) {
  User.findOne({ userName: req.body.userName }, function (err, user) {
    if (err) {
      console.log("error in finding user in sign up");
      return;
    }
    if (!user) {
      User.create(req.body, function (err, user) {
        console.log(user);
        if (err) {
          console.log("error in creating user in sign up");
          return;
        }
        var token = jwt.sign(user.toJSON(), "radha", { expiresIn: "1000000" });
        // console.log(token);
        //handle session creation
        res.cookie("jwt", token);
        return res.redirect("/dashboard");
      });
    } else {
      //console.log("hi")
      var token = jwt.sign(user.toJSON(), "radha", { expiresIn: "100000000" });
      // console.log(token);
      //handle session creation
      res.cookie("jwt", token);
      return res.redirect("/dashboard");
    }
  });
};

module.exports.dashboard = async function (req, res) {
  try {
    const token = req.cookies.jwt;

    const verifyuser = jwt.verify(token, "radha");

    //console.log(verifyuser.userName);
    let data = await Topics.find({ userName: verifyuser.userName });
    //console.log("data",data)
    var total = 0;
    var show = [];
    for (let j of data) {
      let olddata = await Content.findOne({ topicName: j.topicName });
      var array = olddata.contentsplit;
      console.log(array.length);
      for (let i of array) {
        total += i.value;
      }
      console.log(total);
      var percentage = (total / (array.length * 4)) * 100;
      show.push(percentage);

      total = 0;
    }

    //console.log(olddata);

    return res.render("dashboard", {
      title: "dashboard",
      data: data,
      percentage: show,
    });
  } catch (err) {
    console.log(err);
    return res.status(401).send("unauthorized");
  }
};

module.exports.topicspage = async function (req, res) {
  try {
    const token = req.cookies.jwt;

    const verifyuser = jwt.verify(token, "radha");
    const name = verifyuser.userName;
    return res.render("topics_content", {
      title: "topics",
      name: name,
      content: "",
      topic: "",
      split: "",
    });
  } catch (err) {
    console.log(err);
    return res.status(401).send("unauthorized");
  }
};

module.exports.createtopic = async function (req, res) {
  try {
    const token = req.cookies.jwt;
    const verifyuser = jwt.verify(token, "radha");
    let oldtopic = await Topics.findOne({ topicName: req.body.topicName });
    //console.log(oldtopic);
    var splited = [];
    if (verifyuser.userName==oldtopic.userName) {
      if (!oldtopic) {
        // console.log("hi");
        oldtopic = await Topics.create({
          topicName: req.body.topicName,
          content: req.body.topiccontent,
          userName: verifyuser.userName,
        });
        // console.log(oldtopic);
        const content = req.body.topiccontent;
        splited = content.split(/[,-:_''"";?|.{}()]/);

        var contentobj = new Content({
          topicName: oldtopic.topicName,
        });
        for (let i = 0; i < splited.length - 1; i++) {
          contentobj.contentsplit.push({
            sentence: splited[i],
            value: 0,
          });
        }
        await contentobj.save();
        let data = await Content.findOne({ topicName: req.body.topicName });
        splited = data.contentsplit;
      } else {
        let data = await Content.findOne({ topicName: oldtopic.topicName });
        splited = data.contentsplit;
      }
    }
    //console.log(splited);

    const name = verifyuser.userName;
    return res.render("topics_content", {
      title: "topics",
      name: name,
      content: oldtopic.content,
      topic: oldtopic.topicName,
      split: splited,
    });
  } catch (err) {
    console.log(err);
    return res.status(401).send("unauthorized");
  }
};

module.exports.colorchange = async function (req, res) {
  try {
    var topic = req.query.topic;
    var index = req.query.index;
    var value = req.body.value;
    console.log(topic, index, value);
    let olddata = await Content.findOne({ topicName: topic });
    let arr = olddata.contentsplit;
    // let sentence=arr[index];
    // sentence.value=value;
    arr[index].value = value;
    let data = await Content.findOneAndUpdate(
      { topicName: topic },
      {
        contentsplit: arr,
      }
    );
    console.log(data);

    let rentopic = await Topics.findOne({ topicName: topic });
    return res.render("topics_content", {
      title: "topics",
      name: rentopic.userName,
      content: rentopic.content,
      topic: rentopic.topicName,
      split: olddata.contentsplit,
    });

    //console.log(arr);
  } catch (err) {
    console.log(err);
    return res.status(401).send("unauthorized");
  }
};

module.exports.topicpage = async function (req, res) {
  try {
    var topicname = req.params.topic;
    let oldtopic = await Topics.findOne({ topicName: topicname });

    let olddata = await Content.findOne({ topicName: topicname });
    let arr = olddata.contentsplit;

    return res.render("topics_content", {
      title: "topics",
      name: oldtopic.userName,
      content: oldtopic.content,
      topic: oldtopic.topicName,
      split: arr,
    });
  } catch (err) {
    console.log(err);
    return res.status(401).send("unauthorized");
  }
};
