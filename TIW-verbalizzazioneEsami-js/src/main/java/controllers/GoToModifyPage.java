package controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;

import beans.ExamStudent;
import beans.User;
import utility.CheckPermissions;
import utility.DbConnection;
import dao.ExamDAO;

@WebServlet("/GoToModifyPage")
public class GoToModifyPage extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public GoToModifyPage() {
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
		int chosenCourseId = Integer.parseInt(chosenCourse);
		String chosenExam = request.getParameter("examDate");
		String arrayStudents = request.getParameter("matricola");
	
		Gson gson = new Gson();
		List<String> matricoleExam = new ArrayList<>(Arrays.asList(gson.fromJson(arrayStudents, String[].class)));
		
		ExamDAO eDao = new ExamDAO(connection, chosenCourseId, chosenExam);
		ExamStudent examStudent = new ExamStudent();
		
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
		
		List<ExamStudent> examStudents = new ArrayList<>();
		for(String matricola: matricoleExam) {
			try {
				examStudent = eDao.getResult(matricola);
			}catch (SQLException e) {
				response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				response.getWriter().println("Internal server error, please retry later!");
				return;
			}
			//checking if the mark is already published or verbalized
			if((examStudent.getResultState()).equals("PUBBLICATO")|| (examStudent.getResultState()).equals("VERBALIZZATO")) {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.getWriter().println("Trying to access to a published or a verbalized exam");
				return;
			}
			examStudents.add(examStudent);
		}

		String jsonString = gson.toJson(examStudents);
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