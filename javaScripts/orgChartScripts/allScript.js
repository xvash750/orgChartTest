
function toggleMenu() {
    const menu = document.getElementById("menu");
    menu.classList.toggle("active");
}
// Function to toggle the filter menu
function toggleFilterMenu() {
    const filterMenu = document.getElementById("filterMenu");
    filterMenu.classList.toggle("active");
}
// Function to parse CSV data
function parseCSV(csvString) {
// Split CSV string into rows and trim each cell
const rows = csvString.split("\n").map(row => 
row.split(",").map(cell => cell.trim())
);

const headers = rows[0]; // First row contains headers

// Map rows to objects using headers as keys
const data = rows.slice(1) // Exclude header row
.filter(row => row.some(cell => cell !== '')) // Filter out empty rows
.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
        obj[header.trim()] = row[i] ? row[i].trim() : null; // Handle missing values
    });
    return obj; // Return object for each row
});

return data; // Return parsed data
}


// Load the data from localStorage
const csvData = localStorage.getItem("csvData");

if (csvData) {
let parsedData = JSON.parse(csvData);

// If the data is a CSV string, parse it
if (typeof parsedData === 'string') {
parsedData = parseCSV(parsedData);
}

// Convert parsed data into the correct format for the org chart
const employeeData = parsedData.map(row => ({
id: row['ID'],             // Assuming your CSV has an 'ID' column
name: row['Name'],         // Assuming 'Name' column in the CSV
managerId: row['Manager ID'], // Assuming 'Manager ID' column in the CSV
team: row['Team'],         // Assuming 'Team' column in the CSV
jobTitle: row['Job Title'] // Assuming 'Job Title' column in the CSV
}));


function populateTeamDropdown(data) {
const dropdown = document.getElementById("teamDropdown");
const teams = ["All"]; // Start with 'All' option

// Get unique team names from the data
data.forEach(row => {
if (!teams.includes(row.Team)) {
    teams.push(row.Team);
}
});

// Populate dropdown with team options
teams.forEach(team => {
const option = document.createElement("option");
option.value = team;
option.text = team;
dropdown.appendChild(option);
});
}
populateTeamDropdown(parsedData);

document.getElementById("teamDropdown").addEventListener("change", function() {
const selectedTeam = this.value;
filterNodesByTeam(selectedTeam);
});

function filterNodesByTeam(team) {
nodes.forEach(node => {
// If 'All' is selected or the node's team matches the selected team, show the node
if (team === "All" || node.data.team === team) {
    node.data.visible = true;
} else {
    node.data.visible = false;
}
});
update(root); // Re-render the chart with filtered nodes
}


function populateNameDropdown(data) {
const dropdown = document.getElementById("nameDropdown");
const names = ["All"]; // Start with 'All' option

// Get unique names from the data
data.forEach(row => {
if (!names.includes(row.Name)) { // Ensure the name is unique
    names.push(row.Name);
}
});

// Populate dropdown with name options
names.forEach(name => {
const option = document.createElement("option");
option.value = name; // Use 'name' instead of 'team'
option.text = name;  // Use 'name' instead of 'team'
dropdown.appendChild(option);
});
}

// Call the function to populate the dropdown
populateNameDropdown(parsedData);

// Add event listener for the name dropdown
document.getElementById("nameDropdown").addEventListener("change", function() {
const selectedName = this.value; // Get the selected name
filterNodesByName(selectedName); // Pass the selected name to the filter function
});

function filterNodesByName(name) {
// First, set all nodes to invisible
nodes.forEach(node => {
node.data.visible = false;
});

// If "All" is selected, make all nodes visible
if (name === "All") {
nodes.forEach(node => {
    node.data.visible = true;
});
} else {
// Set the selected node and its parents to visible
nodes.forEach(node => {
    if (node.data.name === name) {
        node.data.visible = true; // Make the selected node visible
        expand(node); // Expand the selected node to show children
    }
});

// Ensure that all children of the selected node remain visible
nodes.forEach(node => {
    if (node.parent && node.parent.data.visible) {
        node.data.visible = true; // Make children visible if parent is visible
    }
});
}

update(root); // Re-render the chart with filtered nodes
}



function update(source) {
treeData = treeLayout(root);
nodes = treeData.descendants();
links = treeData.links();

svg.selectAll("*").remove();

// Render only links where both source and target nodes are visible
const link = svg.selectAll(".link")
.data(links.filter(link => link.source.data.visible && link.target.data.visible))
.enter().append("path")
.attr("class", "link")
.attr("d", d3.linkVertical()
    .x((d) => d.x)
    .y((d) => d.y)
)
.attr("stroke-width", "2px");

// Render only visible nodes
const node = svg.selectAll(".node")
.data(nodes.filter(node => node.data.visible))
.enter().append("g")
.attr("class", "node")
.attr("transform", (d) => `translate(${d.x},${d.y})`);

node.append("rect")
.attr("width", 200)
.attr("height", 60)
.attr("x", -100)
.attr("y", -30)
.style("fill", "#f4f4f4")
.style("stroke", "")
.style("rx", 10)
.style("ry", 10)
.on("click", click);

node.append("text")
.attr("dy", -15)
.attr("x", 0)
.attr("text-anchor", "middle")
.text(d => `${d.data.name} (${d.data.childCount})`)
.style("font-size", "15px")
.style("fill", "#5e4b8a");

node.append("text")
.attr("dy", 0)
.attr("x", 0)
.attr("text-anchor", "middle")
.text((d) => d.data.jobTitle)
.style("font-size", "12px")
.style("fill", "#333");

node.append("text")
.attr("dy", 15)
.attr("x", 0)
.attr("text-anchor", "middle")
.text((d) => d.data.team)
.style("font-size", "12px")
.style("fill", "#333");
}


const width = window.innerWidth;
const height = window.innerHeight;

// Create the SVG and set its dimensions
const svg = d3.select("#org-chart")
.attr("width", width)
.attr("height", height)
.call(d3.zoom().on("zoom", zoomed)) // Add zoom behavior
.append("g"); // Group to apply zoom transformations

// Prepare the data for the tree layout
const root = d3.stratify()
.id(d => d.id)
.parentId(d => d.managerId)(employeeData);

// Define the tree layout
const treeLayout = d3.tree()
.nodeSize([200, 150]);

// Count children for each employee
employeeData.forEach(employee => {
employee.childCount = employeeData.filter(e => e.managerId === employee.id).length; // Count children
});

let treeData = treeLayout(root);
let nodes = treeData.descendants();
let links = treeData.links();

// Expand nodes at first render
nodes.forEach(d => {
d.data.visible = true; // Ensure all nodes are visible
if (d.depth > 0) { // Expand all nodes
    expand(d);
}
});
// Update the tree visualization
update(root);

document.getElementById("expandAllBtn").addEventListener("click", () => {
nodes.forEach(d => {
// Expand the node if its depth is less than the calculated max depth
if (d.depth < maxDepth) {
    expand(d);
}
});
update(root);
});

// Add event listener for Collapse All button
document.getElementById("collapseAllBtn").addEventListener("click", () => {
nodes.forEach(d => {
if (d.depth === 1) {
    collapse(d);
}
});
update(root);

// Apply "All" filter on initial render
const team = "All"; // Set initial filter to "All"
applyFilter(team); // Call the filter function on page load
update(root);
});

// Add event listener for Expand All button
document.getElementById("expandAllBtn").addEventListener("click", () => {
nodes.forEach(d => {
// Expand the node if its depth is less than the calculated max depth
if (d.depth < maxDepth) {
    expand(d);
}
});
update(root);
});

document.getElementById('expandNxtBtn').addEventListener('click', function() {
nodes.forEach(node => {
if (node.depth === currentDepth) { // Check if node is at the current depth
    expand(node); // Expand this node
}
});
currentDepth++; // Increment the depth to expand the next level next time

update(root);
});
// Function to filter employee data based on the selected team or name
function getFilteredEmployeeData() {
const selectedTeam = document.getElementById("teamDropdown").value;
const selectedName = document.getElementById("nameDropdown").value;

return employeeData.filter(employee => {
const matchesTeam = selectedTeam === "All" || employee.team === selectedTeam;
const matchesName = selectedName === "All" || employee.name === selectedName;
return matchesTeam && matchesName;
});
}

// <Average Line Reports> - Recalculate based on filtered data
function updateMetrics(filteredData) {
const managerIds = new Set();
filteredData.forEach(employee => {
if (employee.managerId) {
    managerIds.add(employee.managerId); // Add unique manager IDs
}
});

const numberOfManagers = managerIds.size;
const numberOfPositions = filteredData.length; // Total number of positions

// Calculate average line reports
const averageReports = numberOfManagers > 0 ? numberOfPositions / numberOfManagers : 0;

// Calculate max depth based on filtered data
const employeeMap = {};
filteredData.forEach(emp => {
employeeMap[emp.id] = emp;
});

function calculateDepth(employeeId, depth) {
const employee = employeeMap[employeeId];
if (!employee) return depth;

let maxDepth = depth;
const children = filteredData.filter(emp => emp.managerId === employeeId);

for (const child of children) {
    maxDepth = Math.max(maxDepth, calculateDepth(child.id, depth + 1));
}
return maxDepth;
}

// Calculate max depth for each root node
const rootIds = filteredData.filter(emp => !emp.managerId).map(emp => emp.id);
const maxDepth = Math.max(...rootIds.map(id => calculateDepth(id, 0)));

// Update the mini banner with new values
document.getElementById("managerCount").innerText = `Number of Managers: ${numberOfManagers}`;
document.getElementById("positionCount").innerText = `Number of Positions: ${numberOfPositions}`;
document.getElementById("maxDepth").innerText = `Max Depth: ${maxDepth}`;
document.getElementById("averageReports2").innerText = `Average Line Reports: ${averageReports.toFixed(2)}`; // Rounded to 2 decimals
}


// Add event listener to update chart and metrics when a filter changes
document.getElementById("teamDropdown").addEventListener("change", function() {
const filteredData = getFilteredEmployeeData();
filterNodesByTeam(this.value);
updateMetrics(filteredData); // Update the metrics based on filtered data
});

document.getElementById("nameDropdown").addEventListener("change", function() {
const filteredData = getFilteredEmployeeData();
filterNodesByName(this.value);
updateMetrics(filteredData); // Update the metrics based on filtered data
});

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        }
    }

    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d._children = null;
        }
    }

    function click(event, d) {
        if (d.children) {
            // Collapse only the children of the clicked node's parent
            collapse(d);
        } else {
            // Expand only the immediate children, not all descendants
            expand(d);
        }
        update(d); // Update the tree
    }

    function zoomed(event) {
        svg.attr("transform", event.transform);
    }
    function filterTableByTeam(team) {
const rows = document.querySelectorAll("table tbody tr"); // Select table rows

rows.forEach(row => {
const teamCell = row.querySelector("td:nth-child(3)"); // Assuming the team column is the 3rd
if (team === "All" || team === "" || teamCell.textContent === team)
{
    row.style.display = ""; // Show row
} else {
    row.style.display = "none"; // Hide row
}
});
}
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Add the org chart SVG to the PDF
    const svg = document.getElementById("org-chart");
    const svgData = new XMLSerializer().serializeToString(svg);
    const imgData = 'data:image/svg+xml;base64,' + btoa(svgData);
    
    pdf.addImage(imgData, 'SVG', 10, 10, 190, 0); // Adjust dimensions as needed
    pdf.save('org_chart.pdf');
}

function downloadPPTX() {
    const pptx = new PptxGenJS();
    const slide = pptx.addSlide();

    // Add the org chart SVG to the PPTX
    const svg = document.getElementById("org-chart");
    const svgData = new XMLSerializer().serializeToString(svg);
    const imgData = 'data:image/svg+xml;base64,' + btoa(svgData);

    slide.addImage({ data: imgData, x: 1, y: 1, w: 8, h: 6 }); // Adjust dimensions as needed
    pptx.writeFile('org_chart.pptx');
}
}

