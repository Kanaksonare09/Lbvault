// ============================================================
//  HealthScan — Complete MongoDB Schema
//  MongoDB 6.0+
//  Copy-paste into MongoDB Shell or Compass
//  Run each block in order
// ============================================================


// ============================================================
//  1. USERS
//  Single collection for all roles (patient, pathology, doctor, admin)
// ============================================================

db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "passwordHash", "role", "name", "lvId"],
      properties: {
        _id:           { bsonType: "objectId" },
        lvId:          { bsonType: "string" },      // Core system ID (e.g., LV-1234)
        email:         { bsonType: "string" },
        phone:         { bsonType: "string" },
        passwordHash:  { bsonType: "string" },
        role:          { enum: ["patient", "pathology", "doctor", "admin"] },
        name:          { bsonType: "string" },
        avatarUrl:     { bsonType: "string" },
        isActive:      { bsonType: "bool" },
        isVerified:    { bsonType: "bool" },
        lastLoginAt:   { bsonType: "date" },
        createdAt:     { bsonType: "date" },
        updatedAt:     { bsonType: "date" }
      }
    }
  }
});

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ lvId: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ phone: 1 }, { sparse: true });


// ============================================================
//  2. PATIENT PROFILES
//  1:1 with users where role = "patient"
// ============================================================

db.createCollection("patientProfiles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId"],
      properties: {
        _id:                   { bsonType: "objectId" },
        userId:                { bsonType: "objectId" },   // ref: users._id (UNIQUE)
        dateOfBirth:           { bsonType: "date" },
        gender:                { enum: ["male", "female", "other"] },
        bloodGroup:            { bsonType: "string" },     // "A+", "O-" etc.
        emergencyContactName:  { bsonType: "string" },
        emergencyContactPhone: { bsonType: "string" },
        preferredLanguage:     { bsonType: "string" },     // "en", "hi", "mr", "ta"
        createdAt:             { bsonType: "date" },
        updatedAt:             { bsonType: "date" }
      }
    }
  }
});

db.patientProfiles.createIndex({ userId: 1 }, { unique: true });


// ============================================================
//  3. DOCTOR PROFILES
//  1:1 with users where role = "doctor"
// ============================================================

db.createCollection("doctorProfiles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "registrationNumber"],
      properties: {
        _id:                { bsonType: "objectId" },
        userId:             { bsonType: "objectId" },   // ref: users._id (UNIQUE)
        specialty:          { bsonType: "string" },     // "Cardiology", "General" etc.
        registrationNumber: { bsonType: "string" },     // MCI / state council (UNIQUE)
        clinicName:         { bsonType: "string" },
        clinicAddress:      { bsonType: "string" },
        isVerified:         { bsonType: "bool" },       // admin manually verifies
        isErDoctor:         { bsonType: "bool" },       // unlocks emergency override
        createdAt:          { bsonType: "date" },
        updatedAt:          { bsonType: "date" }
      }
    }
  }
});

db.doctorProfiles.createIndex({ userId: 1 }, { unique: true });
db.doctorProfiles.createIndex({ registrationNumber: 1 }, { unique: true });
db.doctorProfiles.createIndex({ isVerified: 1 });


// ============================================================
//  4. PATHOLOGY PROFILES
//  1:1 with users where role = "pathology"
// ============================================================

db.createCollection("pathologyProfiles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "labName", "licenseNumber"],
      properties: {
        _id:            { bsonType: "objectId" },
        userId:         { bsonType: "objectId" },  // ref: users._id (UNIQUE)
        labName:        { bsonType: "string" },
        licenseNumber:  { bsonType: "string" },    // NABL / state license (UNIQUE)
        address:        { bsonType: "string" },
        city:           { bsonType: "string" },
        logoUrl:        { bsonType: "string" },
        apiKeyHash:     { bsonType: "string" },    // SHA-256 of API key, never raw
        webhookSecret:  { bsonType: "string" },    // HMAC secret for payload verification
        isVerified:     { bsonType: "bool" },
        paymentPlan:    { enum: ["free", "basic", "pro"] },
        createdAt:      { bsonType: "date" },
        updatedAt:      { bsonType: "date" }
      }
    }
  }
});

db.pathologyProfiles.createIndex({ userId: 1 }, { unique: true });
db.pathologyProfiles.createIndex({ licenseNumber: 1 }, { unique: true });
db.pathologyProfiles.createIndex({ city: 1 });
db.pathologyProfiles.createIndex({ apiKeyHash: 1 }, { sparse: true });


// ============================================================
//  5. REPORTS
//  Core report document — one per test/upload
// ============================================================

db.createCollection("reports", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["patientId", "uploadedBy", "uploadedByRole", "reportName", "testType", "fileUrl", "reportDate"],
      properties: {
        _id:            { bsonType: "objectId" },
        patientId:      { bsonType: "objectId" },  // ref: users._id
        lvId:           { bsonType: "string" },    // Denormalized HealthScan ID for quick search
        uploadedBy:     { bsonType: "objectId" },  // ref: users._id (patient or pathology user)
        uploadedByRole: { enum: ["patient", "pathology", "api", "doctor"] },
        pathologyId:    { bsonType: "objectId" },  // ref: users._id (where role=pathology) (null if self-upload)
        reportName:     { bsonType: "string" },    // "Complete Blood Count"
        testType:       { bsonType: "string" },    // Specific test categorization
        category:       { enum: ["blood", "urine", "imaging", "biopsy", "other"] },
        fileUrl:        { bsonType: "string" },    // S3 / GCS URL
        thumbnailUrl:   { bsonType: "string" },
        reportDate:     { bsonType: "date" },      // date test was conducted
        status:         { enum: ["processing", "ready", "failed"] },
        isDeleted:      { bsonType: "bool" },      // soft delete
        createdAt:      { bsonType: "date" },
        updatedAt:      { bsonType: "date" }
      }
    }
  }
});

db.reports.createIndex({ patientId: 1, reportDate: -1 });
db.reports.createIndex({ patientId: 1, category: 1 });
db.reports.createIndex({ pathologyId: 1, createdAt: -1 });
db.reports.createIndex({ lvId: 1 });
db.reports.createIndex({ status: 1 });
db.reports.createIndex({ isDeleted: 1 });


// ============================================================
//  6. REPORT BIOMARKERS
//  Structured extracted values — powers trend charts
// ============================================================

db.createCollection("reportBiomarkers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["reportId", "patientId", "biomarkerName", "value", "unit", "testDate"],
      properties: {
        _id:           { bsonType: "objectId" },
        reportId:      { bsonType: "objectId" },  // ref: reports._id
        patientId:     { bsonType: "objectId" },  // ref: users._id (denormalized)
        biomarkerName: { bsonType: "string" },    // "HbA1c", "Creatinine", "Haemoglobin"
        value:         { bsonType: "double" },
        unit:          { bsonType: "string" },    // "%", "mg/dL", "g/dL"
        referenceMin:  { bsonType: "double" },
        referenceMax:  { bsonType: "double" },
        isAbnormal:    { bsonType: "bool" },
        source:        { enum: ["ai_extracted", "lab_api", "manual"] },
        testDate:      { bsonType: "date" },      // copied from report.reportDate
        createdAt:     { bsonType: "date" }
      }
    }
  }
});

db.reportBiomarkers.createIndex({ reportId: 1, biomarkerName: 1 }, { unique: true });
db.reportBiomarkers.createIndex({ patientId: 1, biomarkerName: 1, testDate: 1 });
db.reportBiomarkers.createIndex({ isAbnormal: 1 });


// ============================================================
//  7. REPORT AI ANALYSIS
//  AI summaries, insights, OCR, and multilingual audio
// ============================================================

db.createCollection("reportAiAnalysis", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["reportId"],
      properties: {
        _id:           { bsonType: "objectId" },
        reportId:      { bsonType: "objectId" },  // ref: reports._id (UNIQUE)
        ocrText:       { bsonType: "string" },    // Raw text extracted from file
        summaryEn:     { bsonType: "string" },    // plain-English summary for patient
        insightsEn:    { bsonType: "string" },    // AI observations, flagged values
        doctorBriefEn: { bsonType: "string" },    // clinical-tone brief for doctor
        translations: {                           // summary per locale
          bsonType: "object",
        },
        audioUrls: {                              // TTS audio per locale
          bsonType: "object",
        },
        modelVersion:  { bsonType: "string" },   // tracker for LLM model version via inference
        generatedAt:   { bsonType: "date" }
      }
    }
  }
});

db.reportAiAnalysis.createIndex({ reportId: 1 }, { unique: true });


// ============================================================
//  8. REPORT ACCESS
//  Patient grants doctor access to a specific report
// ============================================================

db.createCollection("reportAccess", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["reportId", "patientId", "doctorId", "status"],
      properties: {
        _id:          { bsonType: "objectId" },
        reportId:     { bsonType: "objectId" },  // ref: reports._id
        patientId:    { bsonType: "objectId" },  // ref: users._id — the grantor
        doctorId:     { bsonType: "objectId" },  // ref: users._id — the grantee
        status:       { enum: ["pending", "approved", "revoked", "expired"] },
        accessLevel:  { enum: ["summary_only", "full_report"] },
        grantedAt:    { bsonType: "date" },
        expiresAt:    { bsonType: "date" },      // null = no expiry
        revokedAt:    { bsonType: "date" },
        createdAt:    { bsonType: "date" }
      }
    }
  }
});

db.reportAccess.createIndex({ reportId: 1, doctorId: 1 }, { unique: true });
db.reportAccess.createIndex({ patientId: 1, status: 1 });
db.reportAccess.createIndex({ doctorId: 1, status: 1 });
db.reportAccess.createIndex({ expiresAt: 1 }, { sparse: true });


// ============================================================
//  9. ACCESS REQUESTS
//  Doctor requests access → patient approves/declines
// ============================================================

db.createCollection("accessRequests", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["doctorId", "patientId", "status", "reason"],
      properties: {
        _id:                  { bsonType: "objectId" },
        doctorId:             { bsonType: "objectId" },  // ref: users._id
        patientId:            { bsonType: "objectId" },  // ref: users._id
        reportId:             { bsonType: "objectId" },  // ref: reports._id (null = all reports)
        reason:               { bsonType: "string" },    // doctor states clinical reason
        status:               { enum: ["pending", "approved", "declined", "expired"] },
        requestedAccessLevel: { enum: ["summary_only", "full_report"] },
        requestedExpiry:      { bsonType: "date" },      // doctor suggests; patient can override
        respondedAt:          { bsonType: "date" },
        expiresAt:            { bsonType: "date" },      // auto-expire
        createdAt:            { bsonType: "date" }
      }
    }
  }
});

db.accessRequests.createIndex(
  { doctorId: 1, reportId: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);
db.accessRequests.createIndex({ patientId: 1, status: 1 });
db.accessRequests.createIndex({ doctorId: 1, status: 1 });
db.accessRequests.createIndex({ expiresAt: 1 });


// ============================================================
//  10. EMERGENCY ACCESS LOGS
//  ER override — append-only, fully audited
// ============================================================

db.createCollection("emergencyAccessLogs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["doctorId", "patientId", "justification"],
      properties: {
        _id:                { bsonType: "objectId" },
        doctorId:           { bsonType: "objectId" },  // ref: users._id
        patientId:          { bsonType: "objectId" },  // ref: users._id
        justification:      { bsonType: "string" },    // mandatory
        accessGrantedAt:    { bsonType: "date" },
        accessExpiresAt:    { bsonType: "date" },
        patientNotifiedAt:  { bsonType: "date" },
        adminReviewed:      { bsonType: "bool" },
        ipAddress:          { bsonType: "string" },
        createdAt:          { bsonType: "date" }       // immutable
      }
    }
  }
});

db.emergencyAccessLogs.createIndex({ doctorId: 1, createdAt: -1 });
db.emergencyAccessLogs.createIndex({ patientId: 1, createdAt: -1 });
db.emergencyAccessLogs.createIndex({ adminReviewed: 1 });
db.emergencyAccessLogs.createIndex({ accessExpiresAt: 1 });


// ============================================================
//  11. API KEYS
//  Per-lab API key management for webhook integration
// ============================================================

db.createCollection("apiKeys", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["pathologyId", "keyHash", "label"],
      properties: {
        _id:         { bsonType: "objectId" },
        pathologyId: { bsonType: "objectId" },    // ref: users._id (where role=pathology)
        keyHash:     { bsonType: "string" },      // SHA-256 of the raw key
        label:       { bsonType: "string" },      // "Production", "Staging"
        scopes:      { bsonType: "array" },       
        lastUsedAt:  { bsonType: "date" },
        isActive:    { bsonType: "bool" },
        expiresAt:   { bsonType: "date" },
        createdAt:   { bsonType: "date" }
      }
    }
  }
});

db.apiKeys.createIndex({ keyHash: 1 }, { unique: true });
db.apiKeys.createIndex({ pathologyId: 1, isActive: 1 });


// ============================================================
//  12. WEBHOOK EVENTS
//  Incoming events from lab systems
// ============================================================

db.createCollection("webhookEvents", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["pathologyId", "eventType", "payload", "status"],
      properties: {
        _id:          { bsonType: "objectId" },
        pathologyId:  { bsonType: "objectId" },  // ref: users._id (where role=pathology)
        eventType:    { bsonType: "string" },    // "report.created" | "report.updated" | "patient.registered"
        payload:      { bsonType: "object" },    // raw incoming JSON
        status:       { enum: ["received", "processing", "success", "failed"] },
        errorMessage: { bsonType: "string" },    // null if success
        retryCount:   { bsonType: "int" },
        processedAt:  { bsonType: "date" },
        createdAt:    { bsonType: "date" }
      }
    }
  }
});

db.webhookEvents.createIndex({ pathologyId: 1, createdAt: -1 });
db.webhookEvents.createIndex({ status: 1, retryCount: 1 });


// ============================================================
//  13. DOCTOR ANNOTATIONS
//  Clinical notes a doctor leaves on shared reports
// ============================================================

db.createCollection("doctorAnnotations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["reportId", "doctorId", "note"],
      properties: {
        _id:              { bsonType: "objectId" },
        reportId:         { bsonType: "objectId" },  // ref: reports._id
        doctorId:         { bsonType: "objectId" },  // ref: users._id
        note:             { bsonType: "string" },
        visibleToPatient: { bsonType: "bool" },      // doctor controls visibility
        createdAt:        { bsonType: "date" },
        updatedAt:        { bsonType: "date" }
      }
    }
  }
});

db.doctorAnnotations.createIndex({ reportId: 1, doctorId: 1 });
db.doctorAnnotations.createIndex({ doctorId: 1, createdAt: -1 });


// ============================================================
//  14. AUDIT LOGS
//  Immutable — every sensitive action logged here
// ============================================================

db.createCollection("auditLogs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["actorId", "actorRole", "action", "targetType", "targetId"],
      properties: {
        _id:        { bsonType: "objectId" },
        actorId:    { bsonType: "objectId" },  // ref: users._id
        actorRole:  { bsonType: "string" },    
        action:     { bsonType: "string" },    
        targetType: { bsonType: "string" },    // "report" | "patient" | "access_request" | "emergency_access"
        targetId:   { bsonType: "objectId" },  
        metadata:   { bsonType: "object" },    // { ip, device, extra context }
        createdAt:  { bsonType: "date" }       // append-only
      }
    }
  }
});

db.auditLogs.createIndex({ actorId: 1, createdAt: -1 });
db.auditLogs.createIndex({ targetId: 1, targetType: 1, createdAt: -1 });
db.auditLogs.createIndex({ action: 1, createdAt: -1 });


// ============================================================
//  15. NOTIFICATIONS
//  In-app + push notification queue
// ============================================================

db.createCollection("notifications", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "type", "title", "body"],
      properties: {
        _id:           { bsonType: "objectId" },
        userId:        { bsonType: "objectId" },  // ref: users._id
        type:          {
          enum: [
            "report_ready",
            "access_requested",
            "access_granted",
            "access_revoked",
            "emergency_override",
            "annotation_added"
          ]
        },
        title:         { bsonType: "string" },
        body:          { bsonType: "string" },
        referenceId:   { bsonType: "objectId" },  // related entity ID
        referenceType: { bsonType: "string" },    // "report" | "access_request" | "emergency_access"
        isRead:        { bsonType: "bool" },
        createdAt:     { bsonType: "date" }
      }
    }
  }
});

db.notifications.createIndex({ userId: 1, isRead: 1, createdAt: -1 });
db.notifications.createIndex({ userId: 1, type: 1 });
