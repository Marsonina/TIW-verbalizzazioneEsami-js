package controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import beans.ExamStudent;
import beans.User;
import utility.DbConnection;
import dao.CourseDAO;
import dao.ExamDAO;

@WebServlet("/ModifyMark")
@MultipartConfig
public class ModifyMark extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	
	List<String> marks = new ArrayList<>(Arrays.asList("ASSENTE", "RIPROVATO", "RIMANDATO", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "30L"));

	public ModifyMark() {
		super();
	}

	public void init() throws ServletException {
		connection = DbConnection.connect(getServletContext());
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doPost(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		HttpSession s = request.getSession();
		
		User user = (User) s.getAttribute("user");
		
		String chosenCourse = request.getParameter("courseId");
		String chosenExam = request.getParameter("examDate");
		String[] examMark = request.getParameterValues("examMark");
		String[] matricoleExam = request.getParameterValues("matricole");
		int chosenCourseId = 0;
		
		if (chosenCourse == null || chosenCourse.isEmpty() || chosenExam == null || chosenExam.isEmpty() || matricoleExam == null || matricoleExam.length == 0 || examMark == null || examMark.length == 0 ) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Missing parameters");
			return;
		}
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        try {
            LocalDate.parse(chosenExam, formatter);
        } catch (DateTimeParseException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Error in data format");
			return;
        }
        try {
			chosenCourseId = Integer.parseInt(chosenCourse);
			}catch(NumberFormatException e) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Bad request, retry!");
				return;
			}
		ExamDAO eDao = new ExamDAO(connection, chosenCourseId, chosenExam);

		//check permissions
		try { 
			//checking if the selected course exists
			CourseDAO cDao = new CourseDAO(connection, chosenCourseId);
			if(cDao.findCourse() == null) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Bad request, retry!");
				return;
			}
			//checking if the current teacher owns the selected course
			String currTeacher = cDao.findOwnerTeacher();
			if(currTeacher == null || !currTeacher.equals(user.getMatricola())) {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.getWriter().println("Bad request, retry!");
				return;
			}
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Failure in exam info database extraction");
			return;
		}
		//check permissions
		try {
			//checking if the the exam date is correct
			if(eDao.findExam() == null) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Bad request, retry!");
				return;
			}
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Failure in exam info database extraction");
			return;
		}
		
		for(int i=0; i < examMark.length; i++) {
			//checking if the mark inserted is valid
			if(marks.contains(examMark[i])){
				ExamStudent examStud = new ExamStudent();
				try {
					examStud = eDao.getResult(matricoleExam[i]);
					if(examStud == null) {
						response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
						response.getWriter().println("Bad request, retry!");
						return;
					}
					//checking if the mark is already published or verbalized
					if(!(examStud.getResultState()).equals("PUBBLICATO")&& !(examStud.getResultState()).equals("VERBALIZZATO")) {
						//change the mark of the student
						eDao.changeMark(matricoleExam[i], examMark[i]);				
					}
				}catch (SQLException e) {
					response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
					response.getWriter().println("Failure in exam student info database extraction");
					return;
				}
		}
		}
		String path = "/GoToEnrolledStudents";
		request.setAttribute("examDate", chosenExam);
		request.setAttribute("courseId", chosenCourse);
		request.getRequestDispatcher(path).forward(request, response);
	}
}


