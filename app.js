// Smart Academic Tracker - Core Application Logic

const API_URL = "https://script.google.com/macros/s/AKfycbwYOmqyV5flipneUvawLdNnb3FNPf5pVMzzFZzTNQNWb2HiAnlF88BeqJh_fXiFu8gWig/exec";

class AcademicTrackerApp {
    constructor() {
        this.currentRole = 'student';
        this.sections = ['landing-section', 'auth-section', 'student-dashboard', 'faculty-dashboard'];
        this.init();
    }

    init() {
        // Ensure DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            // Mock Data for demonstration
            this.setupMockData();
            // Fetch dynamic events
            this.loadEvents();
            // Set initial state
            this.showSection('landing-section');
        });
    }

    setupEventListeners() {
        // Auth forms
        document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
    }

    setupMockData() {
        // Mock Syllabus Data simulating Firestore collection
        this.mockSyllabus = [
            { date: '2026-09-01', subject: 'Web Development (CS202)', topic: 'Intro to React & JSX', videoUrl: 'https://www.youtube.com/results?search_query=Intro+to+React+JSX', notesUrl: 'https://docs.google.com' },
            { date: '2026-09-03', subject: 'Web Development (CS202)', topic: 'React State & Props', videoUrl: 'https://www.youtube.com/results?search_query=React+State+and+Props', notesUrl: 'https://docs.google.com' },
            { date: '2026-09-05', subject: 'Web Development (CS202)', topic: 'Lifecycle & Hooks', videoUrl: 'https://www.youtube.com/results?search_query=React+Lifecycle+and+Hooks', notesUrl: 'https://docs.google.com' },
            { date: '2026-09-10', subject: 'Web Development (CS202)', topic: 'Routing with React Router', videoUrl: 'https://www.youtube.com/results?search_query=React+Router+Tutorial', notesUrl: 'https://docs.google.com' },
            { date: '2026-09-12', subject: 'Web Development (CS202)', topic: 'Context API & Redux', videoUrl: 'https://www.youtube.com/results?search_query=React+Context+API+Redux', notesUrl: 'https://docs.google.com' }
        ];

        // Mock Student Record including subject-wise data
        this.studentRecord = {
            totalClassesHosted: 50,
            classesAttended: 38,
            missedDates: ['2026-09-03', '2026-09-10'], // They missed State/Props and Routing
            subjects: [
                {
                    id: "CS202",
                    name: 'Web Development (CS202)',
                    totalClasses: 30,
                    attendedClasses: 22,
                    marksObtained: 42,
                    marksTotal: 50,
                    grade: "A"
                },
                {
                    id: "CS201",
                    name: 'Data Structures (CS201)',
                    totalClasses: 20,
                    attendedClasses: 16,
                    marksObtained: 38,
                    marksTotal: 50,
                    grade: "B+"
                }
            ]
        };
    }

    // --- Navigation & UI ---

    showSection(sectionId) {
        this.sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (id === sectionId) {
                    el.classList.remove('hidden');
                    // Trigger reflow for animation
                    void el.offsetWidth;
                } else {
                    el.classList.add('hidden');
                }
            }
        });

        // Hide user nav if going back to landing or auth (if not logged in)
        if (sectionId === 'landing-section' || sectionId === 'auth-section') {
            document.getElementById('user-nav').classList.add('hidden');
        }
    }

    openModal(modalId) {
        document.getElementById(modalId)?.classList.remove('hidden');
        if (modalId === 'events-modal') {
            this.loadEvents();
        } else if (modalId === 'lost-found-modal') {
            this.loadLostFoundFeed();
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId)?.classList.add('hidden');
    }

    // --- Dynamic Data Fetching ---

    async loadEvents() {
        const container = document.getElementById('events-container');
        container.innerHTML = `<div class="flex justify-center items-center h-full text-slate-400">Loading events...</div>`;

        try {
            let events = [];
            if (typeof window.fetchEvents === 'function') {
                events = await window.fetchEvents();
            } else {
                console.warn("fetchEvents not found, falling back to empty list.");
            }

            if (events.length === 0) {
                container.innerHTML = `<div class="text-center text-slate-400 p-4">No events found in Firebase. Admin needs to add them!</div>`;
                return;
            }

            container.innerHTML = events.map(ev => `
                <div class="border-b border-white/10 pb-5 mb-5 last:border-0 last:mb-0">
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="text-xl font-bold text-white">${ev.Name || ev.name || 'College Event'}</h3>
                        <span class="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full border border-purple-500/30">Event</span>
                    </div>
                    <p class="text-sm text-slate-400 mb-4"><strong class="text-slate-300">Date:</strong> ${ev.Date || ev.date || 'TBA'}</p>
                    <button onclick="alert('${(ev.Rules || ev.rules || 'No special rules.').replace(/'/g, "\\'")}')" 
                        class="bg-slate-800/80 hover:bg-slate-700 text-purple-400 px-4 py-2 rounded-lg transition-colors font-medium border border-white/5 text-sm">
                        View Rules
                    </button>
                </div>
            `).join('');
        } catch (error) {
            console.error("Failed to load events:", error);
            container.innerHTML = `<div class="text-center text-red-400 p-4">Failed to load events. Check console.</div>`;
        }
    }

    // --- Authentication ---

    switchAuthRole(role) {
        this.currentRole = role;
        const btnStudent = document.getElementById('toggle-student');
        const btnFaculty = document.getElementById('toggle-faculty');
        const studentFields = document.getElementById('student-login-fields');
        const facultyFields = document.getElementById('faculty-login-fields');
        const btnRegister = document.getElementById('btn-register');

        if (role === 'student') {
            // UI Toggle
            btnStudent.classList.replace('text-slate-400', 'text-blue-400');
            btnStudent.classList.remove('hover:text-slate-200');
            btnStudent.classList.add('bg-blue-500/20', 'border-blue-500/30');

            btnFaculty.classList.replace('text-blue-400', 'text-slate-400');
            btnFaculty.classList.add('hover:text-slate-200');
            btnFaculty.classList.remove('bg-blue-500/20', 'border-blue-500/30');

            studentFields.classList.remove('hidden');
            facultyFields.classList.add('hidden');
            if (btnRegister) btnRegister.classList.remove('hidden');
        } else {
            // UI Toggle
            btnFaculty.classList.replace('text-slate-400', 'text-blue-400');
            btnFaculty.classList.remove('hover:text-slate-200');
            btnFaculty.classList.add('bg-blue-500/20', 'border-blue-500/30');

            btnStudent.classList.replace('text-blue-400', 'text-slate-400');
            btnStudent.classList.add('hover:text-slate-200');
            btnStudent.classList.remove('bg-blue-500/20', 'border-blue-500/30');

            facultyFields.classList.remove('hidden');
            studentFields.classList.add('hidden');
            if (btnRegister) btnRegister.classList.add('hidden');
        }
    }

    async handleRegister() {
        const errEl = document.getElementById('auth-error');
        errEl.classList.add('hidden');

        if (this.currentRole === 'student') {
            const email = document.getElementById('student-email').value;
            const password = document.getElementById('student-pass').value;

            if (!email || !password) {
                errEl.textContent = "Please provide an Email and Password to register.";
                errEl.classList.remove('hidden');
                return;
            }

            try {
                if (typeof window.register === 'function') {
                    await window.register(email, password);
                } else {
                    errEl.textContent = "Registration is currently unavailable (Script Error).";
                    errEl.classList.remove('hidden');
                }
            } catch (error) {
                console.error("Registration caught error", error);
            }
        }
    }

    async handleLogin(e) {
        e.preventDefault();

        const errEl = document.getElementById('auth-error');
        errEl.classList.add('hidden');

        if (this.currentRole === 'student') {
            const dept = document.getElementById('student-dept').value;
            const roll = document.getElementById('student-roll').value;
            const email = document.getElementById('student-email').value;
            const password = document.getElementById('student-pass').value;

            if (!dept || !roll || !email || !password) {
                errEl.textContent = "Please fill all fields (Dept, Roll No, Email, Password).";
                errEl.classList.remove('hidden');
                return;
            }

            try {
                // Call the user's custom global login function attached to window
                if (typeof window.login === 'function') {
                    await window.login(email, password);
                } else {
                    // Fallback to direct firebase auth if the script isn't loaded
                    const auth = window.firebaseAuth;
                    const userCredential = await window.signInWithEmailAndPassword(auth, email, password);
                }

                // Store student info for later use
                this.currentStudentInfo = { dept, roll, email };

                this.loginSuccess();
            } catch (error) {
                errEl.textContent = `Login failed: ${error.message}`;
                errEl.classList.remove('hidden');
            }
        } else {
            const id = document.getElementById('faculty-id').value;
            const pass = document.getElementById('faculty-pass').value;
            if (id === 'admin' && pass === 'admin') {
                this.loginSuccess();
            } else {
                errEl.textContent = "Invalid credentials. Try demo accounts.";
                errEl.classList.remove('hidden');
            }
        }
    }

    loginSuccess() {
        const nav = document.getElementById('user-nav');
        const roleDisplay = document.getElementById('user-role-display');

        nav.classList.remove('hidden');
        nav.classList.add('flex', 'items-center');

        if (this.currentRole === 'student') {
            roleDisplay.textContent = 'Student';
            roleDisplay.className = 'mr-4 text-sm font-semibold text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30';
            this.showSection('student-dashboard');
            // Init student dash data
            this.updateAttendanceLabels();
            this.generateCatchupTimeline();
        } else {
            roleDisplay.textContent = 'Faculty / Admin';
            roleDisplay.className = 'mr-4 text-sm font-semibold text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full border border-teal-500/30';
            this.showSection('faculty-dashboard');
        }

        // Setup logout inside login
        document.getElementById('logout-btn').onclick = () => {
            this.showSection('landing-section');
        };
    }

    // --- Attendance & Leave Planner Logic ---

    async handleMarkAttendance() {
        if (this.currentRole !== 'faculty') {
            alert("Unauthorized. Only faculty can perform live check-ins.");
            return;
        }

        const inputEl = document.getElementById('live-checkin-id');
        const uid = inputEl ? inputEl.value.trim() : "";

        if (!uid) {
            alert("Please enter a valid Student Roll Number or ID.");
            return;
        }

        try {
            if (typeof window.markAttendance === 'function') {
                await window.markAttendance(uid);
                if (inputEl) inputEl.value = ''; // clear upon success
            } else {
                alert("Mark Attendance function is not available on window.");
            }
        } catch (error) {
            console.error("Caught error calling markAttendance:", error);
        }
    }

    updateAttendanceLabels() {
        // Calculate Totals from Subjects
        let totalAttended = 0;
        let totalHosted = 0;
        let totalMarksEarned = 0;
        let totalMaxMarks = 0;

        this.studentRecord.subjects.forEach(sub => {
            totalAttended += sub.attendedClasses;
            totalHosted += sub.totalClasses;
            totalMarksEarned += sub.marksObtained;
            totalMaxMarks += sub.marksTotal;
        });

        // Overall Header Updates
        document.getElementById('lbl-total-classes').textContent = totalHosted;
        document.getElementById('lbl-classes-attended').textContent = totalAttended;

        const overallAttPercent = totalHosted > 0 ? ((totalAttended / totalHosted) * 100).toFixed(1) : 0;
        const overallMarksPercent = totalMaxMarks > 0 ? ((totalMarksEarned / totalMaxMarks) * 100).toFixed(1) : 0;

        const lblAtt = document.getElementById('lbl-overall-att');
        if (lblAtt) {
            lblAtt.textContent = `${overallAttPercent}%`;
            lblAtt.className = overallAttPercent >= 75
                ? "font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-lg border border-green-400/20"
                : "font-bold text-red-400 bg-red-400/10 px-3 py-1 rounded-lg border border-red-400/20";
        }

        const lblCurrentAtt = document.getElementById('lbl-current-att');
        if (lblCurrentAtt) {
            lblCurrentAtt.textContent = `${overallAttPercent}%`;
        }

        const lblMarks = document.getElementById('lbl-overall-marks');
        if (lblMarks) {
            lblMarks.textContent = `${overallMarksPercent}%`;
        }

        // Subject-Wise List
        const listContainer = document.getElementById('subject-performance-list');
        if (!listContainer) return;

        listContainer.innerHTML = ''; // Clear existing

        this.studentRecord.subjects.forEach(subject => {
            const attPercentage = ((subject.attendedClasses / subject.totalClasses) * 100).toFixed(1);
            const marksPercentage = ((subject.marksObtained / subject.marksTotal) * 100).toFixed(1);

            // Determine colors based on thresholds
            const attColor = attPercentage >= 75 ? 'text-green-400' : 'text-red-400';
            const attBg = attPercentage >= 75 ? 'bg-green-400/10 border-green-400/20' : 'bg-red-400/10 border-red-400/20';

            const cardHTML = `
                <div class="bg-slate-800/60 p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-800 transition-colors">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <h4 class="font-bold text-white text-lg">${subject.name}</h4>
                        </div>
                        <p class="text-sm text-slate-400 break-words">
                            Classes: <strong class="text-slate-300">${subject.attendedClasses} / ${subject.totalClasses}</strong>
                        </p>
                    </div>
                    
                    <div class="flex gap-4 w-full md:w-auto mt-2 md:mt-0">
                        <div class="flex-1 md:flex-none text-center px-4 py-2 rounded-xl border border-white/10 bg-slate-900/50">
                            <p class="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Attendance</p>
                            <p class="font-bold ${attColor} bg-transparent px-0 py-0 text-xl border-none">${attPercentage}%</p>
                        </div>
                        <div class="flex-1 md:flex-none text-center px-4 py-2 rounded-xl border border-white/10 bg-slate-900/50 relative overflow-hidden group">
                            <div class="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p class="relative z-10 text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Marks</p>
                            <p class="relative z-10 font-bold text-blue-400 text-xl">${subject.marksObtained} <span class="text-xs text-slate-500">/ ${subject.marksTotal}</span></p>
                        </div>
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    calculateLeave() {
        const leaveDaysInput = document.getElementById('leave-input').value;
        const resDiv = document.getElementById('leave-result');
        const resText = document.getElementById('leave-prediction-text');
        const resWarn = document.getElementById('leave-warning');

        if (!leaveDaysInput || isNaN(leaveDaysInput) || leaveDaysInput <= 0) {
            alert("Please enter a valid number of days.");
            return;
        }

        const X = parseInt(leaveDaysInput);

        let attended = 0;
        let total = 0;
        this.studentRecord.subjects.forEach(sub => {
            attended += sub.attendedClasses;
            total += sub.totalClasses;
        });

        // Formula: (attended / (totalClasses + X)) * 100
        const newTotal = total + X;
        const newPercentage = ((attended / newTotal) * 100).toFixed(1);

        resDiv.classList.remove('hidden');

        resText.innerHTML = `If you miss ${X} more classes, your attendance will be <strong>${newPercentage}%</strong>.`;

        if (newPercentage < 75) {
            resDiv.className = 'p-5 rounded-xl mt-6 transition-all bg-red-500/10 border border-red-500/30 backdrop-blur-md';
            resText.className = 'font-semibold text-red-400 text-lg';
            resWarn.className = 'text-sm mt-2 font-bold text-red-500';
            resWarn.innerHTML = `⚠️ RISK ALERT: Attendance falls below 75% requirement.`;
        } else {
            resDiv.className = 'p-5 rounded-xl mt-6 transition-all bg-green-500/10 border border-green-500/30 backdrop-blur-md';
            resText.className = 'font-semibold text-green-400 text-lg';
            resWarn.className = 'text-sm mt-2 text-green-500';
            resWarn.innerHTML = `✅ Safe to take leave. You are above 75%.`;
        }
    }


    // --- Catch-Up Bot Logic ---

    generateCatchupTimeline() {
        const timelineContainer = document.getElementById('catchup-timeline');
        timelineContainer.innerHTML = ''; // Clear previous

        // 1. Cross-reference missedDates with Syllabus collection
        const missedTopics = this.mockSyllabus.filter(topic =>
            this.studentRecord.missedDates.includes(topic.date)
        );

        if (missedTopics.length === 0) {
            timelineContainer.innerHTML = '<div class="text-center text-green-400 font-bold py-8 bg-slate-900/30 rounded-xl border border-dashed border-slate-700">You are all caught up! No missed classes found. 🎉</div>';
            return;
        }

        // 2. Render Timeline Cards
        missedTopics.forEach(topic => {
            const itemHTML = `
                <div class="absolute w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full -left-[13px] sm:-left-[29px] top-6 border-4 border-slate-900 shadow-[0_0_10px_rgba(168,85,247,0.5)] z-10"></div>
                <div class="timeline-item flex flex-col items-start bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative w-full lg:w-3/4 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300 border-l-[4px] border-l-purple-500 hover:border-l-indigo-400">
                    <span class="font-semibold text-xs tracking-wider bg-purple-500/10 text-purple-300 px-3 py-1 rounded-full border border-purple-500/20 mb-3">${this.formatDate(topic.date)}</span>
                    <h4 class="text-2xl font-bold text-white mb-2">${topic.topic}</h4>
                    <p class="text-slate-400 mb-6">${topic.subject}</p>
                    
                    <div class="flex flex-col sm:flex-row gap-3 mt-auto w-full">
                        <a href="${topic.videoUrl}" target="_blank" class="flex-1 text-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 py-2.5 px-4 rounded-xl transition-colors text-sm font-bold flex justify-center items-center gap-2 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                             ▶ Watch Video
                        </a>
                        <a href="${topic.notesUrl}" target="_blank" class="flex-1 text-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 py-2.5 px-4 rounded-xl transition-colors text-sm font-bold flex justify-center items-center gap-2 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                             📄 Read Notes
                        </a>
                    </div>
                </div>
            `;
            // Simplified container for the item to ensure layout handles the absolute marker correctly
            const wrapper = document.createElement('div');
            wrapper.className = "relative w-full ml-2 sm:ml-0";
            wrapper.innerHTML = itemHTML;
            timelineContainer.appendChild(wrapper);
        });

        // Ensure parent timeline has the connecting line line if there are items
        if (missedTopics.length > 0) {
            timelineContainer.className = "timeline relative ml-2 sm:ml-6 pl-6 sm:pl-10 space-y-8 mt-12 border-l-[3px] border-white/10 before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-gradient-to-b before:from-purple-500/50 before:to-transparent";
        }
    }


    // --- Faculty Forms Logic ---

    async handleAddEventSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('ev-title').value;
        const date = document.getElementById('ev-date').value;
        const rules = document.getElementById('ev-rules').value;

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const origText = submitBtn.innerText;
        submitBtn.innerText = "Creating...";

        if (typeof window.addEventToFirebase === 'function') {
            // Match the keys expected by the loadEvents query
            const success = await window.addEventToFirebase({
                Name: title,
                Date: date, // Keep raw YYYY-MM-DD for correct DB sorting
                Rules: rules
            });

            if (success) {
                alert(`Successfully created event: ${title}!`);
                e.target.reset();
            } else {
                alert(`Failed to create event. Check console.`);
            }
        } else {
            alert("Firebase function not found.");
        }
        submitBtn.innerText = origText;
    }

    handleBulkAttendance(e) {
        e.preventDefault();
        const date = document.getElementById('att-date').value;
        const absentInput = document.getElementById('absent-rolls').value;

        if (date && absentInput) {
            const absentees = absentInput.split(',').map(s => s.trim());
            alert(`Success! Marked ${absentees.length} students as absent for ${this.formatDate(date)}.\n(Firestore ArrayUnion simulated)`);
            e.target.reset();
        }
    }

    handleSyllabusUpload(e) {
        e.preventDefault();
        const subject = document.getElementById('syl-subject').value;
        const date = document.getElementById('syl-date').value;
        const topic = document.getElementById('syl-topic').value;

        alert(`Syllabus Updated!\nTopic: ${topic} added for ${this.formatDate(date)} in ${subject}.\n(Firestore Add simulated)`);
        e.target.reset();
    }

    async loadLostFoundFeed() {
        const feed = document.getElementById('lf-feed');
        if (!feed) return;
        feed.innerHTML = `<div class="text-center text-slate-400 mt-4">Loading missing items...</div>`;

        if (typeof window.fetchLostFoundItems === 'function') {
            const items = await window.fetchLostFoundItems();
            if (items.length === 0) {
                feed.innerHTML = `<div class="text-center text-slate-500 mt-4">No lost or found items reported yet.</div>`;
                return;
            }

            feed.innerHTML = items.map(itemObj => {
                const borderColor = itemObj.type === 'Found' ? 'border-l-emerald-500' : 'border-l-rose-500';
                const textColor = itemObj.type === 'Found' ? 'text-emerald-400' : 'text-rose-400';
                const bgColor = itemObj.type === 'Found' ? 'bg-emerald-400/10' : 'bg-rose-400/10';

                // Format relative time if possible, or just standard string
                let dateStr = "Recently";
                if (itemObj.timestamp && itemObj.timestamp.toDate) {
                    dateStr = itemObj.timestamp.toDate().toLocaleDateString();
                }

                return `
                    <div class="bg-slate-800/80 p-4 shadow-md rounded-xl border border-white/5 border-l-[4px] ${borderColor} hover:translate-x-1 transition-transform mb-4">
                        <span class="text-[10px] font-bold ${textColor} uppercase tracking-wider ${bgColor} px-2 py-0.5 rounded-md">${itemObj.type}</span>
                        <h4 class="font-bold text-white mt-2">${itemObj.item}</h4>
                        <p class="text-sm text-slate-400 mt-1">${itemObj.desc} (at ${itemObj.location})</p>
                        <p class="text-xs text-slate-500 mt-2">${dateStr}</p>
                    </div>
                `;
            }).join('');
        }
    }

    async handleLostFoundSubmit(e) {
        e.preventDefault();
        const item = document.getElementById('lf-item').value;
        const type = document.getElementById('lf-type').value;
        const location = document.getElementById('lf-location').value;
        const desc = document.getElementById('lf-desc').value;

        const origText = e.target.querySelector('button[type="submit"]').innerText;
        e.target.querySelector('button[type="submit"]').innerText = "Submitting...";

        if (typeof window.addLostFoundItem === 'function') {
            const success = await window.addLostFoundItem({ item, type, location, desc });
            if (success) {
                alert(`Successfully reported ${item} as ${type}!`);
                e.target.reset();
                this.loadLostFoundFeed();
            } else {
                alert(`Failed to report. Check console.`);
            }
        }
        e.target.querySelector('button[type="submit"]').innerText = origText;
    }


    // --- Utils ---
    formatDate(dateString) {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
}

// Initialize App
const app = new AcademicTrackerApp();
