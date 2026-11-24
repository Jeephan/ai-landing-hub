// ============================================================
// 种子数据与分类体系（演示数据；用户提交内容存于 localStorage）
// ============================================================

export const TAXONOMY = {
  clientTypes: ["企业", "个人", "工厂", "机构/团队"],
  devTypes: ["个人开发者", "独立工作室", "专业企业团队"],
  industries: [
    "制造业", "零售电商", "金融", "医疗健康", "教育", "物流供应链",
    "餐饮消费", "文化传媒", "法律政务", "农业", "其他"
  ],
  skills: [
    "大模型应用 / RAG", "AI 智能客服", "数据看板 / BI", "计算机视觉",
    "语音识别 / 合成", "自动化工作流", "AI 知识库", "推荐系统",
    "OCR 文档处理", "数字人 / 内容生成", "Agent 智能体", "预测分析"
  ],
  budgetBands: [
    { key: "lt1", label: "1 万以内", min: 0, max: 10000 },
    { key: "1-5", label: "1 – 5 万", min: 10000, max: 50000 },
    { key: "5-20", label: "5 – 20 万", min: 50000, max: 200000 },
    { key: "gt20", label: "20 万以上", min: 200000, max: Infinity }
  ],
  statuses: [
    { key: "open", label: "招标中" },
    { key: "matched", label: "已匹配" },
    { key: "closed", label: "已截止" }
  ]
};

export const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#06b6d4,#3b82f6)",
  "linear-gradient(135deg,#f59e0b,#ec4899)",
  "linear-gradient(135deg,#10b981,#06b6d4)",
  "linear-gradient(135deg,#8b5cf6,#ec4899)",
  "linear-gradient(135deg,#3b82f6,#10b981)",
  "linear-gradient(135deg,#ef4444,#f59e0b)",
  "linear-gradient(135deg,#14b8a6,#6366f1)"
];

export const SEED_PROJECTS = [
  {
    id: "p-001",
    title: "注塑工厂质检环节 AI 视觉缺陷检测系统",
    clientType: "工厂",
    industry: "制造业",
    location: "广东 · 东莞",
    band: "5-20",
    budgetMin: 80000,
    budgetMax: 150000,
    duration: "4 – 8 周",
    skills: ["计算机视觉", "OCR 文档处理", "自动化工作流"],
    description:
      "我们是一家中型注塑加工厂，日产塑料配件约 12 万件，目前依赖人工目检外观缺陷（划痕、缺胶、色差、飞边），漏检率与人力成本都偏高。希望落地一套 AI 视觉质检方案：相机工位采集图像 → 模型自动分类缺陷类型并标注位置 → 对接产线分拣信号。\n\n期望支持少量样本冷启动（先收集 500–1000 张缺陷图迭代），可在车间边缘设备或工控机部署；需要提供模型评估指标（召回率/误杀率）与后续每周迭代的维护方案。有制造业视觉落地经验的团队优先。",
    createdAt: "2026-11-20T09:20:00+08:00",
    deadline: "2026-12-15",
    status: "open",
    ownerName: "质检部 · 王先生",
    contact: "投标意向提交后，平台将通过站内方式对接微信",
    views: 128
  },
  {
    id: "p-002",
    title: "服装电商智能客服 + 商品推荐对话机器人",
    clientType: "企业",
    industry: "零售电商",
    location: "浙江 · 杭州",
    band: "1-5",
    budgetMin: 15000,
    budgetMax: 40000,
    duration: "2 – 4 周",
    skills: ["大模型应用 / RAG", "AI 智能客服", "推荐系统"],
    description:
      "女装电商品牌，日均咨询量 2000+，客服高峰期响应慢。希望上线一个智能客服机器人：基于商品库与退换货政策做 RAG 问答，支持尺码推荐、穿搭建议、活动规则解释；无法解决的问题自动转人工并带出对话摘要。\n\n需要对接现有客服工作台（网页端），预留后续接入直播间话术库的扩展能力。要求对话可溯源到知识条目，避免编造政策。",
    createdAt: "2026-11-21T14:05:00+08:00",
    deadline: "2026-12-10",
    status: "open",
    ownerName: "运营部 · 李女士",
    contact: "投标意向提交后，平台将通过站内方式对接微信",
    views: 96
  },
  {
    id: "p-003",
    title: "个人知识管理 AI 知识库助手（对接私人笔记）",
    clientType: "个人",
    industry: "教育",
    location: "远程",
    band: "lt1",
    budgetMin: 3000,
    budgetMax: 8000,
    duration: "1 – 2 周",
    skills: ["大模型应用 / RAG", "AI 知识库"],
    description:
      "个人创作者，积累了多年 Markdown 笔记与 PDF 资料，希望做一个本地优先的 AI 知识库助手：导入文件夹后自动切片向量化，支持自然语言提问，并给出原文出处引用；支持双链卡片与定期整理建议。\n\n倾向轻量化 Web 应用，数据留在本地或私有空间即可，不需要复杂账号体系。有独立开发者作品可参考。",
    createdAt: "2026-11-22T10:40:00+08:00",
    deadline: "2026-12-05",
    status: "open",
    ownerName: "陈先生",
    contact: "投标意向提交后，平台将通过站内方式对接邮箱",
    views: 74
  },
  {
    id: "p-004",
    title: "仓储物流单据 OCR 与自动录入流水线",
    clientType: "工厂",
    industry: "物流供应链",
    location: "江苏 · 苏州",
    band: "5-20",
    budgetMin: 60000,
    budgetMax: 120000,
    duration: "4 – 6 周",
    skills: ["OCR 文档处理", "自动化工作流", "Agent 智能体"],
    description:
      "仓库每天接收纸质送货单、装箱单、快递面单约 3000 份，文员手工录入 ERP 耗时长且易错。希望搭建 OCR 自动录入流水线：拍照/扫描 → 识别关键字段（单号、品名、数量、批次、收发货方）→ 校验字段并回填 ERP，异常单据进入人工复核队列。\n\n需要支持多版式模板迭代，字段置信度低时自动转人工；提供与现有 ERP 的接口对接说明。",
    createdAt: "2026-11-19T16:30:00+08:00",
    deadline: "2026-12-12",
    status: "open",
    ownerName: "仓储部 · 赵经理",
    contact: "投标意向提交后，平台将通过站内方式对接微信",
    views: 112
  },
  {
    id: "p-005",
    title: "诊所随访语音外呼与语音转写系统",
    clientType: "企业",
    industry: "医疗健康",
    location: "广东 · 广州",
    band: "gt20",
    budgetMin: 220000,
    budgetMax: 350000,
    duration: "8 – 12 周",
    skills: ["语音识别 / 合成", "Agent 智能体", "自动化工作流"],
    description:
      "连锁口腔诊所需要术后随访与复查提醒系统：按诊疗记录自动外呼，语音合成播报随访问题，识别患者回答并结构化记录到病历；异常反馈（疼痛、肿胀等）自动标记并通知主治医生。\n\n要求语音自然度高、支持方言词库定制；通话全程转写留痕，符合医疗数据合规要求。需要与诊所 HIS 系统打通，提供灰度上线方案。",
    createdAt: "2026-11-18T11:15:00+08:00",
    deadline: "2026-12-20",
    status: "open",
    ownerName: "信息化负责人 · 林医生",
    contact: "投标意向提交后，平台将通过站内方式对接邮箱",
    views: 156
  },
  {
    id: "p-006",
    title: "连锁门店经营数据 AI 分析看板与经营建议",
    clientType: "企业",
    industry: "餐饮消费",
    location: "四川 · 成都",
    band: "1-5",
    budgetMin: 20000,
    budgetMax: 45000,
    duration: "3 – 4 周",
    skills: ["数据看板 / BI", "预测分析", "大模型应用 / RAG"],
    description:
      "12 家门店的餐饮品牌，POS、外卖、会员数据分散。希望做一个经营看板：营收、客流、复购、爆品/滞销品一目了然；AI 每周生成经营解读，指出异常波动并给出可选动作（如套餐调整、备货建议）。\n\n数据先以表格导入为主，预留后续对接 POS API。看板面向店长与老板两类角色，移动端可读。",
    createdAt: "2026-11-21T09:00:00+08:00",
    deadline: "2026-12-08",
    status: "open",
    ownerName: "创始人 · 周女士",
    contact: "投标意向提交后，平台将通过站内方式对接微信",
    views: 88
  },
  {
    id: "p-007",
    title: "题库自动解析与 AI 错题讲解助手",
    clientType: "机构/团队",
    industry: "教育",
    location: "北京",
    band: "1-5",
    budgetMin: 25000,
    budgetMax: 50000,
    duration: "4 周",
    skills: ["大模型应用 / RAG", "OCR 文档处理"],
    description:
      "K12 教辅机构需要把纸质题库电子化并生成讲解：题目 OCR 识别后，AI 生成分步解析、知识点标签与同类题推荐；学生错题本自动归纳薄弱知识点。\n\n已在匹配阶段，欢迎有教育产品经验的团队进入备选池。",
    createdAt: "2026-11-10T13:20:00+08:00",
    deadline: "2026-11-30",
    status: "matched",
    ownerName: "教研部 · 吴老师",
    contact: "已匹配，暂不接收新投标",
    views: 203
  },
  {
    id: "p-008",
    title: "短视频数字人口播内容批量生成",
    clientType: "企业",
    industry: "文化传媒",
    location: "湖南 · 长沙",
    band: "5-20",
    budgetMin: 50000,
    budgetMax: 100000,
    duration: "4 – 8 周",
    skills: ["数字人 / 内容生成", "语音识别 / 合成"],
    description:
      "MCN 机构需要批量产出口播短视频：输入文案脚本，选择数字人形象与音色，自动生成对口型口播视频，支持多版本剪辑（不同开头钩子）与字幕成片。\n\n希望先做 2 个固定形象试点，单条成片控制在 3 分钟内；提供素材版权与声音授权方案说明。",
    createdAt: "2026-11-22T17:45:00+08:00",
    deadline: "2026-12-18",
    status: "open",
    ownerName: "内容总监 · 唐先生",
    contact: "投标意向提交后，平台将通过站内方式对接微信",
    views: 67
  },
  {
    id: "p-009",
    title: "果园病虫害图像识别与预警 App",
    clientType: "企业",
    industry: "农业",
    location: "云南 · 昆明",
    band: "5-20",
    budgetMin: 70000,
    budgetMax: 140000,
    duration: "6 – 10 周",
    skills: ["计算机视觉", "预测分析"],
    description:
      "柑橘种植合作社希望通过手机拍照识别常见病虫害，给出防治建议与用药参考；结合气象数据做发病趋势预警。\n\n本项目已截止报名，仅作案例展示；后续二期将开放专家会诊模块。",
    createdAt: "2026-10-28T08:30:00+08:00",
    deadline: "2026-11-15",
    status: "closed",
    ownerName: "合作社 · 罗社长",
    contact: "报名已截止",
    views: 184
  },
  {
    id: "p-010",
    title: "合同条款 AI 初审与风险提示工具",
    clientType: "企业",
    industry: "法律政务",
    location: "广东 · 深圳",
    band: "gt20",
    budgetMin: 200000,
    budgetMax: 300000,
    duration: "10 – 14 周",
    skills: ["大模型应用 / RAG", "Agent 智能体", "OCR 文档处理"],
    description:
      "科技公司法务团队每月审阅采购、保密、劳务合同约 400 份。希望落地合同初审工具：抽取主体、金额、违约责任、知识产权、终止条款等要点，对照内部合同模板与法规库标注风险等级与修改建议，生成初审意见摘要供法务复核。\n\n要求结论可追溯到条款原文与依据，支持模板库持续更新；先在采购合同品类试点。",
    createdAt: "2026-11-23T10:10:00+08:00",
    deadline: "2026-12-25",
    status: "open",
    ownerName: "法务部 · 郑律师",
    contact: "投标意向提交后，平台将通过站内方式对接邮箱",
    views: 59
  }
];

export const SEED_DEVELOPERS = [
  {
    id: "d-001",
    name: "林澈",
    devType: "个人开发者",
    title: "全栈大模型应用工程师",
    location: "广东 · 深圳（可远程）",
    years: 6,
    rating: 4.9,
    projectsDone: 38,
    verified: true,
    skills: ["大模型应用 / RAG", "Agent 智能体", "自动化工作流"],
    services: ["需求拆解与原型", "后端 API 与知识库搭建", "工作流自动化", "上线后迭代维护"],
    bio: "独立开发 6 年，专注把大模型能力落成可交付的业务系统：RAG 知识库、多 Agent 协作流程、内部效率工具。擅长从模糊需求里拆出可执行的技术方案，代码整洁、文档齐全，沟通直接。",
    cases: [
      {
        title: "外贸企业邮件与询盘智能分拣助手",
        industry: "零售电商", year: 2026,
        summary: "对接邮箱与 CRM，自动识别询盘意图、产品类别与优先级，草拟回复草稿，销售确认后发出。",
        tags: ["RAG", "Agent", "CRM 对接"],
        result: "询盘平均响应时长从 4 小时缩短到 20 分钟，漏跟进率下降 70%。"
      },
      {
        title: "企业内部制度问答知识库",
        industry: "金融", year: 2025,
        summary: "导入员工手册、报销制度与 FAQ，切片向量化后提供问答与原文引用，接入企业微信侧边栏。",
        tags: ["知识库", "企业微信", "权限隔离"],
        result: "HR 重复咨询量下降 55%，新员工自助答疑覆盖率 92%。"
      }
    ],
    contact: "投递合作意向后，平台站内交换微信与简历",
    accent: 0
  },
  {
    id: "d-002",
    name: "数擎科技",
    devType: "专业企业团队",
    title: "工业 AI 视觉落地团队",
    location: "江苏 · 苏州",
    years: 9,
    rating: 4.8,
    projectsDone: 126,
    verified: true,
    skills: ["计算机视觉", "OCR 文档处理", "自动化工作流"],
    services: ["现场调研与方案设计", "模型训练与边缘部署", "产线集成联调", "驻场与运维支持"],
    bio: "由算法、嵌入式与自动化工程师组成的 18 人团队，长期服务工厂质检、分拣与识别场景。提供从工位选型、样本采集到产线对接的完整交付，支持小样本冷启动与持续迭代。",
    cases: [
      {
        title: "五金件外观缺陷检测产线",
        industry: "制造业", year: 2026,
        summary: "搭建双工位视觉检测，识别划痕、变形、漏加工，对接分拣机构与 MES 系统。",
        tags: ["缺陷检测", "边缘部署", "MES"],
        result: "漏检率控制在 0.3% 以内，单工位替代 3 名目检人力。"
      },
      {
        title: "包装喷码 OCR 核验流水线",
        industry: "制造业", year: 2025,
        summary: "在线读取生产日期与批号 OCR，缺喷/错喷自动剔除并报警留档。",
        tags: ["OCR", "在线检测", "剔除联动"],
        result: "喷码错误流出为零，人工复核工作量减少 80%。"
      }
    ],
    contact: "投递合作意向后，平台站内交换商务联系方式",
    accent: 1
  },
  {
    id: "d-003",
    name: "行知工作室",
    devType: "独立工作室",
    title: "教育 AI 产品工作室",
    location: "北京（可远程）",
    years: 5,
    rating: 4.7,
    projectsDone: 45,
    verified: true,
    skills: ["大模型应用 / RAG", "AI 知识库", "OCR 文档处理"],
    services: ["教育产品原型设计", "题库与讲解生成", "错题本与知识点体系", "H5 / Web 应用交付"],
    bio: "三位来自教研与工程背景的成员，做过教辅、题库、学习助手类产品。理解教育场景对准确性与适龄表达的要求，注重内容安全与可解释性，不做夸大宣传的功能承诺。",
    cases: [
      {
        title: "错题本自动归纳与同类题推荐",
        industry: "教育", year: 2026,
        summary: "拍照录题后自动解析知识点，生成薄弱点图谱并推荐同类练习。",
        tags: ["OCR", "知识图谱", "推荐"],
        result: "学员周均练习完成率提升 34%，错题复现率下降 41%。"
      },
      {
        title: "教师备课资料知识库",
        industry: "教育", year: 2025,
        summary: "教案、课件、真题入库，按课题检索并生成教学设计初稿。",
        tags: ["RAG", "教案生成", "权限分组"],
        result: "备课平均耗时缩短约一半，资料复用率明显提升。"
      }
    ],
    contact: "投递合作意向后，平台站内交换联系方式",
    accent: 2
  },
  {
    id: "d-004",
    name: "苏晚",
    devType: "个人开发者",
    title: "数据智能分析师 / BI 工程师",
    location: "上海（可远程）",
    years: 4,
    rating: 4.8,
    projectsDone: 27,
    verified: false,
    skills: ["数据看板 / BI", "预测分析", "大模型应用 / RAG"],
    services: ["数据建模与清洗", "可视化看板搭建", "经营指标解读", "预测模型试点"],
    bio: "数据科班出身，擅长把零散业务数据整理成指标体系与可读看板，并用统计/预测方法辅助决策。交付物包含口径说明与使用文档，方便业务同学自己维护。",
    cases: [
      {
        title: "零售门店经营分析看板",
        industry: "零售电商", year: 2026,
        summary: "整合 POS 与外卖数据，搭建营收、客流、复购看板，配 AI 周度解读。",
        tags: ["BI", "指标体系", "趋势分析"],
        result: "管理层周会直接使用看板，数据取数口径统一。"
      },
      {
        title: "流失用户预测与分层模型",
        industry: "金融", year: 2025,
        summary: "基于行为数据预测流失概率，分群输出运营触达建议。",
        tags: ["预测建模", "分群", "Python"],
        result: "高风险人群召回率较随机触达提升 2.3 倍。"
      }
    ],
    contact: "投递合作意向后，平台站内交换邮箱与作品集",
    accent: 3
  },
  {
    id: "d-005",
    name: "云声智能",
    devType: "专业企业团队",
    title: "语音交互解决方案商",
    location: "广东 · 广州",
    years: 7,
    rating: 4.9,
    projectsDone: 88,
    verified: true,
    skills: ["语音识别 / 合成", "数字人 / 内容生成", "Agent 智能体"],
    services: ["语音场景方案设计", "外呼 / 对话流程编排", "音色与形象定制", "合规留痕与报表"],
    bio: "专注语音交互与数字人场景，覆盖识别、合成、对话管理与内容成片。团队具备行业词库定制与合规审计经验，支持灰度上线与按效果迭代。",
    cases: [
      {
        title: "保险回访智能外呼系统",
        industry: "金融", year: 2026,
        summary: "按保单节点自动外呼回访，多轮对话收集反馈，结构化记录并异常转人工。",
        tags: ["语音外呼", "多轮对话", "工单回流"],
        result: "回访完成率 91%，人工外呼量下降 65%。"
      },
      {
        title: "品牌数字人口播矩阵",
        industry: "文化传媒", year: 2025,
        summary: "固定数字人形象与音色，批量生成多版本口播短视频并自动配字幕。",
        tags: ["数字人", "语音合成", "批量成片"],
        result: "月产视频从 30 条提升到 300+ 条，制作成本下降 72%。"
      }
    ],
    contact: "投递合作意向后，平台站内交换商务对接方式",
    accent: 4
  },
  {
    id: "d-006",
    name: "周野",
    devType: "个人开发者",
    title: "电商 AI 增长工程师",
    location: "浙江 · 杭州（可远程）",
    years: 5,
    rating: 4.6,
    projectsDone: 33,
    verified: false,
    skills: ["推荐系统", "AI 智能客服", "数字人 / 内容生成"],
    services: ["推荐与搜索优化", "客服机器人搭建", "营销内容生成", "A/B 实验跟进"],
    bio: "深耕电商场景，做过商品推荐、客服应答与营销素材生成。关注转化与复购等真实指标，愿意和业务一起跑数据、调策略，而不是只交一个模型。",
    cases: [
      {
        title: "店铺个性化推荐与搭配购",
        industry: "零售电商", year: 2026,
        summary: "基于浏览与购买行为做首页推荐与搭配套餐，对接店铺前端。",
        tags: ["推荐", "排序", "前端对接"],
        result: "推荐位点击率提升 28%，连带率提升 15%。"
      },
      {
        title: "商品详情文案批量生成",
        industry: "零售电商", year: 2025,
        summary: "输入卖点与参数，生成多风格详情文案与短视频口播稿，人工审核后上架。",
        tags: ["内容生成", "模板化", "审核流"],
        result: "上新文案产能提升 4 倍，人工只做终审。"
      }
    ],
    contact: "投递合作意向后，平台站内交换微信",
    accent: 5
  },
  {
    id: "d-007",
    name: "矩视创新",
    devType: "独立工作室",
    title: "视觉应用创意工作室",
    location: "广东 · 深圳",
    years: 6,
    rating: 4.7,
    projectsDone: 52,
    verified: true,
    skills: ["计算机视觉", "数字人 / 内容生成", "推荐系统"],
    services: ["视觉原型与 Demo", "识别类应用开发", "互动网页 / 可视化", "创意方案落地"],
    bio: "工程与设计混合编组，擅长把视觉算法做成好看、好用的交互产品。从概念验证到正式上线都能承接，交付注重体验细节与跨端适配。",
    cases: [
      {
        title: "展会 AI 互动拍照打卡装置",
        industry: "文化传媒", year: 2026,
        summary: "现场摄像头捕捉动作，生成主题插画与分享卡片，引流社交平台。",
        tags: ["计算机视觉", "互动装置", "分享裂变"],
        result: "展会期间扫码分享 1.2 万次，展位停留时长翻倍。"
      },
      {
        title: "商品识图搜同款小程序",
        industry: "零售电商", year: 2025,
        summary: "拍照上传后以图搜款，匹配相似商品并跳转店铺。",
        tags: ["以图搜款", "小程序", "向量检索"],
        result: "图片搜索转化率高于文字搜索 21%。"
      }
    ],
    contact: "投递合作意向后，平台站内交换作品集链接",
    accent: 6
  },
  {
    id: "d-008",
    name: "麦思工厂",
    devType: "专业企业团队",
    title: "企业知识库与流程自动化团队",
    location: "远程（全国协作）",
    years: 8,
    rating: 4.8,
    projectsDone: 104,
    verified: true,
    skills: ["AI 知识库", "大模型应用 / RAG", "自动化工作流"],
    services: ["知识体系梳理", "内部工具集成", "流程自动化改造", "培训与长期陪跑"],
    bio: "面向中大型企业交付知识库、制度问答与流程自动化项目，覆盖接入企业微信/飞书/钉钉等办公入口。重视数据边界与权限设计，提供分阶段上线与培训陪跑。",
    cases: [
      {
        title: "集团制度与流程问答平台",
        industry: "法律政务", year: 2026,
        summary: "多部门制度文件入库，按组织架构做权限隔离，问答附原文出处。",
        tags: ["RAG", "权限隔离", "多端接入"],
        result: "跨部门制度咨询工单下降 60%，答复一致性显著提升。"
      },
      {
        title: "销售线索跟进自动化流程",
        industry: "金融", year: 2025,
        summary: "线索自动分派、跟进提醒、纪要归档与下周待办生成，串联 CRM 与办公IM。",
        tags: ["工作流", "Agent", "系统集成"],
        result: "线索首次响应时长压缩到 15 分钟内，跟进流失减少 38%。"
      }
    ],
    contact: "投递合作意向后，平台站内交换商务对接方式",
    accent: 7
  },
  {
    id: "d-009",
    name: "陈一",
    devType: "个人开发者",
    title: "农业 AI 算法工程师",
    location: "云南 · 昆明",
    years: 3,
    rating: 4.5,
    projectsDone: 19,
    verified: false,
    skills: ["计算机视觉", "预测分析"],
    services: ["田间图像采集方案", "病虫害识别模型", "移动端 App 交付", "数据迭代标注"],
    bio: "农业信息化方向硕士，做过作物病害识别与长势分析。熟悉移动端轻量模型部署，能下田配合采集样本，注重模型在真实田间环境下的鲁棒性。",
    cases: [
      {
        title: "茶园病害识别小程序",
        industry: "农业", year: 2026,
        summary: "拍照识别常见茶病害，给出分级与防治建议，离线缓存弱网可用。",
        tags: ["移动端", "轻量模型", "离线可用"],
        result: "试点茶园识别准确率 89%，农户反馈上手门槛低。"
      }
    ],
    contact: "投递合作意向后，平台站内交换邮箱",
    accent: 2
  }
];
