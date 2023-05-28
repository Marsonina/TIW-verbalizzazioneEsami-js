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


function CoursesList(_title, _coursescontainer, _courseslist) {
  this.title = _title;
  this.coursescontainer = _coursescontainer;
  this.courseslist = _courseslist;

  this.reset = function() {
    this.coursescontainer.style.visibility = "hidden";
    this.title.textContent = " ";
  };

  this.show = function() {
    var self = this;
    makeCall("GET", "GoToHomeTeacher", null, function(req) {
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
    makeCall("GET", "GoToHomeTeacher?courseId="+courseId, null, function(req) {
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
		studentsList.show(courseid, selectedExam);
      });
  };
	
}

function StudentsList (_title,_studentscontainer, _studentslist) {
	this.title = _title;
	this.studentscontainer = _studentscontainer;
	this.studentslist = _studentslist;
	
	this.reset = function() {
    this.studentscontainer.style.visibility = "hidden";
  };
  
  this.show = function(courseId, examDate) {
	coursesList.reset();
	examsList.reset();
	
	this.studentscontainer.style.visibility = "visible";
    var self = this;
    makeCall("GET", "GoToEnrolledStudents?courseId="+courseId+"&"+"examDate="+examDate, null, function(req) {
      if (req.readyState == 4) {
        var message = req.responseText;
        if (req.status == 200) {
          var response = JSON.parse(req.responseText);
          console.log(response);
          if (response == null) {
            _title.textContent = "No enrolled students for this exam!" + " Course id: "+ courseId + " Exam date: "+ examDate;
            studentsList.reset();
            return;
          }else{
			  _title.textContent = "Course id: "+courseId+ " Exam date: "+examDate;
		  }
          self.update(response, courseId, examDate);
        } else if (req.status == 403) {
          window.location.href = req.getResponseHeader("Location");
          window.sessionStorage.removeItem('user');
        } else {
          self.studentslist.textContent = message;
        }
      }
    });
  };
  
  this.update = function(arrayStudents, courseId, examDate) {
    var tableBody = this.studentslist;
    tableBody.innerHTML = ""; // Svuota il corpo della tabella

    arrayStudents.forEach(function(examStudent) {  
      var row = document.createElement("tr");
      
     var matricolaCell = document.createElement("td");
      matricolaCell.textContent = examStudent.matricola;
      row.appendChild(matricolaCell);

      // Cella per l'ID del corso
      var nameCell = document.createElement("td");
      nameCell.textContent = examStudent.name;
      row.appendChild(nameCell);
      // Cella per il nome del corso come link
      var surnameCell = document.createElement("td");
      surnameCell.textContent = examStudent.surname;
      row.appendChild(surnameCell);
      
      var emailCell = document.createElement("td");
      emailCell.textContent = examStudent.email;
      row.appendChild(emailCell);
      
      var degreeCell = document.createElement("td");
      degreeCell.textContent = examStudent.degree;
      row.appendChild(degreeCell);
      
      var resultCell = document.createElement("td");
      resultCell.textContent = examStudent.result;
      row.appendChild(resultCell);
      
      var resultStateCell = document.createElement("td");
      resultStateCell.textContent = examStudent.resultState;
      row.appendChild(resultStateCell);
     
      var modifyCell = document.createElement("td");
	  var modifyButton = document.createElement("button");
	  modifyButton.textContent = "Modify";
	  if(examStudent.resultState==="PUBBLICATO" || examStudent.resultState==="VERBALIZZATO" || examStudent.resultState==="RIFIUTATO"){
	  	modifyButton.disabled = true;
	  }else if(examStudent.resultState==="INSERITO" || examStudent.resultState==="NON INSERITO"){
	  	modifyButton.disabled = false;
	  }
	  modifyButton.value = examStudent.matricola;
	  modifyButton.addEventListener('click', function() {
		  var matricola = this.value;
		  modifyMark.show(courseId, examDate, matricola)
		  });
      modifyCell.appendChild(modifyButton);
      row.appendChild(modifyCell);

  	  tableBody.appendChild(row);
    });
  };
}

function ModifyMark(_title, _studentContent){
	this.title = _title
	this.studentContent = _studentContent;
	
	this.reset = function() {
    this.studentContent.style.visibility = "hidden";
  };
  
  this.show = function(courseid, examdate, matricola){
		examsList.reset();
		coursesList.reset();
		studentsList.reset();
		 
		this.studentContent.style.visibility = "visible";
	    var self = this;
	    makeCall("GET", "GoToModifyPage?courseId="+courseid+"&examDate="+examdate+"&matricola="+matricola, null, function(req) {
	      if (req.readyState == 4) {
	        var message = req.responseText;
	        if (req.status == 200) {
	          var response = JSON.parse(req.responseText);
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
	
	this.update = function (examdate,courseId,student){	
		  
		var matricolaElement = document.getElementById('matricolaStud');
		var nameElement = document.getElementById('nameStud');
		var surnameElement = document.getElementById('surnameStud');
		var degreeElement = document.getElementById('degree');
		var emailElement = document.getElementById('email');
		var resultStateElement = document.getElementById('resultState');
		
		// Popola i valori dei campi con i dati dello studente
		matricolaElement.textContent = student.matricola;
		nameElement.textContent  = student.name;
		surnameElement.textContent  = student.surname;
		degreeElement.textContent  = student.degree;
		emailElement.textContent  = student.email;
		resultStateElement.textContent  = student.resultState;
		document.getElementById("modifybutton").addEventListener('click', function(e) {
		var form = e.target.closest("form");
    	if (form.checkValidity() && validateFormValues(form)){
			modify(examdate,courseId,matricolaElement.textContent, form);
		};	
		});
	}
	}
	
	function modify(examdate, courseId, student, form) {
		console.log(form.examMark.value);
  	makeCall("POST", "ModifyMark?courseId=" + courseId + "&examDate=" + examdate + "&matricola=" + student, form, function(req) {
    if (req.readyState == 4) {
      var message = req.responseText;
      if (req.status == 200) {
		  studentsList.show(courseId, examdate);
		  modifyMark.reset();
      } else if (req.status == 403) {
        window.location.href = req.getResponseHeader("Location");
        window.sessionStorage.removeItem('user');
      } else {
        console.log(message);
      }
    }
  });
}
	
	

	validateFormValues = function(form) {
	  var validOptions = ["18", "19", "20", "21", "22", "23", "24", 
	  "25", "26", "27", "28", "29", "30", "30L", "ASSENTE", "RIPROVATO"];
	  var input = form.examMark.value;
	  console.log(input);
	  for (var i = 0; i < validOptions.length; i++) {
	    if (!validOptions.includes(input)) {
	      return false;
	    }
	  }
	  return true;
	}


//Manage the page
function PageManager(){
  var info = document.getElementById("userInfo");

  this.start = function(){
    var user = JSON.parse(sessionStorage.getItem("user"));
    userInfo = new UserInfo(user, info);
    userInfo.show();
    
    coursesList = new CoursesList(document.getElementById("title1"),
    document.getElementById("courses_container"),document.getElementById("courses_list"));
    coursesList.show();
    
    examsList = new ExamsList(document.getElementById("title2"),document.getElementById("goToViewRes"));
    examsList.reset();

    studentsList = new StudentsList (document.getElementById("title3"), document.getElementById("examStudents_container"),document.getElementById("students_list"))
    studentsList.reset();
    
    modifyMark = new ModifyMark(document.getElementById("title4"), document.getElementById("modifyMark"));
    modifyMark.reset();
    
     document.querySelector("a[href='Logout']").addEventListener('click', () => {
        window.sessionStorage.removeItem('username');
      })
    
  }
}