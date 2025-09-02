// Toggle password visibility
function togglePassword(id) {
  const input = document.getElementById(id);
  const icon = input.nextElementSibling.querySelector('i');

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = "password";
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}


// Check password strength
function checkPasswordStrength() {
  const password = document.getElementById('regPassword').value;
  const strengthText = document.getElementById('password-strength');
  const strengthBar = document.getElementById('password-strength-bar');

  if (password.length === 0) {
    strengthText.classList.remove('show', 'weak', 'moderate', 'strong');
    strengthBar.style.width = '0';
    return;
  } else {
    strengthText.classList.add('show');
  }

  let strength = 'Weak Password ❌';
  strengthText.classList.remove('weak', 'moderate', 'strong');
  strengthText.classList.add('weak');
  strengthBar.style.width = '33%';
  strengthBar.style.backgroundColor = 'red';

  if (password.length >= 6 && password.match(/(?=.*[0-9])(?=.*[a-zA-Z])/)) {
    strength = 'Moderate Password ⚠️';
    strengthText.classList.remove('weak', 'moderate', 'strong');
    strengthText.classList.add('moderate');
    strengthBar.style.width = '66%';
    strengthBar.style.backgroundColor = 'orange';
  }

  if (password.length >= 8 && password.match(/(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])/)) {
    strength = 'Strong Password ✅';
    strengthText.classList.remove('weak', 'moderate', 'strong');
    strengthText.classList.add('strong');
    strengthBar.style.width = '100%';
    strengthBar.style.backgroundColor = 'green';
  }

  strengthText.textContent = strength;
}

// Show a specific form (login/register)
function showForm(formId) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm = document.getElementById('forgotForm');

  // Hide all forms first
  loginForm.classList.remove('active');
  registerForm.classList.remove('active');
  forgotForm.classList.remove('active');

  // Show the requested form
  const formToShow = document.getElementById(formId);
  if (formToShow) {
    formToShow.classList.add('active');
  }
}


// Simulate sending password reset link
function sendResetLink() {
  const emailInput = document.getElementById('forgotEmail');

  if (!emailInput.checkValidity()) {
    emailInput.reportValidity();
    return;
  }

  alert(`Password reset link has been sent to ${emailInput.value}`);
  emailInput.value = ""; 
  showForm('loginForm'); 
}

// Step 1 → Step 2 transition
function nextStep() {
  const step1Form = document.getElementById('step1');
  const step2Form = document.getElementById('step2');

  if (step1Form.checkValidity()) {
    step1Form.style.display = 'none';
    step2Form.classList.add('active');
  } else {
    step1Form.reportValidity();
  }
}

// Show/hide Year Level based on Account Type
const accountType = document.getElementById('accountType');
const yearLevelBox = document.getElementById('yearLevelBox');

if (accountType) {
  accountType.addEventListener('change', () => {
    if (accountType.value === 'student') {
      yearLevelBox.style.display = 'block';
    } else {
      yearLevelBox.style.display = 'none';
    }
  });
}

document.getElementById("idNumber").addEventListener("input", function(e) {
  let value = e.target.value.replace(/\D/g, ""); // remove non-digits
  if (value.length > 2 && value.length <= 6) {
    value = value.slice(0,2) + "-" + value.slice(2);
  } else if (value.length > 6) {
    value = value.slice(0,2) + "-" + value.slice(2,6) + "-" + value.slice(6,9);
  }
  e.target.value = value;
});

// ==========================
// Firebase Registration
// ==========================
document.querySelector("#step2").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get values from the form
  const firstName = document.querySelector("#step1 input[placeholder='First Name']").value;
  const lastName = document.querySelector("#step1 input[placeholder='Last Name']").value;
  const middleInitial = document.querySelector("#step1 input[placeholder='MI']").value;
  const suffix = document.querySelector("#step1 input[placeholder='Suffix']").value;
  const accountType = document.getElementById("accountType").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const emailAddress = document.querySelector("#step1 input[type='email']").value;
  const idNumber = document.getElementById("idNumber").value;
  const password = document.getElementById("regPassword").value;
  const rfid = document.getElementById("rfid").value;
  const username = document.querySelector("#step1 input[placeholder='Username']").value;
  const yearLevel = document.getElementById("yearLevel").value;

  // Confirm password check
  if (password !== confirmPassword) {
    Swal.fire({
      icon: "error",
      title: "Password Mismatch",
      text: "❌ Passwords do not match. Please try again.",
      confirmButtonText: "OK"
    });
    return;
  }

  try {
    // Show loading popup
    Swal.fire({
      title: "Creating Account...",
      text: "Please wait while we process your registration.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Create user in Firebase Auth
    const userCredential = await auth.createUserWithEmailAndPassword(emailAddress, password);

    // Save extra details in Firestore
    await db.collection("users").doc(userCredential.user.uid).set({
      firstName,
      lastName,
      middleInitial,
      suffix,
      accountType,
      confirmPassword, // ⚠️ not recommended to store
      emailAddress,
      idNumber,
      password, // ⚠️ not recommended to store plaintext
      rfid,
      username,
      yearLevel,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Show success popup
    Swal.fire({
      icon: "success",
      title: "Account Created!",
      text: "✅ Your account has been registered successfully.",
      confirmButtonText: "Proceed to Login"
    }).then(() => {
      showForm("loginForm");
    });

  } catch (err) {
    // Show error popup
    Swal.fire({
      icon: "error",
      title: "Registration Failed",
      text: "❌ " + err.message,
      confirmButtonText: "Try Again"
    });
  }
});

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.querySelector("input[type='email']").value.trim();
  const password = document.querySelector("#loginPassword").value;

  if (!email || !password) {
    Swal.fire({
      icon: "warning",
      title: "Missing Information",
      text: "Please enter both email and password.",
      confirmButtonColor: "#3085d6"
    });
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      // ✅ Login successful
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Redirecting to your dashboard...",
        showConfirmButton: false,
        timer: 2000
      }).then(() => {
        window.location.href = "https://canoneropab2003.github.io/parkada-dashboard/";
      });
    })
    .catch((error) => {
      // ❌ Login failed
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.message,
        confirmButtonColor: "#d33"
      });
    });
});


