/**
 * PDF Generation Script for ADVERSIQ Research Paper V4.0
 * 
 * This script converts the markdown research paper to a professional PDF.
 * 
 * Usage:
 *   npm install markdown-pdf
 *   node generate-pdf.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🔄 ADVERSIQ Research Paper PDF Generator');
console.log('=========================================\n');

// Check if markdown-pdf is installed
const checkDependencies = () => {
    try {
        require.resolve('markdown-pdf');
        return true;
    } catch (e) {
        return false;
    }
};

if (!checkDependencies()) {
    console.log('📦 Installing required dependencies...\n');
    exec('npm install markdown-pdf', (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Error installing dependencies:', error);
            console.log('\n💡 Alternative: Install manually with:');
            console.log('   npm install markdown-pdf');
            console.log('\n   Then run: node generate-pdf.js');
            return;
        }
        console.log('✅ Dependencies installed!\n');
        generatePDF();
    });
} else {
    generatePDF();
}

function generatePDF() {
    const markdownpdf = require('markdown-pdf');
    
    const inputFile = path.join(__dirname, 'ADVERSIQ_RESEARCH_PAPER_V4.0.md');
    const outputFile = path.join(__dirname, 'ADVERSIQ_RESEARCH_PAPER_V4.0.pdf');
    
    console.log('📄 Input:  ADVERSIQ_RESEARCH_PAPER_V4.0.md');
    console.log('📑 Output: ADVERSIQ_RESEARCH_PAPER_V4.0.pdf\n');
    
    const options = {
        cssPath: path.join(__dirname, 'pdf-styles.css'),
        paperFormat: 'A4',
        paperOrientation: 'portrait',
        paperBorder: '2cm',
        renderDelay: 1000,
        runningsPath: path.join(__dirname, 'pdf-header-footer.js')
    };
    
    console.log('🔄 Generating PDF...\n');
    
    markdownpdf(options)
        .from(inputFile)
        .to(outputFile, () => {
            console.log('✅ PDF generated successfully!');
            console.log(`📁 Location: ${outputFile}\n`);
            console.log('📊 File Details:');
            
            const stats = fs.statSync(outputFile);
            const fileSizeInBytes = stats.size;
            const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
            
            console.log(`   Size: ${fileSizeInMB} MB`);
            console.log(`   Pages: ~${Math.ceil(fileSizeInBytes / 50000)} (estimated)\n`);
            console.log('🎉 Done! Your research paper is ready for download.');
        });
}

// Made with Bob
