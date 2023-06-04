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
import com.google.gson.JsonObject;

import beans.ExamStudent;
import beans.User;
import beans.Verbal;
import dao.CourseDAO;
import dao.ExamDAO;
import utility.DbConnection;


@WebServlet("/VerbalizeResults")
public class VerbalizeResults extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	
	public VerbalizeResults() {
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
		
		List<ExamStudent> students = new ArrayList<ExamStudent>();
		ExamDAO eDao = new ExamDAO(connection, Integer.parseInt(selectedCourse) ,selectedDate);
		Verbal verbal = new Verbal();
	    Boolean checkVerbalize=false;
		
	    //checl permissions
		try {
			//checking if the selected course exists
			CourseDAO cDao = new CourseDAO(connection, Integer.parseInt(selectedCourse));
			if(cDao.findCourse() == null) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Error with course choice");
				return;
			}
			//checking if the current teacher owns the selected course
			String currTeacher = cDao.findOwnerTeacher();
			if(currTeacher == null || !currTeacher.equals(user.getMatricola())) {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				response.getWriter().println("Error with course choice");
				return;
			}	
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Internal server error, retry later");
			return;
		}
		try {
			//checking if the the exam date is correct
			if(eDao.findExam() == null) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Error with exam choice");
				return;
			}
			
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Internal server error, retry later");
			return;
		}
		
		
		try {
			CourseDAO cDAO = new CourseDAO(connection, Integer.parseInt(selectedCourse));
			String matricolaTeacher = cDAO.findOwnerTeacher();
			verbal.setMatricolaTeacher(matricolaTeacher);
			try {
				students = eDao.getVerbalizedResult();
				if(students == null) {
					response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
					response.getWriter().println(("No verbalizable results"));
					return;
				}else{
				
					for (ExamStudent student : students) {
					    if (student.getResultState().equals("PUBBLICATO") || student.getResultState().equals("RIFIUTATO") ||
					    		student.getResultState().equals("ASSENTE")){
					        checkVerbalize = true;
					        break;
					    }
					}
					
					if(!checkVerbalize) {
						response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
						response.getWriter().println("No verbalizable results");
						return;
					}
				}
				int id = eDao.createVerbal(verbal);
				verbal.setVerbalId(id);
				eDao.verbalize();
				System.out.print(id);
			} catch (SQLException e) {
				try {
			        connection.rollback();
			    } catch (SQLException e1) {
			        e1.printStackTrace();
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
		String verbalListString = gson.toJson(verbal);
		String studentsListString = gson.toJson(students);
		
		json.addProperty("verbal", verbalListString);
		json.addProperty("sudents", studentsListString);
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