package controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
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
import utility.CheckPermissions;
import utility.DbConnection;
import beans.ExamStudent;
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
		int chosenCourseId = Integer.parseInt(selectedCourse);
		System.out.println(selectedCourse);
		List<ExamStudent> students = new ArrayList<ExamStudent>();
		ExamDAO eDao = new ExamDAO(connection, chosenCourseId ,selectedDate);
		
		//check permissions
		CheckPermissions checker = new CheckPermissions(connection, user, request, response);
		try { 
			//checking if the selected course is correct and "owned" by the teacher
			checker.checkTeacherPermissions(chosenCourseId);
		}catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Failure in courses info database extraction");
			return;
		}
		
		try {
			//checking if the the exam date is correct
			checker.checkExamDate(eDao);
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
