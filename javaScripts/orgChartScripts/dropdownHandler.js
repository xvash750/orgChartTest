document.addEventListener("DOMContentLoaded", function () {
    // Add event listener for Clear Filters button
    document.getElementById("ex").addEventListener("click", () => {
        console.log("Clear Filters button clicked"); // Debugging

        // Reset the dropdown filters to "All"
        document.getElementById("teamDropdown").value = "All";
        document.getElementById("nameDropdown").value = "All";

        // Make all nodes visible but don't expand all nodes
        nodes.forEach(node => {
            node.data.visible = true;  // Make every node visible
            if (node.depth > 0) {
                collapse(node);  // Collapse non-root nodes if necessary
            }
        });

        // Re-render the chart
        console.log("Calling update() to re-render chart with clear filters"); // Debugging
        update(root);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Load the data from localStorage
    const csvData = localStorage.getItem("csvData");

    if (csvData) {
        let parsedData = JSON.parse(csvData);

        if (typeof parsedData === 'string') {
            parsedData = parseCSV(parsedData); // Implement parseCSV function if needed
        }

        // Populate both dropdowns initially
        populateDropdowns(parsedData);

        // Event listeners for dropdown changes
        document.getElementById("teamDropdown").addEventListener("change", function () {
            const selectedTeam = this.value;
            updateNameDropdown(parsedData, selectedTeam);
            applyFilters(parsedData);
        });

        document.getElementById("nameDropdown").addEventListener("change", function () {
            const selectedName = this.value;
            const selectedTeam = document.getElementById("teamDropdown").value;
            updateTeamDropdown(parsedData, selectedName, selectedTeam);
            applyFilters(parsedData);
        });

        function populateDropdowns(data) {
            populateTeamDropdown(data);
            populateNameDropdown(data);
        }

        function populateTeamDropdown(data, selectedName = "All", preserveTeam = null) {
            const teamDropdown = document.getElementById("teamDropdown");
            const currentTeam = preserveTeam || teamDropdown.value;
            teamDropdown.innerHTML = ''; // Clear options
            teamDropdown.appendChild(new Option("All", "All")); // Add "All"

            const filteredData = selectedName === "All" ? data : data.filter(row => row['Name'] === selectedName);
            const teams = [...new Set(filteredData.map(row => row['Team']))];
            teams.forEach(team => {
                const option = new Option(team, team);
                teamDropdown.appendChild(option);
            });

            if (teams.includes(currentTeam) || currentTeam === "All") {
                teamDropdown.value = currentTeam;
            } else {
                teamDropdown.value = "All"; // Reset to "All" if no match
            }
        }

        function populateNameDropdown(data, selectedTeam = "All", preserveName = null) {
            const nameDropdown = document.getElementById("nameDropdown");
            const currentName = preserveName || nameDropdown.value;
            nameDropdown.innerHTML = ''; // Clear options
            nameDropdown.appendChild(new Option("All", "All")); // Add "All"

            const filteredData = selectedTeam === "All" ? data : data.filter(row => row['Team'] === selectedTeam);
            const names = [...new Set(filteredData.map(row => row['Name']))];
            names.forEach(name => {
                const option = new Option(name, name);
                nameDropdown.appendChild(option);
            });

            if (names.includes(currentName) || currentName === "All") {
                nameDropdown.value = currentName;
            } else {
                nameDropdown.value = "All"; // Reset to "All" if no match
            }
        }

        // Apply filters to the chart based on dropdown values
        function applyFilters(data) {
            const selectedTeam = document.getElementById("teamDropdown").value;
            const selectedName = document.getElementById("nameDropdown").value;

            // Filter data based on selected dropdowns
            let filteredData = data;

            if (selectedTeam !== "All") {
                filteredData = filteredData.filter(row => row['Team'] === selectedTeam);
            }

            if (selectedName !== "All") {
                filteredData = filteredData.filter(row => row['Name'] === selectedName);
            }

            // Render the chart with filtered data
            renderChart(filteredData);
        }

        // Function to update the Name dropdown when Team dropdown changes
        function updateNameDropdown(data, selectedTeam) {
            const currentName = document.getElementById("nameDropdown").value;
            populateNameDropdown(data, selectedTeam, currentName);
        }

        // Function to update the Team dropdown when Name dropdown changes
        function updateTeamDropdown(data, selectedName, selectedTeam) {
            populateTeamDropdown(data, selectedName, selectedTeam);
        }

        // Dummy render function for chart (replace with actual chart rendering logic)
        function renderChart(filteredData) {
            console.log("Rendering chart with filtered data: ", filteredData);
            // Actual chart rendering logic should go here
        }
    }
});
