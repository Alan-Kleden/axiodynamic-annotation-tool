// i18n.js - Translations for multilingual annotation tool v5.0
// With welcome screen, resources links, and GDPR compliance

window.translations = {
    en: {
        validate_quiz: "Submit quiz",
        retry_quiz: "Retake quiz",
        // Language selector
        languageLabel: "Language",
        // >>> ADDED: quiz.* labels
        "quiz.title":"🎯 Quiz Codebook",
        "quiz.instructions":"Evaluate <strong>Fc</strong> and <strong>Fi</strong> for each mini-text.",
        "quiz.reminder":"Reminder: if the <em>telos</em> is explicitly blocked, <strong>Fi</strong> cannot be very low.",
        "quiz.qnum":"Q",
        "quiz.telos":"Telos",
        "quiz.explicit":"Explicit telos",
        "quiz.textual_indices":"Textual cues",
        "quiz.pro_action":"Pro-action (Fc)",
        "quiz.block":"Block (Fi)",
        "quiz.fc":"Fc",
        "quiz.fi":"Fi",
        "quiz.item_score":"Item score",
        "quiz.you":"You",
        "quiz.expected_relation":"Expected relation",
        "quiz.your_relation":"Your relation",
        "quiz.dev_expected":"Expected",
        "quiz.hint_separate":"Hint: separate Fc and Fi by at least",
        "quiz.hint_points":"points in the correct direction.",
        "quiz.global_score":"Global score",
        
        // Welcome Screen
        welcomeTitle: "🙏 Thank you for participating in this study!",
        welcomeIntro: "You will contribute to research in <strong>axiodynamic analysis</strong> on <strong>articles from engaged media</strong>. Your task is to evaluate <strong>12 text excerpts</strong> (original French texts) from francophone media and authors.",
        welcomeInstructions: "For each excerpt, you will need to evaluate two dimensions on a scale of 0 to 5 stars:",
        instructionsTitle: "📋 Instructions",
        explicitTelos: "Explicit telos",           // en
        textCues: "Textual cues",
        proAction: "Pro-action (Fc)",
        blockage: "Blockage (Fi)",
        fcShort: "Fc :",
        fiShort: "Fi :",
        quizCodebookTitle: "🎯 Quiz Codebook",
        quizReminder: "Reminder: if the telos is explicitly blocked, Fi should not be very low.",
        
        fcLabel: "Fc (Conative force)",
        fcQuestion: "To what extent does the text AFFIRM a will to act towards the displayed objective?",
        
        fiLabel: "Fi (Inhibitory force)",
        fiQuestion: "To what extent does the text EXPRESS reservations, obstacles, or resistance to this objective?",
        
        scaleTitle: "Rating scale (0 to 5):",
        scale0: "<strong>0</strong> = Total absence",
        scale1: "<strong>1</strong> = Very weak presence",
        scale2: "<strong>2</strong> = Weak",
        scale3: "<strong>3</strong> = Moderate",
        scale4: "<strong>4</strong> = Strong",
        scale5: "<strong>5</strong> = Very strong",
        
        mandatorySelection: "You must select a value for EACH dimension (Fc AND Fi)",
        optionalComment: "You can add an optional comment if the text seems ambiguous",
        estimatedDuration: "Estimated duration: <strong>15-20 minutes</strong>",
        
        truncationNote: "⚠️ <strong>Note:</strong> Some excerpts may contain truncated sentences (beginning or end). This should not influence your annotation - evaluate the overall content of the text.",
        
        importantNote: "⚠️ <strong>Important:</strong> There is no \"right\" or \"wrong\" answer. We are looking for your authentic subjective perception.",
        confidentialityNote: "🔒 <strong>Confidentiality:</strong> Your responses are anonymous. Only a random identifier will be recorded.",
        
        resourcesTitle: "📚 Resources for good annotation",
        guideButton: "📄 Annotation Guide (PDF)",
        videoButton: "🎥 Understanding Axiodynamics (Video)",
        
        startButton: "Start Annotation",
        continueSession: "Resume your previous session?",   // ← AJOUT       home: "Home",
        redoQuiz: "Retake quiz",

        // Annotation Screen
        progress: "Progress",
        of: "of",
        actorLabel: "Actor:",
        documentLabel: "Document:",
        telosTitle: "Institutional Objective (Telos)",
        
        fcTitle: "Fc - Conative force (will to act)",
        fcDescription: "To what extent does this text affirm a will to act towards this objective?",
        
        fiTitle: "Fi - Inhibitory force (obstacles/resistance)",
        fiDescription: "To what extent does this text express reservations or obstacles to this objective?",
        
        commentTitle: "Comment (optional)",
        commentPlaceholder: "Share your thoughts if the text seems ambiguous...",
        
        previous: "← Previous",
        next: "Next →",
        
        // Contact Screen
        completionTitle: "Annotation Complete!",
        completionMessage: "Thank you for your participation.",
        completionStats: "Annotations completed:",
        completionTime: "Total time:",
        completionMinutes: "minutes",
        
        contactTitle: "📧 Receive your participation certificate",
        contactIntro: "Please provide your email address to receive your official participation certificate in this Axiodynamics research project (OSF: https://osf.io/rm42h).",
        
        nameLabel: "Name",
        namePlaceholder: "Your full name",
        emailLabel: "Email",
        emailPlaceholder: "your.email@example.com",
        affiliationLabel: "Affiliation (optional)",
        affiliationPlaceholder: "University, company, research center, etc.",
        
        consentCertificate: "I agree to receive the participation certificate",
        consentNewsletter: "I agree to receive information about the researcher's future projects (Purpose B - Optional)",
        
        gdprNotice: "Your personal data is processed in accordance with the GDPR. You have a right of access, rectification, and deletion.",
        cguLink: "Terms of Use & Privacy Policy",
        
        submitButton: "Send and Receive Certificate",
        
        errorMissingFields: "Please fill in all required fields.",
        errorInvalidEmail: "Please enter a valid email address.",
        errorMissingConsent: "You must accept Purpose A to receive the certificate.",
        successMessage: "✅ Data saved! You will receive your certificate by email shortly.",
        
        // Footer
        projectInfo: "Research project on Axiodynamics",
        researcherInfo: "Researcher: Alan Kleden",
        
        // PDF and Video links (will be used dynamically)
        pdfLink: "docs/EN_ANNOTATION_GUIDELINES_v3.4.pdf",
        videoLink: "https://youtu.be/52zzwq6ITrg",
        cguLink: "cgu/cgu_en.html"
    },
    
    fr: {
        validate_quiz: "Valider le quiz",
        retry_quiz: "Refaire le quiz",

        // Language selector
        languageLabel: "Langue",
            // >>> AJOUT: quiz.* labels
        "quiz.title":"🎯 Codebook du Quiz",
        "quiz.instructions":"Évaluez <strong>Fc</strong> et <strong>Fi</strong> pour chaque mini-texte.",
        "quiz.reminder":"Rappel : si le <em>telos</em> est explicitement empêché, <strong>Fi</strong> ne peut être très bas.",
        "quiz.qnum":"Q",
        "quiz.telos":"Telos",
        "quiz.explicit":"Telos explicite",
        "quiz.textual_indices":"Indices textuels",
        "quiz.pro_action":"Pro-action (Fc)",
        "quiz.block":"Blocage (Fi)",
        "quiz.fc":"Fc",
        "quiz.fi":"Fi",
        "quiz.item_score":"Score item",
        "quiz.you":"Vous",
        "quiz.expected_relation":"Relation attendue",
        "quiz.your_relation":"Votre relation",
        "quiz.dev_expected":"Attendu",
        "quiz.hint_separate":"Astuce : écartez Fc et Fi d’au moins",
        "quiz.hint_points":"points dans le bon sens.",
        "quiz.global_score":"Score global",
        // Welcome Screen
        welcomeTitle: "🙏 Merci de participer à cette étude !",
        welcomeIntro: "Vous allez contribuer à une recherche en <strong>analyse axiodynamique</strong> portant sur des <strong>articles de médias engagés</strong>. Votre tâche consiste à évaluer <strong>12 extraits de textes</strong> (textes originaux en français) provenant de médias et auteurs francophones.",
        welcomeInstructions: "Pour chaque extrait, vous devrez évaluer deux dimensions sur une échelle de 0 à 5 étoiles :",
        
        instructionsTitle: "📋 Instructions",
        // AJOUT APRÈS:  instructionsTitle: "..."
        explicitTelos: "Telos explicite",          // fr
        textCues: "Indices textuels",
        proAction: "Pro-action (Fc)",
        blockage: "Blocage (Fi)",
        fcShort: "Fc :",
        fiShort: "Fi :",
        quizCodebookTitle: "🎯 Codebook du quiz",
        quizReminder: "Rappel : si le telos est explicitement empêché, Fi ne doit pas être très bas.",

        
        fcLabel: "Fc (Force conative)",
        fcQuestion: "Dans quelle mesure le texte AFFIRME-T-IL une volonté d'action vers l'objectif affiché ?",
        
        fiLabel: "Fi (Force d'opposition)",
        fiQuestion: "Dans quelle mesure le texte EXPRIME-T-IL des réserves, obstacles ou résistances face à cet objectif ?",
        
        scaleTitle: "Échelle de notation (0 à 5) :",
        scale0: "<strong>0</strong> = Absence totale",
        scale1: "<strong>1</strong> = Très faible présence",
        scale2: "<strong>2</strong> = Faible",
        scale3: "<strong>3</strong> = Modéré",
        scale4: "<strong>4</strong> = Fort",
        scale5: "<strong>5</strong> = Très fort",
        
        mandatorySelection: "Vous devez sélectionner une valeur pour CHAQUE dimension (Fc ET Fi)",
        optionalComment: "Vous pouvez ajouter un commentaire optionnel si le texte vous semble ambigu",
        estimatedDuration: "Durée estimée : <strong>15-20 minutes</strong>",
        
        truncationNote: "⚠️ <strong>Note :</strong> Certains extraits peuvent contenir des phrases tronquées (début ou fin). Cela ne doit pas influencer votre annotation - évaluez le contenu global du texte.",
        
        importantNote: "⚠️ <strong>Important :</strong> Il n'y a pas de \"bonne\" ou \"mauvaise\" réponse. Nous recherchons votre perception subjective authentique.",
        confidentialityNote: "🔒 <strong>Confidentialité :</strong> Vos réponses sont anonymes. Seul un identifiant aléatoire sera enregistré.",
        
        resourcesTitle: "📚 Ressources pour bien annoter",
        guideButton: "📄 Guide de l'annotation (PDF)",
        videoButton: "🎥 Comprendre l'Axiodynamique (Vidéo)",
        
        startButton: "Commencer l'annotation",
        continueSession: "Reprendre votre session précédente ?",   // ← AJOUT

        home: "Accueil",
        redoQuiz: "Refaire le quiz",

        
        // Annotation Screen
        progress: "Progression",
        of: "sur",
        actorLabel: "Acteur :",
        documentLabel: "Document :",
        telosTitle: "Objectif institutionnel (Telos)",
        
        fcTitle: "Fc - Force conative (volonté d'action)",
        fcDescription: "Dans quelle mesure ce texte affirme-t-il une volonté d'agir vers cet objectif ?",
        
        fiTitle: "Fi - Force inhibitrice (obstacles/résistances)",
        fiDescription: "Dans quelle mesure ce texte exprime-t-il des réserves ou obstacles face à cet objectif ?",
        
        commentTitle: "Commentaire (optionnel)",
        commentPlaceholder: "Partagez vos réflexions si le texte vous semble ambigu...",
        
        previous: "← Précédent",
        next: "Suivant →",
        
        // Contact Screen
        completionTitle: "Annotation terminée !",
        completionMessage: "Merci pour votre participation.",
        completionStats: "Annotations complétées :",
        completionTime: "Temps total :",
        completionMinutes: "minutes",
        
        contactTitle: "📧 Recevez votre certificat de participation",
        contactIntro: "Veuillez fournir votre adresse email pour recevoir votre certificat officiel de participation à ce projet de recherche en Axiodynamique (OSF : https://osf.io/rm42h).",
        
        nameLabel: "Nom",
        namePlaceholder: "Votre nom complet",
        emailLabel: "Email",
        emailPlaceholder: "votre.email@exemple.com",
        affiliationLabel: "Affiliation (optionnel)",
        affiliationPlaceholder: "Université, entreprise, centre de recherche, etc.",
        
        consentCertificate: "J'accepte de recevoir le certificat de participation",
        consentNewsletter: "J'accepte de recevoir des informations sur les projets futurs du chercheur (Finalité B - Optionnel)",
        
        gdprNotice: "Vos données personnelles sont traitées conformément au RGPD. Vous disposez d'un droit d'accès, de rectification et d'effacement.",
        cguLink: "CGU & Politique de Confidentialité",
        
        submitButton: "Envoyer et Recevoir le Certificat",
        
        errorMissingFields: "Veuillez remplir tous les champs obligatoires.",
        errorInvalidEmail: "Veuillez saisir une adresse email valide.",
        errorMissingConsent: "Vous devez accepter la Finalité A pour recevoir le certificat.",
        successMessage: "✅ Données enregistrées ! Vous recevrez votre certificat par email prochainement.",
        
        // Footer
        projectInfo: "Projet de recherche sur l'Axiodynamique",
        researcherInfo: "Chercheur : Alan Kleden",
        
        // PDF and Video links
        pdfLink: "docs/FR_ANNOTATION_GUIDELINES_v3.4.pdf",
        videoLink: "https://youtu.be/cYTx5p3hu7I",
        cguLink: "cgu/cgu_fr.html"
    },
    
    es: {
        validate_quiz: "Validar el quiz",
        retry_quiz: "Rehacer el quiz",
        // Language selector
        languageLabel: "Idioma",
        // >>> AÑADIDO: quiz.* labels
        "quiz.title":"🎯 Guía del Quiz",
        "quiz.instructions":"Evalúa <strong>Fc</strong> y <strong>Fi</strong> para cada mini-texto.",
        "quiz.reminder":"Recordatorio: si el <em>telos</em> está explícitamente bloqueado, <strong>Fi</strong> no puede ser muy bajo.",
        "quiz.qnum":"Q",
        "quiz.telos":"Telos",
        "quiz.explicit":"Telos explícito",
        "quiz.textual_indices":"Indicios textuales",
        "quiz.pro_action":"Pro-acción (Fc)",
        "quiz.block":"Bloqueo (Fi)",
        "quiz.fc":"Fc",
        "quiz.fi":"Fi",
        "quiz.item_score":"Puntuación del ítem",
        "quiz.you":"Usted",
        "quiz.expected_relation":"Relación esperada",
        "quiz.your_relation":"Su relación",
        "quiz.dev_expected":"Esperado",
        "quiz.hint_separate":"Consejo: separe Fc y Fi al menos",
        "quiz.hint_points":"puntos en la dirección correcta.",
        "quiz.global_score":"Puntuación global",
        // Welcome Screen
        welcomeTitle: "🙏 ¡Gracias por participar en este estudio!",
        welcomeIntro: "Contribuirá a la investigación en <strong>análisis axiodinámico</strong> sobre <strong>artículos de medios comprometidos</strong>. Su tarea es evaluar <strong>12 extractos de texto</strong> (textos originales en francés) provenientes de medios y autores francófonos.",
        welcomeInstructions: "Para cada extracto, deberá evaluar dos dimensiones en una escala de 0 a 5 estrellas:",
        
        instructionsTitle: "📋 Instrucciones",
        // AJOUT APRÈS:  instructionsTitle: "..."
        explicitTelos: "Telos explícito",          // es
        textCues: "Indicios textuales",
        proAction: "Pro-acción (Fc)",
        blockage: "Bloqueo (Fi)",
        fcShort: "Fc :",
        fiShort: "Fi :",
        quizCodebookTitle: "🎯 Manual del quiz",
        quizReminder: "Recordatorio: si el telos está explícitamente bloqueado, Fi no debe ser muy bajo.",

        fcLabel: "Fc (Fuerza conativa)",
        fcQuestion: "¿En qué medida el texto AFIRMA una voluntad de acción hacia el objetivo mostrado?",
        
        fiLabel: "Fi (Fuerza de oposición)",
        fiQuestion: "¿En qué medida el texto EXPRESA reservas, obstáculos o resistencias hacia este objetivo?",
        
        scaleTitle: "Escala de calificación (0 a 5):",
        scale0: "<strong>0</strong> = Ausencia total",
        scale1: "<strong>1</strong> = Presencia muy débil",
        scale2: "<strong>2</strong> = Débil",
        scale3: "<strong>3</strong> = Moderado",
        scale4: "<strong>4</strong> = Fuerte",
        scale5: "<strong>5</strong> = Muy fuerte",
        
        mandatorySelection: "Debe seleccionar un valor para CADA dimensión (Fc Y Fi)",
        optionalComment: "Puede agregar un comentario opcional si el texto le parece ambiguo",
        estimatedDuration: "Duración estimada: <strong>15-20 minutos</strong>",
        
        truncationNote: "⚠️ <strong>Nota:</strong> Algunos extractos pueden contener frases truncadas (principio o fin). Esto no debe influir en su anotación - evalúe el contenido global del texto.",
        
        importantNote: "⚠️ <strong>Importante:</strong> No hay respuesta \"correcta\" o \"incorrecta\". Buscamos su percepción subjetiva auténtica.",
        confidentialityNote: "🔒 <strong>Confidencialidad:</strong> Sus respuestas son anónimas. Solo se registrará un identificador aleatorio.",
        
        resourcesTitle: "📚 Recursos para anotar bien",
        guideButton: "📄 Guía de anotación (PDF)",
        videoButton: "🎥 Comprender la Axiodinámica (Video)",
        
        startButton: "Comenzar la anotación",
        continueSession: "¿Reanudar su sesión anterior?",   // ← AJOUT
        home: "Inicio",
        redoQuiz: "Rehacer el quiz",

        // Annotation Screen
        progress: "Progreso",
        of: "de",
        actorLabel: "Actor:",
        documentLabel: "Documento:",
        telosTitle: "Objetivo institucional (Telos)",
        
        fcTitle: "Fc - Fuerza conativa (voluntad de acción)",
        fcDescription: "¿En qué medida este texto afirma una voluntad de actuar hacia este objetivo?",
        
        fiTitle: "Fi - Fuerza inhibidora (obstáculos/resistencias)",
        fiDescription: "¿En qué medida este texto expresa reservas u obstáculos hacia este objetivo?",
        
        commentTitle: "Comentario (opcional)",
        commentPlaceholder: "Comparta sus reflexiones si el texto le parece ambiguo...",
        
        previous: "← Anterior",
        next: "Siguiente →",
        
        // Contact Screen
        completionTitle: "¡Anotación completada!",
        completionMessage: "Gracias por su participación.",
        completionStats: "Anotaciones completadas:",
        completionTime: "Tiempo total:",
        completionMinutes: "minutos",
        
        contactTitle: "📧 Reciba su certificado de participación",
        contactIntro: "Por favor proporcione su dirección de correo electrónico para recibir su certificado oficial de participación en este proyecto de investigación en Axiodinámica (OSF: https://osf.io/rm42h).",
        
        nameLabel: "Nombre",
        namePlaceholder: "Su nombre completo",
        emailLabel: "Email",
        emailPlaceholder: "su.email@ejemplo.com",
        affiliationLabel: "Afiliación (opcional)",
        affiliationPlaceholder: "Universidad, empresa, centro de investigación, etc.",
        
        consentCertificate: "Acepto recibir el certificado de participación",
        consentNewsletter: "Acepto recibir información sobre proyectos futuros del investigador (Finalidad B - Opcional)",
        
        gdprNotice: "Sus datos personales se procesan de acuerdo con el RGPD. Tiene derecho de acceso, rectificación y eliminación.",
        cguLink: "Términos de Uso y Política de Privacidad",
        
        submitButton: "Enviar y Recibir Certificado",
        
        errorMissingFields: "Por favor complete todos los campos obligatorios.",
        errorInvalidEmail: "Por favor ingrese una dirección de correo electrónico válida.",
        errorMissingConsent: "Debe aceptar la Finalidad A para recibir el certificado.",
        successMessage: "✅ ¡Datos guardados! Recibirá su certificado por correo electrónico en breve.",
        
        // Footer
        projectInfo: "Proyecto de investigación sobre Axiodinámica",
        researcherInfo: "Investigador: Alan Kleden",
        
        // PDF and Video links
        pdfLink: "docs/ES_ANNOTATION_GUIDELINES_v3.4.pdf",
        videoLink: "https://youtu.be/fyMR9K6uQgk",
        cguLink: "cgu/cgu_es.html"
    },
    
    zh: {
        validate_quiz: "提交测验",
        retry_quiz: "重做测验",
        // Language selector
        languageLabel: "语言",
        // >>> 新增: quiz.* labels
        "quiz.title":"🎯 测验指引",
        "quiz.instructions":"为每段短文本评估 <strong>Fc</strong> 与 <strong>Fi</strong>。",
        "quiz.reminder":"提示：若 <em>telos</em> 被明确阻止，<strong>Fi</strong> 不能很低。",
        "quiz.qnum":"Q",
        "quiz.telos":"Telos",
        "quiz.explicit":"显性 telos",
        "quiz.textual_indices":"文本线索",
        "quiz.pro_action":"促进行为（Fc）",
        "quiz.block":"阻断（Fi）",
        "quiz.fc":"Fc",
        "quiz.fi":"Fi",
        "quiz.item_score":"题目得分",
        "quiz.you":"你",
        "quiz.expected_relation":"期望关系",
        "quiz.your_relation":"你的关系",
        "quiz.dev_expected":"期望值",
        "quiz.hint_separate":"提示：请至少将 Fc 与 Fi 区分",
        "quiz.hint_points":"个分值，并方向正确。",
        "quiz.global_score":"总分",
        // Welcome Screen
        welcomeTitle: "🙏 感谢您参与本研究！",
        welcomeIntro: "您将参与<strong>轴动力学分析</strong>研究，材料为<strong>立场鲜明的媒体文章</strong>。您的任务是评估<strong>12段文本摘录</strong>（原始法语文本），来源于法语媒体与作者。",
        welcomeInstructions: "对于每个摘录，您需要在0到5星的范围内评估两个维度：",
        instructionsTitle: "📋 说明",
        // AJOUT APRÈS:  instructionsTitle: "..."
        explicitTelos: "明确的目的（Telos）",     // zh
        textCues: "文本线索",
        proAction: "前进意向（Fc）",
        blockage: "阻碍（Fi）",
        fcShort: "Fc ：",
        fiShort: "Fi ：",
        quizCodebookTitle: "🎯 测验手册",
        quizReminder: "提示：如果目标被明确阻碍，Fi 不应很低。",

        fcLabel: "Fc（意动力）",
        fcQuestion: "文本在多大程度上表达了朝向显示目标的行动意愿？",
        
        fiLabel: "Fi（抑制力）",
        fiQuestion: "文本在多大程度上表达了对该目标的保留、障碍或抵抗？",
        
        scaleTitle: "评分标准（0到5）：",
        scale0: "<strong>0</strong> = 完全没有",
        scale1: "<strong>1</strong> = 非常微弱",
        scale2: "<strong>2</strong> = 微弱",
        scale3: "<strong>3</strong> = 中等",
        scale4: "<strong>4</strong> = 强",
        scale5: "<strong>5</strong> = 非常强",
        
        mandatorySelection: "您必须为每个维度选择一个值（Fc和Fi）",
        optionalComment: "如果文本看起来含糊不清，您可以添加可选评论",
        estimatedDuration: "预计时长：<strong>15-20分钟</strong>",
        
        truncationNote: "⚠️ <strong>注意：</strong>一些摘录可能包含被截断的句子（开头或结尾）。这不应影响您的注释 - 评估文本的整体内容。",
        
        importantNote: "⚠️ <strong>重要提示：</strong>没有\"正确\"或\"错误\"的答案。我们寻求的是您真实的主观感知。",
        confidentialityNote: "🔒 <strong>保密性：</strong>您的回答是匿名的。只会记录一个随机标识符。",
        
        resourcesTitle: "📚 良好注释的资源",
        guideButton: "📄 注释指南（PDF）",
        videoButton: "🎥 理解轴动力学（视频）",
        
        startButton: "开始注释",
        continueSession: "继续您上一次的会话？",   // ← AJOUT
        home: "首页",
        redoQuiz: "重新进行测验",

        // Annotation Screen
        progress: "进度",
        of: "共",
        actorLabel: "行为者：",
        documentLabel: "文档：",
        telosTitle: "机构目标（Telos）",
        
        fcTitle: "Fc - 意动力（行动意愿）",
        fcDescription: "这段文本在多大程度上表达了朝向该目标行动的意愿？",
        
        fiTitle: "Fi - 抑制力（障碍/抵抗）",
        fiDescription: "这段文本在多大程度上表达了对该目标的保留或障碍？",
        
        commentTitle: "评论（可选）",
        commentPlaceholder: "如果文本看起来含糊不清，请分享您的想法...",
        
        previous: "← 上一个",
        next: "下一个 →",
        
        // Contact Screen
        completionTitle: "注释完成！",
        completionMessage: "感谢您的参与。",
        completionStats: "完成的注释：",
        completionTime: "总时间：",
        completionMinutes: "分钟",
        
        contactTitle: "📧 接收您的参与证书",
        contactIntro: "请提供您的电子邮件地址以接收您在本轴动力学研究项目中的官方参与证书（OSF：https://osf.io/rm42h）。",
        
        nameLabel: "姓名",
        namePlaceholder: "您的全名",
        emailLabel: "电子邮件",
        emailPlaceholder: "your.email@example.com",
        affiliationLabel: "所属机构（可选）",
        affiliationPlaceholder: "大学、公司、研究中心等",
        
        consentCertificate: "我同意接收参与证书",
        consentNewsletter: "我同意接收有关研究人员未来项目的信息（目的B - 可选）",
        
        gdprNotice: "您的个人数据按照GDPR进行处理。您拥有访问、更正和删除的权利。",
        cguLink: "使用条款和隐私政策",
        
        submitButton: "发送并接收证书",
        
        errorMissingFields: "请填写所有必填字段。",
        errorInvalidEmail: "请输入有效的电子邮件地址。",
        errorMissingConsent: "您必须接受目的A才能接收证书。",
        successMessage: "✅ 数据已保存！您将很快通过电子邮件收到证书。",
        
        // Footer
        projectInfo: "轴动力学研究项目",
        researcherInfo: "研究员：Alan Kleden",
        
        // PDF and Video links
        pdfLink: "docs/ZH_ANNOTATION_GUIDELINES_v3.4.pdf",
        videoLink: "https://youtu.be/pBfO-YWitJg",
        cguLink: "cgu/cgu_zh.html"
    }
};

// Helper function to get translation
function t(key) {
    // Try to get language from multiple sources
    const lang = window.currentLanguage || document.getElementById('language-select')?.value || 'en';
    return window.translations[lang]?.[key] || window.translations['en']?.[key] || key;
}

// Helper function to update all translatable elements
function updateTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);
        
        if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
            element.placeholder = translation;
        } else {
            element.innerHTML = translation;
        }
    });
}
