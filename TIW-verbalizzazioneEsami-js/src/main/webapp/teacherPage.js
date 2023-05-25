/**
 * TeacherPage
 */
let courses,exams, pageManager = new PageManager();

//function to load the 'first' page
window.addEventListener("load", ()=>{
	if(sessionStorage.getItem("user") == null){
		window.location.href = "index.html";
	} else {
		pageManager.start();
		//pageManager.refresh();
	}
},false);


//Diplay the user information
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



//Manage the page
function PageManager(){
  var info = document.getElementById("userInfo");

  this.start = function(){
    var user = JSON.parse(sessionStorage.getItem("user"));
    userInfo = new UserInfo(user, info);
    userInfo.show();
    
  }
}
