//index.js
//获取应用实例
const app = getApp()

var baseUrl = "http://icons.maiyizhi.cn"
var jsonData = require('../data/data.js');
var canvas = wx.createCanvasContext('canvasIn');

Page({
  data: {
    picChoosed: false, // 标识是否显示首次进入提示
    squarePic: "", // 方形图片来源   为了减少再次点击的时候重绘
    roundPic: "", // 圆形图片来源  为了减少再次点击的时候重绘
    isSquare: true, // 当前是点击方还是圆
    tabs: ["圣诞", "边框", "加V", "小红点", "角标", "个性标签", "爱心", "生肖", "脸部", "帽子", "眼镜", "头饰", "代购", "心情"],
    currentTab: 0,
    currentIcon: 0, // 添加type的角标
    imageDatas: jsonData.dataList,
    canvasWidth: app.globalData.widthRatio * 500,
    bgPic: {
      src: "",
      width: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      nativeWidth: 0,
      nativeHeight: 0
    },
    typeIcons: [],
    hatSize: 80
  },

  onLoad: function() {
    this.setData({
      canvasWidth: app.globalData.widthRatio * 500
    })
  },

  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  /**
   * 方形图片选中
   */
  squareClick: function(e) {
    if (this.data.isSquare) {
      return;
    }
    var that = this;
    that.setData({
      isSquare: true
    })
    canvas.clearRect(0, 0, this.data.canvasWidth, this.data.canvasWidth)
    canvas.save();
    canvas.drawImage(this.data.squarePic, 0, 0, this.data.canvasWidth, this.data.canvasWidth)
    canvas.draw()
  },
  /**
   * 圆形图片选项选中
   */
  roundClick: function(e) {

    if (!this.data.isSquare) {
      return;
    }
    var that = this;
    that.setData({
      isSquare: false
    })
    if (that.data.roundPic != "") {
      canvas.clearRect(0, 0, that.data.canvasWidth, that.data.canvasWidth);
      canvas.save();
      canvas.drawImage(that.data.roundPic, 0, 0, that.data.canvasWidth, that.data.canvasWidth); // 推进去图片，必须是https图片
      canvas.draw(); //可将之前在绘图上下文中的描述（路径、变形、样式）画到 canvas 中
      canvas.restore();
      return;
    }

    var radius = that.data.canvasWidth / 2;
    console.log("裁剪圆形  radius =" + radius);
    canvas.clearRect(0, 0, that.data.canvasWidth, that.data.canvasWidth);
    canvas.save();
    canvas.beginPath();
    canvas.arc(radius, radius, radius, 0, Math.PI * 2, false);
    canvas.clip();
    canvas.drawImage(that.data.bgPic.src, 0, 0, that.data.canvasWidth, that.data.canvasWidth); // 推进去图片，必须是https图片
    canvas.draw(); //可将之前在绘图上下文中的描述（路径、变形、样式）画到 canvas 中
    canvas.restore();

    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: that.data.canvasWidth,
      height: that.data.canvasWidth,
      destWidth: that.data.bgPic.nativeWidth,
      destHeight: that.data.bgPic.nativeWidth,
      canvasId: 'canvasIn',
      success(res) {
        console.log(res.tempFilePath);
        that.setData({
          roundPic: res.tempFilePath
        })
      }
    })

  },
  /**
   * 标签导航点击
   */
  tabClick: function(e) {
    console.log("标签导航点击 e" + JSON.stringify(e))
    this.setData({
      currentTab: e.currentTarget.dataset.index
    })
  },
  /**
   * 图片点击
   */
  iconClick: function(e) {
    console.log("图片点击 e" + JSON.stringify(e))
    if (!this.data.picChoosed) {
      wx.showToast({
        title: "请先选择一张图片作为头像",
        icon: "none"
      })
    }
    var icon = {
      src: this.data.imageDatas[this.data.currentTab][e.currentTarget.dataset.index],
      cancelCenterX: app.globalData.widthRatio * 250-50,
      cancelCenterY: app.globalData.widthRatio * 250-50,
      handleCenterX: app.globalData.widthRatio * 250+30,
      handleCenterY: app.globalData.widthRatio * 250+30,
      hatCenterX: app.globalData.widthRatio * 250,
      hatCenterY: app.globalData.widthRatio * 250,
      scale: 1,
      rotate: 0
    }
    var icons = this.data.typeIcons.concat(icon)
    this.setData({
      typeIcons: icons
    })

  },
  /**
   * 打开相册
   */
  openPhoto: function(res) {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ["original", "compressed"],
      sourceType: ['album', 'camera'],
      success: (res) => {
        var tempFilePaths = res.tempFilePaths;
        console.log("打开相册:" + res);
        that.setData({
          'bgPic.src': res.tempFilePaths[0],
          squarePic: res.tempFilePaths[0],
          roundPic: "",
        });
        canvas.clearRect(0, 0, this.data.canvasWidth, this.data.canvasWidth)
        canvas.save();
        canvas.drawImage(res.tempFilePaths[0], 0, 0, this.data.canvasWidth, this.data.canvasWidth)
        canvas.draw()

        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success: function(result) {
            that.setData({
              'bgPic.nativeWidth': result.width,
              "bgPic.nativeHeight": result.height
            })
          }
        })
        this.assignPicChoosed(true);
      },
      fail: (res) => {
        this.assignPicChoosed(false);
      },
      complete: (res) => {

      },
    })
  },
  /**
   * 使用微信头像
   */
  openWXPhoto: function(e) {

  },
  /**
   * 预览
   */
  openPreview: function(e) {

  },
  /**
   * 指定图片选择
   */
  assignPicChoosed: function(isSuccess) {
    this.setData({
      picChoosed: isSuccess
    })
  },
  touchStart(e) {
    console.log("touchStart" + JSON.stringify(e))
    this.setData({
      currentIcon: e.target.dataset.index
    })
    this.hat_center_x = this.data.typeIcons[this.data.currentIcon].hatCenterX;
    this.hat_center_y = this.data.typeIcons[this.data.currentIcon].hatCenterY;
    this.cancel_center_x = this.data.typeIcons[this.data.currentIcon].cancelCenterX;
    this.cancel_center_y = this.data.typeIcons[this.data.currentIcon].cancelCenterY;
    this.handle_center_x = this.data.typeIcons[this.data.currentIcon].handleCenterX;
    this.handle_center_y = this.data.typeIcons[this.data.currentIcon].handleCenterY;
    this.scale = this.data.typeIcons[this.data.currentIcon].scale;
    this.rotate = this.data.typeIcons[this.data.currentIcon].rotate;
    this.touch_target = "";
    this.start_x = 0;
    this.start_y = 0;
    if (e.target.id == "hat") {
      this.touch_target = "hat";
    } else if (e.target.id == "handle") {
      this.touch_target = "handle"
    } else {
      this.touch_target = ""
    };

    if (this.touch_target != "") {
      this.start_x = e.touches[0].clientX;
      this.start_y = e.touches[0].clientY;
    }
  },
  touchEnd(e) {
    console.log("touchEnd" + JSON.stringify(e))
    this.hat_center_x = this.data.typeIcons[this.data.currentIcon].hatCenterX;
    this.hat_center_y = this.data.typeIcons[this.data.currentIcon].hatCenterY;
    this.cancel_center_x = this.data.typeIcons[this.data.currentIcon].cancelCenterX;
    this.cancel_center_y = this.data.typeIcons[this.data.currentIcon].cancelCenterY;
    this.handle_center_x = this.data.typeIcons[this.data.currentIcon].handleCenterX;;
    this.handle_center_y = this.data.typeIcons[this.data.currentIcon].handleCenterY;
    this.touch_target = "";
    this.scale = this.data.typeIcons[this.data.currentIcon].scale;
    this.rotate = this.data.typeIcons[this.data.currentIcon].rotate;
  },
  touchMove(e) {
    console.log("touchMove" + JSON.stringify(e))
    var current_x = e.touches[0].clientX;
    var current_y = e.touches[0].clientY;
    var moved_x = current_x - this.start_x;
    var moved_y = current_y - this.start_y;
    var currIcon = this.data.currentIcon;
    if (this.touch_target == "hat") {
      this.setData({
        ["typeIcons[" + currIcon + "].hatCenterX"]: this.data.typeIcons[this.data.currentIcon].hatCenterX + moved_x,
        ["typeIcons[" + currIcon + "].hatCenterY"]: this.data.typeIcons[this.data.currentIcon].hatCenterY + moved_y,
        ["typeIcons[" + currIcon + "].cancelCenterX"]: this.data.typeIcons[this.data.currentIcon].cancelCenterX + moved_x,
        ["typeIcons[" + currIcon + "].cancelCenterY"]: this.data.typeIcons[this.data.currentIcon].cancelCenterY + moved_y,
        ["typeIcons[" + currIcon + "].handleCenterX"]: this.data.typeIcons[this.data.currentIcon].handleCenterX + moved_x,
        ["typeIcons[" + currIcon + "].handleCenterY"]: this.data.typeIcons[this.data.currentIcon].handleCenterY + moved_y,
      })
    };
    if (this.touch_target == "handle") {
      let diff_x_before = this.handle_center_x - this.hat_center_x;
      let diff_y_before = this.handle_center_y - this.hat_center_y;
      let diff_x_after = this.data.typeIcons[this.data.currentIcon].handleCenterX - this.hat_center_x;
      let diff_y_after = this.data.typeIcons[this.data.currentIcon].handleCenterY - this.hat_center_y;
      let distance_before = Math.sqrt(diff_x_before * diff_x_before + diff_y_before * diff_y_before);
      let distance_after = Math.sqrt(diff_x_after * diff_x_after + diff_y_after * diff_y_after);
      let angle_before = Math.atan2(diff_y_before, diff_x_before) / Math.PI * 180;
      let angle_after = Math.atan2(diff_y_after, diff_x_after) / Math.PI * 180;
    
      console.log("scale=" + distance_after / distance_before * this.scale)
      this.setData({
        ["typeIcons[" + currIcon + "].handleCenterX"]: this.data.typeIcons[this.data.currentIcon].handleCenterX + moved_x,
        ["typeIcons[" + currIcon + "].handleCenterY"]: this.data.typeIcons[this.data.currentIcon].handleCenterY + moved_y,
        ["typeIcons[" + currIcon + "].cancelCenterX"]: 2 * this.data.typeIcons[this.data.currentIcon].hatCenterX - this.data.typeIcons[this.data.currentIcon].handleCenterX - 25,
        ["typeIcons[" + currIcon + "].cancelCenterY"]: 2 * this.data.typeIcons[this.data.currentIcon].hatCenterY - this.data.typeIcons[this.data.currentIcon].handleCenterY - 25,
        ["typeIcons[" + currIcon + "].scale"]: distance_after / distance_before * this.scale,
        ["typeIcons[" + currIcon + "].rotate"]: angle_after - angle_before + this.rotate,
      

      })
    }
    this.start_x = current_x;
    this.start_y = current_y;
   
 
  },


})