document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('cert-grid');
    const instruction = document.querySelector('.instruction');
    const folderPath = 'assets/certs/';

    fetch('certs.json')
        .then(response => response.json())
        .then(files => {
            instruction.textContent = `${files.length} Certificates found.`;
            
            files.forEach((filename, index) => {
                // 1. Clean up the name for display
                let displayName = filename.split('.').slice(0, -1).join('.');
                displayName = displayName.replace(/[-_]/g, ' ');
                displayName = displayName.replace(/\b\w/g, l => l.toUpperCase());

                // 2. Determine file type
                const extension = filename.split('.').pop().toLowerCase();
                const fileUrl = `${folderPath}${filename}`;
                
                // 3. Create the Card Structure
                const card = document.createElement('div');
                card.classList.add('cert-card');

                // We create a unique ID for the container so we can inject the image/canvas later
                const containerId = `preview-${index}`;

                card.innerHTML = `
                    <div class="card-content">
                        <a href="${fileUrl}" target="_blank" class="preview-container" id="${containerId}">
                            <!-- Content injected via JS below -->
                            <div class="loading-spinner">Loading...</div>
                        </a>
                        <h3>${displayName}</h3>
                        <p class="file-type">${extension.toUpperCase()} FILE</p>
                    </div>
                `;

                grid.appendChild(card);

                // 4. Handle Logic: Image vs PDF
                const container = document.getElementById(containerId);

                if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
                    // Standard Image
                    container.innerHTML = `<img src="${fileUrl}" alt="${displayName}" loading="lazy">`;
                } 
                else if (extension === 'pdf') {
                    // Render PDF to Canvas
                    renderPDFToCanvas(fileUrl, container);
                } 
                else {
                    // Fallback
                    container.innerHTML = `<div class="pdf-preview"><i class="fas fa-file"></i></div>`;
                }
            });
        })
        .catch(error => {
            console.error('Error loading certs:', error);
            instruction.textContent = "Error loading certificate list.";
        });
});

// Helper function to render PDF
async function renderPDFToCanvas(url, container) {
    try {
        // Load the PDF
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        
        // Fetch the first page
        const page = await pdf.getPage(1);
        
        // Prepare canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Define scale (quality) - 1.5 is a good balance for thumbnails
        const viewport = page.getViewport({ scale: 1.5 });

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Clear "Loading..." text and append canvas
        container.innerHTML = ''; 
        container.appendChild(canvas);

        // Render page into canvas context
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        await page.render(renderContext).promise;

    } catch (error) {
        console.error('PDF Render Error:', error);
        container.innerHTML = `
            <div class="pdf-preview">
                <i class="fas fa-file-pdf"></i>
                <span>Preview Unavailable</span>
            </div>`;
    }
}
