package utility;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import beans.User;
import dao.CourseDAO;
import dao.ExamDAO;

public class CheckPermissions {
	
	User user;
	Connection connection;
	HttpServletRequest request;
	HttpServletResponse response;
	
	public CheckPermissions(Connection connection, User user, 
			HttpServletRequest request, HttpServletResponse response) {
		this.request = request;
		this.response = response;
		this.connection = connection;
		this.user = user;
	}

	public void checkTeacherPermissions(int chosenCourseId) throws IOException, SQLException {
		CourseDAO cDao = new CourseDAO(connection, chosenCourseId);
			//checking if the selected course exists
			if(cDao.findCourse() == null) {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.getWriter().println("Failure in exam info database extraction");
				return;
			}
			//checking if the current teacher owns the selected course
			String currTeacher = cDao.findOwnerTeacher();
			if(currTeacher == null || !currTeacher.equals(user.getMatricola())) {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.getWriter().println("Failure in exam info database extraction");
				return;
			}
		}
	
	public void checkExamDate(ExamDAO eDao) throws SQLException, IOException {
		if(eDao.findExam() == null) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.getWriter().println("Failure in exam info database extraction");
			return;
		}
	}
}
