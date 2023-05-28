package beans;

import java.sql.Date;
import java.sql.Timestamp;

public class Verbal {
	private int verbalId = 0;
	//private LocalDateTime dateTime = LocalDateTime.now();   //.truncatedTo(ChronoUnit.SECONDS);
	private Timestamp dateTime = new Timestamp(new Date(System.currentTimeMillis()).getTime());
	private String matricolaTeacher;
	
	public String getMatricolaTeacher() {
		return matricolaTeacher;
	}

	public int getVerbalId() {
		return verbalId;
	}

	public Timestamp getDateTime() {
		return dateTime;
	}
	
	public void setVerbalId(int i) {
		 verbalId = i;
	}

	public void setMatricolaTeacher(String m) {
		matricolaTeacher = m;
	}
}