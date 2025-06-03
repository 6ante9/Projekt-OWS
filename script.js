document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reservationForm");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const ime = document.getElementById("ime").value.trim();
      const prezime = document.getElementById("prezime").value.trim();
      const datumRodjenja = new Date(document.getElementById("datum").value);
      const tip = document.getElementById("tip").value;
      const brojOsoba = parseInt(document.getElementById("osobe").value);

      if (!ime || !prezime || !tip || isNaN(brojOsoba)) {
        alert("Molimo ispunite sva polja ispravno.");
        return;
      }

      if (!datumRodjenja || datumRodjenja == "Invalid Date") {
        alert("Molimo unesite valjani datum.");
        return;
      }

      const danas = new Date();
      let dob = danas.getFullYear() - datumRodjenja.getFullYear();
      const mjesecRazlika = danas.getMonth() - datumRodjenja.getMonth();

      if (
        mjesecRazlika < 0 ||
        (mjesecRazlika === 0 && danas.getDate() < datumRodjenja.getDate())
      ) {
        dob--;
      }

      if (dob < 18) {
        alert("Rezervaciju mogu napraviti samo osobe starije od 18 godina.");
        return;
      }

      if (tip === "stol" && brojOsoba > 5) {
        alert("Za stol je dozvoljeno maksimalno 5 osoba.");
        return;
      }

      if (tip === "separe" && (brojOsoba < 6 || brojOsoba > 10)) {
        alert("Za separe je dozvoljeno 6 do 10 osoba.");
        return;
      }

      
      const novaRezervacija = {
        ime,
        prezime,
        datumRodjenja: datumRodjenja.toISOString().split("T")[0], 
        tip,
        brojOsoba,
        vrijemeRezervacije: new Date().toISOString(),
      };

  
      const sveRezervacije =
        JSON.parse(localStorage.getItem("rezervacije")) || [];

      
      sveRezervacije.push(novaRezervacija);

      
      localStorage.setItem("rezervacije", JSON.stringify(sveRezervacije));

      alert("Rezervacija uspješno zaprimljena. Vidimo se u klubu Eclipse!");
      form.reset();
    });
  }
});
