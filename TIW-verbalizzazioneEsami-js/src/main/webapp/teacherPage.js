/**
 * TeacherPage
 */
let pageManager = new PageManager();

//function to load the 'first' page
window.addEventListener("load", ()=>{
	//user not logged in
	if(sessionStorage.getItem("user") == null){
		window.location.href = "index.html";
	} else {
		//user logged in
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

//Display courses list
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
      
      // ID Course Cell
      var idCell = document.createElement("td");
      idCell.textContent = course.courseId;
      row.appendChild(idCell);
      
      // Course's name Cell with link
      var nameCell = document.createElement("td");
      var courseLink = document.createElement("a");
      nameCell.appendChild(courseLink);
      courseLink.textContent = course.courseName;
      courseLink.setAttribute("href", "#");
      courseLink.setAttribute('courseId',course.courseId);
       
	  courseLink.removeEventListener("click", handleClick);
	  //we handle the event of click on courseId    
	  courseLink.addEventListener("click", handleClick);
	  //function that highlight the course selected and handles the click on link	
	  function handleClick(e) {
		  console.log("course");
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
    this.coursescontainer.style.visibility = "visible"; 
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
    this.examslist.style.visibility = "hidden";
  };

  this.show = function(courseId) {
  	document.getElementById("noExams").textContent = " ";  
	this.examslist.style.visibility = "visible"; 
    var self = this;
    makeCall("GET", "GoToHomeTeacher?courseId="+courseId, null, function(req) {
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
  console.log(this.selectedCourseId);
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
    console.log("esam");
    studentsList.show(self.selectedCourseId, selectedExam);
  }
  }

	
}

//Display enrolled students list
function StudentsList (_title,_studentscontainer, _studentslist) {
	this.title = _title;
	this.studentscontainer = _studentscontainer;
	this.studentslist = _studentslist;
	this.courseId = null;
	this.examDate = null;
	this.arrayStudents = null;
	this.reset = function() {
	    this.studentscontainer.style.visibility = "hidden";
	    document.getElementById("buttons").style.visibility = "hidden";
	    this.title.textContent = " ";
  };
  
  this.show = function(courseId, examDate) {
	  pageManager.refresh();
	  pageManager.returnHome();
	 document.getElementById("noStudents").textContent = " ";   
	 var self = this;
	
	this.studentscontainer.style.visibility = "visible";
	document.getElementById("buttons").style.visibility = "visible";
    makeCall("GET", "GoToEnrolledStudents?courseId="+courseId+"&"+"examDate="+examDate, null, function(req) {
      if (req.readyState == 4) {
        var message = req.responseText;
        if (req.status == 200) {
          var response = JSON.parse(req.responseText);
          if (response == null) {
            document.getElementById("noStudents").textContent = "No enrolled students for this exam!" + " Course id: "+ courseId + " Exam date: "+ examDate;
            self.reset();
            return;
          }else{
			  document.getElementById("noStudents").textContent = " "
		  }
		  self.arrayStudents = response;
          self.update(response,self);
        } else if (req.status == 403) {
          window.location.href = req.getResponseHeader("Location");
          window.sessionStorage.removeItem('user');
        } else {
          console.log(message);
        }
      }
    });
    this.courseId = courseId;
	this.examDate = examDate;
	
  };
  
  this.update = function(arrayStudents,self) {  
	document.getElementById('viewTitle').textContent = "Enrolled students for the selected exam"
	this.title.textContent = "Course id: "+this.courseId+ " Exam date: "+this.examDate;
    var tableBody = this.studentslist;
    tableBody.innerHTML = ""; // Svuota il corpo della tabella
	var topublish = true;
	var toverbalize = true;
	var tomodify = true;
	
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
	  modifyButton.value = examStudent.matricola;
	  
	  //Conditions to disable modifyBotton
	  if(examStudent.resultState==="PUBBLICATO" || examStudent.resultState==="VERBALIZZATO" || examStudent.resultState==="RIFIUTATO"){
	  	modifyButton.disabled = true;
	  }else if(examStudent.resultState==="INSERITO" || examStudent.resultState==="NON INSERITO"){
	  	modifyButton.disabled = false;
	  }
	  
	  modifyButton.removeEventListener("click", handleClick);
	  // Add event listener
	  function handleClick(e) {
		   var matricola = this.value;
	    modifyMark.show(self.courseId, self.examDate,matricola);
	  }  
	  
	  modifyButton.addEventListener("click", handleClick);
		  
      modifyCell.appendChild(modifyButton);
      row.appendChild(modifyCell);
  	  tableBody.appendChild(row);
  	  
  	  //Add css classes
	  	if(examStudent.resultState === "INSERITO"){
			topublish = false;
			row.classList.add("inserito");
		} 
		if(examStudent.resultState === "PUBBLICATO"){
			toverbalize = false;
			row.classList.add("pubblicato");
		}
		if(examStudent.resultState === "NON INSERITO"){
			tomodify = false;
			row.classList.add("noninserito");
		}
		if(examStudent.resultState === "VERBALIZZATO"){
			row.classList.add("verbalizzato");
		}if(examStudent.resultState === "RIFIUTATO"){
			toverbalize = false;
		}
  	  
    });
      //Conditions to disable publishBotton, verbalizeBotton and multipleModifyBotton
      document.getElementById("publishbutton").disabled = topublish;	  

      document.getElementById("verbalizebutton").disabled = toverbalize;	

      document.getElementById("multiplemodifybutton").disabled = tomodify;	

      
  };
  
  this.publish = function (self){
	 document.getElementById("publishbutton").removeEventListener("click", publishButtonClickHandler);
	document.getElementById("publishbutton").addEventListener("click", publishButtonClickHandler);
	function publishButtonClickHandler(e) {
	    console.log("publish");
		makeCall("GET", "PublishResults?courseId="+self.courseId+"&examDate="+self.examDate, null, function(req) {
	      if (req.readyState == 4) {
	        var message = req.responseText;
	        if (req.status == 200) {
	          var response = JSON.parse(req.responseText);
	          self.update(response,self);
	        } else if (req.status == 403) {
	          window.location.href = req.getResponseHeader("Location");
	          window.sessionStorage.removeItem('user');
	        } else {
	          console.log(message);
	        }
	      }
	    });
  	}
  }
	this.verbalize = function(self){
	 // Rimuovi i listener degli eventi click, se presenti  
	  document.getElementById("verbalizebutton").removeEventListener("click", verbalizeButtonClickHandler);
	  // Aggiungi i nuovi listener degli eventi click
	 
	  document.getElementById("verbalizebutton").addEventListener("click", verbalizeButtonClickHandler);
	  
	  function verbalizeButtonClickHandler(e) {
	    verbal.show(self.courseId, self.examDate);
	    console.log("Verbalize");
	  }
	}
	this.multiplemodify = function(self){

	  document.getElementById("multiplemodifybutton").removeEventListener("click", multipleModifyButtonClickHandler);
	  document.getElementById("multiplemodifybutton").addEventListener("click", multipleModifyButtonClickHandler);
	  
	  function multipleModifyButtonClickHandler(e) {
		  console.log("multMod"); 
	    multipleModify.show(self.courseId, self.examDate, self.arrayStudents);   
	  }

	}
}

function ModifyMark(_title, _studentContent){
	this.title = _title
	this.studentContent = _studentContent;
	var form = document.getElementById("singleModifyForm");
	this.courseId = null;
	this.examDate = null;
	
	this.reset = function() {
    this.studentContent.style.visibility = "hidden";
    this.title.textContent = " ";
  };
  
  this.show = function(courseid, examdate, matricola){
		pageManager.refresh();
		pageManager.returnStudents(courseid, examdate);
		this.studentContent.style.visibility = "visible";
	    var self = this;
	    var matricolaArray = new Array();
	    matricolaArray.push(matricola);
	    var json = JSON.stringify(matricolaArray);
		var studentParameter = encodeURIComponent(json);
	    makeCall("GET", "GoToModifyPage?courseId="+courseid+"&examDate="+examdate+"&matricola="+studentParameter, null, function(req) {
	      if (req.readyState == 4) {
	        var message = req.responseText;
	        if (req.status == 200) {
	          var response = JSON.parse(req.responseText);
	          self.update(response);
	        } else if (req.status == 403) {
	          window.location.href = req.getResponseHeader("Location");
	          window.sessionStorage.removeItem('user');
	        } else {
	          console.log(message);
	        }
	      }
	    });
	    self.courseId = courseid;
	    self.examDate = examdate;
	}

	this.update = function (arrayStudents){	
		document.getElementById('viewTitle').textContent = "Modify mark" 
		this.title.textContent ="Enter the mark and press 'Modify' !" 
		var matricolaElement = document.getElementById('matricolaStud');
		var nameElement = document.getElementById('nameStud');
		var surnameElement = document.getElementById('surnameStud');
		var degreeElement = document.getElementById('degree');
		var emailElement = document.getElementById('email');
		var resultStateElement = document.getElementById('resultState');
		
		
		arrayStudents.forEach(function(student){
		// Popola i valori dei campi con i dati dello studente
		matricolaElement.textContent = student.matricola;
		nameElement.textContent  = student.name;
		surnameElement.textContent  = student.surname;
		degreeElement.textContent  = student.degree;
		emailElement.textContent  = student.email;
		resultStateElement.textContent  = student.resultState;
		
		var matricolaHidden = document.createElement('input');
	    matricolaHidden.setAttribute("type", "hidden");
	    matricolaHidden.setAttribute("name", "matricole"); // Utilizza "[]" per indicare che è un array di valori
	    matricolaHidden.value = student.matricola;
	    form.appendChild(matricolaHidden);
	    
	    });
    

	}
	
	this.modify = function(self) {
		document.getElementById("modifybutton").removeEventListener("click", modifyAllButtonClickHandler);
		document.getElementById("modifybutton").addEventListener("click", modifyAllButtonClickHandler);
		function modifyAllButtonClickHandler(e) {
		    console.log("modify");
			var form = e.target.closest("form");
			var input = form.examMark.value;
			if (form.checkValidity() && validateFormValues(input)) {
				var courseId = self.courseId;
				var examDate = self.examDate;
		  		makeCall("POST", "ModifyMark?courseId=" + self.courseId + "&examDate=" + self.examDate, form, function(req) {
		    	if (req.readyState == 4) {
		      	var message = req.responseText;
		      	if (req.status == 200) {
				  studentsList.show(courseId,examDate);
				  self.reset();
		      } else if (req.status == 403) {
		        window.location.href = req.getResponseHeader("Location");
		        window.sessionStorage.removeItem('user');
		      } else {
		        console.log(message);
		      }
		      }	
  			});
			  var child = form.querySelector("[name='matricole']");
			  if (child) {
			    child.remove();
			  }
			}

		};

		}
	
}


//Form input validation
validateFormValues = function(input) {
  var validOptions = ["18", "19", "20", "21", "22", "23", "24", 
  "25", "26", "27", "28", "29", "30", "30L", "ASSENTE", "RIPROVATO"];
  console.log(input);
  for (var i = 0; i < validOptions.length; i++) {
    if (!validOptions.includes(input)) {
      return false;
    }
  }
  return true;
}


function Verbal(_title, _verbalcontainer, _verbalstudents){
	this.title= _title;
	this.verbalcontainer = _verbalcontainer;
	this.verbalstudents = _verbalstudents;
	
	this.reset = function() {
		this.verbalcontainer.style.visibility = "hidden";
		this.title.style.visibility = "hidden";
	}	
	
	this.show = function(courseId, examDate){
		pageManager.refresh();
		pageManager.returnStudents(courseId, examDate);
		var self = this;
		this.verbalcontainer.style.visibility = "visible";
		this.title.style.visibility = "visible";
	  makeCall("GET", "VerbalizeResults?courseId="+courseId+"&examDate="+examDate, null, function(req) {
      if (req.readyState == 4) {
        var message = req.responseText;
        if (req.status == 200) {
          var response = JSON.parse(req.responseText);
          var info = JSON.parse(response.verbal);
          var stud = JSON.parse(response.sudents);
          self.update(info,stud,courseId, examDate)          
        } else if (req.status == 403) {
          window.location.href = req.getResponseHeader("Location");
          window.sessionStorage.removeItem('user');
        } else {
          console.log(message);
        }
      }
    });
	}
	
	this.update = function(info,stud,courseId, examDate){
		 document.getElementById('viewTitle').textContent = " Verbal "
		var tableBody = this.verbalstudents;
    	tableBody.innerHTML = ""; // Svuota il corpo della tabella
    	var codeElement = document.getElementById('code');
		var dateTimeElement = document.getElementById('dateTime');
		var verbalCourseElement = document.getElementById('verbal_course');
		var verbalExamElement = document.getElementById('verbal_exam');
		var matricolaTeacherElement = document.getElementById('matricola_teacher');
		
		// Popola i valori dei campi con i dati dello studente
		codeElement.textContent = info.verbalId;
		dateTimeElement.textContent  = info.dateTime;
		verbalCourseElement.textContent  = courseId;
		verbalExamElement.textContent  = examDate;
		matricolaTeacherElement.textContent  = info.matricolaTeacher;
    

    stud.forEach(function(examStudent) { 
	    var riga = document.createElement("tr");
	      
	    var cellaMatricola = document.createElement("td");
	    cellaMatricola.textContent = examStudent.matricola;
	    riga.appendChild(cellaMatricola);
	
	    var cellaNome = document.createElement("td");
	    cellaNome.textContent = examStudent.name;
	    riga.appendChild(cellaNome);
	
	    var cellaCognome = document.createElement("td");
	    cellaCognome.textContent = examStudent.surname;
	    riga.appendChild(cellaCognome);
	      
	    var cellaRisultato = document.createElement("td");
	    cellaRisultato.textContent = examStudent.result;
	    riga.appendChild(cellaRisultato);
	
	    tableBody.appendChild(riga);
    });
		
	}

}


	
function MultipleModify(_modifycontainer, _modifystudents){
		this.modifycontainer = _modifycontainer;
		this.modifystudents = _modifystudents;
		this.courseId = null;
		this.examDate = null;
		var resultForm = document.getElementById("resultForm");
		
		this.reset = function() {
		this.modifycontainer.style.visibility = "hidden";
		document.getElementById("multipleModify").style.visibility = "hidden";
		}
	
		this.show = function(courseId, examDate, examStudents) {
			pageManager.refresh();
			pageManager.returnStudents(courseId, examDate);
			this.modifycontainer.style.visibility = "visible";
			document.getElementById("multipleModify").style.visibility = "visible";
			
		    var studentsToModify = new Array();
		    examStudents.forEach(function(examStudent) { 
				if(examStudent.resultState ==="NON INSERITO")
				studentsToModify.push(examStudent);
			});
			this.courseId = courseId;
			this.examDate = examDate;
			this.update(studentsToModify);
		
	 };
	 
this.update = function(arrayStudents) {
  var form = document.getElementById("resultForm");;
  var tableBody = this.modifystudents;
  tableBody.innerHTML = "";
  var matricole = new Array();

  arrayStudents.forEach(function(examStudent) {
    var row = document.createElement("tr");
    matricole.push(examStudent.matricola);

    var matricolaCell = document.createElement("td");
    matricolaCell.textContent = examStudent.matricola;
    row.appendChild(matricolaCell);

    var nameCell = document.createElement("td");
    nameCell.textContent = examStudent.name;
    row.appendChild(nameCell);

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
	var input = document.createElement('input');
	input.setAttribute('type', 'text');
    input.setAttribute('name', 'examMark');
    form.appendChild(input);
    resultCell.appendChild(input);
    row.appendChild(resultCell);
    

    var resultStateCell = document.createElement("td");
    resultStateCell.textContent = examStudent.resultState;
    row.appendChild(resultStateCell);
  
    
    var matricolaHidden = document.createElement('input');
    matricolaHidden.setAttribute("type", "hidden");
    matricolaHidden.setAttribute("name", "matricole"); // Utilizza "[]" per indicare che è un array di valori
    matricolaHidden.value = examStudent.matricola;
    form.appendChild(matricolaHidden);
    row.appendChild(matricolaHidden);

    tableBody.appendChild(row);
  });
	
  }	
	
	this.modify = function(self) {
		document.getElementById("modifyAllbutton").removeEventListener("click", modifyAllButtonClickHandler);
		document.getElementById("modifyAllbutton").addEventListener("click", modifyAllButtonClickHandler);
		function modifyAllButtonClickHandler(e) {
		    console.log("modifyAll");
			var form = e.target.closest("form");;
		    if (form.checkValidity()){
				var resultInputs = document.querySelectorAll("td input[name='examMark']");
				var results = [];
				var formOkay = true;
				resultInputs.forEach(function(input) {
				if(validateFormValues(input.value))
		      		results.push(input.value);
		      	else 
		      		formOkay = false;
		    	});
		    	if(formOkay){
					courseId = self.courseId;
					examDate = self.examDate;
		    		makeCall("POST", "ModifyMark?courseId=" + self.courseId + "&examDate=" + self.examDate, form, function(req) {
			    	if (req.readyState == 4) {
			      		var message = req.responseText;
				      	if (req.status == 200) {
						  studentsList.show(courseId, examDate);
						  multipleModify.reset();
				      	} else if (req.status == 403) {
					        window.location.href = req.getResponseHeader("Location");
					        window.sessionStorage.removeItem('user');
				      	} else {
				        	console.log(message);
				      	}
			    	}
			  		});
				}
				

			};

		}
	}
}


//Function to manage the page
function PageManager(){
  	var info = document.getElementById("userInfo");
    var user = JSON.parse(sessionStorage.getItem("user"));
    
    userInfo = new UserInfo(user, info);
    coursesList = new CoursesList(document.getElementById("title1"),
    							  document.getElementById("courses_container"),
    							  document.getElementById("courses_list")); 
    examsList = new ExamsList(document.getElementById("title2"),
    					      document.getElementById("goToViewRes"));
    studentsList = new StudentsList (document.getElementById("title3"),
    								 document.getElementById("examStudents_container"),
    								 document.getElementById("students_list"));
    modifyMark = new ModifyMark(document.getElementById("title4"), 
    							document.getElementById("modifyMark"));
    verbal = new Verbal(document.getElementById("verbalInfo"), 
    					document.getElementById("verbalcontainer"), 
    					document.getElementById("verbalstudents"));
   	multipleModify = new MultipleModify(document.getElementById("changeMark_container"), 
   										document.getElementById("changeMark_list"));
   	
    document.getElementById("homePage").style.visibility = "hidden";
    document.getElementById("enrolledPage").style.visibility = "hidden";
    
     document.querySelector("a[href='Logout']").addEventListener('click', () => {
        window.sessionStorage.removeItem('username');
     });
    //we initialize the main page with user info and courses' list
    this.start = function(){
	    userInfo.show();
	    coursesList.show();
	    studentsList.publish(studentsList);
	    studentsList.verbalize(studentsList);
	    studentsList.multiplemodify(studentsList);
	    multipleModify.modify(multipleModify);
	    modifyMark.modify(modifyMark);
	    examsList.examSelection(examsList);
    }
  //we initially hide every component 
  	this.refresh = function(){
		document.getElementById("homePage").style.visibility = "hidden";
		document.getElementById("enrolledPage").style.visibility = "hidden";	
		document.getElementById("noStudents").textContent = " ";
		document.getElementById("noExams").textContent = " ";
		coursesList.reset();
		examsList.reset();
		studentsList.reset();
		modifyMark.reset();
		verbal.reset();
		multipleModify.reset();
	}
	//key that allows the return to the homePage view containing teacher's courses
	document.getElementById("homePage").addEventListener('click', function() {
		console.log("return");
		pageManager.refresh();
		coursesList.show();
	 });
	//function that makes the return to the homePage key visible
	this.returnHome = function(){
	    document.getElementById("homePage").style.visibility = "visible";
     }
    //key that allows the return to the view of all enrolled students 
    this.returnStudents = function(courseId, examDate){
		document.getElementById("enrolledPage").style.visibility = "visible";
	    document.getElementById("enrolledPage").addEventListener('click', function() {
		console.log("return");	
		pageManager.refresh();
		studentsList.show(courseId, examDate);
	  });
    }

}
