
    // If logged in, load CSV data from localStorage and render the table
    const data = localStorage.getItem("csvData");
    if (data) {
        csvData = JSON.parse(data); // Store data in global variable
        renderTable(csvData); // Render the table
    } else {
        document.getElementById('data-table').innerHTML = '<p>No data available. Please upload a CSV file.</p>';
    }

