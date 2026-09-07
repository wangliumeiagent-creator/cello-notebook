// Use Python's standard-library zipfile from the command line to package dist.
// Kept as a manifest so generated QA data and source PDFs cannot enter the handoff.
module.exports={root:'dist',exclude:['.DS_Store'],entry:'index.html',records:'Browser localStorage, export/import JSON separately'};
