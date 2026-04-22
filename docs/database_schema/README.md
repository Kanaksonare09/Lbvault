# HealthScan MongoDB Schema Design

This directory contains the finalized, verified, and standardized MongoDB schema for the HealthScan project. 

## Corrections & Improvements Made to Original Draft

1. **`lvId` Added to Users**: The original schema missed the `lvId` field which is integral to the HealthScan ecosystem for linking profiles. It has been added to the `users` collection as a `required` and `unique` indexed field.
2. **`reports` Alignment**: 
   - Denormalized `lvId` is included for rapid query capability without heavy joins.
   - Replaced `title` with `reportName` and added `testType` to align with the current HealthScan application's data flow.
   - Added `doctor` to `uploadedByRole` in case doctors directly upload historical records for a patient.
3. **`ocrText` Added to AI Analysis**: The `reportAiAnalysis` collection originally lacked a field for the raw OCR extracted text. This has been added as `ocrText` because the raw payload is needed for GenAI reprocessing to avoid running expensive OCR multiple times.
4. **General Polish**: Added missing properties into the simulated sample inserts to make the scripts directly testable.

## Schema Files

- **`schema_setup.js`**: Contains the complete MongoDB scripts utilizing `$jsonSchema` validators. You can run this file directly in `mongosh` or MongoDB Compass to enforce strict data structures on your collections.

## Architecture Guidelines

- **Centralized Users**: All entities (`patient`, `pathology`, `doctor`, `admin`) authenticate through the `users` table.
- **Entity Profiles**: Specific data for each role is stored in its respective 1:1 profile collection (`patientProfiles`, `doctorProfiles`, `pathologyProfiles`).
- **Separation of Concerns**: Reports are kept lightweight. Extracted biomarkers, doctor annotations, AI analysis, and access permissions are modularized into separate collections referenced by the `reportId`.
- **Immutability**: Collections like `auditLogs` and `emergencyAccessLogs` are designed to be append-only to maintain forensic integrity.
