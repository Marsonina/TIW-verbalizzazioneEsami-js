/**
 * Student page
 */
let courses,exams, pageManager = new PageManager();

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

function CoursesList(_title, _coursescontainer, _courseslist) {
  this.title = _title;
  this.coursescontainer = _coursescontainer;
  this.courseslist = _courseslist;

  this.reset = function() {
    this.coursescontainer.style.visibility = "hidden";
    this.title.textContent = " ";
  };

  this.show = function() {
	  pageManager.refresh();
	  this.coursescontainer.style.visibility = "visible";  
    var self = this;
    makeCall("GET", "GoToHomeStudent", null, function(req) {
      if (req.readyState == 4) {
        var message = req.responseText;
        if (req.status == 200) {
          var response = JSON.parse(req.responseText);
          var coursesToShow = JSON.parse(response.courses);
          if (coursesToShow.length == 0) {
            self.courseslist.textContent = "No courses!";
            return;
          }
          self.update(coursesToShow);
        } else if (req.status == 403) {
          window.location.href = req.getResponseHeader("Location");
          window.sessionStorage.removeItem('user');
        } else {
          self.courseslist.textContent = message;
        }
      }
    });
  };

  this.update = function(arraycourses) {
	  document.getElementById('viewTitle').textContent = " Polimi servizi online "
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
      courseLink.textContent = course.courseName;
      courseLink.setAttribute("href", "#");
     courseLink.addEventListener("click", function() {
		  var allRows = document.querySelectorAll("tr");
		  allRows.forEach(function(row) {
		    row.classList.remove("current");
		  });
		 row.classList.add("current");
        examsList.show(course.courseId)
  
      });
      nameCell.appendChild(courseLink);
      row.appendChild(nameCell);

      tableBody.appendChild(row);
    });
  };
}

//Exams list
function ExamsList(_title, _examslist){
	this.title = _title;
	this.examslist = _examslist;
	
  this.reset = function() {
    this.examslist.style.visibility = "hidden";
  };

  this.show = function(courseId) {
	this.examslist.style.visibility = "visible"; 
    var self = this;
    makeCall("GET", "GoToHomeStudent?courseId="+courseId, null, function(req) {
      if (req.readyState == 4) {
        var message = req.responseText;
        if (req.status == 200) {
          var response = JSON.parse(req.responseText);
          var examsToShow = JSON.parse(response.exams);
          console.log(examsToShow);
          console.log(courseId);
          if (examsToShow.length == 0) {
			  document.getElementById("noExams").textContent = "No exam date for course number " + courseId;
			  examsList.reset();			  
            return;
          }else{
			  document.getElementById("noExams").textContent = " ";
		  }
          self.update(examsToShow,courseId);
        } else if (req.status == 403) {
          window.location.href = req.getResponseHeader("Location");
          window.sessionStorage.removeItem('user');
        } else {
          console.log(message);
        }
      }
    });
  };
	
  this.update = function(arrayexams,courseid) {

	  this.title.textContent = "Exam dates for the course number: " + courseid;

	    // Get the form elements
	  var form = document.getElementById('goToViewRes');
	  var examDateElement = form.querySelector('select[name="examDate"]');
	
	  // Clear any existing options from the select element
	  examDateElement.innerHTML = '';
	
	  // Create and append new option elements based on the date array
	  arrayexams.forEach(function(date) {
	    var option = document.createElement('option');
	    option.textContent = date.date;
	    examDateElement.appendChild(option);
	  });
	  
	  document.getElementById("viewRes").addEventListener("click", function() {
		var selectedExam = examDateElement.value;
		result.show(courseid, selectedExam);
      });
  };
	
}

function Result(_title,_resultcontainer){
	this.title = _title;
	this.resultcontainer = _resultcontainer;
	
	this.reset = function() {
		this.title.style.visibility = "hidden";
		this.resultcontainer.style.visibility = "hidden";
	};
	
	this.show = function(courseid, examdate){
		pageManager.refresh();
	  pageManager.returnHome();
		this.title.style.visibility = "visible"; 
		this.resultcontainer.style.visibility = "visible";
	    var self = this;
	    makeCall("GET", "ExamResult?courseId="+courseid+"&examDate="+examdate, null, function(req) {
	      if (req.readyState == 4) {
	        var message = req.responseText;
	        if (req.status == 200) {
	          var response = JSON.parse(req.responseText);
	          console.log(response);
	          if(response.resultState === "NON INSERITO" || response.resultState === "INSERITO") {
				  document.getElementById("examInfo").textContent = "Il voto non è disponibile";
	            return;
	          }
	          self.update(examdate,courseid,response);
	        } else if (req.status == 403) {
	          window.location.href = req.getResponseHeader("Location");
	          window.sessionStorage.removeItem('user');
	        } else {
	          console.log(message);
	        }
	      }
	    });
	}
	
	this.update = function (examdate,courseid,student){
		document.getElementById('viewTitle').textContent = " Exam result "
		  this.title.textContent = "Course id: " + courseid +"\n" +"Exam date: "+examdate;	

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
		  console.log(student.matricola);
		  console.log(matricolaElement.textContent);
		
		  if (student.resultState === 'PUBBLICATO') {
		    refuseButton.disabled = false;
		  } else if (student.resultState === 'RIFIUTATO'){
			  console.log("Rifiutato");
		     document.getElementById('refuse').textContent="Il voto è stato rifiutato"
		  } else if (student.resultState === 'VERBALIZZATO'){
			  refuseButton.disabled = true;
		  }
		
		  refuseButton.addEventListener('click', function() {
		  	refuse(examdate,courseid); 
		  });
		
	}
	
}

refuse = function(examdate,courseid){
    makeCall("GET", "RefuseMark?courseId="+courseid+"&examDate="+examdate, null, function(req) {
      if (req.readyState == 4) {
        var message = req.responseText;
        if (req.status == 200) {
          var response = JSON.parse(req.responseText);
          result.update(examdate,courseid,response);
        } else if (req.status == 403) {
          window.location.href = req.getResponseHeader("Location");
          window.sessionStorage.removeItem('user');
        } else {
          console.log(message);
        }
      }
    });
}


//Manage the page
function PageManager(){
  var info = document.getElementById("userInfo");


    var user = JSON.parse(sessionStorage.getItem("user"));
    userInfo = new UserInfo(user, info);
    
    coursesList = new CoursesList(document.getElementById("title1"),
    document.getElementById("courses_container"),document.getElementById("courses_list"));
    
    examsList = new ExamsList(document.getElementById("title2"),document.getElementById("goToViewRes"));

    
    result = new Result(document.getElementById("title3"),document.getElementById("examInfo"));

    
     document.querySelector("a[href='Logout']").addEventListener('click', () => {
	        window.sessionStorage.removeItem('username');
	      })
	      
	this.start = function(){
	    userInfo.show();
	    coursesList.show();
    } 
 
	this.refresh = function(){
		document.getElementById("homePage").style.visibility = "hidden";
		document.getElementById("noExams").textContent = " ";
		coursesList.reset();
		examsList.reset();
		result.reset();
	}
	
	this.returnHome = function(){
	    document.getElementById("homePage").style.visibility = "visible";
	    document.getElementById("homePage").addEventListener('click', function() {
		pageManager.refresh();
		coursesList.show();
    });
 }

}





	

   
