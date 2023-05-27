/**
 *SORTING FUNCTIONS
 */
function reorderTable(colonna) {
  var tabella = document.getElementById("examStudents_container");
  var tbody = tabella.getElementsByTagName("tbody")[0];
  var righe = Array.from(tbody.getElementsByTagName("tr"));

  var indiceColonna;
  var ordineAttuale;

  var intestazioni = tabella.getElementsByTagName("th");
  for (var i = 0; i < intestazioni.length; i++) {
    if (intestazioni[i] === colonna) {
      indiceColonna = i;
      if (colonna.classList.contains("asc")) {
        colonna.classList.remove("asc");
        colonna.classList.add("desc");
        ordineAttuale = "desc";
      } else if (colonna.classList.contains("desc")) {
        colonna.classList.remove("desc");
        colonna.classList.add("asc");
        ordineAttuale = "asc";
      } else {
        colonna.classList.add("asc");
        ordineAttuale = "asc";
      }
    } else {
      intestazioni[i].classList.remove("asc");
      intestazioni[i].classList.remove("desc");
    }
  }

  righe.sort(function (rigaA, rigaB) {
    var cellaA = rigaA.getElementsByTagName("td")[indiceColonna].textContent.trim();
    var cellaB = rigaB.getElementsByTagName("td")[indiceColonna].textContent.trim();

    if (ordineAttuale === "asc") {
      if (!isNaN(cellaA) && !isNaN(cellaB)) {
        return cellaA - cellaB;
      } else {
        return cellaA.localeCompare(cellaB);
      }
    } else {
      if (!isNaN(cellaA) && !isNaN(cellaB)) {
        return cellaB - cellaA;
      } else {
        return cellaB.localeCompare(cellaA);
      }
    }
  });

  righe.forEach(function (riga) {
    tbody.appendChild(riga);
  });
}

var intestazioniColonne = document.querySelectorAll("#examStudents_container th.sortable");
intestazioniColonne.forEach(function (intestazione) {
  intestazione.addEventListener("click", function () {
    reorderTable(intestazione);
  });
});
