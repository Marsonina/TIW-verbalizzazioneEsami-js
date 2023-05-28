package controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
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
import utility.CheckPermissions;
import utility.DbConnection;
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
		int chosenCourseId = Integer.parseInt(chosenCourse);
		String chosenExam = request.getParameter("examDate");
		String matricolaSelected = request.getParameter("matricola");
		String examMark = request.getParameter("examMark");
		
		System.out.println(chosenCourseId);
		System.out.println(chosenExam);
		System.out.println(matricolaSelected);
		System.out.println(examMark);
		
		ExamDAO eDao = new ExamDAO(connection, chosenCourseId, chosenExam);

		//check permissions
		CheckPermissions checker = new CheckPermissions(connection, user, request, response);
		try { 
			//checking if the selected course is correct and "owned" by the teacher
			checker.checkTeacherPermissions(chosenCourseId);
		}catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Failure in courses info database extraction");
		}
		
		try {
			//checking if the the exam date is correct
			checker.checkExamDate(eDao);
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Failure in exam info database extraction");
		}
		
		//checking if the mark inserted is valid
		if(marks.contains(examMark)){
			ExamStudent examStud = new ExamStudent();
			try {
				examStud = eDao.getResult(matricolaSelected);
				//checking if the mark is already published or verbalized
				if(!(examStud.getResultState()).equals("PUBBLICATO")&& !(examStud.getResultState()).equals("VERBALIZZATO")) {
					//change the mark of the student
					eDao.changeMark(matricolaSelected, examMark);
					System.out.println(eDao.getResult(matricolaSelected));				}
			}catch (SQLException e) {
				response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				response.getWriter().println("Failure in exam student info database extraction");
			}
		
		String path = "/GoToEnrolledStudents";
		request.setAttribute("examDate", chosenExam);
		request.setAttribute("courseId", chosenCourse);
		request.getRequestDispatcher(path).forward(request, response);

		}else {
			String path = "/GoToModifyPage";
			request.setAttribute("examDate", chosenExam);
			request.setAttribute("courseId", chosenCourse);
			request.setAttribute("matricola", matricolaSelected);
			request.getRequestDispatcher(path).forward(request, response);
		}
	}
}


