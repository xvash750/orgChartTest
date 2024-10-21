
function saveData() {
    const table = document.querySelector('table');
    const rows = table.querySelectorAll('tr');
    const updatedData = [];

    rows.forEach((row, rowIndex) => {
        if (rowIndex === 0) return; // Skip header row
        const cells = row.querySelectorAll('td');
        const rowData = {};
        cells.forEach(cell => {
            const input = cell.querySelector('input');
            if (input) {
                const header = input.getAttribute('data-header');
                rowData[header] = input.value; // Get value from input
            } else {
                const header = "ID"; // Ensure ID is fetched correctly
                rowData[header] = cell.textContent;
            }
        });
        updatedData.push(rowData);
    });

    localStorage.setItem("csvData", JSON.stringify(updatedData));
    alert('Data saved successfully!');
}