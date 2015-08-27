//created by yinshawn rao on 2015/08/27

;
(function() {
	function Imager() {
		this.preview = document.querySelector("#preview");
		this.uploader = document.querySelector("#uploader");
		this.tip = document.querySelector(".uploadtip");
		this.spinner = document.querySelector(".spinner");
		this.openImg=document.querySelector("#openImg");
		this.button = {
			delImg: document.querySelector("#deleteCurImg"),
			cgWH: document.querySelector("#changeWH")
		};
		this.textInput = {
			cgW: document.querySelector("#changeW"),
			cgH: document.querySelector("#changeH")
		}

		this.ww = window.innerWidth;
		this.wh = window.innerHeight;
		this.maxW = this.ww - 100;

		this.dataURL;
		this.canvas;
		this.ctx;
		this.init();
	}

	Imager.prototype = {
		init: function() {
			this.liveEvents();
		},
		liveEvents: function() {
			var _this = this;
			var btn = this.button;
			var ipt = this.textInput;
			this.uploader.onchange = function() {
				_this.upload(this, _this);
			};
			this.openImg.onclick=function(){
				if (_this.canvas) {
					window.open(_this.canvas.toDataURL());
				}
				else{
					alert("请上传图片后再操作！");
				}
			};
			btn.delImg.onclick = function() {
				if (_this.canvas) {
					if (confirm("你确定要删除当前图片吗？")) {
						_this.preview.className = "";
						_this.preview.innerHTML = "";
						_this.preview.appendChild(_this.tip);
						_this.uploader.style.zIndex = "99";
					}
				} else {
					alert("当前没有可删除的图片");
				}
			};
			btn.cgWH.onclick = function() {
				if (_this.canvas) {
					var wVal = ipt.cgW.value;
					var hVal = ipt.cgH.value;
					if (wVal === "" || hVal === "") {
						alert("参数未填写完整！");
					} else if (wVal <= 0 || hVal <= 0) {
						alert("宽高必须为大于0的数字");
					} else if (wVal >= _this.maxW) {
						alert("宽度不能超过当前窗口高度");
					} else {
						_this.handler_changeSize();
					}
				} else {
					alert("请上传图片后再操作！");
				}
			}
		},
		upload: function(file, _this) {
			_this.preview.innerHTML = "";
			_this.spinner.style.display = "block";
			var reader = new FileReader();
			reader.readAsDataURL(file.files[0]);
			reader.onload = function(e) {
				_this.dataURL = e.target.result;
				_this.render(_this.dataURL);
			}
		},
		render: function(url) {
			var _this = this;
			this.preview.innerHTML = '<canvas id="canvas"></canvas>';
			this.canvas = document.querySelector("#canvas");
			this.canvas.innerHTML="你的浏览器不支持canvas，请更换高级浏览器后再使用！";
			this.ctx = this.canvas.getContext("2d");
			var img = new Image();
			img.src = url;
			img.onload = function() {
				var w = _this.fixSize(img.width, img.height).w;
				var h = _this.fixSize(img.width, img.height).h;
				_this.textInput.cgW.value = w;
				_this.textInput.cgH.value = h;
				_this.canvas.width = w;
				_this.canvas.height = h;
				_this.preview.className = "auto";
				_this.ctx.drawImage(img, 0, 0, w, h);
				_this.spinner.style.display = "none";
				_this.uploader.style.zIndex = "-1";
			}
		},
		fixSize: function(width, height) {
			var fixW, fixH;
			if (width > this.maxW) {
				fixW = this.maxW;
				fixH = height / width * this.maxW;
			} else {
				fixW = width;
				fixH = height;
			}
			return {
				w: fixW,
				h: fixH
			}
		},
		handler_changeSize: function() {
			var _this = this;
			var img = new Image();
			img.src = this.dataURL;
			var w = this.textInput.cgW.value;
			var h = this.textInput.cgH.value;
			img.onload = function() {
				_this.canvas.width = w;
				_this.canvas.height = h;
				_this.ctx.drawImage(img, 0, 0, w, h);
			}
		}
	}
	window["Imager"] = Imager;
})()