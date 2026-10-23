# सबसे पहले यह पढ़ें — Salon Website V1

यह starter pack अब **Public Salon Website + Owner Management Web App** के लिए अपडेट किया गया है। इसमें अभी actual application code नहीं है; यह documentation और planning pack है।

## V1 में क्या शामिल है?

- Public Home, Services, About, Gallery, Contact pages
- Login और controlled signup/invitation flow
- Owner-only dashboard
- बाईं ओर editing controls और दाईं ओर live preview (desktop); mobile पर stacked/tabs layout
- Structured content editing: salon details, logo/images, services, prices, durations, policies, social/contact links
- Save Draft और Publish Changes
- Enquiry management
- Basic analytics dashboard
- Rule-based FAQ chatbot
- Developer support request form

## V1 में क्या शामिल नहीं है?

Appointment booking, online payments, WhatsApp automation, AI receptionist, multi-salon SaaS, subscription billing, staff management, inventory और advanced CRM.

## शुरुआत कैसे करें

1. ZIP extract करें और `salon-website` folder को VS Code/Codex में खोलें।
2. `AGENTS.md`, `PRODUCT_VISION.md`, `PRD-V1.md`, `DESIGN.md`, और `TASKS.md` पढ़ें।
3. पहले salon की वास्तविक जानकारी और design preferences दें। जानकारी न हो तो `TODO` रखें।
4. Coding से पहले `PRD-V1.md` के Section 15 में दिए architecture/security decisions पर सहमति करें।
5. Codex से एक बार में एक milestone करवाएँ। पहले project setup और public Home page से शुरुआत करें।
6. हर feature को browser में जाँचें और tests चलाएँ। बिना verification task को `DONE` न करें।

## सुरक्षा की खास बात

Login/signup page public हो सकता है, लेकिन public signup करने वाले हर व्यक्ति को owner access नहीं मिलना चाहिए। Single-salon pilot में owner account controlled तरीके से approve/provision होना चाहिए।

## Beginner के लिए महत्वपूर्ण

यह V1 पहले वाले public-only website scope से बड़ा है, क्योंकि इसमें authentication, database, media storage और customer data management भी हैं। इन services का चयन करने से पहले उनकी current pricing, free-tier limits और deployment compatibility जाँचें। कोई provider या paid service चुपचाप न चुनें।

यह ZIP documentation pack है, तैयार website नहीं। Actual application code और live deployment अभी नहीं हैं।
