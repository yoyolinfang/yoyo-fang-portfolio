const zh={
navExp:"经历",navResearch:"研究",navAbout:"关于",navContact:"联系",heroEye:"人工智能 · 市场 · 组织",
heroTitle:"研究 AI 如何重塑<em>市场、组织</em>与商业决策。",heroLead:"我结合经济学思维、行业研究与数据分析，将新兴技术转化为可落地的洞察。",
available:"关注战略、研究与数据分析机会",conversation:"与我联系",explore:"查看我的研究",currently:"正在进行",currentRole:"AI 与组织管理研究",currentOrg:"字节跳动 · 管理研究院",focus:"研究主线",focusText:"AI 应用、组织变革与新兴科技市场。",
expEye:"职业经历",expTitle:"跨越组织与市场的研究经历。",date1:"2026年7月 — 至今",company1:"字节跳动",role1:"AI 与组织管理研究实习生",place1:"中国北京",body1:"综合行业报告、专家访谈与公开数据，研究 AI 如何重塑组织管理；分析岗位架构、管理流程与跨职能协作，为 AI 驱动的组织与人力系统设计提供研究支持。",tag11:"组织研究",tag12:"AI 应用",tag13:"定性研究",
date2:"2025年7月 — 2026年7月",company2:"国泰海通证券",role2:"消费电子行业研究实习生",place2:"北京 / 线上",body2:"结合财务报表、行业数据与产业组织框架，研究小米及其他消费电子公司；搭建 AI 智能眼镜市场规模测算模型，并围绕系统架构、BOM 成本、功耗及产品量产能力开展硬件研究。",tag21:"证券研究",tag22:"市场测算",tag23:"技术分析",
date3:"2024年11月 — 2025年7月",company3:"海通证券",role3:"家电行业研究实习生",place3:"北京 / 线上",body3:"撰写覆盖十余家家电公司的行业研究报告，结合宏观指标、公司财务、原材料成本与回归分析研究盈利驱动因素；评估贸易及补贴政策对公司经营与盈利表现的潜在影响。",tag31:"行业研究",tag32:"财务分析",tag33:"政策分析",
date4:"2024年10月 — 2025年1月",company4:"Prozparity Energy",role4:"市场营销实习生",place4:"香港 / 线上",body4:"负责 Instagram、LinkedIn 与 Facebook 数字营销活动，并根据互动数据优化内容策略；运用 SEO/SEM、关键词研究与 Google Analytics，提升跨境电商的自然流量及转化表现。",tag41:"数字营销",tag42:"SEO / SEM",tag43:"消费者分析",
researchEye:"精选研究",researchTitle:"那些让我继续追问的问题。",p1label:"消费者分析 · 2026",p1title:"AI 智能眼镜的满意度究竟由什么驱动？",p1body:"使用 Python 与 VADER 搭建功能级情感分析流程，并检验电池、相机、音频和智能功能与用户评分之间的关系。",p1foot:"300+ 条评论 · 句子级 NLP · 回归分析",
p2label:"独立研究 · FESS 2025",p2title:"企业采用 AI，会先带来增长还是利润？",p2body:"研究 EssilorLuxottica 的 AI 产品扩张，将收入增长、研发投入与运营成本纳入技术颠覆分析框架。",p2foot:"独立作者 · 论文获会议录用",
p3label:"健康经济学 · 2026",p3title:"政策能消除激励，还是只会转移激励？",p3body:"以医生诱导需求和激励相容为框架，研究中国药品零加成政策是否导致支出从药品转向其他医疗服务。",p3foot:"政策分析 · 因果证据整合",
aboutEye:"关于我",aboutTitle:"用经济学视角，拆解现实世界里的复杂问题。",aboutBody:"我是早稻田大学全球政治经济学专业学生。我的工作位于经济学思维和应用研究的交叉点：从宽泛、模糊的问题出发，找到合适的数据与框架，再把分析变成真正可以用于决策的答案。",school:"早稻田大学",degree:"全球政治经济学学士 · 2023–2027",languagesLabel:"工作语言",toolkit:"研究工具",econometrics:"计量经济学",marketResearch:"市场研究",visualization:"数据可视化",financial:"财务分析",languages:"中文 · 母语 / 英文 · 流利 / 日语 · 日常交流",contactEye:"保持联系",contactTitle:"有一个值得研究的问题？",contactBody:"我很乐意讨论 AI、战略、市场，以及组织如何做出决策。",footer:"由好奇心、证据与清晰思考驱动。"
};
const originals=new Map();
document.querySelectorAll("[data-t],[data-t-html]").forEach(el=>originals.set(el.dataset.t||el.dataset.tHtml,el.dataset.tHtml?el.innerHTML:el.textContent));
function setLang(lang){
  document.documentElement.lang=lang==="zh"?"zh-CN":"en";
  document.querySelectorAll("[data-t]").forEach(el=>{const k=el.dataset.t;el.textContent=lang==="zh"&&zh[k]?zh[k]:originals.get(k)});
  document.querySelectorAll("[data-t-html]").forEach(el=>{const k=el.dataset.tHtml;el.innerHTML=lang==="zh"&&zh[k]?zh[k]:originals.get(k)});
  document.querySelectorAll("[data-lang]").forEach(b=>b.classList.toggle("active",b.dataset.lang===lang));
  localStorage.setItem("portfolio-language",lang);
}
document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>setLang(b.dataset.lang)));
setLang(localStorage.getItem("portfolio-language")==="zh"?"zh":"en");
