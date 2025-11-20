const inputs = document.querySelectorAll(".css-controller input");
const cssOutput = document.getElementById("css-output");
const image = document.getElementById("main-image");
const toggleThemeBtn = document.getElementById("toggle-theme");
const upload = document.getElementById("img-upload");

// CSS en tiempo real
inputs.forEach(input => {
  input.addEventListener("input", handleUpdate);
  input.addEventListener("change", handleUpdate);
});

function handleUpdate() {
  const suffix = this.dataset.sizing || "";
  document.documentElement.style.setProperty(`--${this.name}`, this.value + suffix);
  updateCSSBox();
}

// UPLOAD IMAGE
upload.addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) image.src = URL.createObjectURL(file);
});

// Dark mode  
toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const icon = toggleThemeBtn.querySelector("span");

  if (document.body.classList.contains("dark")) {
    icon.textContent = "sunny";    
  } else {
    icon.textContent = "bedtime";   
  }
});
 
 
// Plantilla CSS dinamico 
function updateCSSBox() {
  const c = getComputedStyle(document.documentElement);

  const width = c.getPropertyValue("--width").trim();
  const padding = c.getPropertyValue("--padding").trim();
  const blur = c.getPropertyValue("--blur").trim();
  const base = c.getPropertyValue("--base").trim();
  const br = c.getPropertyValue("--border-radius").trim();

  cssOutput.textContent =
`img#main-image {
  width: ${width};
  padding: ${padding};
  filter: blur(${blur});
  background-color: ${base};
  border-radius: ${br};
}`;
}

updateCSSBox();
