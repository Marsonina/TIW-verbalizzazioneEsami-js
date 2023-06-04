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
import com.google.gson.JsonObject;

import beans.Course;
import beans.Exam;
import beans.User;
import dao.CourseDAO;
import dao.StudentDAO;
import utility.DbConnection;


@WebServlet("/GoToHomeStudent")
public class GoToHomeStudent extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	
	public GoToHomeStudent() {
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
		String chosenCourse = request.getParameter("courseId");
		
		StudentDAO sDao = new StudentDAO(connection, user.getMatricola());
		List<Course> courses = new ArrayList<Course>();
		List<Exam> exams = new ArrayList<Exam>();
		int chosenCourseId = 0;
		
		try {
			//courses in which the student is enrolled for the exam
			courses = sDao.getCourses();
			
			if (chosenCourse != null) { 
				chosenCourseId = Integer.parseInt(chosenCourse);
				//exam's available dates corresponding to the selected course
				exams = sDao.getExamDates(chosenCourseId);
				CourseDAO cDao = new CourseDAO(connection, chosenCourseId);	
				//checking if the selection of the course is correct
				if(cDao.findCourse() == null) {
					response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
					response.getWriter().println("Trying to access to not existing course");
					return;
				}
				//checking if the current student is enrolled to the selected course
				List<String> currStudents = cDao.findAttendingStudent();
				if(currStudents == null || !currStudents.contains(user.getMatricola())) {
					response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
					response.getWriter().println("Trying to access to not attended course");
					return;
				}
			}
		} catch (SQLException e) {
			// throw new ServletException(e);
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Internal server error, retry later");
			return;
		}
		
		JsonObject json = new JsonObject();
		Gson gson = new Gson();
		String courseListString = gson.toJson(courses);
		String examsListString = gson.toJson(exams);
		
		json.addProperty("courses", courseListString);
		json.addProperty("courseId", chosenCourseId);
		json.addProperty("exams", examsListString);
		response.setStatus(HttpServletResponse.SC_OK);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		String jsonString = new Gson().toJson(json);
		response.getWriter().write(jsonString);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}


}
























