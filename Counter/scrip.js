(function(){

    const buttons = document.querySelectorAll(".btn-counter");
    let count = parseInt(localStorage.getItem("count")) || 0;

    const counter = document.querySelector(".counter-machine");
    const counterContainer = document.querySelector(".counter");

    counter.textContent = count;

    function updateUI() {
        counter.textContent = count;
        localStorage.setItem("count", count);

        counter.classList.add("bump");
        setTimeout(() => counter.classList.remove("bump"), 100);

        if(count > 0){
            counterContainer.classList.remove("negative");
            counterContainer.classList.add("positive");
        }else if(count < 0){
            counterContainer.classList.remove("positive");
            counterContainer.classList.add("negative");
        }else{
            counterContainer.classList.remove("positive","negative");
        }
    }

    buttons.forEach(function(button){
        button.addEventListener('click', function(){

            if(button.classList.contains("decrease-btn")){
                count--;
            }else if(button.classList.contains("increase-btn")){
                count++;
            }else if(button.classList.contains("reset-btn")){
                count = 0;
            }

            updateUI();
        });
    });

})();

const toggleThemeBtn = document.getElementById("toggle-theme");

toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const icon = toggleThemeBtn.querySelector("span");

    if (document.body.classList.contains("dark")) {
        icon.textContent = "sunny";
        localStorage.setItem("theme", "dark");
    } else {
        icon.textContent = "bedtime";
        localStorage.setItem("theme", "light");
    }
});

// Cargar tema guardado
if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark");
    toggleThemeBtn.querySelector("span").textContent = "sunny";
}
