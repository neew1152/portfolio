document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('cert-grid');
    const instruction = document.querySelector('.instruction');
    const folderPath = 'assets/certs/';

    // Fetch the list of files from certs.json
    fetch('certs.json')
        .then(response => response.json())
        .then(files => {
            instruction.textContent = `${files.length} Certificates found. Click to view.`;
            
            files.forEach(filename => {
                // 1. Create the Card
                const card = document.createElement('div');
                card.classList.add('cert-card');

                // 2. Format the Name (remove extension, replace -/_ with space)
                let displayName = filename.split('.').slice(0, -1).join('.');
                displayName = displayName.replace(/[-_]/g, ' ');
                // Capitalize words
                displayName = displayName.replace(/\b\w/g, l => l.toUpperCase());

                // 3. Check file type for preview
                const extension = filename.split('.').pop().toLowerCase();
                let previewContent = '';

                if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
                    // It's an image, show it
                    previewContent = `<img src="${folderPath}${filename}" alt="${displayName}" loading="lazy">`;
                } else if (extension === 'pdf') {
                    // It's a PDF, show a fancy PDF icon
                    previewContent = `
                        <div class="pdf-preview">
                            <i class="fas fa-file-pdf"></i>
                            <span>PDF Document</span>
                        </div>`;
                } else {
                    // Unknown file
                    previewContent = `<div class="pdf-preview"><i class="fas fa-file"></i></div>`;
                }

                // 4. Build HTML
                card.innerHTML = `
                    <div class="card-content">
                        <a href="${folderPath}${filename}" target="_blank">
                            ${previewContent}
                        </a>
                        <h3>${displayName}</h3>
                        <p class="file-type">${extension.toUpperCase()} FILE</p>
                    </div>
                `;

                grid.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error loading certs:', error);
            instruction.textContent = "Error loading certificate list. Check certs.json format.";
        });
});