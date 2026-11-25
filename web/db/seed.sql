-- Summit General Hospital — seed data for local development and first deploy.
-- Content is copied from the existing static site (src/pages/*.html).
-- Ids are explicit so re-running this file is idempotent (INSERT OR REPLACE).
-- Apply after db/schema.sql:  npm run db:local

PRAGMA foreign_keys = OFF;

-- INSERT OR REPLACE deletes a row before re-inserting it, which trips the
-- ON DELETE RESTRICT children. Clear those first so this file can be re-run.
DELETE FROM doctor_departments;
DELETE FROM services;

-- Departments (directory filter chips + booking labels) ----------------------
INSERT OR REPLACE INTO departments
  (id, slug, name, filter_label, appointment_label, card_label, summary, icon, is_active, sort_order)
VALUES
  (1, 'internal-medicine', 'Internal Medicine', 'Internal medicine', 'Internal Medicine',
   'Internal medicine',
   'Adult health, chronic conditions, infections and preventive care.', 'i-stethoscope', 1, 1),
  (2, 'pediatrics', 'Pediatrics and Child Health', 'Pediatrics', 'Pediatrics & Child Health',
   'Pediatrics',
   'Newborn checks, childhood illness, growth monitoring and vaccinations.', 'i-child', 1, 2),
  (3, 'womens-health', 'Obstetrics and Gynecology', 'Women''s health', 'Obstetrics & Gynecology',
   'Women''s health',
   'Antenatal care, safe delivery, postnatal support and gynecological care.', 'i-users', 1, 3),
  (4, 'surgery', 'General and Laparoscopic Surgery', 'Surgery & ortho', 'General & Laparoscopic Surgery',
   'Surgery',
   'Elective and emergency procedures in modern theatres.', 'i-scalpel', 1, 4);

-- Consultants ----------------------------------------------------------------
INSERT OR REPLACE INTO doctors
  (id, slug, name, role, focus, bio_md, photo_path, photo_alt, clinic_note,
   languages, accepts_appointments, is_active, sort_order)
VALUES
  (1, 'dr-million-seid-muzeyen', 'Dr. Million Seid Muzeyen', 'Internist & CEO',
   'Adult internal medicine and chronic disease care.',
   NULL, '/assets/img/doctors/dr-million-seid-muzeyen.jpg',
   'Portrait of Dr. Million Seid Muzeyen', 'Clinic days — call to confirm',
   '[]', 1, 1, 1),
  (2, 'dr-yasin-ahmed-yesuf', 'Dr. Yasin Ahmed Yesuf', 'Consultant Pediatrician',
   'Child health, newborn follow-up and childhood illness.',
   NULL, '/assets/img/doctors/dr-yasin-ahmed-yesuf.jpg',
   'Portrait of Dr. Yasin Ahmed Yesuf', 'Clinic days — call to confirm',
   '[]', 1, 1, 2),
  (3, 'dr-gosa-abebe-shifera', 'Dr. Gosa Abebe Shifera', 'Consultant General Surgeon',
   'General and emergency surgery.',
   NULL, '/assets/img/doctors/dr-gosa-abebe-shifera.jpg',
   'Portrait of Dr. Gosa Abebe Shifera', 'Clinic days — call to confirm',
   '[]', 1, 1, 3),
  (4, 'dr-biniyam-denekew-asrat', 'Dr. Biniyam Denekew Asrat', 'Consultant Obstetrician and Gynecologist',
   'Obstetrics, gynaecological care and women''s health.',
   NULL, '/assets/img/doctors/dr-biniyam-denekew-asrat.jpg',
   'Portrait of Dr. Biniyam Denekew Asrat', 'Clinic days — call to confirm',
   '[]', 1, 1, 4);

INSERT OR REPLACE INTO doctor_departments (doctor_id, department_id, is_primary) VALUES
  (1, 1, 1),
  (2, 2, 1),
  (3, 4, 1),
  (4, 3, 1);

-- Service categories ---------------------------------------------------------
INSERT OR REPLACE INTO service_categories (id, slug, name, is_active, sort_order) VALUES
  (1, 'emergency', 'Emergency', 1, 1),
  (2, 'clinical', 'Clinical', 1, 2),
  (3, 'diagnostics', 'Diagnostics', 1, 3),
  (4, 'support', 'Support', 1, 4);

-- Services -------------------------------------------------------------------
INSERT OR REPLACE INTO services
  (id, slug, name, summary, icon, tag_label, category_id, department_id,
   booking_department, cta_label, cta_type, is_emergency, is_active, sort_order)
VALUES
  (1, 'emergency', 'Emergency and Critical Care',
   'Immediate assessment, stabilisation and critical care for adults and children — day or night.',
   'i-cross', 'Emergency · 24/7', 1, NULL, NULL, 'Call the emergency line', 'call', 1, 1, 1),
  (2, 'internal-medicine', 'Internal Medicine',
   'Adult health, chronic conditions, infections and preventive care from experienced internists.',
   'i-stethoscope', 'Clinical', 2, 1, 'Internal Medicine', 'Book this service', 'appointment', 0, 1, 2),
  (3, 'family-medicine', 'Family Medicine and Screening',
   'A regular doctor for check-ups, health screening, travel advice and family health.',
   'i-user', 'Clinical', 2, NULL, 'Family Medicine', 'Book this service', 'appointment', 0, 1, 3),
  (4, 'pediatrics', 'Pediatrics and Child Health',
   'Newborn checks, childhood illness, growth monitoring, vaccinations and family support.',
   'i-child', 'Clinical', 2, 2, 'Pediatrics & Child Health', 'Book this service', 'appointment', 0, 1, 4),
  (5, 'obgyn', 'Obstetrics and Gynecology',
   'Antenatal care, safe delivery, postnatal support and gynecological care at every stage.',
   'i-users', 'Clinical', 2, 3, 'Obstetrics & Gynecology', 'Book this service', 'appointment', 0, 1, 5),
  (6, 'surgery', 'General and Laparoscopic Surgery',
   'Elective and emergency procedures, including minimally invasive surgery, in modern theatres.',
   'i-scalpel', 'Clinical', 2, 4, 'General & Laparoscopic Surgery', 'Book this service', 'appointment', 0, 1, 6),
  (7, 'orthopedics', 'Orthopedics and Trauma',
   'Fracture care, joint assessment and rehabilitation after injury or surgery.',
   'i-bone', 'Clinical', 2, NULL, 'Orthopedics & Trauma', 'Book this service', 'appointment', 0, 1, 7),
  (8, 'cardiology', 'Cardiology',
   'Heart assessment, blood pressure management, risk reduction and ongoing follow-up.',
   'i-heart', 'Clinical', 2, NULL, 'Cardiology', 'Book this service', 'appointment', 0, 1, 8),
  (9, 'neurology', 'Neurology',
   'Assessment for headache, seizure, stroke follow-up and other neurological concerns.',
   'i-brain', 'Clinical', 2, NULL, 'Neurology', 'Book this service', 'appointment', 0, 1, 9),
  (10, 'dermatology', 'Dermatology',
   'Skin, hair and nail conditions for adults and children, with practical treatment advice.',
   'i-shield', 'Clinical', 2, NULL, 'Dermatology', 'Book this service', 'appointment', 0, 1, 10),
  (11, 'ent', 'Ear, Nose and Throat (ENT)',
   'Ear, nose and throat care for adults and children, from sinus problems to hearing concerns.',
   'i-ear', 'Clinical', 2, NULL, 'ENT', 'Book this service', 'appointment', 0, 1, 11),
  (12, 'ophthalmology', 'Ophthalmology',
   'Eye checks, vision care and assessment of common eye conditions for all ages.',
   'i-eye', 'Clinical', 2, NULL, 'Ophthalmology', 'Book this service', 'appointment', 0, 1, 12),
  (13, 'urology', 'Urology',
   'Assessment and treatment for urinary concerns and men''s health, with respectful, private care.',
   'i-droplet', 'Clinical', 2, NULL, 'Urology', 'Book this service', 'appointment', 0, 1, 13),
  (14, 'dental', 'Dental Care',
   'Preventive dentistry, fillings, extractions and practical oral health advice.',
   'i-tooth', 'Clinical', 2, NULL, 'Dental Care', 'Book this service', 'appointment', 0, 1, 14),
  (15, 'radiology', 'Radiology and Imaging',
   'X-ray, ultrasound and diagnostic imaging to support your diagnosis and treatment plan.',
   'i-scan', 'Diagnostics', 3, NULL, 'Radiology & Imaging', 'Ask about a test', 'contact', 0, 1, 15),
  (16, 'laboratory', 'Laboratory Services',
   'Haematology, biochemistry, microbiology and rapid tests, with timely results for your clinician.',
   'i-lab', 'Diagnostics', 3, NULL, NULL, 'Ask about a test', 'contact', 0, 1, 16),
  (17, 'pharmacy', 'Pharmacy',
   'Prescription dispensing, medication advice and refills from pharmacists who know your plan.',
   'i-pill', 'Support', 4, NULL, NULL, 'Contact the pharmacy', 'contact', 0, 1, 17),
  (18, 'physiotherapy', 'Physiotherapy and Rehabilitation',
   'Movement, pain and recovery programmes after injury, surgery or a long illness.',
   'i-activity', 'Support', 4, NULL, 'Physiotherapy & Rehabilitation', 'Book this service', 'appointment', 0, 1, 18);

-- Blog taxonomy (no posts are seeded: nothing is published yet) -------------
INSERT OR REPLACE INTO post_categories (id, slug, name, sort_order) VALUES
  (1, 'hospital-news', 'Hospital news', 1),
  (2, 'health-advice', 'Health advice', 2),
  (3, 'services', 'Services and clinics', 3);

-- Published patient stories (quoted from the current homepage) --------------
INSERT OR REPLACE INTO testimonials
  (id, patient_name, patient_meta, quote, rating, source, source_url,
   source_review_id, is_published, is_featured, sort_order)
VALUES
  (1, 'Mahlet A.', 'Lemi Kura, Addis Ababa',
   'The nurses explained everything to my mother in Amharic. That made all the difference.',
   NULL, 'website', NULL, NULL, 1, 1, 1),
  (2, 'Yonas T.', 'Summit, Addis Ababa',
   'I came in late at night with chest pain. Someone saw me straight away and told me what was happening.',
   NULL, 'website', NULL, NULL, 1, 1, 2),
  (3, 'Sara & Dawit', 'CMC, Addis Ababa',
   'Our daughter''s first hospital visit was calm, not frightening. We knew what to expect at every step.',
   NULL, 'website', NULL, NULL, 1, 1, 3);

PRAGMA foreign_keys = ON;
