// API Configuration - Update this if your backend runs on a different URL
const API_BASE_URL = "";

// State management
let uploadedFile = null;
let isFileUploaded = false;

// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const uploadCard = document.getElementById('uploadCard');
const fileName = document.getElementById('fileName');
const uploadStatus = document.getElementById('uploadStatus');
const generateForm = document.getElementById('generateForm');
const generateBtn = document.getElementById('generateBtn');
const outputSection = document.getElementById('outputSection');
const outputTopic = document.getElementById('outputTopic');
const outputContent = document.getElementById('outputContent');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const toast = document.getElementById('toast');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const printBtn = document.getElementById('printBtn');

// Initialize event listeners
function init() {
    // File input change event
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop events
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Form submit event
    generateForm.addEventListener('submit', handleGenerate);

    // Output action buttons
    copyBtn.addEventListener('click', handleCopy);
    downloadBtn.addEventListener('click', handleDownload);
    printBtn.addEventListener('click', handlePrint);
}

// File selection handler
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        validateAndUploadFile(file);
    }
}

// Drag over handler
function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('drag-over');
}

// Drag leave handler
function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('drag-over');
}

// Drop handler
function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('drag-over');

    const file = event.dataTransfer.files[0];
    if (file) {
        validateAndUploadFile(file);
    }
}

// Validate and upload file
function validateAndUploadFile(file) {
    // Check if file is PDF
    if (file.type !== 'application/pdf') {
        showUploadStatus('Please upload a PDF file only', 'error');
        return;
    }

    // Show file name
    fileName.textContent = file.name;
    fileName.classList.add('show');

    // Store file and upload
    uploadedFile = file;
    uploadFile(file);
}

// Upload file to backend
async function uploadFile(file) {
    showLoading('Uploading PDF...');

    try {
        // Create form data with the file
        const formData = new FormData();
        formData.append('file', file);

        // Make API call to /upload endpoint
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();

        // Show success message
        showUploadStatus(
            `✓ Upload successful! ${result.chunks_added || 0} chunks processed`,
            'success'
        );

        // Enable generate button
        isFileUploaded = true;
        generateBtn.disabled = false;

        showToast('PDF uploaded successfully!', 'success');

    } catch (error) {
        console.error('Upload error:', error);
        showUploadStatus(`✗ Upload failed: ${error.message}`, 'error');
        showToast('Upload failed. Please try again.', 'error');

        // Reset state
        isFileUploaded = false;
        generateBtn.disabled = true;
    } finally {
        hideLoading();
    }
}

// Handle generate form submission
async function handleGenerate(event) {
    event.preventDefault();

    if (!isFileUploaded) {
        showToast('Please upload a PDF first', 'error');
        return;
    }

    // Get form values
    const formData = new FormData(generateForm);
    const topic = formData.get('topic');
    const marks = formData.get('marks');
    const difficulty = formData.get('difficulty');
    const qtype = formData.get('qtype');
    const num = formData.get('num');

    showLoading('Generating questions...');

    try {
        // Create URL-encoded form data for the /generate endpoint
        const params = new URLSearchParams();
        params.append('topic', topic);
        params.append('marks', marks);
        params.append('difficulty', difficulty);
        params.append('qtype', qtype);
        params.append('num', num);

        // Make API call to /generate endpoint
        const response = await fetch(`${API_BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        if (!response.ok) {
            throw new Error(`Generation failed: ${response.statusText}`);
        }

        const result = await response.json();

        // Display generated questions
        displayQuestions(result);

        showToast('Questions generated successfully!', 'success');

    } catch (error) {
        console.error('Generation error:', error);
        showToast(`Generation failed: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Display generated questions
function displayQuestions(result) {
    outputTopic.textContent = result.topic || 'Generated Questions';
    outputContent.textContent = result.questions || 'No questions generated';

    // Show output section with animation
    outputSection.style.display = 'block';

    // Scroll to output section
    setTimeout(() => {
        outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Copy to clipboard
function handleCopy() {
    const text = outputContent.textContent;

    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(error => {
        console.error('Copy error:', error);
        showToast('Failed to copy', 'error');
    });
}

// Download as text file
function handleDownload() {
    const text = outputContent.textContent;
    const topic = outputTopic.textContent;
    const filename = `${topic.replace(/\s+/g, '_')}_questions.txt`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Download started!', 'success');
}

// Print questions
function handlePrint() {
    const topic = outputTopic.textContent;
    const text = outputContent.textContent;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${topic}</title>
            <style>
                body {
                    font-family: 'Inter', Arial, sans-serif;
                    max-width: 800px;
                    margin: 2rem auto;
                    padding: 2rem;
                    line-height: 1.8;
                }
                h1 {
                    color: #333;
                    border-bottom: 2px solid #00d9ff;
                    padding-bottom: 0.5rem;
                }
                pre {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    font-family: inherit;
                }
            </style>
        </head>
        <body>
            <h1>${topic}</h1>
            <pre>${text}</pre>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Show loading overlay
function showLoading(message = 'Processing...') {
    loadingText.textContent = message;
    loadingOverlay.classList.add('show');
}

// Hide loading overlay
function hideLoading() {
    loadingOverlay.classList.remove('show');
}

// Show upload status
function showUploadStatus(message, type) {
    uploadStatus.textContent = message;
    uploadStatus.className = `upload-status show ${type}`;
}

// Show toast notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
