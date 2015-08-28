//created by yinshawn rao on 2015/08/27

;
(function() {
	function Imager() {

		/*
		dom选择器
		 */
		$ = function(dom) {
			return document.querySelector(dom);
		};

		/*
		dom元素
		 */
		this.preview = $("#preview");
		this.vbox = $(".viewbox");
		this.uploader = $("#uploader");
		this.tip = $(".uploadtip");
		this.spinner = $(".spinner");
		this.openImg = $("#openImg");

		/*
		按钮组件
		 */
		this.button = {
			delImg: $("#deleteCurImg"),
			rstImg: $("#resetCurImg"),
			cgWH: $("#changeWH"),
			folW: $("#followWW"),
			folH: $("#followHH"),
			rot90: $("#rotate90")
		};

		/*
		输入框组件
		 */
		this.textInput = {
			cgW: $("#changeW"),
			cgH: $("#changeH"),
			flW: $("#followW"),
			flH: $("#followH")
		};

		/*
		预定义变量
		 */
		this.ww = window.innerWidth;
		this.wh = window.innerHeight;
		this.maxW = this.ww - 100; //最大宽度
		this.warns = "请上传图片后再操作！"; //未上传图片提提示语

		/*
		预声明变量
		 */
		this.dataURL; //base64编码
		this.orgW; //初始渲染宽度
		this.orgH; //初始渲染高度
		this.canvas;
		this.ctx;
		this.init();
	}

	Imager.prototype = {

		/**
		 * 入口
		 * @return {[type]} [description]
		 */
		init: function() {
			this.liveEvents();
		},

		/**
		 * 注册常驻事件
		 * @return {[type]} [description]
		 */
		liveEvents: function() {
			var _this = this;
			var btn = this.button; //按钮组件
			var ipt = this.textInput; //输入框组件

			/*
			点击上传
			 */
			this.uploader.onchange = function() {
				_this.upload(this, _this);
			};

			/*
			没有图片另存为菜单时弹出新窗口获取图片
			 */
			this.openImg.onclick = function() {
				if (_this.canvas) {
					window.open(_this.canvas.toDataURL()); //在新窗口打开处理后的图片
				} else {
					alert(_this.warns);
				}
			};

			/*
			删除图片
			 */
			btn.delImg.onclick = function() {
				if (_this.canvas) {
					if (confirm("你确定要删除当前图片吗？")) { //防止误操作
						_this.preview.className = "";
						_this.preview.innerHTML = "";
						_this.preview.appendChild(_this.tip);
						_this.uploader.style.zIndex = "99"; //文件域层级置顶
					}
				} else {
					alert(_this.warns);
				}
			};

			/*
			重置图片
			 */
			btn.rstImg.onclick = function() {
				ipt.flW.value = "";
				ipt.flH.value = "";
				//还原所有data-clicked
				if (_this.canvas) {
					_this.reRender(_this.orgW, _this.orgH);
					_this.updateVal(_this.orgW, _this.orgH);
				} else {
					alert(_this.warns);
				}
			};

			/*
			指定值修改宽高
			 */
			btn.cgWH.onclick = function() {
				ipt.flW.value = "";
				ipt.flH.value = "";
				if (_this.canvas) {
					var wVal = ipt.cgW.value;
					var hVal = ipt.cgH.value;
					if (wVal === "" || hVal === "") {
						alert("参数未填写完整！");
					} else if (wVal <= 0 || hVal <= 0) {
						alert("宽高必须为大于0的数字！");
					} else if (wVal >= _this.maxW || hVal > 10000) {
						alert("宽高超过限制！");
					} else {
						_this.reRender(ipt.cgW.value, ipt.cgH.value);
					}
				} else {
					alert(_this.warns);
				}
			};

			/*
			以宽度为基准，按比例修改
			 */
			btn.folW.onclick = function() {
				ipt.flH.value = "";
				if (_this.canvas) {
					var wVal = ipt.flW.value;
					if (wVal === "") {
						alert("参数未填写完整！");
					} else if (wVal <= 0) {
						alert("宽高必须为大于0的数字！");
					} else if (wVal >= _this.maxW) {
						alert("宽度超过限制！");
					} else {
						var relatedH = _this.getRelativeH(wVal); //以宽度为准计算高度
						_this.updateVal(wVal, relatedH);
						_this.reRender(wVal, relatedH);
					}
				} else {
					alert(_this.warns);
				}
			};

			/*
			以高度为基准，按比例修改
			 */
			btn.folH.onclick = function() {
				ipt.flW.value = "";
				if (_this.canvas) {
					var hVal = ipt.flH.value;
					if (hVal === "") {
						alert("参数未填写完整！");
					} else if (hVal <= 0) {
						alert("宽高必须为大于0的数字！");
					} else if (hVal >= 10000) {
						alert("高度超过限制！");
					} else {
						var relatedW = _this.getRelativeW(hVal); //以高度为准算出宽度
						_this.updateVal(relatedW, hVal);
						_this.reRender(relatedW, hVal);
					}
				} else {
					alert(_this.warns);
				}
			};

			/*
			旋转90度
			 */
			btn.rot90.onclick = function() {
				if (_this.canvas) {
					var bol = parseInt(this.dataset.clicked);
					if (!bol) {
						this.dataset.clicked = 1;
						var size = _this.getCurSize(_this.canvas);
						var w = size.w;
						var h = size.h;
						_this.rotateCtx(w, h, 90);
					} else {
						alert(this.dataset.clicked);
						//旋转0度
					}
				} else {
					alert(_this.warns);
				}
			}
		},

		/**
		 * 上传图片并得到base64
		 * @param  {[type]} file  [description]
		 * @param  {[type]} _this [description]
		 * @return {[type]}       [description]
		 */
		upload: function(file, _this) {
			_this.preview.innerHTML = "";
			_this.spinner.style.display = "block"; //显示loading
			var reader = new FileReader();
			reader.readAsDataURL(file.files[0]); //以base64方式读取
			reader.onload = function(e) {
				_this.dataURL = e.target.result; //获取base64
				_this.render(_this.dataURL);
			}
		},

		/**
		 * 渲染上传的图片
		 * @param  {[type]} url [description]
		 * @return {[type]}     [description]
		 */
		render: function(url) {
			var _this = this;
			this.preview.innerHTML = '<canvas id="canvas"></canvas>';
			this.canvas = document.querySelector("#canvas");
			this.canvas.innerHTML = "你的浏览器不支持canvas，请更换高级浏览器后再使用！";
			this.ctx = this.canvas.getContext("2d");
			var img = new Image();
			img.src = url;
			img.onload = function() {
				var w = _this.fixSize(img.width, img.height).w;
				var h = _this.fixSize(img.width, img.height).h;
				_this.orgW = w;
				_this.orgH = h;
				_this.updateVal(w, h);
				_this.canvas.width = w;
				_this.canvas.height = h;
				_this.preview.className = "auto"; //将预览窗口由固定宽高改为自适应宽高
				_this.ctx.drawImage(img, 0, 0, w, h);
				_this.spinner.style.display = "none";
				_this.uploader.style.zIndex = "-1"; //文件域层级置底
			}
		},

		/**
		 * 当图片宽度超过限制宽度时的处理
		 * @param  {[type]} w [description]
		 * @param  {[type]} h [description]
		 * @return {[type]}   [description]
		 */
		fixSize: function(w, h) {
			var fixW, fixH;
			if (w > this.maxW) {
				fixW = this.maxW;
				fixH = parseInt(h / w * this.maxW);
			} else {
				fixW = w;
				fixH = h;
			}
			return {
				w: fixW,
				h: fixH
			}
		},

		/**
		 * 获取相对比例的高度
		 * @param  {[type]} w [description]
		 * @return {[type]}   [description]
		 */
		getRelativeH: function(w) {
			return parseInt(w * this.orgH / this.orgW);
		},

		/**
		 * 获取相对比例的宽度
		 * @param  {[type]} h [description]
		 * @return {[type]}   [description]
		 */
		getRelativeW: function(h) {
			return parseInt(h * this.orgW / this.orgH);
		},

		/**
		 * 二次渲染
		 * @param  {[type]} w [description]
		 * @param  {[type]} h [description]
		 * @return {[type]}   [description]
		 */
		reRender: function(w, h) {
			var _this = this;
			var img = new Image();
			img.src = this.dataURL;
			img.onload = function() {
				_this.canvas.width = w;
				_this.canvas.height = h;
				_this.ctx.drawImage(img, 0, 0, w, h);
			}
		},

		/**
		 * 旋转图像
		 * @return {[type]} [description]
		 */
		rotateCtx: function(w, h, deg) {
			var _this = this;
			var img = new Image();
			img.src = this.dataURL;
			img.onload = function() {
				_this.canvas.width = h;
				_this.canvas.height = w;
				switch (deg) {
					case 90:
						_this.ctx.translate(_this.canvas.width, 0); //旋转90度前，画布需沿x轴左移一个单位距离
						break;
					case 180:
						break;
					case 270:
						break;
					default:
						break;
				}
				_this.ctx.rotate(deg * Math.PI / 180);
				_this.ctx.drawImage(img, 0, 0, w, h);
				_this.updateVal(h, w);
			}
		},

		/**
		 * 获取当前状态图像的宽高
		 * @param  {[type]} canvas [description]
		 * @return {[type]}        [description]
		 */
		getCurSize: function(canvas) {
			var arr = canvas.getBoundingClientRect();
			return {
				w: arr.width,
				h: arr.height
			};
		},

		/**
		 * 更新宽度高度输入框的值
		 * @param  {[type]} w [description]
		 * @param  {[type]} h [description]
		 * @return {[type]}   [description]
		 */
		updateVal: function(w, h) {
			this.textInput.cgW.value = w;
			this.textInput.cgH.value = h;
		}
	}

	window["Imager"] = Imager; //提供句柄返回给闭包外

	return new Imager(); //即时执行
})()