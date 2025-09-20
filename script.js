document.addEventListener("DOMContentLoaded", function () {
    const formSteps = document.querySelectorAll(".form-step");
    const nextButtons = document.querySelectorAll(".next-btn");
    const prevButtons = document.querySelectorAll(".prev-btn");
    const progressBar = document.querySelector(".progress");
    const form = document.getElementById("multiStepForm");

    let currentStep = 0;

    function updateProgressBar() {
        const progress = ((currentStep) / formSteps.length) * 100;
        progressBar.style.width = progress + "%";
    }

    function showStep(step) {
        formSteps.forEach((stepDiv, index) => {
            stepDiv.classList.toggle("active", index === step);
        });
        updateProgressBar();
    }

    function requiresSelection(stepIndex) {
        return true;
    }

    function hasMadeSelection(stepIndex) {
        const step = formSteps[stepIndex];

        if (step.querySelector(".selected")) return true;

        const requiredInputs = step.querySelectorAll("input, select, textarea");
        for (let input of requiredInputs) {
            if (input.type !== "button" && input.value.trim() !== "") {
                return true;
            }
        }
        return false;
    }

    function nextStep() {
        if (requiresSelection(currentStep) && !hasMadeSelection(currentStep)) {
            alert("Please complete this step before continuing.");
            return;
        }
        if (currentStep < formSteps.length - 1) {
            currentStep++;
            showStep(currentStep);
        }
    }

    nextButtons.forEach(button => {
        button.addEventListener("click", nextStep);
    });

    prevButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    document.querySelectorAll(".vehicle-option, .budget-btn, .finance-btn, .employment-btn, .bankruptcy-btn").forEach(button => {
    button.addEventListener("click", () => {
        const inputField = document.getElementById(button.dataset.target);
        if (inputField) {
            inputField.value = button.dataset.value;
        }
        
        // Supprimer tous les boutons "selected" dans ce groupe
        const groupClass = button.classList[0]; // ex: "vehicle-option"
        document.querySelectorAll("." + groupClass).forEach(el => el.classList.remove("selected"));
        
        // Ajouter la classe "selected" au bouton cliqué
        button.classList.add("selected");

        // 👉 Avancer automatiquement à l'étape suivante après la sélection
        nextStep();
    });
});

    document.querySelectorAll("#firstname, #lastname, #email, #phone, #homeaddress, #companyname, #jobtitle, #years, #months, #dob, #income").forEach(input => {
        input.addEventListener("input", () => {
            let hiddenField = document.getElementById("hidden" + input.id.replace(/-/g, "").charAt(0).toUpperCase() + input.id.replace(/-/g, "").slice(1));
            if (hiddenField) {
                hiddenField.value = input.value;
            }
        });
    });

form.addEventListener("submit", function (event) {
    event.preventDefault();

    console.log("Submitting form...");

    let formData = new FormData(this);
    formData.append("action", "submit_autoloan_form");

    // Send to your LeadConnector webhook
    fetch("https://services.leadconnectorhq.com/hooks/91wRYYomwhn5oMEqYIq0/webhook-trigger/8482769c-5165-41b2-9c46-a15e3d190ee4", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries())),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => console.log("Webhook sent to LeadConnector"))
    .catch(err => console.error("Webhook error:", err));

    // Continue with WordPress AJAX submission
    fetch('/wp-admin/admin-ajax.php', {
        method: "POST",
        body: new URLSearchParams([...formData.entries()]),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log("Response received:", result);
        if (result.success) {
            alert("Thank you! Your information has been submitted.");
            form.reset();
            document.querySelectorAll(".selected").forEach(el => el.classList.remove("selected"));
            document.querySelectorAll("[id^=hidden]").forEach(hiddenInput => hiddenInput.value = "");
            setTimeout(() => {
                currentStep = 0;
                showStep(currentStep);
            }, 1000);
        } else {
            alert("Please go back and fill in the missing sections.");
        }
    })
    .catch(error => console.error("Submission error:", error));
    });


    showStep(currentStep);
    
    
});
