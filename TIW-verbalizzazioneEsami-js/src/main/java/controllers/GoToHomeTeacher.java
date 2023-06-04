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
import dao.TeacherDAO;
import utility.DbConnection;


@WebServlet("/GoToHomeTeacher")
public class GoToHomeTeacher extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	
	public GoToHomeTeacher() {
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
		
		TeacherDAO tDao = new TeacherDAO(connection, user.getMatricola());
		List<Course> courses = new ArrayList<Course>();
		List<Exam> exams = new ArrayList<Exam>();
		int chosenCourseId = 0;
		
		try {
			courses = tDao.getCourses();
			if (chosenCourse != null) { 
				if (chosenCourse.isEmpty()) {
					response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
					response.getWriter().println("Error in course id selection");
					return;
				}else {
					try {
					chosenCourseId = Integer.parseInt(chosenCourse);
					}catch(NumberFormatException e) {
						response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
						response.getWriter().println("Bad request, retry!");
						return;
					}
					//exams corresponding to selected course
					exams = tDao.getExamDates(chosenCourseId);
					//check permissions
					CourseDAO cDao = new CourseDAO(connection, chosenCourseId);
					if(cDao.findCourse() == null) {
						response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
						response.getWriter().println("Inexistent course");
						return;
					}
					String currTeacher = cDao.findOwnerTeacher();
					if(currTeacher == null || !currTeacher.equals(user.getMatricola())) {
						response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
						response.getWriter().println("Not owned course");
						return;
					}
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
