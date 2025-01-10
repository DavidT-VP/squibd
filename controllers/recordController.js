const db = require('../config/database');
const multer = require('multer');
const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Setup multer to store CSV in "uploads" folder
const upload = multer({ dest: 'uploads/' });

// 1) Upload CSV
exports.uploadCSV = (req, res) => {
  const singleUpload = upload.single('file');

  singleUpload(req, res, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'File upload error' });
    }

    const csvFilePath = req.file.path;
    const parser = fs.createReadStream(csvFilePath).pipe(
      parse({
        columns: true,
        trim: true,
      })
    );

    parser.on('data', (row) => {
      // row => { full_name, ssn, job_start_date, job_end_date, status, job_type, organization_id }
      db.run(
        `INSERT INTO EmploymentRecords 
         (full_name, ssn, job_start_date, job_end_date, status, job_type, organization_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          row.full_name,
          row.ssn,
          row.job_start_date,
          row.job_end_date,
          row.status,
          row.job_type,
          row.organization_id
        ]
      );
    });

    parser.on('end', () => {
      fs.unlinkSync(csvFilePath); // remove file from server
      return res.status(200).json({ message: 'CSV uploaded and records saved.' });
    });

    parser.on('error', (error) => {
      console.error(error);
      return res.status(500).json({ message: 'Error parsing CSV file' });
    });
  });
};

// 2) Search by SSN
exports.searchBySSN = (req, res) => {
  const { ssn } = req.params;
  db.all(`SELECT * FROM EmploymentRecords WHERE ssn = ?`, [ssn], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    // Obfuscate SSN (show only last 2 digits)
    const obfuscatedRows = rows.map(record => {
      const fullSSN = record.ssn;
      const visiblePart = fullSSN.slice(-2);
      const hiddenPart = '*'.repeat(fullSSN.length - 2);
      const displaySSN = hiddenPart + visiblePart;

      return { ...record, ssn: displaySSN };
    });
    res.status(200).json(obfuscatedRows);
  });
};

// 3) Generate PDF
exports.generatePDF = (req, res) => {
  const { ssn } = req.params;

  db.all(`SELECT * FROM EmploymentRecords WHERE ssn = ?`, [ssn], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }

    // Create a PDF
    const doc = new PDFDocument();
    res.setHeader('Content-disposition', `attachment; filename=EVR-${ssn}.pdf`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    doc.fontSize(18).text('Employment Verification Report', { align: 'center' });
    doc.moveDown();

    if (rows.length === 0) {
      doc.fontSize(12).text(`No records found for SSN: ${ssn}`);
      doc.end();
      return;
    }

    // We'll display only the last 2 digits of SSN in the PDF
    const fullSSN = rows[0].ssn;
    const visiblePart = fullSSN.slice(-2);
    const hiddenPart = '*'.repeat(fullSSN.length - 2);
    const displaySSN = hiddenPart + visiblePart;

    doc.fontSize(12).text(`SSN: ${displaySSN}`);
    doc.moveDown();

    rows.forEach((record, index) => {
      doc.text(`Record #${index + 1}`);
      doc.text(`Full Name: ${record.full_name}`);
      doc.text(`Organization ID: ${record.organization_id}`);
      doc.text(`Job Type: ${record.job_type}`);
      doc.text(`Start Date: ${record.job_start_date}`);
      doc.text(`End Date: ${record.job_end_date}`);
      doc.text(`Status: ${record.status}`);
      doc.moveDown();
    });

    doc.end();
  });
};
