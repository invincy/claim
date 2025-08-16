        // Create floating particles

        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = 50;
            const particles = [];

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';

                // Random starting position
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (6 + Math.random() * 4) + 's';

                // Random size variation
                const size = 1 + Math.random() * 2;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';

                particlesContainer.appendChild(particle);
                particles.push(particle);
            }

            return { container: particlesContainer, particles };
        }

        function createConnections(container, particles) {
            const svg = document.getElementById('particleLines');
            const connections = [];
            const clusterCount = 5;

            for (let i = 0; i < clusterCount; i++) {
                const clusterSize = Math.random() < 0.5 ? 2 : 3;
                const indices = [];
                while (indices.length < clusterSize) {
                    const idx = Math.floor(Math.random() * particles.length);
                    if (!indices.includes(idx)) indices.push(idx);
                }
                for (let j = 0; j < clusterSize - 1; j++) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    svg.appendChild(line);
                    connections.push({ a: particles[indices[j]], b: particles[indices[j + 1]], line });
                }
            }

            function updateLines() {
                const rect = container.getBoundingClientRect();
                connections.forEach(conn => {
                    const rectA = conn.a.getBoundingClientRect();
                    const rectB = conn.b.getBoundingClientRect();
                    const x1 = rectA.left + rectA.width / 2 - rect.left;
                    const y1 = rectA.top + rectA.height / 2 - rect.top;
                    const x2 = rectB.left + rectB.width / 2 - rect.left;
                    const y2 = rectB.top + rectB.height / 2 - rect.top;
                    conn.line.setAttribute('x1', x1);
                    conn.line.setAttribute('y1', y1);
                    conn.line.setAttribute('x2', x2);
                    conn.line.setAttribute('y2', y2);
                });
                requestAnimationFrame(updateLines);
            }

            requestAnimationFrame(updateLines);
        }

        // Initialize particles when page loads
        document.addEventListener('DOMContentLoaded', function() {
            const { container, particles } = createParticles();
            createConnections(container, particles);
            loadFromStorage();
            updateCounters();
        });


        // Collapsible functionality
        document.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', function() {
                const target = document.getElementById(this.dataset.target);
                const arrow = this.querySelector('span:last-child');
                
                target.classList.toggle('active');
                arrow.style.transform = target.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
            });
        });

        // Workflow collapsible functionality with disabled state check
        document.querySelectorAll('.workflow-header').forEach(header => {
            header.addEventListener('click', function() {
                // Don't allow clicking if section is disabled
                if (this.style.pointerEvents === 'none') {
                    return;
                }
                
                const target = document.getElementById(this.dataset.target);
                const arrow = this.querySelector('span:last-child');
                
                target.classList.toggle('active');
                arrow.style.transform = target.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
            });
        });

        // Form functionality

        const deathClaimBtn = document.getElementById('deathClaimBtn');
        const specialCaseBtn = document.getElementById('specialCaseBtn');
        const deathClaimForm = document.getElementById('deathClaimForm');
        const specialCaseForm = document.getElementById('specialCaseForm');
        const cancelForm = document.getElementById('cancelForm');
        const cancelSpecialForm = document.getElementById('cancelSpecialForm');
        deathClaimBtn?.addEventListener('click', () => {
            deathClaimForm?.classList.remove('hidden');
        });

        specialCaseBtn?.addEventListener('click', () => {
            specialCaseForm?.classList.remove('hidden');
        });

        cancelForm?.addEventListener('click', () => {
            deathClaimForm?.classList.add('hidden');
            resetForm();
        });

        cancelSpecialForm?.addEventListener('click', () => {
            specialCaseForm?.classList.add('hidden');
            resetSpecialForm();
        });

        // Date calculation
        const commencementDate = document.getElementById('commencementDate');
        const deathDate = document.getElementById('deathDate');
        const durationDisplay = document.getElementById('durationDisplay');
        const durationText = document.getElementById('durationText');

        const suggestionBox = document.getElementById('suggestionBox');
        const suggestionText = document.getElementById('suggestionText');
        const timeBarWarning = document.getElementById('timeBarWarning');
        const manualSelection = document.getElementById('manualSelection');

        function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 3000);
        }


        // Auto-format date inputs
        function formatDateInput(input) {
            let value = input.value.replace(/\D/g, ''); // Remove non-digits
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            if (value.length >= 5) {
                value = value.substring(0, 5) + '/' + value.substring(5, 9);
            }
            input.value = value;
        }

        commencementDate?.addEventListener('input', function() {
            formatDateInput(this);
            calculateDuration();
        });

        deathDate?.addEventListener('input', function() {
            formatDateInput(this);
            calculateDuration();
        });

        function calculateDuration() {
            const commDate = commencementDate.value.replace(/\//g, '');
            const deathDateVal = deathDate.value.replace(/\//g, '');

            if (commDate.length === 8 && deathDateVal.length === 8) {
                const commYear = parseInt(commDate.substring(4, 8));
                const commMonth = parseInt(commDate.substring(2, 4));
                const commDay = parseInt(commDate.substring(0, 2));

                const deathYear = parseInt(deathDateVal.substring(4, 8));
                const deathMonth = parseInt(deathDateVal.substring(2, 4));
                const deathDay = parseInt(deathDateVal.substring(0, 2));

                const commDateObj = new Date(commYear, commMonth - 1, commDay);
                const deathDateObj = new Date(deathYear, deathMonth - 1, deathDay);

                const diffTime = Math.abs(deathDateObj - commDateObj);
                const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);

                durationText.textContent = `${diffYears.toFixed(2)} years`;
                durationDisplay.classList.remove('hidden');

                // Show suggestion
                let suggestion = '';
                let bgColor = '';
                if (diffYears < 3) {
                    suggestion = '🟥 Suggested: Early Claim';
                    bgColor = 'suggestion-early';
                } else if (diffYears >= 3 && diffYears <= 5) {
                    suggestion = '🟦 Suggested: Non-Early (4–5 Yrs)';
                    bgColor = 'suggestion-medium';
                } else {
                    suggestion = '🟩 Suggested: Non-Early';
                    bgColor = 'suggestion-late';
                }


                suggestionText.textContent = suggestion;
                suggestionBox.className = `p-4 rounded-xl ${bgColor}`;
                suggestionBox.classList.remove('hidden');
                manualSelection.classList.remove('hidden');

                // Time-bar check using current date as intimation
                const today = new Date();
                const intimationDiff = (today - deathDateObj) / (1000 * 60 * 60 * 24);
                let timeBarMessage = '';
                if (commDateObj < new Date(2020, 0, 1)) {
                    if (intimationDiff > 365 * 3) {
                        timeBarMessage = '⚠️ Claim is time barred (death reported after 3 years)';
                    }
                } else {
                    if (intimationDiff > 90) {
                        timeBarMessage = '⚠️ Claim is time barred (death reported after 90 days)';
                    }
                }

                if (timeBarMessage) {
                    timeBarWarning.textContent = timeBarMessage;
                    timeBarWarning.classList.remove('hidden');
                } else {
                    timeBarWarning.textContent = '';
                    timeBarWarning.classList.add('hidden');
                }
            }
        }





        function removeRow(button) {
            const row = button.closest('tr');
            const tableBody = row.parentNode;
            row.remove();
            
            if (tableBody.children.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">No active death claims</td></tr>';
            }
            saveToStorage();
        }

        // Store case data for reopening with localStorage persistence
        let savedCases = JSON.parse(localStorage.getItem('licSavedCases') || '{}');
        let savedSpecialCases = JSON.parse(localStorage.getItem('licSavedSpecialCases') || '{}');
        let savedWorkflowStates = JSON.parse(localStorage.getItem('licWorkflowStates') || '{}');

        // Save data to localStorage
        function saveToStorage() {
            localStorage.setItem('licSavedCases', JSON.stringify(savedCases));
            localStorage.setItem('licSavedSpecialCases', JSON.stringify(savedSpecialCases));
            localStorage.setItem('licWorkflowStates', JSON.stringify(savedWorkflowStates));
            localStorage.setItem('licActiveClaims', document.getElementById('activeDeathClaimsTable').innerHTML);
            localStorage.setItem('licActiveSpecialCases', document.getElementById('activeSpecialCasesTable').innerHTML);

            updateCounters();
        }

        // Update counters for all sections
        function updateCounters() {
            // Count active death claims
            const activeDeathRows = document.querySelectorAll('#activeDeathClaimsTable tr:not([colspan])');
            const activeDeathCount = activeDeathRows.length > 0 && !activeDeathRows[0].querySelector('td[colspan]') ? activeDeathRows.length : 0;
            document.getElementById('activeDeathClaimsCounter').textContent = activeDeathCount;

            // Count active special cases
            const activeSpecialRows = document.querySelectorAll('#activeSpecialCasesTable tr:not([colspan])');
            const activeSpecialCount = activeSpecialRows.length > 0 && !activeSpecialRows[0].querySelector('td[colspan]') ? activeSpecialRows.length : 0;
            document.getElementById('activeSpecialCasesCounter').textContent = activeSpecialCount;


        }

        // Load data from localStorage
        function loadFromStorage() {
            // Load active death claims
            const activeClaims = localStorage.getItem('licActiveClaims');
            if (activeClaims) {
                document.getElementById('activeDeathClaimsTable').innerHTML = activeClaims;
                // Re-attach event listeners to loaded rows
                document.querySelectorAll('#activeDeathClaimsTable tr').forEach(row => {
                    if (row.querySelector('td:first-child') && !row.querySelector('td[colspan]')) {
                        row.style.cursor = 'pointer';
                        row.onclick = function() { openCase(this); };
                    }
                });
            }

            // Load active special cases
            const activeSpecialCases = localStorage.getItem('licActiveSpecialCases');
            if (activeSpecialCases) {
                document.getElementById('activeSpecialCasesTable').innerHTML = activeSpecialCases;
                // Re-attach event listeners to loaded rows
                document.querySelectorAll('#activeSpecialCasesTable tr').forEach(row => {
                    if (row.querySelector('td:first-child') && !row.querySelector('td[colspan]')) {
                        row.style.cursor = 'pointer';
                        row.onclick = function() { openSpecialCase(this); };
                    }
                });
            }


        }



        // Special Case Save functionality
        document.getElementById('saveSpecialCase')?.addEventListener('click', function() {
            const policyNo = document.getElementById('specialPolicyNumber').value;
            const name = document.getElementById('specialName').value;
            const type = document.getElementById('specialType').value;
            const issue = document.getElementById('specialIssue').value;
            const resolved = document.getElementById('specialResolved').checked;

            if (!policyNo || !name || !type || !issue) {
                showToast('Please fill all fields.');
                return;
            }


            if (resolved) {
                // Add to completed special cases
                const completedTableBody = document.getElementById('completedSpecialCasesTable');
                if (completedTableBody.querySelector('td[colspan="5"]')) {
                    completedTableBody.innerHTML = '';
                }

                const completedRow = document.createElement('tr');
                completedRow.className = 'lic-table-row border-t transition-all duration-300';
                completedRow.innerHTML = `
                    <td class="px-6 py-4 font-semibold text-gray-300">${policyNo}</td>
                    <td class="px-6 py-4 font-semibold text-gray-300">${name}</td>
                    <td class="px-6 py-4 font-semibold text-gray-300">${type}</td>
                    <td class="px-6 py-4 font-semibold text-gray-300">${issue.length > 50 ? issue.substring(0, 50) + '...' : issue}</td>
                    <td class="px-6 py-4">
                        <button class="btn-danger px-4 py-2 rounded-lg text-sm font-bold" onclick="removeCompletedSpecialRow(this)">
                            🗑️ Remove
                        </button>
                    </td>
                `;
                completedTableBody.appendChild(completedRow);

                // Remove from active cases
                const activeTableBody = document.getElementById('activeSpecialCasesTable');
                const rows = activeTableBody.querySelectorAll('tr');
                rows.forEach(row => {
                    const policyCell = row.querySelector('td:first-child');
                    if (policyCell && policyCell.textContent === policyNo) {
                        row.remove();
                    }
                });

                if (activeTableBody.children.length === 0) {
                    activeTableBody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">No active special cases</td></tr>';
                }

                saveToStorage();
                showToast('Special case marked as resolved and moved to completed cases!');

            } else {
                // Save to active special cases
                const tableBody = document.getElementById('activeSpecialCasesTable');
                if (tableBody.querySelector('td[colspan="5"]')) {
                    tableBody.innerHTML = '';
                }

                // Check if case already exists
                let existingRow = null;
                const rows = tableBody.querySelectorAll('tr');
                rows.forEach(row => {
                    const policyCell = row.querySelector('td:first-child');
                    if (policyCell && policyCell.textContent === policyNo) {
                        existingRow = row;
                    }
                });

                // Save case data for reopening
                savedSpecialCases[policyNo] = {
                    name: name,
                    type: type,
                    issue: issue,
                    resolved: resolved
                };
                saveToStorage();

                if (existingRow) {
                    // Update existing row
                    existingRow.innerHTML = `
                        <td class="px-6 py-4 font-semibold text-gray-300">${policyNo}</td>
                        <td class="px-6 py-4 font-semibold text-gray-300">${name}</td>
                        <td class="px-6 py-4 font-semibold text-gray-300">${type}</td>
                        <td class="px-6 py-4 font-semibold text-gray-300">${issue.length > 50 ? issue.substring(0, 50) + '...' : issue}</td>
                        <td class="px-6 py-4">
                            <button class="btn-danger px-4 py-2 rounded-lg text-sm font-bold" onclick="event.stopPropagation(); removeSpecialRow(this)">
                                🗑️ Remove
                            </button>
                        </td>
                    `;
                    existingRow.className = 'lic-table-row border-t transition-all duration-300';
                    existingRow.style.cursor = 'pointer';
                    existingRow.onclick = function() { openSpecialCase(this); };
                } else {
                    // Add new row
                    const row = document.createElement('tr');
                    row.className = 'lic-table-row border-t transition-all duration-300';
                    row.style.cursor = 'pointer';
                    row.innerHTML = `
                        <td class="px-6 py-4 font-semibold text-gray-300">${policyNo}</td>
                        <td class="px-6 py-4 font-semibold text-gray-300">${name}</td>
                        <td class="px-6 py-4 font-semibold text-gray-300">${type}</td>
                        <td class="px-6 py-4 font-semibold text-gray-300">${issue.length > 50 ? issue.substring(0, 50) + '...' : issue}</td>
                        <td class="px-6 py-4">
                            <button class="btn-danger px-4 py-2 rounded-lg text-sm font-bold" onclick="event.stopPropagation(); removeSpecialRow(this)">
                                🗑️ Remove
                            </button>
                        </td>
                    `;
                    row.onclick = function() { openSpecialCase(this); };
                    tableBody.appendChild(row);

                }

                showToast('Special case saved successfully!');

            }

            specialCaseForm.classList.add('hidden');
            resetSpecialForm();
        });

        function openCase(row) {
            const cells = row.querySelectorAll('td');
            
            // Extract data from the row
            const policyNo = cells[0].textContent;
            const name = cells[1].textContent;
            const claimType = cells[2].textContent;
            const stage = cells[3].textContent;
            
            // Show the form
            deathClaimForm.classList.remove('hidden');
            
            // Populate basic fields
            document.getElementById('policyNumber').value = policyNo;
            document.getElementById('claimantName').value = name;
            
            // Restore all saved data if exists
            if (savedCases[policyNo]) {
                const savedData = savedCases[policyNo];
                
                // Restore basic form data
                if (savedData.commencementDate) document.getElementById('commencementDate').value = savedData.commencementDate;
                if (savedData.deathDate) document.getElementById('deathDate').value = savedData.deathDate;
                if (savedData.query) document.getElementById('queryText').value = savedData.query;
                
                // Trigger duration calculation if dates exist
                if (savedData.commencementDate && savedData.deathDate) {
                    calculateDuration();
                }
            }
            
            // Select the claim type
            const claimTypeRadio = document.querySelector(`input[name="claimType"][value="${claimType}"]`);
            if (claimTypeRadio) {
                claimTypeRadio.checked = true;
                claimTypeRadio.dispatchEvent(new Event('change'));
            }
            
            // Show workflow sections
            document.getElementById('workflowSections').classList.remove('hidden');
            
            // Restore workflow state if exists
            if (savedWorkflowStates[policyNo]) {
                const workflowState = savedWorkflowStates[policyNo];
                
                // Restore all form inputs
                Object.keys(workflowState).forEach(inputId => {
                    const input = document.getElementById(inputId);
                    if (input) {
                        if (input.type === 'checkbox' || input.type === 'radio') {
                            input.checked = workflowState[inputId];
                            if (input.checked) {
                                input.dispatchEvent(new Event('change'));
                            }
                        } else {
                            input.value = workflowState[inputId];
                            if (input.type === 'date' && input.value) {
                                input.dispatchEvent(new Event('change'));
                            }
                        }
                    }
                });
            }
            
        }

        function removeSpecialRow(button) {
            const row = button.closest('tr');
            const tableBody = row.parentNode;
            row.remove();
            
            if (tableBody.children.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">No active special cases</td></tr>';
            }
            saveToStorage();
        }

        function openSpecialCase(row) {
            const cells = row.querySelectorAll('td');
            
            // Extract data from the row
            const policyNo = cells[0].textContent;
            const name = cells[1].textContent;
            const type = cells[2].textContent;
            const issue = cells[3].textContent;
            
            // Show the form
            specialCaseForm.classList.remove('hidden');
            
            // Populate fields
            document.getElementById('specialPolicyNumber').value = policyNo;
            document.getElementById('specialName').value = name;
            document.getElementById('specialType').value = type;
            
            // Restore full issue text and resolved status from saved data
            if (savedSpecialCases[policyNo]) {
                document.getElementById('specialIssue').value = savedSpecialCases[policyNo].issue;
                document.getElementById('specialResolved').checked = savedSpecialCases[policyNo].resolved;
            } else {
                document.getElementById('specialIssue').value = issue;
                document.getElementById('specialResolved').checked = false;
            }
            
        }

        function resetSpecialForm() {
            document.getElementById('specialPolicyNumber').value = '';
            document.getElementById('specialName').value = '';
            document.getElementById('specialType').value = '';
            document.getElementById('specialIssue').value = '';
            document.getElementById('specialResolved').checked = false;
        }

        // Workflow logic
        const nomineeAvailable = document.getElementById('nomineeAvailable');
        const nomineeNotAvailable = document.getElementById('nomineeNotAvailable');
        const investigationRadios = document.querySelectorAll('input[name="investigationType"]');
        const investigationDetails = document.getElementById('investigationDetails');
        const investigationDate = document.getElementById('investigationDate');
        const daysSinceAllotted = document.getElementById('daysSinceAllotted');
        const daysCount = document.getElementById('daysCount');
        const doSentDate = document.getElementById('doSentDate');
        const daysSinceSent = document.getElementById('daysSinceSent');
        const doSentDaysCount = document.getElementById('doSentDaysCount');
        const doDecisionSection = document.getElementById('doDecisionSection');
        const paymentDone = document.getElementById('paymentDone');

        // Nominee checkbox logic (mutually exclusive) with completion tracking
        nomineeAvailable?.addEventListener('change', function() {
            if (this.checked) {
                nomineeNotAvailable.checked = false;
                document.getElementById('letFormsSection').classList.add('hidden');
            }
            checkSectionCompletion('checkNominee');
        });

        nomineeNotAvailable?.addEventListener('change', function() {
            if (this.checked) {
                nomineeAvailable.checked = false;
                document.getElementById('letFormsSection').classList.remove('hidden');
            } else {
                document.getElementById('letFormsSection').classList.add('hidden');
            }
            checkSectionCompletion('checkNominee');
        });

        // Documents completion tracking
        document.getElementById('deathClaimFormDocs')?.addEventListener('change', function() {
            checkSectionCompletion('documentsRequired');
        });

        document.getElementById('letForms')?.addEventListener('change', function() {
            checkSectionCompletion('documentsRequired');
        });

        // Investigation radio logic with completion tracking
        investigationRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    investigationDetails.classList.remove('hidden');
                }
                checkSectionCompletion('investigation');
            });
        });

        // Investigation received completion tracking
        document.getElementById('investigationReceived')?.addEventListener('change', function() {
            checkSectionCompletion('investigation');
        });

        // D.O. Decision completion tracking
        document.getElementById('doDecisionReceived')?.addEventListener('change', function() {
            checkSectionCompletion('doDecision');
        });

        // Investigation date calculation
        investigationDate?.addEventListener('change', function() {
            if (this.value) {
                const allottedDate = new Date(this.value);
                const today = new Date();
                const diffTime = Math.abs(today - allottedDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                daysCount.textContent = diffDays;
                daysSinceAllotted.classList.remove('hidden');
            }
        });

        // D.O. sent date calculation
        doSentDate?.addEventListener('change', function() {
            if (this.value) {
                const sentDate = new Date(this.value);
                const today = new Date();
                const diffTime = Math.abs(today - sentDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                doSentDaysCount.textContent = diffDays;
                daysSinceSent.classList.remove('hidden');
            }
        });

        // Progressive workflow logic based on claim type
        document.querySelectorAll('input[name="claimType"]').forEach(radio => {
            radio.addEventListener('change', function() {
                // Show workflow sections when claim type is selected
                document.getElementById('workflowSections').classList.remove('hidden');
                
                // Reset all sections to collapsed and disabled
                resetWorkflowSections();
                
                // Enable first section (Check Nominee)
                enableSection('checkNominee');
                
                // Store selected claim type for workflow control
                window.selectedClaimType = this.value;
                
                // Show/hide sections based on claim type
                const investigationSection = document.getElementById('investigation').parentElement;
                if (this.value === 'Early') {
                    doDecisionSection.classList.remove('hidden');
                    investigationSection.classList.remove('hidden');
                } else if (this.value === 'Non-Early (4–5 Yrs)') {
                    doDecisionSection.classList.add('hidden');
                    investigationSection.classList.remove('hidden');
                } else { // Non-Early (>5 years)
                    doDecisionSection.classList.add('hidden');
                    investigationSection.classList.add('hidden');
                }
            });
        });

        function resetWorkflowSections() {
            // Collapse all workflow sections
            document.querySelectorAll('.workflow-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Reset all arrows
            document.querySelectorAll('.workflow-header span:last-child').forEach(arrow => {
                arrow.style.transform = 'rotate(0deg)';
            });
            
            // Disable all sections except the first one
            const sections = ['checkNominee', 'documentsRequired', 'investigation', 'doDecision', 'proceedPayment'];
            sections.forEach(sectionId => {
                disableSection(sectionId);
            });
        }

        function enableSection(sectionId) {
            const section = document.getElementById(sectionId);
            const header = document.querySelector(`[data-target="${sectionId}"]`);
            
            if (section && header) {
                header.classList.remove('opacity-50', 'cursor-not-allowed');
                header.classList.add('hover:bg-gray-50');
                header.style.pointerEvents = 'auto';
            }
        }

        function disableSection(sectionId) {
            const section = document.getElementById(sectionId);
            const header = document.querySelector(`[data-target="${sectionId}"]`);
            
            if (section && header) {
                header.classList.add('opacity-50', 'cursor-not-allowed');
                header.classList.remove('hover:bg-gray-50');
                header.style.pointerEvents = 'none';
                section.classList.remove('active');
            }
        }

        function checkSectionCompletion(sectionId) {
            let isComplete = false;
            let nextSectionId = null;
            
            switch(sectionId) {
                case 'checkNominee':
                    isComplete = nomineeAvailable.checked || nomineeNotAvailable.checked;
                    if (isComplete) {
                        nextSectionId = 'documentsRequired';
                        enableSection('documentsRequired');
                    }
                    break;
                    
                case 'documentsRequired':
                    const deathClaimFormChecked = document.getElementById('deathClaimFormDocs').checked;
                    const letFormsChecked = document.getElementById('letForms').checked;
                    const letFormsRequired = !document.getElementById('letFormsSection').classList.contains('hidden');
                    
                    isComplete = deathClaimFormChecked && (!letFormsRequired || letFormsChecked);
                    if (isComplete) {
                        if (window.selectedClaimType === 'Non-Early') {
                            // For Non-Early (>5 years), skip investigation and go to payment
                            nextSectionId = 'proceedPayment';
                            enableSection('proceedPayment');
                        } else {
                            nextSectionId = 'investigation';
                            enableSection('investigation');
                        }
                    }
                    break;
                    
                case 'investigation':
                    const investigationTypeSelected = document.querySelector('input[name="investigationType"]:checked');
                    const investigationReceived = document.getElementById('investigationReceived').checked;
                    
                    isComplete = investigationTypeSelected && investigationReceived;
                    if (isComplete) {
                        if (window.selectedClaimType === 'Early') {
                            nextSectionId = 'doDecision';
                            enableSection('doDecision');
                        } else {
                            nextSectionId = 'proceedPayment';
                            enableSection('proceedPayment');
                        }
                    }
                    break;
                    
                case 'doDecision':
                    const doDecisionReceived = document.getElementById('doDecisionReceived').checked;
                    isComplete = doDecisionReceived;
                    if (isComplete) {
                        nextSectionId = 'proceedPayment';
                        enableSection('proceedPayment');
                    }
                    break;
            }
            
            // Auto-expand next section when current section is completed
            if (isComplete && nextSectionId) {
                setTimeout(() => {
                    autoExpandSection(nextSectionId);
                }, 300); // Small delay for smooth transition
            }
            
            return isComplete;
        }

        function autoExpandSection(sectionId) {
            const section = document.getElementById(sectionId);
            const header = document.querySelector(`[data-target="${sectionId}"]`);
            const arrow = header.querySelector('span:last-child');
            
            if (section && header && !section.classList.contains('active')) {
                section.classList.add('active');
                arrow.style.transform = 'rotate(180deg)';
            }
        }

        // Payment done - move to completed claims
        paymentDone?.addEventListener('change', function() {
            if (this.checked) {
                const policyNo = document.getElementById('policyNumber').value;
                const name = document.getElementById('claimantName').value;
                const selectedType = document.querySelector('input[name="claimType"]:checked');
                
                if (policyNo && name && selectedType) {
                    // Add to completed claims
                    const completedTableBody = document.getElementById('completedDeathClaimsTable');
                    if (completedTableBody.querySelector('td[colspan="5"]')) {
                        completedTableBody.innerHTML = '';
                    }

                    const completedRow = document.createElement('tr');
                    completedRow.className = 'lic-table-row border-t transition-all duration-300';
                    completedRow.innerHTML = `
                        <td class="px-6 py-4 font-semibold text-gray-300">${policyNo}</td>
                        <td class="px-6 py-4 font-semibold text-gray-300">${name}</td>
                        <td class="px-6 py-4 font-semibold text-gray-300">${selectedType.value}</td>
                        <td class="px-6 py-4 font-semibold text-gray-300">${new Date().toLocaleDateString()}</td>
                        <td class="px-6 py-4">
                            <button class="btn-danger px-4 py-2 rounded-lg text-sm font-bold" onclick="removeCompletedRow(this)">
                                🗑️ Remove
                            </button>
                        </td>
                    `;
                    completedTableBody.appendChild(completedRow);

                    // Remove from active claims
                    const activeTableBody = document.getElementById('activeDeathClaimsTable');
                    const rows = activeTableBody.querySelectorAll('tr');
                    rows.forEach(row => {
                        const policyCell = row.querySelector('td:first-child');
                        if (policyCell && policyCell.textContent === policyNo) {
                            row.remove();
                        }
                    });

                    if (activeTableBody.children.length === 0) {
                        activeTableBody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">No active death claims</td></tr>';
                    }


                    saveToStorage();
                    showToast('Claim completed and moved to completed claims!');
                    deathClaimForm.classList.add('hidden');
                    resetForm();

                }
            }
        });

        // Save progress functionality
        document.getElementById('saveProgress')?.addEventListener('click', function() {
            const policyNo = document.getElementById('policyNumber').value;
            const name = document.getElementById('claimantName').value;
            const selectedType = document.querySelector('input[name="claimType"]:checked');


            if (!policyNo || !name || !selectedType) {
                showToast('⚠️ Please fill basic claim information first.');
                return;
            }



            // Save all form data
            const formData = {
                commencementDate: document.getElementById('commencementDate').value,
                deathDate: document.getElementById('deathDate').value,
                query: document.getElementById('queryText').value
            };
            savedCases[policyNo] = formData;

            // Save workflow state
            const workflowState = {};
            const allInputs = document.querySelectorAll('#workflowSections input, #workflowSections select, #workflowSections textarea');
            allInputs.forEach(input => {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    workflowState[input.id] = input.checked;
                } else {
                    workflowState[input.id] = input.value;
                }
            });
            savedWorkflowStates[policyNo] = workflowState;

            // Update or add to active claims table
            const tableBody = document.getElementById('activeDeathClaimsTable');
            if (tableBody.querySelector('td[colspan="5"]')) {
                tableBody.innerHTML = '';
            }

            // Check if claim already exists
            let existingRow = null;
            const rows = tableBody.querySelectorAll('tr');
            rows.forEach(row => {
                const policyCell = row.querySelector('td:first-child');
                if (policyCell && policyCell.textContent === policyNo) {
                    existingRow = row;
                }
            });


            const stage = getClaimStage();


            if (existingRow) {
                // Update existing row
                existingRow.innerHTML = `
                    <td class="px-6 py-4 font-semibold text-gray-300">${policyNo}</td>
                    <td class="px-6 py-4 font-semibold text-gray-300">${name}</td>
                    <td class="px-6 py-4 font-semibold text-gray-300">${selectedType.value}</td>
                    <td class="px-6 py-4 font-semibold text-gray-300">${stage}</td>
                    <td class="px-6 py-4">
                        <button class="btn-danger px-4 py-2 rounded-lg text-sm font-bold" onclick="event.stopPropagation(); removeRow(this)">
                            🗑️ Remove
                        </button>
                    </td>
                `;
                existingRow.className = 'dark-table-row border-t transition-all duration-300';
                existingRow.style.cursor = 'pointer';
                existingRow.onclick = function() { openCase(this); };
            } else {
                // Add new row
                const row = document.createElement('tr');
                row.className = 'dark-table-row border-t transition-all duration-300';
                row.style.cursor = 'pointer';
                row.innerHTML = `
                    <td class="px-6 py-4 font-semibold text-gray-300">${policyNo}</td>
                    <td class="px-6 py-4 font-semibold text-gray-300">${name}</td>
                    <td class="px-6 py-4 font-semibold text-gray-300">${selectedType.value}</td>
                    <td class="px-6 py-4 font-semibold text-gray-300">${stage}</td>
                    <td class="px-6 py-4">
                        <button class="btn-danger px-4 py-2 rounded-lg text-sm font-bold" onclick="event.stopPropagation(); removeRow(this)">
                            🗑️ Remove
                        </button>
                    </td>
                `;
                row.onclick = function() { openCase(this); };

                tableBody.appendChild(row);
            }

            saveToStorage();

            showToast('💾 Progress saved successfully!');
            deathClaimForm.classList.add('hidden');
            resetForm();
        });



        function getClaimStage() {
            if (document.getElementById('paymentDone').checked) return 'Payment Done';
            if (document.getElementById('doDecisionReceived') && document.getElementById('doDecisionReceived').checked) return 'D.O. Decision Received';
            if (document.getElementById('investigationReceived').checked) return 'Investigation Complete';
            if (document.getElementById('investigationDate').value) return 'Under Investigation';
            if (document.getElementById('deathClaimFormDocs').checked) return 'Documents Received';
            if (document.getElementById('nomineeAvailable').checked || document.getElementById('nomineeNotAvailable').checked) return 'Nominee Verified';
            return 'Initial Review';
        }

        function removeCompletedRow(button) {
            const row = button.closest('tr');
            const tableBody = row.parentNode;
            row.remove();
            
            if (tableBody.children.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">No completed death claims</td></tr>';
            }
            saveToStorage();
        }

        function removeCompletedSpecialRow(button) {
            const row = button.closest('tr');
            const tableBody = row.parentNode;
            row.remove();
            
            if (tableBody.children.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">No completed special cases</td></tr>';
            }
            saveToStorage();
        }

        function resetForm() {
            document.getElementById('policyNumber').value = '';
            document.getElementById('claimantName').value = '';
            document.getElementById('commencementDate').value = '';
            document.getElementById('deathDate').value = '';
            durationDisplay.classList.add('hidden');
            suggestionBox.classList.add('hidden');
            manualSelection.classList.add('hidden');
            document.getElementById('workflowSections').classList.add('hidden');
            document.querySelectorAll('input[name="claimType"]').forEach(radio => radio.checked = false);
            
            // Reset all workflow inputs
            document.querySelectorAll('#workflowSections input').forEach(input => {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            });
            document.getElementById('queryText').value = '';
            document.getElementById('letFormsSection').classList.add('hidden');
            investigationDetails.classList.add('hidden');
            daysSinceAllotted.classList.add('hidden');
            daysSinceSent.classList.add('hidden');
            doDecisionSection.classList.add('hidden');
        }

