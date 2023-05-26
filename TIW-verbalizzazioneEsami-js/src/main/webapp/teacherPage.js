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

function StudentsList (_studentscontainer, _studentslist) {
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
          if (response.length == 0) {
            self.studentslist.textContent = "No enrolled students for this exam!";
            return;
          }
          self.update(response);
        } else if (req.status == 403) {
          window.location.href = req.getResponseHeader("Location");
          window.sessionStorage.removeItem('user');
        } else {
          self.studentslist.textContent = message;
        }
      }
    });
  };
  
  this.update = function(arrayStudents) {
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
	  modifyButton.addEventListener('click', function() {
		  });
      modifyCell.appendChild(modifyButton);
      row.appendChild(modifyCell);

  	  tableBody.appendChild(row);
    });
  };
}

//Exams list
function ExamsList(_examslist){
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
            document.getElementById("noExams").textContent("No exam date for course number "+ courseId);
            return;
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

	  document.getElementById("title2").textContent = "Exam dates for the course number: " + courseid;

	    // Get the form elements
	  var form = document.getElementById('goToViewStud');
	  var examDateElement = form.querySelector('select[name="examDate"]');
	
	  // Clear any existing options from the select element
	  examDateElement.innerHTML = '';
	
	  // Create and append new option elements based on the date array
	  arrayexams.forEach(function(date) {
	    var option = document.createElement('option');
	    option.textContent = date.date;
	    examDateElement.appendChild(option);
	  });
	  
	  document.getElementById("viewStud").addEventListener("click", function() {
		  var selectedDate = examDateElement.value
		studentsList.show(courseid, selectedDate);
      });
  };
	
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
    
    examsList = new ExamsList(document.getElementById("goToViewStud"));
    examsList.reset();

    studentsList = new StudentsList (document.getElementById("examStudents_container"),document.getElementById("students_list"))
    studentsList.reset();
    
    
  }
}
