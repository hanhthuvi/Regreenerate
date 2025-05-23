document.addEventListener("DOMContentLoaded", () => {
  // Page 4 click navigation
  const arrow = document.getElementById("to-page-4");
  const main = document.querySelector("main");
  const page4 = document.querySelector(".page-4");
  const footer = document.getElementById("footer");

  if (arrow) {
    arrow.addEventListener("click", () => {
      main.style.display = "none";
      if (page4) page4.style.display = "block";
      if (footer) footer.classList.add("hidden");
    });
  }
});
