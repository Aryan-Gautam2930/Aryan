import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "hi" | "mr";
export const LANGS: { code: Lang; label: string; speech: string }[] = [
  { code: "en", label: "English", speech: "en-IN" },
  { code: "hi", label: "हिन्दी", speech: "hi-IN" },
  { code: "mr", label: "मराठी", speech: "mr-IN" },
];

const en = {
  appName: "Record System for CHW",
  tagline: "Patient visit log & follow-up reminders for community health workers",
  dashboard: "Dashboard", patients: "Patients", reminders: "Reminders", help: "Help & Language", settings: "Profile & Settings",
  searchPlaceholder: "Search patient by name…", signOut: "Sign out",
  signIn: "Sign in", signUp: "Create account", name: "Full name", email: "Email", password: "Password",
  haveAccount: "Already have an account?", noAccount: "New here?", checkEmail: "Account created. Please check your email to confirm, then sign in.",
  totalPatients: "Patient records", visitsMonth: "Visits this month", upcomingReminders: "Upcoming reminders", recentVisits: "Recent visits",
  addPatient: "Add patient", addVisit: "Add visit", editPatient: "Edit patient", save: "Save", cancel: "Cancel", edit: "Edit", delete: "Delete",
  fullName: "Patient full name", sex: "Sex", female: "Female", male: "Male", other: "Other", preferNot: "Prefer not to say",
  age: "Age (years)", dob: "Date of birth", weight: "Weight (kg)", bloodGroup: "Blood group", unknown: "Unknown",
  visitDate: "Visit date", symptoms: "Reported health issue / symptoms", advice: "Care / precautions / advice given", followUp: "Follow-up notes (optional)",
  visitHistory: "Visit history", noPatients: "No patients yet. Add your first patient record.", noVisits: "No visits recorded yet.",
  noResults: "No patients match your search.", confirmDelete: "Are you sure? This cannot be undone.", saved: "Saved", deleted: "Deleted",
  newReminder: "New reminder", title: "Title", patientOptional: "Patient (optional)", none: "None", date: "Date", time: "Time", notes: "Notes",
  upcoming: "Upcoming", past: "Past / completed", markDone: "Mark complete", markUndone: "Mark not done", overdue: "Overdue",
  noReminders: "No reminders here.", enableNotifications: "Enable browser notifications",
  notifNote: "Notifications only appear while this app is open in a browser tab. They will not arrive when the browser is closed.",
  notifUnsupported: "This browser does not support notifications. Reminders are shown inside the app.",
  notifDenied: "Notifications are blocked. You can allow them in your browser's site settings.",
  notifOn: "Notifications are on (while the app is open).", language: "Language", speak: "Speak", stop: "Stop", pause: "Pause", resume: "Resume",
  voiceMissing: "No voice for this language is installed on your device. The text is shown instead.",
  speechUnsupported: "Read-aloud is not supported in this browser.",
  disclaimer: "This app is a recordkeeping aid only. It does not diagnose and is not a substitute for clinical judgment. Refer patients to a doctor or health facility when needed.",
  voiceInput: "Voice input", listening: "Listening… tap to stop", micInfo: "Your browser will ask for microphone permission. Speech may be processed by your browser's provider.",
  loading: "Loading…", errorLoad: "Could not load data. Please try again.", retry: "Retry", viewAll: "View all", visits: "visits", lastVisit: "Last visit",
  profileSaved: "Profile updated", preferredLanguage: "Preferred language",
  helpTopics: [
    { t: "Add a patient", b: "Open Patients and tap Add patient. Fill in the name, sex and age, and the first visit details. Tap Save." },
    { t: "Find and edit records", b: "Type a name in the search bar at the top. Open the patient to see all visits. Use Edit to correct details or Add visit for a new visit." },
    { t: "Set reminders", b: "Open Reminders and tap New reminder. Choose a date and time, link a patient if needed, and save. Mark it complete after follow-up." },
    { t: "Protect patient privacy", b: "Keep your phone locked. Do not share your password. Sign out on shared devices. Only record information needed for care." },
  ],
};
type Dict = typeof en;

const hi: Dict = {
  ...en,
  appName: "CHW रिकॉर्ड सिस्टम",
  tagline: "सामुदायिक स्वास्थ्य कार्यकर्ताओं के लिए मरीज़ विज़िट लॉग और फॉलो-अप रिमाइंडर",
  dashboard: "डैशबोर्ड", patients: "मरीज़", reminders: "रिमाइंडर", help: "सहायता और भाषा", settings: "प्रोफ़ाइल और सेटिंग्स",
  searchPlaceholder: "नाम से मरीज़ खोजें…", signOut: "साइन आउट",
  signIn: "साइन इन", signUp: "खाता बनाएँ", name: "पूरा नाम", email: "ईमेल", password: "पासवर्ड",
  haveAccount: "पहले से खाता है?", noAccount: "नए हैं?", checkEmail: "खाता बन गया। कृपया ईमेल देखकर पुष्टि करें, फिर साइन इन करें।",
  totalPatients: "मरीज़ रिकॉर्ड", visitsMonth: "इस महीने की विज़िट", upcomingReminders: "आने वाले रिमाइंडर", recentVisits: "हाल की विज़िट",
  addPatient: "मरीज़ जोड़ें", addVisit: "विज़िट जोड़ें", editPatient: "मरीज़ संपादित करें", save: "सहेजें", cancel: "रद्द करें", edit: "संपादित करें", delete: "हटाएँ",
  fullName: "मरीज़ का पूरा नाम", sex: "लिंग", female: "महिला", male: "पुरुष", other: "अन्य", preferNot: "बताना नहीं चाहते",
  age: "उम्र (वर्ष)", dob: "जन्म तिथि", weight: "वज़न (किग्रा)", bloodGroup: "ब्लड ग्रुप", unknown: "पता नहीं",
  visitDate: "विज़िट की तारीख", symptoms: "बताई गई समस्या / लक्षण", advice: "दी गई देखभाल / सावधानी / सलाह", followUp: "फॉलो-अप नोट्स (वैकल्पिक)",
  visitHistory: "विज़िट इतिहास", noPatients: "अभी कोई मरीज़ नहीं। पहला रिकॉर्ड जोड़ें।", noVisits: "अभी कोई विज़िट दर्ज नहीं।",
  noResults: "खोज से कोई मरीज़ नहीं मिला।", confirmDelete: "क्या आप निश्चित हैं? इसे वापस नहीं किया जा सकता।", saved: "सहेजा गया", deleted: "हटाया गया",
  newReminder: "नया रिमाइंडर", title: "शीर्षक", patientOptional: "मरीज़ (वैकल्पिक)", none: "कोई नहीं", date: "तारीख", time: "समय", notes: "नोट्स",
  upcoming: "आने वाले", past: "पिछले / पूर्ण", markDone: "पूर्ण करें", markUndone: "अपूर्ण करें", overdue: "समय निकल गया",
  noReminders: "यहाँ कोई रिमाइंडर नहीं।", enableNotifications: "ब्राउज़र सूचनाएँ चालू करें",
  notifNote: "सूचनाएँ केवल तब दिखेंगी जब ऐप ब्राउज़र में खुला हो। ब्राउज़र बंद होने पर नहीं आएँगी।",
  notifUnsupported: "यह ब्राउज़र सूचनाएँ समर्थित नहीं करता। रिमाइंडर ऐप में दिखेंगे।",
  notifDenied: "सूचनाएँ ब्लॉक हैं। ब्राउज़र की साइट सेटिंग्स में अनुमति दें।",
  notifOn: "सूचनाएँ चालू हैं (ऐप खुला रहने तक)।", language: "भाषा", speak: "सुनें", stop: "रोकें", pause: "विराम", resume: "जारी रखें",
  voiceMissing: "आपके डिवाइस पर इस भाषा की आवाज़ इंस्टॉल नहीं है। टेक्स्ट पढ़ें।",
  speechUnsupported: "इस ब्राउज़र में पढ़कर सुनाना समर्थित नहीं है।",
  disclaimer: "यह ऐप केवल रिकॉर्ड रखने का साधन है। यह निदान नहीं करता और चिकित्सकीय निर्णय का विकल्प नहीं है। ज़रूरत हो तो मरीज़ को डॉक्टर या स्वास्थ्य केंद्र भेजें।",
  voiceInput: "आवाज़ से लिखें", listening: "सुन रहा है… रोकने के लिए टैप करें", micInfo: "ब्राउज़र माइक्रोफ़ोन की अनुमति माँगेगा।",
  loading: "लोड हो रहा है…", errorLoad: "डेटा लोड नहीं हुआ। फिर से कोशिश करें।", retry: "फिर कोशिश करें", viewAll: "सभी देखें", visits: "विज़िट", lastVisit: "अंतिम विज़िट",
  profileSaved: "प्रोफ़ाइल अपडेट हुई", preferredLanguage: "पसंदीदा भाषा",
  helpTopics: [
    { t: "मरीज़ जोड़ें", b: "मरीज़ खोलें और मरीज़ जोड़ें दबाएँ। नाम, लिंग, उम्र और पहली विज़िट की जानकारी भरें। सहेजें दबाएँ।" },
    { t: "रिकॉर्ड खोजें और बदलें", b: "ऊपर खोज में नाम लिखें। मरीज़ खोलकर सभी विज़िट देखें। सुधार के लिए संपादित करें, नई विज़िट के लिए विज़िट जोड़ें।" },
    { t: "रिमाइंडर लगाएँ", b: "रिमाइंडर खोलें और नया रिमाइंडर दबाएँ। तारीख और समय चुनें, ज़रूरत हो तो मरीज़ जोड़ें और सहेजें।" },
    { t: "मरीज़ की गोपनीयता", b: "फ़ोन लॉक रखें। पासवर्ड साझा न करें। साझा डिवाइस पर साइन आउट करें। केवल ज़रूरी जानकारी लिखें।" },
  ],
};

const mr: Dict = {
  ...en,
  appName: "CHW रेकॉर्ड प्रणाली",
  tagline: "समुदाय आरोग्य कार्यकर्त्यांसाठी रुग्ण भेट नोंद आणि पाठपुरावा स्मरणपत्रे",
  dashboard: "डॅशबोर्ड", patients: "रुग्ण", reminders: "स्मरणपत्रे", help: "मदत आणि भाषा", settings: "प्रोफाइल आणि सेटिंग्ज",
  searchPlaceholder: "नावाने रुग्ण शोधा…", signOut: "साइन आउट",
  signIn: "साइन इन", signUp: "खाते तयार करा", name: "पूर्ण नाव", email: "ईमेल", password: "पासवर्ड",
  haveAccount: "आधीच खाते आहे?", noAccount: "नवीन आहात?", checkEmail: "खाते तयार झाले. ईमेल तपासून पुष्टी करा, मग साइन इन करा.",
  totalPatients: "रुग्ण नोंदी", visitsMonth: "या महिन्यातील भेटी", upcomingReminders: "येणारी स्मरणपत्रे", recentVisits: "अलीकडील भेटी",
  addPatient: "रुग्ण जोडा", addVisit: "भेट जोडा", editPatient: "रुग्ण संपादित करा", save: "जतन करा", cancel: "रद्द करा", edit: "संपादित करा", delete: "हटवा",
  fullName: "रुग्णाचे पूर्ण नाव", sex: "लिंग", female: "स्त्री", male: "पुरुष", other: "इतर", preferNot: "सांगू इच्छित नाही",
  age: "वय (वर्षे)", dob: "जन्मतारीख", weight: "वजन (किलो)", bloodGroup: "रक्तगट", unknown: "माहित नाही",
  visitDate: "भेटीची तारीख", symptoms: "सांगितलेली समस्या / लक्षणे", advice: "दिलेली काळजी / खबरदारी / सल्ला", followUp: "पाठपुरावा नोंद (ऐच्छिक)",
  visitHistory: "भेटींचा इतिहास", noPatients: "अजून रुग्ण नाहीत. पहिली नोंद जोडा.", noVisits: "अजून भेट नोंदलेली नाही.",
  noResults: "शोधाशी जुळणारे रुग्ण नाहीत.", confirmDelete: "खात्री आहे? हे परत करता येणार नाही.", saved: "जतन झाले", deleted: "हटवले",
  newReminder: "नवीन स्मरणपत्र", title: "शीर्षक", patientOptional: "रुग्ण (ऐच्छिक)", none: "काही नाही", date: "तारीख", time: "वेळ", notes: "नोंदी",
  upcoming: "येणारी", past: "मागील / पूर्ण", markDone: "पूर्ण करा", markUndone: "अपूर्ण करा", overdue: "वेळ गेली",
  noReminders: "येथे स्मरणपत्रे नाहीत.", enableNotifications: "ब्राउझर सूचना सुरू करा",
  notifNote: "सूचना फक्त अॅप ब्राउझरमध्ये उघडे असताना दिसतील. ब्राउझर बंद असताना येणार नाहीत.",
  notifUnsupported: "हा ब्राउझर सूचना समर्थित करत नाही. स्मरणपत्रे अॅपमध्ये दिसतील.",
  notifDenied: "सूचना ब्लॉक आहेत. ब्राउझरच्या साइट सेटिंग्जमध्ये परवानगी द्या.",
  notifOn: "सूचना सुरू आहेत (अॅप उघडे असेपर्यंत).", language: "भाषा", speak: "ऐका", stop: "थांबवा", pause: "विराम", resume: "पुढे चालू",
  voiceMissing: "तुमच्या डिव्हाइसवर या भाषेचा आवाज नाही. मजकूर वाचा.",
  speechUnsupported: "या ब्राउझरमध्ये वाचून दाखवणे समर्थित नाही.",
  disclaimer: "हे अॅप फक्त नोंदी ठेवण्याचे साधन आहे. हे निदान करत नाही आणि वैद्यकीय निर्णयाचा पर्याय नाही. गरज असल्यास रुग्णाला डॉक्टर किंवा आरोग्य केंद्राकडे पाठवा.",
  voiceInput: "आवाजाने लिहा", listening: "ऐकत आहे… थांबवण्यासाठी टॅप करा", micInfo: "ब्राउझर मायक्रोफोनची परवानगी मागेल.",
  loading: "लोड होत आहे…", errorLoad: "डेटा लोड झाला नाही. पुन्हा प्रयत्न करा.", retry: "पुन्हा प्रयत्न", viewAll: "सर्व पहा", visits: "भेटी", lastVisit: "शेवटची भेट",
  profileSaved: "प्रोफाइल अद्यतनित", preferredLanguage: "आवडती भाषा",
  helpTopics: [
    { t: "रुग्ण जोडा", b: "रुग्ण उघडा आणि रुग्ण जोडा दाबा. नाव, लिंग, वय आणि पहिल्या भेटीची माहिती भरा. जतन करा दाबा." },
    { t: "नोंदी शोधा आणि बदला", b: "वरच्या शोधात नाव लिहा. रुग्ण उघडून सर्व भेटी पहा. दुरुस्तीसाठी संपादित करा, नवीन भेटीसाठी भेट जोडा." },
    { t: "स्मरणपत्रे लावा", b: "स्मरणपत्रे उघडा आणि नवीन स्मरणपत्र दाबा. तारीख आणि वेळ निवडा, हवे असल्यास रुग्ण जोडा आणि जतन करा." },
    { t: "रुग्णाची गोपनीयता", b: "फोन लॉक ठेवा. पासवर्ड कोणालाही देऊ नका. सामायिक डिव्हाइसवर साइन आउट करा. फक्त आवश्यक माहिती लिहा." },
  ],
};

const DICTS: Record<Lang, Dict> = { en, hi, mr };

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({ lang: "en", setLang: () => {}, t: en });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const s = localStorage.getItem("chw-lang");
    if (s === "en" || s === "hi" || s === "mr") setLangState(s);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("chw-lang", l);
  };
  return <Ctx.Provider value={{ lang, setLang, t: DICTS[lang] }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
export const speechLang = (l: Lang) => LANGS.find((x) => x.code === l)!.speech;