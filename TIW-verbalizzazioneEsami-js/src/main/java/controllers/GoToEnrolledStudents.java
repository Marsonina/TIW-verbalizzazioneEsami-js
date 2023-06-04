package controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;

import beans.User;
import utility.DbConnection;
import beans.ExamStudent;
import dao.CourseDAO;
import dao.ExamDAO;

@WebServlet("/GoToEnrolledStudents")
public class GoToEnrolledStudents extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	
	public GoToEnrolledStudents() {
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
		String selectedDate = request.getParameter("examDate");
		String selectedCourse = request.getParameter("courseId");
		int chosenCourseId = 0;
		
		if (selectedCourse == null || selectedCourse.isEmpty() || selectedDate == null || selectedDate.isEmpty()) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Missing parameters");
			return;
		}
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        try {
            LocalDate.parse(selectedDate, formatter);
        } catch (DateTimeParseException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Error in data format");
			return;
        }
        
        try {
			chosenCourseId = Integer.parseInt(selectedCourse);
			}catch(NumberFormatException e) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Bad request, retry!");
				return;
			}
		
		List<ExamStudent> students = new ArrayList<ExamStudent>();
		ExamDAO eDao = new ExamDAO(connection, chosenCourseId ,selectedDate);
		
		//check permissions
		try { 
			CourseDAO cDao = new CourseDAO(connection, chosenCourseId);
			//checking if the selected course exists
			if(cDao.findCourse() == null) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Bad request, retry!");
				return;
			}
			String currTeacher = cDao.findOwnerTeacher();
			//checking if the current teacher owns the selected course
			if(currTeacher == null || !currTeacher.equals(user.getMatricola())) {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.getWriter().println("Bad request, retry!");
				return;
			}
		} catch (SQLException e) {
			response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "Failure in teacher's exams database extraction");
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
		
		try {
			students = eDao.getStudents();
		}
		catch(SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Failure in exam students info database extraction");
			return;
		}
		
		Gson gson = new Gson();

		String jsonString = gson.toJson(students);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(jsonString);
		
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
