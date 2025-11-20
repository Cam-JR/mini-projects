window.onload = function(){

    let seconds = 0;
    let miliSeconds = 0;

    let interval;

    const addSeconds = document.querySelector(".seconds");
    const addMilliSeconds = document.querySelector(".milli");

    const startBtn = document.querySelector(".start");
    const stopBtn = document.querySelector(".stop");
    const resetBtn = document.querySelector(".reset");

    startBtn.onclick = function(){

        clearInterval(interval);
        interval = setInterval(start,10);

    }

    stopBtn.onclick = function(){
        clearInterval(interval);
    }

    resetBtn.onclick = function(){
        clearInterval(interval);
        seconds = 0;
        miliSeconds = 0;
        addSeconds.innerHTML = "00";
        addMilliSeconds.innerHTML = "00";
    }


    function start(){

        miliSeconds++;

        if(miliSeconds < 10 ){
            addMilliSeconds.innerHTML = "0" + miliSeconds;

        }else{
            addMilliSeconds.innerHTML =  miliSeconds;

        }

        ///  1 s = 1000 ms  /// 1s = 100ms

        if(miliSeconds > 99){
            seconds++;
            addSeconds.innerHTML = seconds < 10 ? "0" + seconds: seconds;
            miliSeconds = 0;
            addMilliSeconds.innerHTML = "00";
        }



    }


}; 
 

// DARK MODE

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