package controllers;


import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringEscapeUtils;

import com.google.gson.Gson;

import beans.ExamStudent;
import beans.User;
import dao.CourseDAO;
import dao.ExamDAO;
import utility.DbConnection;



@WebServlet("/ExamResult")
public class ExamResult extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public ExamResult() {
		super();
	}
	
	public void init() throws ServletException {
		//connecting with DB
		connection = DbConnection.connect(getServletContext());
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		HttpSession s = request.getSession();
		User user = (User) s.getAttribute("user");
		String chosenCourse ;
		String chosenExam ;
		chosenCourse = StringEscapeUtils.escapeJava(request.getParameter("courseId"));
		chosenExam = StringEscapeUtils.escapeJava(request.getParameter("examDate"));
		int chosenCourseId = 0;
		
		if (chosenCourse == null || chosenCourse.isEmpty() || chosenExam == null || chosenExam.isEmpty()) {
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
        	try {
			chosenCourseId = Integer.parseInt(chosenCourse);
			}catch(NumberFormatException e) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Bad request, retry!");
				return;
    		}
			}catch(NumberFormatException e) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Bad request, retry!");
				return;
			}
		
		ExamDAO eDao = new ExamDAO(connection, chosenCourseId, chosenExam);
		ExamStudent examStudent = new ExamStudent();
		
		try {			 
			CourseDAO cDao = new CourseDAO(connection, Integer.parseInt(chosenCourse));
			//checking if the course selected exists
			if(cDao.findCourse() == null) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Bad request, retry!");
				return;
			}
			//checking if the current student attends the selected course
			List<String> currStudents = cDao.findAttendingStudent();
			if(currStudents == null || !currStudents.contains(user.getMatricola())) {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.getWriter().println("Bad request, retry!");
				return;
			}				
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Internal server error, retry later");
			return;
		}
		
		try {	
			//checking if the exam date selected exists		
			if(eDao.findExam() == null) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Bad request, retry!");
				return;
			}
			//checking if the student is enrolled to a specific exam in a specific date
			List<String> examStudents = eDao.findExamStudent();
			if(examStudents == null || !examStudents.contains(user.getMatricola())) {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.getWriter().println("Try to access to not enrolled exam");
				return;
			}		
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Internal server error, retry later");
			return;
		}
		
		
		try {
			//we obtain all the relevant infos about the student enrolled to the exam 
			examStudent = eDao.getResult(user.getMatricola());
		} catch (SQLException e) {
			// throw new ServletException(e);
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Internal server error, retry later");
			return;
		}
		String uJSON = new Gson().toJson(examStudent);
		response.setStatus(HttpServletResponse.SC_OK);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().println(uJSON);
		
	}
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}