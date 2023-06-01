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
		String[] examMark = request.getParameterValues("examMark");
		String[] matricoleExam = request.getParameterValues("matricole");
		for(int i=0;i<matricoleExam.length;i++)
			System.out.println(matricoleExam[i]);
		for(int i=0;i<examMark.length;i++)
			System.out.println(examMark[i]);
		System.out.println(chosenCourse);
		System.out.println(chosenExam);
		ExamDAO eDao = new ExamDAO(connection, chosenCourseId, chosenExam);

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
		
		for(int i=0; i < examMark.length; i++) {
			//checking if the mark inserted is valid
			if(marks.contains(examMark[i])){
				System.out.println(matricoleExam[i]);
				System.out.println(examMark[i]);
				ExamStudent examStud = new ExamStudent();
				try {
					examStud = eDao.getResult(matricoleExam[i]);
					System.out.println(examStud.getMatricola());
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


