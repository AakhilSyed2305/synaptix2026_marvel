const students = [
    { roll: 1, name: "Rahul" },
    { roll: 2, name: "Anita" },
    { roll: 3, name: "Kiran" },
    { roll: 4, name: "Sneha" },
    { roll: 5, name: "Arjun" }
];

function loadStudents() {
    const table = document.getElementById("attendanceTable");
    const body = document.getElementById("studentBody");
    const submitBtn = document.getElementById("submitBtn");

    body.innerHTML = ""; // Clear existing rows

    students.forEach(student => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.roll}</td>
            <td>${student.name}</td>
            <td>
                <label>
                    <input type="radio" name="att${student.roll}" value="Present"> Present
                </label>
                <label>
                    <input type="radio" name="att${student.roll}" value="Absent"> Absent
                </label>
            </td>
        `;

        body.appendChild(row);
    });

    table.style.display = "table";
    submitBtn.style.display = "inline-block";
}

function submitAttendance() {
    let present = 0;
    let absent = 0;

    students.forEach(student => {
        const status = document.querySelector(`input[name="att${student.roll}"]:checked`);
        if (status) {
            if (status.value === "Present") present++;
            else absent++;
        }
    });

    document.getElementById("summary").innerHTML =
        `Present: <span class="present">${present}</span> |
         Absent: <span class="absent">${absent}</span>`;
}