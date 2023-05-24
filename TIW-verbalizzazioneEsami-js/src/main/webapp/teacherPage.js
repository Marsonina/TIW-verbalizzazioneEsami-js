/**
 * TeacherPage
 */
let courses,exams, pageManager = new PageManager();

window.addEventListener("load", ()=>{
	if(sessionStorage.getItem("user") == null){
		window.location.href = "index.html";
	} else {
		pageManager.start();
		//pageManager.refresh();
	}
},false);

/*function UserInfo(_user, _userInfoContainer){
	this.name = _user.name;
	this.surname = _user.surname;
	this.matricola = _user.matricola;
	this.role = _user.role;
	
	this.show = function(){
		_userInfoContainer.name = this.name;
		_userInfoContainer.surname = this.surname;
		_userInfoContainer.matricola = this.matricola;
		_userInfoContainer.role = this.role;
		console.log(this.name);
		console.log(this.surname);
		console.log(this.matricola);
	}
}

function PageManager(){
	var info = document.getElementById("userInfo");
	this.start = function(){
		userInfo = new UserInfo(JSON.parse(sessionStorage.getItem("user")), info)
		userInfo.show();
		console.log(info.name);
		console.log(info.surname);
		console.log(info.matricola);
	}
}*/
function UserInfo(_user, _userInfoContainer){
  this.name = _user.name;
  this.surname = _user.surname;
  this.matricola = _user.matricola;
  this.role = _user.role;
  this.container = _userInfoContainer;

  this.show = function(){
    this.container.querySelector('#name').innerText = this.name;
    this.container.querySelector('#surname').innerText = this.surname;
    this.container.querySelector('#matricola').innerText = this.matricola;
    this.container.querySelector('#role').innerText = this.role;
  }
}

function PageManager(){
  var info = document.getElementById("userInfo");

  this.start = function(){
    var user = JSON.parse(sessionStorage.getItem("user"));
    userInfo = new UserInfo(user, info);
    userInfo.show();
  }
}
