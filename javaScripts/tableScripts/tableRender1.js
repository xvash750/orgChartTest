let csvData = []; // Global variable to store CSV data
let currentSortColumn = null; // Store the current sort column
let sortOrder = 'asc'; // Store the sort order

// Function to render the table
function renderTable(data) {
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const headers = Object.keys(data[0]);

    // Create headers
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.addEventListener('click', () => sortTable(header)); // Add click event for sorting
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create rows
    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            if (header === "ID") {
                // Display ID as plain text (read-only)
                td.textContent = row[header]; // Display ID
            } else {
                // Allow editing for other columns
                const input = document.createElement('input');
                input.value = row[header];
                input.setAttribute('data-header', header);
                td.appendChild(input);
            }
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    document.getElementById('data-table').innerHTML = '';
    document.getElementById('data-table').appendChild(table);
}
