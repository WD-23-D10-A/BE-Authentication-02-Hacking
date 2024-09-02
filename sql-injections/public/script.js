document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const username = formData.get("username");
  const password = formData.get("password");

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `username=${encodeURIComponent(
      username
    )}&password=${encodeURIComponent(password)}`,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.isAdmin) {
        window.location.href = "/admin.html";
      } else {
        document.getElementById("dataView").style.display = "block";
        document.getElementById(
          "dataTable"
        ).innerHTML = `<tr><td>Username: ${data.user.username}</td><td>Score: ${data.user.score}</td></tr>`;
      }
    })
    .catch((error) => console.error("Error:", error));
});

function updateScore(userId, newScore) {
  fetch("/update-score", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `userId=${userId}&newScore=${newScore}`,
  }).then((response) => {
    if (response.ok) {
      alert("Score updated successfully");
    } else {
      alert("Failed to update score");
    }
  });
}
