document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        // Create activity card
        const card = document.createElement("div");
        card.className = "activity-card";

        const participantCount = details.participants.length;
        const availableSpots = details.max_participants - participantCount;

        card.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Available Spots:</strong> ${availableSpots}/${details.max_participants}</p>
          <div class="participants-section">
            <h5>Participants (${participantCount})</h5>
            ${details.participants.length > 0
              ? `<ul class="participants-list">
                  ${details.participants.map(email => `
                    <li>
                      <span>${email}</span>
                      <button class="delete-btn" data-activity="${name}" data-email="${email}" title="Remove participant">✕</button>
                    </li>
                  `).join('')}
                </ul>`
              : `<p class="no-participants">No participants yet</p>`
            }
          </div>
        `;

        activitiesList.appendChild(card);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add delete button event listeners
      document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          const activityName = btn.dataset.activity;
          const email = btn.dataset.email;

          if (confirm(`Are you sure you want to remove ${email} from ${activityName}?`)) {
            try {
              const response = await fetch(
                `/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`,
                {
                  method: "DELETE",
                }
              );

              if (response.ok) {
                messageDiv.textContent = `Successfully removed ${email} from the activity`;
                messageDiv.className = "message success";
                fetchActivities(); // Reload to show updated participants
              } else {
                const error = await response.json();
                messageDiv.textContent = `Error: ${error.detail}`;
                messageDiv.className = "message error";
              }

              messageDiv.classList.remove("hidden");

              // Hide message after 5 seconds
              setTimeout(() => {
                messageDiv.classList.add("hidden");
              }, 5000);
            } catch (error) {
              messageDiv.textContent = "An error occurred. Please try again.";
              messageDiv.className = "message error";
              messageDiv.classList.remove("hidden");
              console.error("Error removing participant:", error);
            }
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;
    const messageDiv = document.getElementById("message");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        messageDiv.textContent = "Successfully signed up!";
        messageDiv.className = "message success";
        signupForm.reset();
        fetchActivities(); // Reload to show updated participants
      } else {
        const error = await response.json();
        messageDiv.textContent = `Error: ${error.detail}`;
        messageDiv.className = "message error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "An error occurred. Please try again.";
      messageDiv.className = "message error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Load activities on page load
  fetchActivities();
});
