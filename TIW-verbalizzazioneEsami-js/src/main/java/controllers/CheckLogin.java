package controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.annotation.MultipartConfig;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringEscapeUtils;

import beans.User;
import dao.UserDAO;
import utility.DbConnection;



@WebServlet("/CheckLogin")
@MultipartConfig
public class CheckLogin extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public CheckLogin() {
		super();
	}

	public void init() throws ServletException {
		//connection with DB
		connection = DbConnection.connect(getServletContext());
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		//get of parameters insert by the user
		String usrn = null;
		String pwd = null;
		String role = null;
		
		usrn = StringEscapeUtils.escapeJava(request.getParameter("username"));
		pwd = StringEscapeUtils.escapeJava(request.getParameter("pwd"));
		role = StringEscapeUtils.escapeJava(request.getParameter("role"));
		
		System.out.println(usrn);
		System.out.println(pwd);
		System.out.println(role);
		
		UserDAO usr = new UserDAO(connection);
		User u = null;
		
		if (usrn == null || pwd == null || usrn.isEmpty() || pwd.isEmpty() ) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Credentials must be not null");
			return;
		}
		
		try {
			if(role.equals("teacher"))
				//check of teacher credentials
				u = usr.checkCredentialsTeacher(usrn, pwd);
			else if(role.equals("student"))
				//check of student credentials
				u = usr.checkCredentialsStudent(usrn, pwd);
		} catch (SQLException e) {
			// throw new ServletException(e);
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Internal server error, retry later");
			return;
		}
		
		
		
		if (u == null) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.getWriter().println("Incorrect credentials");
		} else {
			request.getSession().setAttribute("user", u);
			response.setStatus(HttpServletResponse.SC_OK);
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().println(usrn);
		}
	}

	public void destroy() {
		try {
			if (connection != null) {
				connection.close();
			}
		} catch (SQLException sqle) {
			 System.err.println("Errore durante la chiusura della connessione: " + sqle.getMessage());
		}
	}
}
