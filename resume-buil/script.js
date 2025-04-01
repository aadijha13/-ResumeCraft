document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const appContainer = document.getElementById('app-container');
    const resumeForm = document.getElementById('resume-form');
    const previewContainer = document.getElementById('resume-preview');
    const newResumeBtn = document.getElementById('new-resume');
    const saveResumeBtn = document.getElementById('save-resume');
    const downloadPdfBtn = document.getElementById('download-pdf');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomLevel = document.getElementById('zoom-level');
    
    // Resume type buttons
    const typeOptions = document.querySelectorAll('.type-option');
    
    // Template thumbnails
    const templateThumbnails = document.querySelectorAll('.template-thumbnail');
    
    // Resume data
    let resumeData = {
        type: 'job',
        template: 'professional',
        personalInfo: {
            name: '',
            email: '',
            phone: '',
            address: ''
        },
        experience: [],
        education: [],
        skills: [],
        customFields: {}
    };
    
    let zoom = 100;

    // Initialize the app
    init();

    function init() {
        loadFromLocalStorage();
        setupEventListeners();
        renderForm();
        updatePreview();
        updateTheme();
    }

    function setupEventListeners() {
        // Form inputs
        resumeForm.addEventListener('input', function(e) {
            if (e.target.id in resumeData.personalInfo) {
                resumeData.personalInfo[e.target.id] = e.target.value;
                updatePreview();
            }
        });

        // Resume type selection
        typeOptions.forEach(option => {
            option.addEventListener('click', function() {
                typeOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                resumeData.type = this.dataset.type;
                updateTheme();
                updateFormFields();
                updatePreview();
            });
        });

        // Template selection
        templateThumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                templateThumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                resumeData.template = this.dataset.template;
                updatePreview();
            });
        });

        // Add buttons
        document.querySelectorAll('.add-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const section = this.dataset.section;
                addEmptyField(section);
            });
        });

        // Download PDF
        downloadPdfBtn.addEventListener('click', downloadPDF);

        // New Resume
        newResumeBtn.addEventListener('click', newResume);

        // Save Resume
        saveResumeBtn.addEventListener('click', saveToLocalStorage);

        // Zoom controls
        zoomInBtn.addEventListener('click', () => adjustZoom(10));
        zoomOutBtn.addEventListener('click', () => adjustZoom(-10));
    }

    function adjustZoom(amount) {
        zoom = Math.min(Math.max(zoom + amount, 50), 150);
        document.querySelector('.preview-container').style.transform = `scale(${zoom/100})`;
        zoomLevel.textContent = `${zoom}%`;
    }

    function updateTheme() {
        // Remove all theme classes
        appContainer.classList.remove(
            'marriage-theme',
            'student-theme',
            'cv-theme',
            'biodata-theme'
        );
        
        // Add current theme class
        if (resumeData.type !== 'job') {
            appContainer.classList.add(`${resumeData.type}-theme`);
        }
    }

    function updateFormFields() {
        const extraField1 = document.getElementById('extra-field-1-container');
        const extraField2 = document.getElementById('extra-field-2-container');
        const customSection1 = document.getElementById('custom-section-1');
        const customSection2 = document.getElementById('custom-section-2');
        
        // Clear all custom fields
        extraField1.innerHTML = '';
        extraField2.innerHTML = '';
        customSection1.innerHTML = '';
        customSection2.innerHTML = '';
        
        // Show/hide standard sections based on resume type
        document.getElementById('experience-section').style.display = 
            resumeData.type === 'marriage' ? 'none' : 'block';
        document.getElementById('education-section').style.display = 'block';
        document.getElementById('skills-section').style.display = 
            resumeData.type === 'marriage' ? 'none' : 'block';
        
        // Add type-specific fields
        switch(resumeData.type) {
            case 'marriage':
                extraField1.innerHTML = `
                    <label for="dob">Date of Birth</label>
                    <input type="date" id="dob" data-field="dob">
                `;
                extraField2.innerHTML = `
                    <label for="religion">Religion</label>
                    <input type="text" id="religion" placeholder="e.g., Hindu, Christian" data-field="religion">
                `;
                
                customSection1.innerHTML = `
                    <div class="section-header">
                        <h3><i class="fas fa-users"></i> Family Details</h3>
                        <button type="button" class="add-btn" data-section="family">
                            <i class="fas fa-plus"></i> Add
                        </button>
                    </div>
                    <div id="family-fields" class="dynamic-fields"></div>
                `;
                
                customSection2.innerHTML = `
                    <div class="section-header">
                        <h3><i class="fas fa-heart"></i> Partner Preferences</h3>
                    </div>
                    <div class="form-group">
                        <label for="preferred-age">Preferred Age Range</label>
                        <input type="text" id="preferred-age" placeholder="e.g., 25-30" data-field="preferredAge">
                    </div>
                    <div class="form-group">
                        <label for="preferred-religion">Preferred Religion</label>
                        <input type="text" id="preferred-religion" placeholder="e.g., Hindu" data-field="preferredReligion">
                    </div>
                `;
                break;
                
            case 'student':
                extraField1.innerHTML = `
                    <label for="university">University</label>
                    <input type="text" id="university" placeholder="Your university" data-field="university">
                `;
                extraField2.innerHTML = `
                    <label for="major">Major</label>
                    <input type="text" id="major" placeholder="Your major" data-field="major">
                `;
                
                customSection1.innerHTML = `
                    <div class="section-header">
                        <h3><i class="fas fa-trophy"></i> Achievements</h3>
                        <button type="button" class="add-btn" data-section="achievements">
                            <i class="fas fa-plus"></i> Add
                        </button>
                    </div>
                    <div id="achievements-fields" class="dynamic-fields"></div>
                `;
                
                customSection2.innerHTML = `
                    <div class="section-header">
                        <h3><i class="fas fa-project-diagram"></i> Projects</h3>
                        <button type="button" class="add-btn" data-section="projects">
                            <i class="fas fa-plus"></i> Add
                        </button>
                    </div>
                    <div id="projects-fields" class="dynamic-fields"></div>
                `;
                break;
                
            case 'cv':
                extraField1.innerHTML = `
                    <label for="profession">Profession</label>
                    <input type="text" id="profession" placeholder="Your profession" data-field="profession">
                `;
                extraField2.innerHTML = `
                    <label for="website">Website/Portfolio</label>
                    <input type="url" id="website" placeholder="https://yourportfolio.com" data-field="website">
                `;
                
                customSection1.innerHTML = `
                    <div class="section-header">
                        <h3><i class="fas fa-certificate"></i> Certifications</h3>
                        <button type="button" class="add-btn" data-section="certifications">
                            <i class="fas fa-plus"></i> Add
                        </button>
                    </div>
                    <div id="certifications-fields" class="dynamic-fields"></div>
                `;
                break;
                
            case 'biodata':
                extraField1.innerHTML = `
                    <label for="father-name">Father's Name</label>
                    <input type="text" id="father-name" placeholder="Father's name" data-field="fatherName">
                `;
                extraField2.innerHTML = `
                    <label for="mother-name">Mother's Name</label>
                    <input type="text" id="mother-name" placeholder="Mother's name" data-field="motherName">
                `;
                
                customSection1.innerHTML = `
                    <div class="section-header">
                        <h3><i class="fas fa-users"></i> Family Details</h3>
                    </div>
                    <div class="form-group">
                        <label for="siblings">Siblings</label>
                        <input type="text" id="siblings" placeholder="Number of siblings" data-field="siblings">
                    </div>
                `;
                break;
        }
        
        // Reattach event listeners
        document.querySelectorAll('.add-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const section = this.dataset.section;
                addEmptyField(section);
            });
        });
        
        // Load data for custom fields
        loadCustomFields();
    }

    function loadCustomFields() {
        // Load data for extra fields
        const extraFields = document.querySelectorAll('[data-field]');
        extraFields.forEach(field => {
            const fieldName = field.dataset.field;
            if (resumeData.personalInfo[fieldName]) {
                field.value = resumeData.personalInfo[fieldName];
            }
            
            field.addEventListener('input', function() {
                resumeData.personalInfo[this.dataset.field] = this.value;
                updatePreview();
            });
        });
        
        // Load data for custom sections
        if (resumeData.customFields[resumeData.type]) {
            const customData = resumeData.customFields[resumeData.type];
            
            for (const section in customData) {
                if (customData[section].length > 0) {
                    resumeData[section] = customData[section];
                }
            }
        }
    }

    function addEmptyField(section) {
        const id = Date.now();
        let fieldData = { id };

        switch(section) {
            case 'experience':
                fieldData = { ...fieldData, jobTitle: '', company: '', period: '', description: '' };
                break;
            case 'education':
                fieldData = { ...fieldData, degree: '', institution: '', year: '' };
                break;
            case 'skills':
                fieldData = { ...fieldData, skill: '' };
                break;
            case 'family':
                fieldData = { ...fieldData, relation: '', name: '', occupation: '' };
                break;
            case 'achievements':
                fieldData = { ...fieldData, title: '', year: '', description: '' };
                break;
            case 'projects':
                fieldData = { ...fieldData, name: '', technologies: '', description: '' };
                break;
            case 'certifications':
                fieldData = { ...fieldData, name: '', issuer: '', year: '' };
                break;
        }

        if (!resumeData[section]) {
            resumeData[section] = [];
        }
        
        resumeData[section].push(fieldData);
        
        // Store in customFields if it's a type-specific section
        if (['family', 'achievements', 'projects', 'certifications'].includes(section)) {
            if (!resumeData.customFields[resumeData.type]) {
                resumeData.customFields[resumeData.type] = {};
            }
            if (!resumeData.customFields[resumeData.type][section]) {
                resumeData.customFields[resumeData.type][section] = [];
            }
            resumeData.customFields[resumeData.type][section].push(fieldData);
        }
        
        renderForm();
        updatePreview();
    }

    function renderForm() {
        // Personal info
        document.getElementById('name').value = resumeData.personalInfo.name || '';
        document.getElementById('email').value = resumeData.personalInfo.email || '';
        document.getElementById('phone').value = resumeData.personalInfo.phone || '';
        document.getElementById('address').value = resumeData.personalInfo.address || '';

        // Dynamic fields
        renderDynamicFields('experience');
        renderDynamicFields('education');
        renderDynamicFields('skills');
        
        // Custom fields based on type
        switch(resumeData.type) {
            case 'marriage':
                renderDynamicFields('family');
                break;
            case 'student':
                renderDynamicFields('achievements');
                renderDynamicFields('projects');
                break;
            case 'cv':
                renderDynamicFields('certifications');
                break;
        }
    }

    function renderDynamicFields(section) {
        const container = document.getElementById(`${section}-fields`);
        if (!container) return;
        
        container.innerHTML = '';

        if (!resumeData[section] || resumeData[section].length === 0) return;

        resumeData[section].forEach((item) => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'dynamic-field';
            fieldDiv.dataset.id = item.id;

            let fieldsHTML = '';
            const removeBtn = `<button type="button" class="remove-btn" data-section="${section}" data-id="${item.id}">×</button>`;

            switch(section) {
                case 'experience':
                    fieldsHTML = `
                        ${removeBtn}
                        <div class="form-group">
                            <label for="exp-job-${item.id}">Job Title</label>
                            <input type="text" id="exp-job-${item.id}" value="${item.jobTitle || ''}" 
                                   data-section="experience" data-field="jobTitle" data-id="${item.id}">
                        </div>
                        <div class="form-group">
                            <label for="exp-company-${item.id}">Company</label>
                            <input type="text" id="exp-company-${item.id}" value="${item.company || ''}" 
                                   data-section="experience" data-field="company" data-id="${item.id}">
                        </div>
                        <div class="form-group">
                            <label for="exp-period-${item.id}">Period</label>
                            <input type="text" id="exp-period-${item.id}" value="${item.period || ''}" 
                                   data-section="experience" data-field="period" data-id="${item.id}">
                        </div>
                        <div class="form-group">
                            <label for="exp-desc-${item.id}">Description</label>
                            <textarea id="exp-desc-${item.id}" data-section="experience" 
                                      data-field="description" data-id="${item.id}">${item.description || ''}</textarea>
                        </div>
                    `;
                    break;
                case 'education':
                    fieldsHTML = `
                        ${removeBtn}
                        <div class="form-group">
                            <label for="edu-degree-${item.id}">Degree</label>
                            <input type="text" id="edu-degree-${item.id}" value="${item.degree || ''}" 
                                   data-section="education" data-field="degree" data-id="${item.id}">
                        </div>
                        <div class="form-group">
                            <label for="edu-institution-${item.id}">Institution</label>
                            <input type="text" id="edu-institution-${item.id}" value="${item.institution || ''}" 
                                   data-section="education" data-field="institution" data-id="${item.id}">
                        </div>
                        <div class="form-group">
                            <label for="edu-year-${item.id}">Year</label>
                            <input type="text" id="edu-year-${item.id}" value="${item.year || ''}" 
                                   data-section="education" data-field="year" data-id="${item.id}">
                        </div>
                    `;
                    break;
                case 'skills':
                    fieldsHTML = `
                        ${removeBtn}
                        <div class="form-group">
                            <label for="skill-${item.id}">Skill</label>
                            <input type="text" id="skill-${item.id}" value="${item.skill || ''}" 
                                   data-section="skills" data-field="skill" data-id="${item.id}">
                        </div>
                    `;
                    break;
                case 'family':
                    fieldsHTML = `
                        ${removeBtn}
                        <div class="form-group">
                            <label for="family-relation-${item.id}">Relation</label>
                            <input type="text" id="family-relation-${item.id}" value="${item.relation || ''}" 
                                   data-section="family" data-field="relation" data-id="${item.id}">
                        </div>
                        <div class="form-group">
                            <label for="family-name-${item.id}">Name</label>
                            <input type="text" id="family-name-${item.id}" value="${item.name || ''}" 
                                   data-section="family" data-field="name" data-id="${item.id}">
                        </div>
                        <div class="form-group">
                            <label for="family-occupation-${item.id}">Occupation</label>
                            <input type="text" id="family-occupation-${item.id}" value="${item.occupation || ''}" 
                                   data-section="family" data-field="occupation" data-id="${item.id}">
                        </div>
                    `;
                    break;
                case 'achievements':
                    fieldsHTML = `
                        ${removeBtn}
                        <div class="form-group">
                            <label for="ach-title-${item.id}">Title</label>
                            <input type="text" id="ach-title-${item.id}" value="${item.title || ''}" 
                                   data-section="achievements" data-field="title" data-id="${item.id}">
                        </div>
                        <div class="form-group">
                            <label for="ach-year-${item.id}">Year</label>
                            <input type="text" id="ach-year-${item.id}" value="${item.year || ''}" 
                                   data-section="achievements" data-field="year" data-id="${item.id}">
                        </div>
                        <div class="form-group">
                            <label for="ach-desc-${item.id}">Description</label>
                            <textarea id="ach-desc-${item.id}" data-section="achievements" 
                                      data-field="description" data-id="${item.id}">${item.description || ''}</textarea>
                        </div>
                    `;
                    break;
                case 'projects':
                    fieldsHTML = `
                        ${removeBtn}
                        <div class="form-group">
                            <label for="proj-name-${item.id}">Project Name</label>
                            <input type="text" id="proj-name-${item.id}" value="${item.name || ''}" 
                                   data-section="projects" data-field="name" data-id="${item.id}">
                        </div>
                        <div class="form-group">
                            <label for="proj-tech-${item.id}">Technologies</label>
                            <input type="text" id="proj-tech-${item.id}" value="${item.technologies || ''}" 
                                   data-section="projects" data-field="technologies" data-id="${item.id}">
                        </div>
                        <div class="form-group">
                            <label for="proj-desc-${item.id}">Description</label>
                            <textarea id="proj-desc-${item.id}" data-section="projects" 
                                      data-field="description" data-id="${item.id}">${item.description || ''}</textarea>
                        </div>
                    `;
                    break;
                case 'certifications':
                    fieldsHTML = `
                        ${removeBtn}
                        <div class="form-group">
                            <label for="cert-name-${item.id}">Certification Name</label>
                            <input type="text" id="cert-name-${item.id}" value="${item.name || ''}" 
                                   data-section="certifications" data-field="name" data-id="${item.id}">
                        </div>
                        <div class="form-group">
                            <label for="cert-issuer-${item.id}">Issuer</label>
                            <input type="text" id="cert-issuer-${item.id}" value="${item.issuer || ''}" 
                                   data-section="certifications" data-field="issuer" data-id="${item.id}">
                        </div>
                        <div class="form-group">
                            <label for="cert-year-${item.id}">Year</label>
                            <input type="text" id="cert-year-${item.id}" value="${item.year || ''}" 
                                   data-section="certifications" data-field="year" data-id="${item.id}">
                        </div>
                    `;
                    break;
            }

            fieldDiv.innerHTML = fieldsHTML;
            container.appendChild(fieldDiv);
        });

        // Add event listeners to dynamic fields
        document.querySelectorAll('.dynamic-field input, .dynamic-field textarea').forEach(input => {
            input.addEventListener('input', function() {
                const section = this.dataset.section;
                const field = this.dataset.field;
                const id = this.dataset.id;
                const value = this.value;

                const item = resumeData[section].find(item => item.id == id);
                if (item) {
                    item[field] = value;
                    
                    // Also update in customFields if it's a type-specific section
                    if (['family', 'achievements', 'projects', 'certifications'].includes(section)) {
                        const customItem = resumeData.customFields[resumeData.type][section].find(i => i.id == id);
                        if (customItem) {
                            customItem[field] = value;
                        }
                    }
                    
                    updatePreview();
                }
            });
        });

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const section = this.dataset.section;
                const id = this.dataset.id;

                resumeData[section] = resumeData[section].filter(item => item.id != id);
                
                // Also remove from customFields if it's a type-specific section
                if (['family', 'achievements', 'projects', 'certifications'].includes(section)) {
                    resumeData.customFields[resumeData.type][section] = 
                        resumeData.customFields[resumeData.type][section].filter(item => item.id != id);
                }
                
                renderForm();
                updatePreview();
            });
        });
    }

    function updatePreview() {
        previewContainer.className = `resume-template ${resumeData.template}`;
        
        let previewHTML = `
            <div class="resume-header">
                <h2>${resumeData.personalInfo.name || 'Your Name'}</h2>
                <p>${[resumeData.personalInfo.email, resumeData.personalInfo.phone, resumeData.personalInfo.address]
                    .filter(Boolean).join(' | ')}</p>
            </div>
        `;

        // Type-specific header info
        switch(resumeData.type) {
            case 'marriage':
                previewHTML += `
                    <div class="resume-section">
                        <h3>Personal Details</h3>
                        <div class="info-grid">
                            ${resumeData.personalInfo.dob ? `<p><strong>Date of Birth:</strong> ${resumeData.personalInfo.dob}</p>` : ''}
                            ${resumeData.personalInfo.religion ? `<p><strong>Religion:</strong> ${resumeData.personalInfo.religion}</p>` : ''}
                        </div>
                    </div>
                `;
                break;
            case 'student':
                previewHTML += `
                    <div class="resume-section">
                        <h3>Education</h3>
                        <div class="info-grid">
                            ${resumeData.personalInfo.university ? `<p><strong>University:</strong> ${resumeData.personalInfo.university}</p>` : ''}
                            ${resumeData.personalInfo.major ? `<p><strong>Major:</strong> ${resumeData.personalInfo.major}</p>` : ''}
                        </div>
                    </div>
                `;
                break;
            case 'cv':
                previewHTML += `
                    <div class="resume-section">
                        <h3>Professional Profile</h3>
                        <div class="info-grid">
                            ${resumeData.personalInfo.profession ? `<p><strong>Profession:</strong> ${resumeData.personalInfo.profession}</p>` : ''}
                            ${resumeData.personalInfo.website ? `<p><strong>Portfolio:</strong> ${resumeData.personalInfo.website}</p>` : ''}
                        </div>
                    </div>
                `;
                break;
            case 'biodata':
                previewHTML += `
                    <div class="resume-section">
                        <h3>Family Information</h3>
                        <div class="info-grid">
                            ${resumeData.personalInfo.fatherName ? `<p><strong>Father's Name:</strong> ${resumeData.personalInfo.fatherName}</p>` : ''}
                            ${resumeData.personalInfo.motherName ? `<p><strong>Mother's Name:</strong> ${resumeData.personalInfo.motherName}</p>` : ''}
                            ${resumeData.personalInfo.siblings ? `<p><strong>Siblings:</strong> ${resumeData.personalInfo.siblings}</p>` : ''}
                        </div>
                    </div>
                `;
                break;
        }

        // Work Experience (not for marriage resumes)
        if (resumeData.type !== 'marriage' && resumeData.experience.length > 0) {
            previewHTML += `
                <div class="resume-section">
                    <h3>Work Experience</h3>
                    ${resumeData.experience.map(exp => `
                        <div class="experience-item">
                            <div class="item-header">
                                <h4>${exp.jobTitle || 'Job Title'}</h4>
                                <p>${exp.period || 'Period'}</p>
                            </div>
                            <p><strong>${exp.company || 'Company'}</strong></p>
                            <p>${exp.description || 'Job description'}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Education
        if (resumeData.education.length > 0) {
            previewHTML += `
                <div class="resume-section">
                    <h3>Education</h3>
                    ${resumeData.education.map(edu => `
                        <div class="education-item">
                            <div class="item-header">
                                <h4>${edu.degree || 'Degree'}</h4>
                                <p>${edu.year || 'Year'}</p>
                            </div>
                            <p>${edu.institution || 'Institution'}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Skills (not for marriage resumes)
        if (resumeData.type !== 'marriage' && resumeData.skills.length > 0) {
            previewHTML += `
                <div class="resume-section">
                    <h3>Skills</h3>
                    <div class="skills-list">
                        ${resumeData.skills.map(skill => `
                            <span class="skill-tag">${skill.skill || 'Skill'}</span>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Type-specific sections
        switch(resumeData.type) {
            case 'marriage':
                if (resumeData.family && resumeData.family.length > 0) {
                    previewHTML += `
                        <div class="resume-section">
                            <h3>Family Details</h3>
                            ${resumeData.family.map(member => `
                                <div class="info-item">
                                    <p><strong>${member.relation || 'Relation'}:</strong> ${member.name || 'Name'} (${member.occupation || 'Occupation'})</p>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
                
                if (resumeData.personalInfo.preferredAge || resumeData.personalInfo.preferredReligion) {
                    previewHTML += `
                        <div class="resume-section">
                            <h3>Partner Preferences</h3>
                            <div class="info-grid">
                                ${resumeData.personalInfo.preferredAge ? `<p><strong>Preferred Age:</strong> ${resumeData.personalInfo.preferredAge}</p>` : ''}
                                ${resumeData.personalInfo.preferredReligion ? `<p><strong>Preferred Religion:</strong> ${resumeData.personalInfo.preferredReligion}</p>` : ''}
                            </div>
                        </div>
                    `;
                }
                break;
                
            case 'student':
                if (resumeData.achievements && resumeData.achievements.length > 0) {
                    previewHTML += `
                        <div class="resume-section">
                            <h3>Achievements</h3>
                            ${resumeData.achievements.map(ach => `
                                <div class="achievement-item">
                                    <p><strong>${ach.title || 'Title'}</strong> (${ach.year || 'Year'})</p>
                                    <p>${ach.description || 'Description'}</p>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
                
                if (resumeData.projects && resumeData.projects.length > 0) {
                    previewHTML += `
                        <div class="resume-section">
                            <h3>Projects</h3>
                            ${resumeData.projects.map(proj => `
                                <div class="project-item">
                                    <p><strong>${proj.name || 'Project Name'}</strong> (${proj.technologies || 'Technologies'})</p>
                                    <p>${proj.description || 'Description'}</p>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
                break;
                
            case 'cv':
                if (resumeData.certifications && resumeData.certifications.length > 0) {
                    previewHTML += `
                        <div class="resume-section">
                            <h3>Certifications</h3>
                            ${resumeData.certifications.map(cert => `
                                <div class="certification-item">
                                    <p><strong>${cert.name || 'Certification Name'}</strong> - ${cert.issuer || 'Issuer'} (${cert.year || 'Year'})</p>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
                break;
        }

        previewContainer.innerHTML = previewHTML;
    }

    function downloadPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');

        html2canvas(previewContainer, {
            scale: 2,
            logging: false,
            useCORS: true
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = doc.internal.pageSize.getWidth();
            const imgHeight = canvas.height * imgWidth / canvas.width;

            doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            doc.save(`${resumeData.type}_resume.pdf`);
        });
    }

    function saveToLocalStorage() {
        localStorage.setItem('resumeData', JSON.stringify(resumeData));
        alert('Resume saved successfully!');
    }

    function loadFromLocalStorage() {
        const savedData = localStorage.getItem('resumeData');
        if (savedData) {
            resumeData = JSON.parse(savedData);
        }
    }

    function newResume() {
        if (confirm('Are you sure you want to start a new resume? Any unsaved changes will be lost.')) {
            resumeData = {
                type: 'job',
                template: 'professional',
                personalInfo: {
                    name: '',
                    email: '',
                    phone: '',
                    address: ''
                },
                experience: [],
                education: [],
                skills: [],
                customFields: {}
            };
            renderForm();
            updatePreview();
            updateTheme();
            
            // Reset active buttons
            typeOptions.forEach(opt => opt.classList.remove('active'));
            document.querySelector(`.type-option[data-type="job"]`).classList.add('active');
            
            templateThumbnails.forEach(t => t.classList.remove('active'));
            document.querySelector(`.template-thumbnail[data-template="professional"]`).classList.add('active');
        }
    }
});