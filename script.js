document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("search-btn");
  const usernameInput = document.getElementById("user-input");
  const statsContainer = document.querySelector(".stats-container");
  const easyProgressCircle = document.querySelector(".easy-progress");
  const mediumProgressCircle = document.querySelector(".medium-progress");
  const hardProgressCircle = document.querySelector(".hard-progress");
  const easyLabel = document.getElementById("easy-label");
  const mediumLabel = document.getElementById("medium-label");
  const hardLabel = document.getElementById("hard-label");
  const cardStatsContainer = document.querySelector(".stats-cards");

  function validateUsername(username) {
    if (username.trim() === "") {
      alert("Username should not be empty");
      return false;
    }
    const regex = /^[a-zA-Z0-9_-]{1,15}$/;
    const isMatching = regex.test(username);
    if (!isMatching) {
      alert("Invalid Username");
    }
    return isMatching;
  }

  async function fetchUserDetails(username) {
    try {
      searchButton.textContent = "Searching...";
      searchButton.disabled = true;

      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const targetUrl = 'https://leetcode.com/graphql/';

      const myHeaders = new Headers();
      myHeaders.append("content-type", "application/json");

      const graphql = JSON.stringify({
        query: `
          query userSessionProgress($username: String!) {
            allQuestionsCount {
              difficulty
              count
            }
            matchedUser(username: $username) {
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                  submissions
                }
                totalSubmissionNum {
                  difficulty
                  count
                  submissions
                }
              }
            }
          }
        `,
        variables: { username }
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: graphql,
      };

      const response = await fetch(proxyUrl + targetUrl, requestOptions);
      if (!response.ok) {
        throw new Error("Unable to fetch the User details");
      }
      const parsedData = await response.json();
      displayUserData(parsedData);
    } catch (error) {
      statsContainer.innerHTML = `<p>${error.message}</p>`;
    } finally {
      searchButton.textContent = "Search";
      searchButton.disabled = false;
    }
  }

  function updateProgress(solved, total, label, circle) {
    const progressDegree = (solved / total) * 100;
    circle.style.setProperty("--progress-degree", `${progressDegree}%`);
    label.textContent = `${solved}/${total}`;
  }

  function displayUserData(parsedData) {
    const totalEasyQues = parsedData.data.allQuestionsCount.find(q => q.difficulty === "Easy").count;
    const totalMediumQues = parsedData.data.allQuestionsCount.find(q => q.difficulty === "Medium").count;
    const totalHardQues = parsedData.data.allQuestionsCount.find(q => q.difficulty === "Hard").count;

    const stats = parsedData.data.matchedUser.submitStats.acSubmissionNum;
    const totalStats = parsedData.data.matchedUser.submitStats.totalSubmissionNum;

    const solvedEasy = stats.find(q => q.difficulty === "Easy").count;
    const solvedMedium = stats.find(q => q.difficulty === "Medium").count;
    const solvedHard = stats.find(q => q.difficulty === "Hard").count;

    updateProgress(solvedEasy, totalEasyQues, easyLabel, easyProgressCircle);
    updateProgress(solvedMedium, totalMediumQues, mediumLabel, mediumProgressCircle);
    updateProgress(solvedHard, totalHardQues, hardLabel, hardProgressCircle);

    const cardsData = totalStats.map((q, i) => ({
      label: `${q.difficulty} Submissions`,
      value: q.submissions,
    }));

    cardStatsContainer.innerHTML = cardsData.map(
      data =>
        `<div class="card">
          <h4>${data.label}</h4>
          <p>${data.value}</p>
        </div>`
    ).join("");
  }

  searchButton.addEventListener('click', function () {
    const username = usernameInput.value;
    if (validateUsername(username)) {
      fetchUserDetails(username);
    }
  });
});





