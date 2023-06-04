/**
 * Student page
 */
let pageManager = new PageManager();

//function to load the 'first' page
window.addEventListener("load", ()=>{
	if(sessionStorage.getItem("user") == null){
		window.location.href = "index.html";
	} else {
		pageManager.refresh();
		pageManager.start();
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

//Display courses list
function CoursesList(_title, _coursescontainer, _courseslist) {
  this.title = _title;
  this.coursescontainer = _coursescontainer;
  this.courseslist = _courseslist;

  this.reset = function() {
    this.coursescontainer.style.display = "none";
    this.title.textContent = " ";
  };

  this.show = function() { 
    var self = this;
    makeCall("GET", "GoToHomeStudent", null, function(req) {
      if (req.readyState == 4) {
        var message = req.responseText;
        if (req.status == 200) {
          var response = JSON.parse(req.responseText);
          var coursesToShow = JSON.parse(response.courses);
          if (coursesToShow.length == 0) {
            self.coursescontainer.textContent = "No courses!";
            return;
          }
          self.update(coursesToShow);
        } else if (req.status == 403) {
          window.location.href = req.getResponseHeader("Location");
          window.sessionStorage.removeItem('user');
        } else {
          console.log(message);
        }
      }
    });
  };

  this.update = function(arraycourses) {
	  document.getElementById('viewTitle').textContent = "Polimi servizi online";
	  this.title.textContent = "Select a date and choose an exam!"; 
	
	  var tableBody = this.courseslist;
	  tableBody.innerHTML = ""; // Svuota il corpo della tabella
	
	  arraycourses.forEach(function(course) {  
      var row = document.createElement("tr");
      
      // Cella per l'ID del corso
      var idCell = document.createElement("td");
      idCell.textContent = course.courseId;
      row.appendChild(idCell);
      
      // Cella per il nome del corso come link
      var nameCell = document.createElement("td");
      var courseLink = document.createElement("a");
      nameCell.appendChild(courseLink);
      courseLink.textContent = course.courseName;
      courseLink.setAttribute("href", "#");
      courseLink.setAttribute('courseId',course.courseId);
      
	  courseLink.removeEventListener("click", handleClick);    
      courseLink.addEventListener("click", handleClick);
	
	  function handleClick(e) {
	    var allRows = document.querySelectorAll("tr");
        allRows.forEach(function(row) {
        	row.classList.remove("current");
        });
        row.classList.add("current");
	    examsList.show(e.target.getAttribute("courseId"));
	  }
	             
      row.appendChild(nameCell);
      tableBody.appendChild(row);
    });
    this.coursescontainer.style.display = "block"; 
  };
}


//Display exams list
function ExamsList(_title, _examslist){
	this.title = _title;
	this.examslist = _examslist;
	this.selectedCourseId = null;
	var form = document.getElementById('goToViewRes');
    this.examDate = form.querySelector('select[name="examDate"]');
    
    this.reset = function() {
    	this.examslist.style.display = "none";
    };

  	this.show = function(courseId) {
		document.getElementById("noExams").textContent = " ";  
		this.examslist.style.display = "block"; 
	    var self = this;
	    makeCall("GET", "GoToHomeStudent?courseId="+courseId, null, function(req) {
	      if (req.readyState == 4) {
	        var message = req.responseText;
	        if (req.status == 200) {
	          var response = JSON.parse(req.responseText);
	          var examsToShow = JSON.parse(response.exams);
	          if (examsToShow.length == 0) {
				  document.getElementById("noExams").textContent = "No exam date for course number " + courseId;
				  self.reset();			  
	              return;
	          }else{
				  document.getElementById("noExams").textContent = " ";
			  }
	          self.update(examsToShow);
	        } else if (req.status == 403) {
	          window.location.href = req.getResponseHeader("Location");
	          window.sessionStorage.removeItem('user');
	        } else {
	          console.log(message);
	        }
	      }
	    });
	    this.selectedCourseId = courseId;
  };
	
  this.update = function(arrayexams) {
	  this.title.textContent = "Exam dates for the course number: " + this.selectedCourseId;
	  var examDateElement = this.examDate 
	  // Clear any existing options from the select element
	  examDateElement.innerHTML = '';
	  // Create and append new option elements based on the date array
	  arrayexams.forEach(function(date) {
	    var option = document.createElement('option');
	    option.textContent = date.date;
	    examDateElement.appendChild(option);
	  });
  };
  
  this.examSelection = function(self){
	  // Remove existing event listener (if any)
	  document.getElementById("viewRes").removeEventListener("click", handleClick);
	  document.getElementById("viewRes").addEventListener("click", handleClick);
	  // Add event listener
	  function handleClick(e) {
	    var selectedExam = self.examDate.value;
	    result.show(self.selectedCourseId, selectedExam);
	  }
  }	
}

//Display the result page
function Result(_title,_resultcontainer){
	this.title = _title;
	this.resultcontainer = _resultcontainer;
	this.examDate = null;
	this.courseId = null;
	
	this.reset = function() {
		this.title.style.display = "none";
		this.resultcontainer.style.display = "none";
	};
	
	this.show = function(courseid, examdate){
		pageManager.refresh();
	  	pageManager.returnHome();
		this.title.style.display = "block"; 
		this.resultcontainer.style.display = "block";
	    var self = this;
	    makeCall("GET", "ExamResult?courseId="+courseid+"&examDate="+examdate, null, function(req) {
	      if (req.readyState == 4) {
	        var message = req.responseText;
	        if (req.status == 200) {
	          var response = JSON.parse(req.responseText);
	          if(response.resultState === "NON INSERITO" || response.resultState === "INSERITO") {
				  document.getElementById("examInfo").textContent = "Il voto non è disponibile";
	            return;
	          }
	          self.update(response);
	        } else if (req.status == 403) {
	          window.location.href = req.getResponseHeader("Location");
	          window.sessionStorage.removeItem('user');
	        } else {
	          console.log(message);
	        }
	      }
	    });
	    this.examDate = examdate;
	    this.courseId = courseid;
	}
	
	this.update = function (student){
		document.getElementById('viewTitle').textContent = " Exam result "
		this.title.textContent = "Course id: " + this.courseId +"\n" +"Exam date: "+this.examDate;	
		var matricolaElement = document.getElementById('matricola2');
		var nameElement = document.getElementById('name2');
		var surnameElement = document.getElementById('surname2');
		var degreeElement = document.getElementById('degree');
		var emailElement = document.getElementById('email');
		var resultElement = document.getElementById('result');
		var resultStateElement = document.getElementById('resultstate');
		var refuseButton = document.getElementById('refusebotton');
		
		// Popola i valori dei campi con i dati dello studente
		matricolaElement.textContent = student.matricola;
		nameElement.textContent  = student.name;
		surnameElement.textContent  = student.surname;
		degreeElement.textContent  = student.degree;
		emailElement.textContent  = student.email;
		resultElement.textContent  = student.result;
		resultStateElement.textContent  = student.resultState;
		
		//conditions to disabled the botton refuse
		  if (student.resultState === 'PUBBLICATO') {
		    refuseButton.disabled = false;
		  } else if (student.resultState === 'RIFIUTATO'){
		     document.getElementById('refuse').textContent="Il voto è stato rifiutato"
		  } else if (student.resultState === 'VERBALIZZATO'){
			  refuseButton.disabled = true;
		  }		
	}
	
	this.refuseMark = function (self){
	  // Remove existing event listener (if any)
	  document.getElementById('refusebotton').removeEventListener("click", handleClick);
	  document.getElementById('refusebotton').addEventListener("click", handleClick);
	  // Add event listener
	  function handleClick(e) {
	    refuse(self.examDate,self.courseId); 
	  }
	}	
}


refuse = function(examdate,courseid){
    makeCall("GET", "RefuseMark?courseId="+courseid+"&examDate="+examdate, null, function(req) {
      if (req.readyState == 4) {
        var message = req.responseText;
        if (req.status == 200) {
          var response = JSON.parse(req.responseText);
          result.update(response);
        } else if (req.status == 403) {
          window.location.href = req.getResponseHeader("Location");
          window.sessionStorage.removeItem('user');
        } else {
          console.log(message);
        }
      }
    });
}

	
//Function to manage the page
function PageManager(){
  	var info = document.getElementById("userInfo");
    var user = JSON.parse(sessionStorage.getItem("user"));
    userInfo = new UserInfo(user, info);
    coursesList = new CoursesList(document.getElementById("title1"),
    document.getElementById("courses_container"),document.getElementById("courses_list")); 
    examsList = new ExamsList(document.getElementById("title2"),document.getElementById("goToViewRes"));   
   	result = new Result(document.getElementById("title3"),document.getElementById("examInfo"));
    document.getElementById("homePage").style.display = "none";
    
     document.querySelector("a[href='Logout']").addEventListener('click', () => {
        window.sessionStorage.removeItem('username');
     })
      
    this.start = function(){
	    userInfo.show();
	    coursesList.show();
	    examsList.examSelection(examsList);
	    result.refuseMark(result);
    }
  
  	this.refresh = function(){
		document.getElementById("homePage").style.display = "none";
		document.getElementById("noExams").textContent = " ";
		coursesList.reset();
		examsList.reset();
		result.reset();
	}
	
	document.getElementById("homePage").addEventListener('click', function() {
		pageManager.refresh();
		coursesList.show();
	 });
	
	this.returnHome = function(){
	    document.getElementById("homePage").style.display = "block";
     }

}

