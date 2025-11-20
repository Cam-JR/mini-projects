function calculateBMI() {
    const weight = parseFloat(document.getElementById("weight").value);
    const height = parseFloat(document.getElementById("height").value) / 100;

    const result = document.getElementById("result");
    const categoryText = document.getElementById("category");
    const idealWeightText = document.getElementById("idealWeight");
    const indicator = document.getElementById("bmiIndicator");

    if (!weight || !height) {
        result.style.color = "red";
        result.textContent = "Por favor, introduce valores válidos.";
        categoryText.textContent = "";
        idealWeightText.textContent = "";
        indicator.style.left = "0";
        return;
    }

    const bmi = (weight / (height * height)).toFixed(1);
    result.style.color = "#333";
    result.textContent = `Tu BMI es: ${bmi}`;

    let category = "";

    if (bmi < 18.5) {
        category = "Bajo peso";
    } else if (bmi < 25) {
        category = "Normal";
    } else if (bmi < 30) {
        category = "Sobrepeso";
    } else if (bmi < 35) {
        category = "Obesidad";
    } else {
        category = "Obesidad extrema";
    }

    categoryText.textContent = category;

    // --- Peso ideal ---
    const minWeight = (18.5 * height * height).toFixed(1);
    const maxWeight = (24.9 * height * height).toFixed(1);

    idealWeightText.innerHTML =
        `Tu peso saludable debería estar entre <b>${minWeight} kg</b> y <b>${maxWeight} kg</b>.`;

    // --- Posición del indicador ---
    let position = (bmi / 40) * 100;
    if (position < 0) position = 0;
    if (position > 100) position = 100;

    indicator.style.left = `${position}%`;
}
