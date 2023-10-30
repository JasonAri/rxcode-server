const express = require("express");
const app = express();

app.use(express.static(__dirname + "/public"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 允许跨域
app.all("*", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

// vxid和兑奖码 (实际从数据库引入)
let userInfoList = require("./mock.js");

app.get("/admin", (req, res) => {
  res.send({ code: 200, data: userInfoList, msg: "OK" });
});

// api
app.post("/rxcode", (req, res) => {
  console.log('post /rxcode')

  let resultData = {};
  // 解构vxid
  const { vxid } = req.body;
  // vxid非空判断
  if (!vxid) {
    res.send({ code: 201, data: resultData, msg: "vxid不能为空" });
    return;
  }

  // 后端查表 返回index
  const resIdx = userInfoList.findIndex((currentValue, index, arr) => {
    return currentValue.vxid === vxid;
  });

  // 查表无结果
  if (resIdx === -1) {
    res.send({ code: 202, data: resultData, msg: "vxid错误" });
  } else {
    // vxid命中
    let takenTime = userInfoList[resIdx].takenTime; // 读取领取时间
    // 判断领取状态
    if (takenTime === "未领取") {
      // 未领取
      resultData = { rxCode: userInfoList[resIdx].rxCode };
      // 标记领取时间
      takenTime = new Date().toLocaleString();
      userInfoList[resIdx].takenTime = takenTime;
      // 输出领取信息
      console.log(userInfoList[resIdx]);
      // 返回请求
      res.send({ code: 200, data: resultData, msg: "OK" });
    } else {
      // 已领取过
      res.send({ code: 203, data: resultData, msg: "该ID已被领取" });
    }
  }
});

app.listen(3000, () => {
  console.log("express serve listening...");
});
