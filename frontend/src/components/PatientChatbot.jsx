import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Globe,
  ChevronDown,
  Loader2,
  Sparkles,
  Phone,
  MapPin,
  Calendar,
  Heart
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// MULTILINGUAL KNOWLEDGE BASE — No external API needed
// ─────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

const GREETINGS = {
  en: "Hello! 👋 I'm MedBot, your AI health assistant. How can I help you today?",
  hi: "नमस्ते! 👋 मैं MedBot हूँ, आपका AI स्वास्थ्य सहायक। आज मैं आपकी कैसे मदद कर सकता हूँ?",
  mr: "नमस्कार! 👋 मी MedBot आहे, तुमचा AI आरोग्य सहाय्यक. आज मी तुम्हाला कशी मदत करू शकतो?",
  es: "¡Hola! 👋 Soy MedBot, tu asistente de salud con IA. ¿Cómo puedo ayudarte hoy?",
  fr: "Bonjour! 👋 Je suis MedBot, votre assistant santé IA. Comment puis-je vous aider aujourd'hui?",
  ar: "مرحباً! 👋 أنا MedBot، مساعدك الصحي بالذكاء الاصطناعي. كيف يمكنني مساعدتك اليوم؟",
  zh: "你好！👋 我是MedBot，您的AI健康助手。今天我能为您做什么？",
};

const QUICK_ACTIONS = {
  en: ['📅 Book Appointment', '🚨 Emergency Info', '🏥 Departments', '💰 Fee Info', '📞 Contact Us'],
  hi: ['📅 अपॉइंटमेंट बुक करें', '🚨 आपातकाल जानकारी', '🏥 विभाग', '💰 शुल्क जानकारी', '📞 संपर्क करें'],
  mr: ['📅 अपॉइंटमेंट बुक करा', '🚨 आपत्काल माहिती', '🏥 विभाग', '💰 शुल्क माहिती', '📞 संपर्क करा'],
  es: ['📅 Reservar Cita', '🚨 Info de Emergencia', '🏥 Departamentos', '💰 Info de Tarifas', '📞 Contáctenos'],
  fr: ['📅 Prendre Rendez-vous', '🚨 Urgences', '🏥 Départements', '💰 Tarifs', '📞 Nous Contacter'],
  ar: ['📅 حجز موعد', '🚨 معلومات الطوارئ', '🏥 الأقسام', '💰 الرسوم', '📞 اتصل بنا'],
  zh: ['📅 预约挂号', '🚨 急诊信息', '🏥 科室介绍', '💰 费用说明', '📞 联系我们'],
};

const RESPONSES = {
  en: {
    appointment: "To book an appointment:\n• Log in and go to **Appointments** section\n• Choose your preferred doctor and time slot\n• You'll receive an SMS confirmation\n\nOr call us at 📞 +1-800-MEDOS-01",
    emergency: "🚨 **Emergency Services**\nEmergency Helpline: **108 / 911**\nOur 24/7 Emergency Ward is on the **Ground Floor, Block A**.\n\nFor immediate ambulance: Call **102**\nPoison Control: **1-800-222-1222**",
    departments: "🏥 **Our Departments:**\n• Cardiology · Neurology · Oncology\n• Orthopedics · Pediatrics · Gynecology\n• Radiology · General Surgery · Urology\n• Dermatology · Psychiatry · ENT\n\nAll departments are open Mon-Sat, 8 AM – 6 PM",
    fee: "💰 **Fee Structure:**\n• General Consultation: $150\n• Specialist Consultation: $200–$350\n• Emergency Visit: $500+\n• ICU (per day): $1,200\n• Lab tests: Varies by panel\n\nInsurance & payment plans available.",
    contact: "📞 **Contact MedOS Hospital:**\n• Main: +1-800-MEDOS-01\n• Emergency: 108 / 911\n• Email: care@medoshospital.com\n• Address: 42 Clinical Ave, Medical District\n\nWorking Hours: 24/7 (Emergency), Mon-Sat 8AM-8PM (OPD)",
    default: "I'm here to help! You can ask me about:\n• Booking appointments\n• Emergency contacts\n• Hospital departments\n• Fee information\n• Hospital location\n\nOr type your question and I'll do my best to assist! 😊",
  },
  hi: {
    appointment: "अपॉइंटमेंट बुक करने के लिए:\n• लॉगिन करें और **अपॉइंटमेंट** सेक्शन में जाएं\n• अपना पसंदीदा डॉक्टर और समय चुनें\n• SMS पुष्टिकरण मिलेगा\n\nया हमें कॉल करें: 📞 +1-800-MEDOS-01",
    emergency: "🚨 **आपातकालीन सेवाएं**\nआपातकालीन हेल्पलाइन: **108 / 911**\nहमारा 24/7 आपातकालीन वार्ड **ग्राउंड फ्लोर, ब्लॉक A** में है।\n\nएम्बुलेंस के लिए: **102** कॉल करें",
    departments: "🏥 **हमारे विभाग:**\n• हृदयरोग · न्यूरोलॉजी · ऑन्कोलॉजी\n• हड्डी रोग · बाल रोग · स्त्री रोग\n• रेडियोलॉजी · सामान्य शल्य · त्वचा रोग\n\nसभी विभाग सोम-शनि, सुबह 8 – शाम 6 बजे खुले हैं",
    fee: "💰 **शुल्क संरचना:**\n• सामान्य परामर्श: ₹1,200\n• विशेषज्ञ परामर्श: ₹1,500–₹3,000\n• आपातकालीन: ₹4,500+\n• ICU (प्रति दिन): ₹8,000\n\nबीमा और किस्त भुगतान उपलब्ध है।",
    contact: "📞 **MedOS अस्पताल से संपर्क:**\n• मुख्य: +1-800-MEDOS-01\n• आपातकाल: 108 / 911\n• ईमेल: care@medoshospital.com\n• पता: 42 क्लिनिकल एवेन्यू, मेडिकल डिस्ट्रिक्ट",
    default: "मैं आपकी मदद के लिए यहाँ हूँ! आप मुझसे पूछ सकते हैं:\n• अपॉइंटमेंट बुकिंग\n• आपातकालीन संपर्क\n• अस्पताल विभाग\n• शुल्क जानकारी\n\nअपना प्रश्न टाइप करें! 😊",
  },
  mr: {
    appointment: "अपॉइंटमेंट बुक करण्यासाठी:\n• लॉगिन करा आणि **अपॉइंटमेंट** विभागात जा\n• तुमचा आवडता डॉक्टर आणि वेळ निवडा\n• SMS पुष्टीकरण मिळेल\n\nकिंवा आम्हाला कॉल करा: 📞 +1-800-MEDOS-01",
    emergency: "🚨 **आपत्कालीन सेवा**\nआपत्कालीन हेल्पलाइन: **108 / 911**\nआमचा 24/7 आपत्कालीन वार्ड **ग्राउंड फ्लोर, ब्लॉक A** येथे आहे.",
    departments: "🏥 **आमचे विभाग:**\n• हृदयरोग · न्यूरोलॉजी · ऑन्कोलॉजी\n• हाडांचे आजार · बालरोग · स्त्रीरोग\n• रेडियोलॉजी · सामान्य शस्त्रक्रिया\n\nसोम-शनि, सकाळी 8 – संध्याकाळी 6 वाजता",
    fee: "💰 **शुल्क माहिती:**\n• सामान्य सल्लामसलत: ₹1,200\n• तज्ञ सल्लामसलत: ₹1,500–₹3,000\n• ICU (दररोज): ₹8,000\n\nविमा आणि हप्ता पर्याय उपलब्ध.",
    contact: "📞 **संपर्क:**\n• मुख्य: +1-800-MEDOS-01\n• आपत्काल: 108 / 911\n• ईमेल: care@medoshospital.com",
    default: "मी तुमच्या मदतीसाठी येथे आहे! तुम्ही विचारू शकता:\n• अपॉइंटमेंट बुकिंग\n• आपत्कालीन संपर्क\n• विभाग माहिती\n\nतुमचा प्रश्न टाइप करा! 😊",
  },
  es: {
    appointment: "Para reservar una cita:\n• Inicia sesión y ve a la sección **Citas**\n• Elige tu médico y horario preferido\n• Recibirás confirmación por SMS\n\nO llámanos: 📞 +1-800-MEDOS-01",
    emergency: "🚨 **Servicios de Emergencia**\nLínea de emergencia: **112 / 911**\nNuestro servicio de urgencias 24/7 está en **Planta Baja, Bloque A**.",
    departments: "🏥 **Nuestros Departamentos:**\n• Cardiología · Neurología · Oncología\n• Ortopedia · Pediatría · Ginecología\n• Radiología · Cirugía General\n\nAbierto Lun-Sáb, 8:00–18:00",
    fee: "💰 **Tarifas:**\n• Consulta general: $150\n• Especialista: $200–$350\n• Urgencias: $500+\n• UCI (por día): $1,200\n\nSeguros y planes de pago disponibles.",
    contact: "📞 **Contacto:**\n• Principal: +1-800-MEDOS-01\n• Emergencia: 112 / 911\n• Email: care@medoshospital.com",
    default: "¡Estoy aquí para ayudarte! Puedes preguntarme sobre:\n• Reserva de citas\n• Contactos de emergencia\n• Departamentos\n• Información de tarifas\n\n¡Escribe tu pregunta! 😊",
  },
  fr: {
    appointment: "Pour prendre rendez-vous:\n• Connectez-vous et allez dans **Rendez-vous**\n• Choisissez votre médecin et créneau\n• Vous recevrez une confirmation SMS\n\nOu appelez-nous: 📞 +1-800-MEDOS-01",
    emergency: "🚨 **Services d'Urgence**\nNuméro d'urgence: **15 / 112**\nNotre urgence 24h/24 est au **Rez-de-chaussée, Bâtiment A**.",
    departments: "🏥 **Nos Départements:**\n• Cardiologie · Neurologie · Oncologie\n• Orthopédie · Pédiatrie · Gynécologie\n• Radiologie · Chirurgie Générale\n\nOuvert Lun-Sam, 8h00–18h00",
    fee: "💰 **Tarifs:**\n• Consultation générale: 150€\n• Spécialiste: 200–350€\n• Urgences: 500€+\n\nAssurances et plans de paiement disponibles.",
    contact: "📞 **Contact:**\n• Principal: +1-800-MEDOS-01\n• Urgence: 15 / 112\n• Email: care@medoshospital.com",
    default: "Je suis là pour vous aider! Vous pouvez me demander:\n• Prise de rendez-vous\n• Contacts d'urgence\n• Départements\n• Informations tarifaires\n\nPosez votre question! 😊",
  },
  ar: {
    appointment: "لحجز موعد:\n• سجل الدخول واذهب إلى قسم **المواعيد**\n• اختر طبيبك ووقتك المفضل\n• ستصلك رسالة تأكيد\n\nأو اتصل بنا: 📞 +1-800-MEDOS-01",
    emergency: "🚨 **خدمات الطوارئ**\nخط الطوارئ: **911 / 120**\nقسم الطوارئ 24/7 في **الطابق الأرضي، المبنى A**.",
    departments: "🏥 **أقسامنا:**\n• أمراض القلب · طب الأعصاب · الأورام\n• العظام · طب الأطفال · أمراض النساء\n• الأشعة · الجراحة العامة\n\nمفتوح الاثنين-السبت، 8 صباحاً – 6 مساءً",
    fee: "💰 **رسوم الخدمات:**\n• استشارة عامة: 150$\n• أخصائي: 200–350$\n• طوارئ: 500$+\n\nالتأمين وخطط الدفع متاحة.",
    contact: "📞 **التواصل:**\n• الرئيسي: +1-800-MEDOS-01\n• طوارئ: 911\n• البريد: care@medoshospital.com",
    default: "أنا هنا لمساعدتك! يمكنك السؤال عن:\n• حجز المواعيد\n• جهات الطوارئ\n• الأقسام الطبية\n• معلومات الرسوم\n\nاكتب سؤالك! 😊",
  },
  zh: {
    appointment: "预约挂号：\n• 登录系统，进入**预约**模块\n• 选择您的医生和时间段\n• 您将收到短信确认\n\n或致电：📞 +1-800-MEDOS-01",
    emergency: "🚨 **急诊服务**\n急救热线：**120 / 911**\n我们的24小时急诊室位于**一楼，A栋**。",
    departments: "🏥 **我们的科室：**\n• 心内科 · 神经科 · 肿瘤科\n• 骨科 · 儿科 · 妇产科\n• 放射科 · 普外科 · 皮肤科\n\n周一至周六，上午8点至下午6点",
    fee: "💰 **收费标准：**\n• 普通门诊：¥150\n• 专科门诊：¥200–350\n• 急诊：¥500起\n• ICU（每天）：¥1,200\n\n支持医保和分期付款。",
    contact: "📞 **联系我们：**\n• 主线：+1-800-MEDOS-01\n• 急救：120 / 911\n• 邮箱：care@medoshospital.com",
    default: "我在这里为您服务！您可以询问：\n• 预约挂号\n• 急救联系\n• 科室介绍\n• 收费说明\n\n请输入您的问题！😊",
  },
};

// ─────────────────────────────────────────────────────────────
// SMART INTENT DETECTION
// ─────────────────────────────────────────────────────────────
const detectIntent = (text) => {
  const t = text.toLowerCase();
  if (/appoint|book|schedule|予約|موعد|rendez|cita|अपॉइंटमेंट|appointment/.test(t)) return 'appointment';
  if (/emergency|urgent|ambulance|911|108|120|طوارئ|urgence|emergencia|आपातकाल|आपत्काल/.test(t)) return 'emergency';
  if (/depart|ward|wing|section|specialty|科室|قسم|département|विभाग/.test(t)) return 'departments';
  if (/fee|cost|charge|price|bill|pay|insurance|शुल्क|رسوم|tarif|料金|费用|precio/.test(t)) return 'fee';
  if (/contact|phone|address|location|email|call|where|direction|पता|عنوان|adresse|联系|ubicación/.test(t)) return 'contact';
  return 'default';
};

// Quick action to intent mapping
const mapQuickAction = (action) => {
  if (action.includes('Appointment') || action.includes('अपॉइंटमेंट') || action.includes('Cita') || action.includes('Rendez') || action.includes('موعد') || action.includes('预约')) return 'appointment';
  if (action.includes('Emergency') || action.includes('आपातकाल') || action.includes('आपत्काल') || action.includes('Urgence') || action.includes('Emergencia') || action.includes('طوارئ') || action.includes('急诊')) return 'emergency';
  if (action.includes('Department') || action.includes('विभाग') || action.includes('Département') || action.includes('Departamento') || action.includes('الأقسام') || action.includes('科室')) return 'departments';
  if (action.includes('Fee') || action.includes('शुल्क') || action.includes('Tarif') || action.includes('Tarifa') || action.includes('الرسوم') || action.includes('费用')) return 'fee';
  if (action.includes('Contact') || action.includes('संपर्क') || action.includes('Contacter') || action.includes('Contactenos') || action.includes('اتصل') || action.includes('联系')) return 'contact';
  return 'default';
};

// ─────────────────────────────────────────────────────────────
// CHATBOT COMPONENT
// ─────────────────────────────────────────────────────────────
export default function PatientChatbot() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const [langOpen, setLangOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize greeting when opened or language changed
  useEffect(() => {
    if (open) {
      setMessages([
        {
          id: 1,
          sender: 'bot',
          text: GREETINGS[lang],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setShowQuickActions(true);
    }
  }, [open, lang]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendMessage = (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowQuickActions(false);
    setTyping(true);

    // Simulate AI "thinking" time
    const thinkTime = 800 + Math.random() * 700;
    setTimeout(() => {
      const intent = detectIntent(text);
      const responseText = RESPONSES[lang]?.[intent] || RESPONSES['en'][intent] || RESPONSES['en']['default'];

      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, thinkTime);
  };

  const handleQuickAction = (action) => {
    sendMessage(action);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const currentLang = LANGUAGES.find(l => l.code === lang);

  return (
    <>
      {/* ── Floating Chat Button ── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`
          fixed bottom-6 right-6 z-[999] 
          w-14 h-14 rounded-full shadow-2xl
          flex items-center justify-center
          transition-all duration-300 active:scale-95
          ${open
            ? 'bg-slate-800 border border-slate-700 rotate-0'
            : 'bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-110'
          }
        `}
        aria-label="Toggle patient assistant"
      >
        {open
          ? <X className="w-6 h-6 text-white" />
          : <MessageCircle className="w-6 h-6 text-white" />
        }
        {/* Notification pulse when closed */}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* ── Chat Panel ── */}
      {open && (
        <div
          className="
            fixed bottom-24 right-6 z-[998]
            w-[360px] max-h-[580px]
            bg-white dark:bg-slate-900
            border border-slate-200 dark:border-slate-700
            rounded-3xl shadow-2xl shadow-slate-900/20
            flex flex-col overflow-hidden
            animate-in slide-in-from-bottom-4 fade-in duration-300
          "
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white leading-none">MedBot Assistant</h3>
                <span className="text-[10px] text-blue-100 font-medium mt-0.5 block flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block"></span>
                  Online · AI Powered
                </span>
              </div>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(prev => !prev)}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl transition"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{currentLang?.flag} {currentLang?.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-10 w-40 animate-in fade-in slide-in-from-top-2 duration-150">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-xs font-bold flex items-center gap-2 transition hover:bg-slate-50 dark:hover:bg-slate-700 ${
                        lang === l.code ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span className="text-base">{l.flag}</span>
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={`flex flex-col gap-0.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[82%]`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 px-1">{msg.time}</span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                    <Heart className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start items-end gap-2">
                <div className="w-7 h-7 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick action buttons */}
            {showQuickActions && !typing && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] text-slate-400 font-semibold px-1">Quick help:</p>
                <div className="flex flex-wrap gap-1.5">
                  {(QUICK_ACTIONS[lang] || QUICK_ACTIONS['en']).map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action)}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-300 text-slate-700 dark:text-slate-200 text-[10px] font-semibold px-3 py-1.5 rounded-xl transition active:scale-95"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 dark:border-slate-700 px-3 py-3 bg-white dark:bg-slate-900 shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={lang === 'hi' ? 'अपना प्रश्न यहाँ लिखें...' : lang === 'ar' ? 'اكتب سؤالك هنا...' : lang === 'zh' ? '请输入您的问题...' : 'Type your question...'}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-2xl flex items-center justify-center transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 shrink-0"
              >
                {typing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </form>
            <p className="text-[9px] text-slate-400 text-center mt-1.5 font-medium">
              AI assistant · For emergencies call 108 / 911
            </p>
          </div>

        </div>
      )}
    </>
  );
}
