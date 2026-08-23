document.addEventListener("DOMContentLoaded", () => {
  const ADMIN_EMAIL = "admin@clubeclipse.hr";
  const ADMIN_LOZINKA = "Admin123!";

  const ucitaj = (key) => JSON.parse(localStorage.getItem(key)) || [];
  const spremi = (key, value) =>
    localStorage.setItem(key, JSON.stringify(value));

  const prijavljeniKorisnik =
    JSON.parse(localStorage.getItem("prijavljeniKorisnik"));

  // ADMIN RAČUN
  let korisnici = ucitaj("korisnici");

  if (!korisnici.some(k => k.email === ADMIN_EMAIL)) {
    korisnici.push({
      id: 1,
      ime: "Admin",
      prezime: "Club Eclipse",
      email: ADMIN_EMAIL,
      lozinka: ADMIN_LOZINKA,
      uloga: "admin"
    });

    spremi("korisnici", korisnici);
  }

  // ZAŠTITA STRANICA
  const stranica = window.location.pathname;

  if (stranica.endsWith("admin.html")) {
    if (!prijavljeniKorisnik || prijavljeniKorisnik.uloga !== "admin") {
      alert("Nemate dopuštenje za pristup admin sučelju.");
      window.location.href = "index.html";
      return;
    }

    document.body.style.display = "block";
  }

  if (stranica.endsWith("moje-rezervacije.html")) {
    if (!prijavljeniKorisnik) {
      alert("Za pregled svojih rezervacija morate biti prijavljeni.");
      window.location.href = "login.html";
      return;
    }

    if (prijavljeniKorisnik.uloga === "admin") {
      window.location.href = "admin.html";
      return;
    }

    document.body.style.display = "block";
  }

  // NAVBAR
  const navbar = document.querySelector(".navbar ul");

  function dodajLink(text, href, callback = null) {
    const li = document.createElement("li");
    const link = document.createElement("a");

    link.href = href;
    link.textContent = text;

    if (callback) {
      link.addEventListener("click", callback);
    }

    li.appendChild(link);
    navbar.appendChild(li);

    return link;
  }

  if (navbar) {
    const loginLink = navbar.querySelector('a[href="login.html"]');

    if (prijavljeniKorisnik) {
      if (loginLink) loginLink.parentElement.remove();

      if (
        prijavljeniKorisnik.uloga === "admin" &&
        !navbar.querySelector('a[href="admin.html"]')
      ) {
        dodajLink("Admin panel", "admin.html");
      }

      if (
        prijavljeniKorisnik.uloga === "korisnik" &&
        !navbar.querySelector('a[href="moje-rezervacije.html"]')
      ) {
        dodajLink("Moje rezervacije", "moje-rezervacije.html");
      }

      const imeLink = dodajLink(prijavljeniKorisnik.ime, "#");
      imeLink.style.color = "#f0c808";

      dodajLink("Odjava", "#", (e) => {
        e.preventDefault();

        localStorage.removeItem("prijavljeniKorisnik");
        alert("Uspješno ste se odjavili.");

        window.location.href = "index.html";
      });

    } else if (!loginLink) {
      dodajLink("Prijava", "login.html");
    }
  }

  // FORMAT DATUMA
  function formatirajDatum(datum) {
    if (!datum) return "-";

    const [godina, mjesec, dan] = datum.split("-");

    if (!godina || !mjesec || !dan) return datum;

    return `${dan}.${mjesec}.${godina}.`;
  }

  function formatirajVrstu(tip) {
    if (tip === "stol") return "Stol";
    if (tip === "separe") return "Separe";
    return tip || "-";
  }

  // ADMIN - PRIKAZ REZERVACIJA
  const reservationTableBody =
    document.getElementById("reservationTableBody");

  const nemaRezervacija =
    document.getElementById("nemaRezervacija");

  function prikaziRezervacije() {
    if (!reservationTableBody) return;

    const rezervacije = ucitaj("rezervacije");

    reservationTableBody.innerHTML = "";

    if (nemaRezervacija) {
      nemaRezervacija.style.display =
        rezervacije.length === 0 ? "block" : "none";
    }

    rezervacije.forEach((rezervacija, index) => {
      const red = document.createElement("tr");

      const podaci = [
        `${rezervacija.ime} ${rezervacija.prezime}`,
        rezervacija.korisnikEmail || "Nije dostupno",
        formatirajDatum(rezervacija.datumRodjenja),
        formatirajVrstu(rezervacija.tip),
        rezervacija.brojOsoba
      ];

      podaci.forEach(podatak => {
        const td = document.createElement("td");
        td.textContent = podatak;
        red.appendChild(td);
      });

      const akcija = document.createElement("td");
      const gumb = document.createElement("button");

      gumb.textContent = "Obriši";
      gumb.classList.add("delete-button");

      gumb.addEventListener("click", () => {
        obrisiRezervaciju(index);
      });

      akcija.appendChild(gumb);
      red.appendChild(akcija);

      reservationTableBody.appendChild(red);
    });
  }

  function obrisiRezervaciju(index) {
    const rezervacije = ucitaj("rezervacije");
    const rezervacija = rezervacije[index];

    if (!rezervacija) return;

    const potvrda = confirm(
      `Želite li obrisati rezervaciju korisnika ${rezervacija.ime} ${rezervacija.prezime}?`
    );

    if (!potvrda) return;

    rezervacije.splice(index, 1);
    spremi("rezervacije", rezervacije);

    alert("Rezervacija je uspješno obrisana.");
    prikaziRezervacije();
  }

  if (reservationTableBody) {
    prikaziRezervacije();
  }

  // MOJE REZERVACIJE
  const myReservationsTableBody =
    document.getElementById("myReservationsTableBody");

  const nemaMojihRezervacija =
    document.getElementById("nemaMojihRezervacija");

  function prikaziMojeRezervacije() {
    if (!myReservationsTableBody || !prijavljeniKorisnik) return;

    const sveRezervacije = ucitaj("rezervacije");

    const mojeRezervacije = sveRezervacije.filter(
      rezervacija =>
        rezervacija.korisnikId === prijavljeniKorisnik.id ||
        rezervacija.korisnikEmail === prijavljeniKorisnik.email
    );

    myReservationsTableBody.innerHTML = "";

    if (nemaMojihRezervacija) {
      nemaMojihRezervacija.style.display =
        mojeRezervacije.length === 0 ? "block" : "none";
    }

    mojeRezervacije.forEach(rezervacija => {
      const red = document.createElement("tr");

      const podaci = [
        `${rezervacija.ime} ${rezervacija.prezime}`,
        formatirajDatum(rezervacija.datumRodjenja),
        formatirajVrstu(rezervacija.tip),
        rezervacija.brojOsoba
      ];

      podaci.forEach(podatak => {
        const td = document.createElement("td");
        td.textContent = podatak;
        red.appendChild(td);
      });

      const akcija = document.createElement("td");
      const gumb = document.createElement("button");

      gumb.textContent = "Otkaži";
      gumb.classList.add("delete-button");

      gumb.addEventListener("click", () => {
        otkaziMojuRezervaciju(rezervacija.id);
      });

      akcija.appendChild(gumb);
      red.appendChild(akcija);

      myReservationsTableBody.appendChild(red);
    });
  }

  function otkaziMojuRezervaciju(id) {
    const rezervacije = ucitaj("rezervacije");

    const rezervacija = rezervacije.find(r => r.id === id);

    if (!rezervacija) {
      alert("Rezervacija nije pronađena.");
      return;
    }

    const mojaRezervacija =
      rezervacija.korisnikId === prijavljeniKorisnik.id ||
      rezervacija.korisnikEmail === prijavljeniKorisnik.email;

    if (!mojaRezervacija) {
      alert("Nemate dopuštenje za otkazivanje ove rezervacije.");
      return;
    }

    if (!confirm("Jeste li sigurni da želite otkazati ovu rezervaciju?")) {
      return;
    }

    const noveRezervacije =
      rezervacije.filter(r => r.id !== id);

    spremi("rezervacije", noveRezervacije);

    alert("Rezervacija je uspješno otkazana.");
    prikaziMojeRezervacije();
  }

  if (myReservationsTableBody) {
    prikaziMojeRezervacije();
  }

  // NOVA REZERVACIJA
  const reservationForm =
    document.getElementById("reservationForm");

  if (reservationForm) {
    if (!prijavljeniKorisnik) {
      alert("Za izradu rezervacije morate biti prijavljeni.");
      window.location.href = "login.html";
      return;
    }

    if (prijavljeniKorisnik.uloga === "admin") {
      alert("Administrator koristi admin sučelje.");
      window.location.href = "admin.html";
      return;
    }

    const imeInput = document.getElementById("ime");
    const prezimeInput = document.getElementById("prezime");

    imeInput.value = prijavljeniKorisnik.ime;
    prezimeInput.value = prijavljeniKorisnik.prezime;

    reservationForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const ime = imeInput.value.trim();
      const prezime = prezimeInput.value.trim();

      const datumRodjenja =
        new Date(document.getElementById("datum").value);

      const tip =
        document.getElementById("tip").value;

      const brojOsoba =
        parseInt(document.getElementById("osobe").value);

      if (!ime || !prezime || !tip || isNaN(brojOsoba)) {
        alert("Molimo ispunite sva polja ispravno.");
        return;
      }

      if (datumRodjenja.toString() === "Invalid Date") {
        alert("Molimo unesite valjani datum rođenja.");
        return;
      }

      const danas = new Date();

      let dob =
        danas.getFullYear() - datumRodjenja.getFullYear();

      const mjesecRazlika =
        danas.getMonth() - datumRodjenja.getMonth();

      if (
        mjesecRazlika < 0 ||
        (
          mjesecRazlika === 0 &&
          danas.getDate() < datumRodjenja.getDate()
        )
      ) {
        dob--;
      }

      if (dob < 18) {
        alert(
          "Rezervaciju mogu napraviti samo osobe starije od 18 godina."
        );
        return;
      }

      if (tip === "stol" && (brojOsoba < 1 || brojOsoba > 5)) {
        alert("Za stol je dozvoljeno 1 do 5 osoba.");
        return;
      }

      if (tip === "separe" && (brojOsoba < 6 || brojOsoba > 10)) {
        alert("Za separe je dozvoljeno 6 do 10 osoba.");
        return;
      }

      const rezervacije = ucitaj("rezervacije");

      rezervacije.push({
        id: Date.now(),
        ime,
        prezime,
        datumRodjenja: datumRodjenja.toISOString().split("T")[0],
        tip,
        brojOsoba,
        korisnikEmail: prijavljeniKorisnik.email,
        korisnikId: prijavljeniKorisnik.id
      });

      spremi("rezervacije", rezervacije);

      alert(
        "Rezervacija uspješno zaprimljena. Vidimo se u klubu Eclipse!"
      );

      reservationForm.reset();

      imeInput.value = prijavljeniKorisnik.ime;
      prezimeInput.value = prijavljeniKorisnik.prezime;
    });
  }

  // REGISTRACIJA
  const registerForm =
    document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const ime =
        document.getElementById("registerIme").value.trim();

      const prezime =
        document.getElementById("registerPrezime").value.trim();

      const email =
        document.getElementById("registerEmail").value.trim();

      const lozinka =
        document.getElementById("registerLozinka").value;

      const ponovljenaLozinka =
        document.getElementById("registerLozinkaPonovi").value;

      if (lozinka.length < 6) {
        alert("Lozinka mora sadržavati najmanje 6 znakova.");
        return;
      }

      if (lozinka !== ponovljenaLozinka) {
        alert("Lozinke se ne podudaraju.");
        return;
      }

      const korisnici = ucitaj("korisnici");

      const postojiKorisnik = korisnici.some(
        korisnik =>
          korisnik.email.toLowerCase() === email.toLowerCase()
      );

      if (postojiKorisnik) {
        alert("Korisnik s ovom email adresom već postoji.");
        return;
      }

      korisnici.push({
        id: Date.now(),
        ime,
        prezime,
        email,
        lozinka,
        uloga: "korisnik"
      });

      spremi("korisnici", korisnici);

      alert("Registracija je uspješna. Sada se možete prijaviti.");
      window.location.href = "login.html";
    });
  }

  // PRIJAVA
  const loginForm =
    document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email =
        document.getElementById("loginEmail").value.trim();

      const lozinka =
        document.getElementById("loginLozinka").value;

      const korisnici = ucitaj("korisnici");

      const korisnik = korisnici.find(
        korisnik =>
          korisnik.email.toLowerCase() === email.toLowerCase() &&
          korisnik.lozinka === lozinka
      );

      if (!korisnik) {
        alert("Pogrešan email ili lozinka.");
        return;
      }

      spremi("prijavljeniKorisnik", korisnik);

      alert(`Dobrodošao, ${korisnik.ime}!`);

      window.location.href =
        korisnik.uloga === "admin"
          ? "admin.html"
          : "index.html";
    });
  }
});