const User = require("../models/users");
const Topics = require("../models/Topics");
const Content = require("../models/content");
const jwt = require("jsonwebtoken");

module.exports.home = function (req, res) {
  return res.render("home", {
    title: "home",
  });
};

//Creating user
//USER ENTERS HIS/HER USERNAME AND PRESS ENTER WHICH REDIRECTS TO THE DASHBOARD.
module.exports.create = function (req, res) {
  User.findOne({ userName: req.body.userName }, function (err, user) {
    if (err) {
      console.log("error in finding user in sign up");
      return;
    }
    if (!user) {
      //creating the user
      User.create(req.body, function (err, user) {
        console.log(user);
        if (err) {
          console.log("error in creating user in sign up");
          return;
        }
        //creating the token
        var token = jwt.sign(user.toJSON(), "radha", { expiresIn: "1000000" });
        //handle session creation
        res.cookie("jwt", token);
        return res.redirect("/dashboard");
      });
    } else {
      var token = jwt.sign(user.toJSON(), "radha", { expiresIn: "100000000" });
      // console.log(token);
      //handle session creation
      res.cookie("jwt", token);
      return res.redirect("/dashboard");
    }
  });
};

//Creating Dashboard
//USER CAN ADD NEW TOPIC AND ALSO SEE THE PROGRESS OF THE OLD CONTENT TOPICS HE HAS WRITTEN SO FAR
module.exports.dashboard = async function (req, res) {
  try {
    const token = req.cookies.jwt;
    //verifying the user from the cookie
    const verifyuser = jwt.verify(token, "radha");
    //finding the user from database
    let data = await Topics.find({ userName: verifyuser.userName });
    //for maintaining total percentage covered in the topic
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
      var percentage =parseInt( (total / (array.length * 4)) * 100);
      show.push(percentage);
      total = 0;
    }
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

//Content page for fresh creating the topic
//AFTER CLICKING ON ADD TOPIC ON DASHBOARD,USER REACHES TO THE ADD TOPIC SCREEN WITH A TEXT FILED TO ADD TOPIC TITLE ON TOP AND TEXT AREA BELOW IT, TO WRITE ABOUT THE TOPIC.

module.exports.topicspage = async function (req, res) {
  try {
    const token = req.cookies.jwt;
    //verifying the user from the cookie
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

//When the user will click on submit button, the user will create a topic in his/her account
module.exports.createtopic = async function (req, res) {
  try {
    const token = req.cookies.jwt;
    //verifying the user from the cookie
    const verifyuser = jwt.verify(token, "radha");
    //finding the topic is present in the user database or not
    let oldtopic = await Topics.findOne({ topicName: req.body.topicName });
    //console.log(oldtopic);
    var splited = [];
    //checking if user is present or not
    if (verifyuser) {
      //if topic is not present in the user database then user will create the new topic
      if (!oldtopic) {
        oldtopic = await Topics.create({
          topicName: req.body.topicName,
          content: req.body.topiccontent,
          userName: verifyuser.userName,
        });
        const content = req.body.topiccontent;
        //splited = content.split(/[,-:_''"";?|.{}()]/);
        let splitedsymbols = [".", ",", ";", ":", "/", "-", "?", "|","@"];
        let index;
        let startingindex = 0;

        for (index = 0; index < content.length; index++) {
          for (let i = 0; i < splitedsymbols.length; i++) {
            if (content.charAt(index) == splitedsymbols[i]) {
              let splitedsentense = content.substring(startingindex, index+1);
              splited.push(splitedsentense);
              startingindex=index+1;

            }
          }
        }
        // if(startingindex<content.length){
           let splitedsentense = content.substring(startingindex, index+1);
               splited.push(splitedsentense);
        // }
    
        //let splitedsentense = content.substring(startingindex, index);

    




        
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
      } 
      //checking if the verifying user and topic user name is same or not
      else if (verifyuser.userName==oldtopic.userName)  {
        let data = await Content.findOne({ topicName: oldtopic.topicName });
        splited = data.contentsplit;
      }
    }

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


//To change the colour of the content A/C to the value assign
module.exports.colorchange = async function (req, res) {
  try {
    var topic = req.query.topic;
    var index = req.query.index;
    var value = req.body.value;
    //console.log(topic, index, value);
    let olddata = await Content.findOne({ topicName: topic });
    let arr = olddata.contentsplit;
    arr[index].value = value;
    //for changing the value of the sentense a/c to the understanding and to reflect the colour
    let data = await Content.findOneAndUpdate(
      { topicName: topic },
      {
        contentsplit: arr,
      }
    );
    //console.log(data);

    let rentopic = await Topics.findOne({ topicName: topic });
    return res.render("topics_content", {
      title: "topics",
      name: rentopic.userName,
      content: rentopic.content,
      topic: rentopic.topicName,
      split: olddata.contentsplit,
    });

  } catch (err) {
    console.log(err);
    return res.status(401).send("unauthorized");
  }
};


//to redirect to the content page when user will click on topic in dashboard page
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


//update
module.exports.update=async function(req,res){
  try{
    

  }catch(err){

  }
}
