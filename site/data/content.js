/*
 * 圣献唱诗院 · 调查档案 —— 全站文案
 * 改文字只改这个文件。
 *
 * 写法约定：
 *   - 段落之间空一行（\n\n）
 *   - **加粗** 用两个星号包起来
 *   - note：维的手写批注
 *
 * 换成自己的图片素材：
 *   把图片放进 site/assets/img/，然后在对应条目的 image（或 photo / sunImage）里填路径，
 *   例如 image: 'assets/img/ev-candle.png'。留空 '' 就继续用代码画的线稿。
 */
window.CONTENT = {

  site: {
    title: '圣献唱诗院',
    titleEn: 'CATHARSIS CHOIR',
    caseNo: 'CASE FILE 0110',
    // 背景音乐路径，例如 'assets/audio/hymn.mp3'。留空则使用合成的低持续音。
    music: '',
  },

  nav: [
    { route: 'home',      num: '0',   en: 'PROLOGUE',  zh: '导语' },
    { route: 'map',       num: 'I',   en: 'THE GROUNDS', zh: '唱诗院地图' },
    { route: 'journal',   num: 'II',  en: 'EIGHT DAYS', zh: '八日日志' },
    { route: 'evidence',  num: 'III', en: 'EVIDENCE',  zh: '证物柜' },
    { route: 'rules',     num: 'V',   en: 'THE RULES', zh: '游客守则' },
    { route: 'missing',   num: 'VI',  en: 'MISSING',   zh: '失踪档案' },
  ],

  ui: {
    stages: ['清醒', '微恙', '安宁', '至臻'],
    meterLabel: 'ASSIMILATION',
    leave: '离开唱诗院',
    leaveConfirm: '离开唱诗院将清除所有进度：同化值、拿过的物件、读过的日志。\n\n确定离开吗？',
    music: '颂歌',
    locked: '未解封',
    close: '关闭',
  },

  // 0. 门禁 · 工作证
  // 维的桌面档案夹：左边白纸是欢迎信，右边黑板上放着证件、枪、线索便签、蘸水笔、半张牛皮纸。
  // 物件点一下拿起来看，再点空白处放回去。
  gate: {
    kicker: 'CASE FILE 0110 · RESTRICTED',
    photo: '',          // 证件照，例如 'assets/img/wei.png'；留空就是一块纯黑

    // ---- 调查局证件（正面仿 FBI 证件版式）
    card: {
      bureau: 'SERAVIA INVESTIGATION BUREAU',
      ministry: 'SERAVIA MINISTRY OF JUSTICE',
      subordinate: 'Subordinate to the Seravia Ministry of Justice',
      watermark: 'FBI',             // 证件正面的大水印字母（按要求暂不改）
      lineA: 'WHOSE SIGNATURE AND PHOTOGRAPH APPEAR HEREON IS A REGULAR APPOINTED',
      title: 'POLICE OFFICER',
      lineB: 'OF THE SERAVIA INVESTIGATION BUREAU, SERAVIA MINISTRY OF JUSTICE',
      fields: [
        ['CODENAME', '0110'],
        ['IDENTIFICATION NO.', '∞'],
        ['DEPARTMENT', 'Seravia Intelligence Department'],
        ['TITLE', 'police officer'],
      ],
      // 背面
      back: 'The bearer is hereby commissioned to investigate unlawful acts within Seravia, to gather evidence in cases wherein the Investigation Bureau is, or may become, an interested party, and to discharge such other duties as the law confers upon him.',
      signer: 'Chief Justiciar',
      order: 'BY ORDER OF: THE CHIEF JUSTICIAR OF SERAVIA',
      issued: 'ISSUED —— · VALID UNTIL ∞',
      signatureLabel: 'SIGNATURE',
      flipHint: '点击或拖动翻面',
    },

    // ---- 左边白纸：欢迎信。鼠标停留会慢慢融化，1.5 秒后闪回中文原稿 1 秒
    // 段落越往后越"坏"；落款永远清晰。
    letter: {
      title: 'Welcome to the Bureau!',
      greeting: 'Dear Officer 0110,',
      body: [
        'On behalf of everyone at the Seravia Investigation Bureau, it is my great pleasure to welcome you to our team. We are so very glad to have you with us.',
        'Your first day begins at 9:00 a.m. with a briefing in the Bureau’s main hall, followed by a tour of the Bureau and… a visit to the Choir of Sacred Offering. We will prepare for you — refreshments, refreshments, silver, silver? white candles. It is a tradition we hold very dear.',
        'Should you have any questions, any questions, any questions, any questions, please do not hesitate, hesitate, hesitate, hes— to ask. We look forward, forward, for-forw— to working beside you.',
      ],
      closing: 'Yours faithfully,',
      signature: 'The Chief Justiciar',
      signOff: 'Seravia Investigation Bureau',
      // 闪回的中文原稿
      zh: {
        title: '欢迎加入调查局！',
        greeting: '亲爱的 0110 警员：',
        body: [
          '谨代表塞拉维亚调查局全体热烈欢迎你加入我们的团队。我们非常高兴能有您加入。',
          '您的第一天将于上午 9 点开始，在调查局主厅参加简报会，随后参观调查局并……来到圣献唱诗院。我们将为您准备——茶点，茶点，银，银？白色香烛。这是我们十分珍视的传统。',
          '如果您有任何疑问，任何疑问，任何疑问，任何疑问，请随时提出，提出，提出，提。我们期待，期待，期期期期。与您并肩工作。',
        ],
        closing: '此致',
        signature: '审判长',
        signOff: '塞拉维亚调查局',
      },
      // 揉成团再展开，里面是它自己藏的另一版
      hidden: "DON'T COME.",
      hint: '按住揉成一团',
    },

    // ---- 克莱因蓝便签
    note: 'Good luck with the investigation.',

    // ---- 线索便签（手写、做旧）
    clue: [
      'The scent of the candles reminds me of an old friend…',
      'Perhaps he has already set out upon the Path of Purification.',
    ],

    // ---- 半张牛皮纸（另一半 "Forever" 以后放在别的角色页）
    kraft: 'WE',

    objects: {
      card:  { en: 'INVESTIGATION BUREAU ID', zh: '调查局证件' },
      gun:   { en: 'SERVICE REVOLVER', zh: '银色左轮' },
      clue:  { en: 'NOTE · UNKNOWN HAND', zh: '线索便签' },
      pen:   { en: 'OBLIQUE DIP PEN', zh: '银色斜口蘸水笔' },
      kraft: { en: 'TORN KRAFT PAPER', zh: '半张牛皮纸' },
      putBack: '放回',
    },

    button: 'AUTHENTICATE',
    checking: '正在核对持证人……',
    success: '权限确认。欢迎回来，0110。档案已解封。',
    easterEgg: 'MIRROR-HOLDER · WORLD: SACRED CHOIR · ROLE: INVESTIGATION · TIME LIMIT: 8 DAYS',
  },

  // 1. 首页
  home: {
    titleA: 'Game',
    titleB: 'Start',
    startRoute: 'map',            // 点 Game Start 去哪：'map' 地图 / 'journal' 八日日志月相页
    startHint: '进入唱诗院',
    titleEn: 'THE CHOIR OF SACRED OFFERING',   // 圣献唱诗院的英文名，可改
    // 左半边底图（半透明）。现在是你给的穹顶参考图做占位，正式上线前换成 GPT 生成的图
    bgImage: 'assets/img/dome-placeholder.jpg',
    // 右边卡片下面压着的银莲花（已去色 + 同心圆实色混合）。留空则用代码画的线稿花
    flowersImage: 'assets/img/anemone-rings.png',
    // 去色但没叠同心圆的版本：鼠标经过时闪出来
    flowersAltImage: 'assets/img/anemone-plain.png',
    panels: {
      days: 'EIGHT DAYS',
      daysZh: '八日日志',
      files: 'FILES',
      filesZh: '档案',
      desk: 'STATUS',
      deskZh: '状态',
      credits: 'CREDITS',
      creditsZh: '致谢',
    },
    // 首页「致谢」小块：图片署名（上线必须保留）
    credits: [
      ['作者', '翎 · liminous（世界观、剧情文案、页面设计与排版、素材）'],
      ['枪', 'Gordon Gartrell · CC BY-SA 2.0 · Wikimedia Commons'],
      ['祈祷室围墙', '小红书 @Jyuemim'],
      ['黑日', '小红书 @無山'],
      ['交互参考', 'React Bits（翻转卡、揉纸、打乱文字、可变邻近、像素交换）'],
    ],
    kicker: 'A JOURNEY THROUGH THE EIGHT DAYS OF THE GREAT HYMN',
    // 左下角花体字（7 人 · 调查组 2 · 信徒组 1 的缩写）
    partySign: '7c.2p.1e',
    // 唱片上螺旋排列的哥特体文字（只能用英文/拉丁字母，Aktura 字体没有中文）。不够长会自动重复
    discText:
      'The Sacred Choir of Offering is a renowned sanctuary of soul healing, where hymns are said to wash the sins from the heart. ' +
      'As the great annual Hymn draws near, believers and travellers gather here in search of inner peace. ' +
      'Light the holy white candle. Let the drifting incense and the sacred song lift the weariness of the world and the burden of feeling from you, ' +
      'and lead your soul into a stillness without stain. ' +
      '✦ Blessed are they who forget, for the moonlight remembers in their stead. ' +
      '✦ Two moons, one mercy. Two moons, one mouth. ' +
      '✦ Do not count the candles. The candles are counting you. ' +
      '✦ Sing the second verse. There are no words in the second verse. Follow. ' +
      '✦ Mother of white petals, take our taste, take our tears, take our names and keep them in wax. ' +
      '✦ Whoever is still afraid has not yet been loved enough. ' +
      '✦ We were fourteen. We are eleven. We are light. ' +
      '✦ Eight days, and the door does not open outward. ' +
      '✦ Kyrie, catharsis. Christe, catharsis. Kyrie, catharsis. ' +
      '✦ Hush now. The choir is breathing for you.',
    hubText: 'CASE FILE 0110 ✦ CATHARSIS CHOIR ✦ SIDE A ✦ EIGHT DAYS ✦ ',
    intro:
      '圣献唱诗院是著名的灵魂疗愈圣地，宣称通过颂歌仪式可以洗涤心灵的罪孽。随着唱诗院一年一度的大颂礼将近，大量信教者以及游客被吸引前来寻求内心的平静。\n\n' +
      '点燃神圣的白色香烛，在这里，飘渺的灵烟与神圣的颂歌或许能洗去您尘世的疲惫与情感的负累，引领您的灵魂抵达无垢的宁静之境。',
    note: '宣传册写得真好。好到我开始算这一本印刷成本多少钱了。',
    meta: [
      ['LOCATION', '创造域 · 边域分支级子世界'],
      ['TYPE', '规则怪谈'],
      ['TIME LIMIT', '8 DAYS'],
      ['PARTY', '7 · 调查组 2 / 游客组 4 / 信徒组 1'],
    ],
  },

  // 2. 地图（方块地图：外圈黑 → 内圈白，中间方块拼出来的圆是银莲花田，正中是圣堂）
  map: {
    // 右边的欢迎语：中文在上，英文在下
    welcome: {
      zh: ['欢迎到来', '愿您安宁，愿神护佑您。'],
      en: ['Welcome.', 'May you find peace; may the Divine keep you.'],
    },
    // 地图下面的按钮：英文在上（大字），中文在下（小字）。点了进八日日志
    candle: { en: 'Light the Candle', zh: '点燃香烛' },

    // 房间：col / row 是地图格子坐标（19 × 19，左上角是 0,0），w / h 是占几格
    // action 留空的房间只有悬停效果
    rooms: [
      { id: 'studio',    zh: '工作室', en: 'STUDIO',           col: 2,  row: 2,  w: 3, h: 2, action: 'studio' },
      { id: 'gate',      zh: '大门',   en: 'THE GATE',         col: 8,  row: 1,  w: 3, h: 2, action: 'gate' },
      { id: 'dining',    zh: '餐厅',   en: 'REFECTORY',        col: 14, row: 2,  w: 3, h: 2, action: 'dining' },
      { id: 'hall',      zh: '会议厅', en: 'CHAPTER HALL',     col: 1,  row: 8,  w: 3, h: 2, action: 'hall' },
      { id: 'chapel',    zh: '祈祷室', en: 'ORATORY · CHAPEL', sub: '小礼拜堂', col: 15, row: 8, w: 3, h: 2, action: 'chapel' },
      { id: 'dorm',      zh: '居室',   en: 'DORMITORY',        col: 2,  row: 15, w: 3, h: 2, action: 'dorm' },
      { id: 'bell',      zh: '钟楼',   en: 'BELL TOWER',       sub: '档案馆', col: 8, row: 16, w: 3, h: 2, action: 'bell' },
      { id: 'parlour',   zh: '会客室', en: 'PARLOUR',          col: 14, row: 15, w: 3, h: 2, action: 'parlour' },
      { id: 'cathedral', zh: '卡塔西斯圣堂', en: 'CATHARSIS',  col: 8,  row: 8,  w: 3, h: 3, action: 'cathedral' },
      { id: 'field',     zh: '银莲花田', en: 'ANEMONE FIELD',  col: 12, row: 9,  w: 2, h: 1, action: 'field' },
    ],

    // 数值全部暗中计分，不显示（地图页补充，docs/specs/2b）
    gate: {
      image: 'assets/img/map/gate.webp',
      text: 'DAY1.祂的世界',
      assim: 1,
    },
    dorm: {
      image: 'assets/img/map/dorm.webp',
      text: '入夜，跟随队伍来到居室。',          // 点这句话，下面才弹出选项
      wander: '游荡', wanderText: '你在尽头的休息厅茶几下找到一张撕了一半的牛皮纸。', got: '获得「forever」×1',
      wanderClarity: 8,                           // 捡到的半张纸放进手提箱（证物柜），和「WE」拼合时同化值 +5
      enter: '进屋', enterText: '钟声敲响，遁入梦乡。', enterAssim: 1,
    },
    studio: '筹办大颂礼的重要场所，游客免入。',
    field: '禁止踩踏花坪。',
    parlour: '你作为初来乍到的游客没有被邀请。',
    hall: '若你的职务达到参议员往上即可进入。',    // 暂时进不了（参议员线不做）
    chapel: {
      image: 'assets/img/map/chapel.webp',
      text: ['唱诗院的老人们平日会来到这里。', '你踏入此地，无人望向你。'],
      pray: '做礼拜', prayText: '月光短暂地注视了你。', prayAssim: 2,
      walk: '四处走走', walkText: '建筑后是极高的围墙，似乎隔绝了两个世界。', walkClarity: 1,
      walkImage: 'assets/img/map/chapel-wall.webp',
      walkCredit: '图片来源：小红书 @Jyuemim',
      leave: '离开', leaveText: '月光饶有兴致地瞥视了你。', leaveAssim: 8,
    },
    bell: {
      image: 'assets/img/map/belltower.webp',
      up: '上楼',
      archive: '档案室', archiveText: '似乎锁门了。',
      gaze: '眺望', gazeText: '银莲花田簇拥着卡塔西斯圣堂，你的心中感到一阵安宁。',
    },
    dining: {
      image: 'assets/img/map/dining.webp',
      text: '还没到开饭的时间。',
      forward: '走到前方',
      hi: '嗨',
      girlImage: 'assets/img/map/dining-girl.webp',
      girlText: '女孩？看着你，她对你打了个招呼。',
      leave: '离开餐厅',
    },
    cathedral: {
      image: 'assets/img/map/cathedral.webp',
      text: '天地间的纯白，我们的安宁。',
    },
    close: '关闭',
  },

  // 八天的月相（首页的月相弧在用）。日志原文已按方案 3 删掉
  // moon：月亮被照亮的比例（1 = 满月，0 = 新月，'double' = 双月重叠）
  days: [
    {
      day: 1, moon: 1, phase: '满月', place: '外围',
    },
    {
      day: 2, moon: 0.84, phase: '亏凸月', place: '入院',
    },
    {
      day: 3, moon: 0.66, phase: '下弦前', place: '圣乐聆演 I',
    },
    {
      day: 4, moon: 0.5, phase: '下弦月', place: '圣乐聆演 II',
    },
    {
      day: 5, moon: 0.3, phase: '残月', place: '圣物展出 I',
    },
    {
      day: 6, moon: 0.12, phase: '新月前', place: '圣物展出 II',
    },
    {
      day: 7, moon: 0, phase: '新月', place: '大弥撒前夜',
    },
    {
      day: 8, moon: 'double', phase: '双月重叠', place: '大弥撒',
    },
  ],

  // 3. 八日日志（方案 3）：全屏森林月相。顶上黑边正中一行扁长小字；
  // 月亮从右往左数 1–6，鼠标停 1 秒弹出选项。x / y 是月亮在图上的位置（百分比）
  journal: {
    title: 'GAZE UPON THE FIRMAMENT',          // "凝视天穹"
    hold: 1000,                                 // 停留多久弹出（毫秒）
    moons: [
      { n: 1, x: 78.1, y: 51.0, label: '前往证物柜', route: 'evidence' },
      { n: 2, x: 67.4, y: 53.3, label: '游客守则',   route: 'rules' },
      { n: 3, x: 55.3, y: 53.3, label: '失踪档案',   route: 'missing' },
      { n: 4, x: 44.8, y: 53.3, label: 'D4 日志',    route: 'd4' },
      { n: 5, x: 33.1, y: 53.2, label: '前往教堂',   route: 'church' },
      { n: 6, x: 20.6, y: 53.1, label: '', route: 'ending', twin: true },
    ],
    // 第六个（双月）：前五个没点完时，斜体小字晃动
    unfinished: '副本未完成',
    // 分结局：同化值 > endingAt 永归宁国，否则异神极乐
    // （以后：明晰 ≥ 35 时异神极乐里有个小彩蛋，用户到时候再说）
    endingAt: 50,
    endings: {
      peace: { label: '失踪档案', sub: '永归宁国' },
      bliss: { label: '失踪档案', sub: '异神极乐' },
    },
    soon: '此页尚在书写。',
  },

  // DAY4 日志（方案 4，docs/specs/4.日志页面.pdf）
  // 黑底莫比乌斯环月亮，十字架尖端悬在中心圆月上方；点中心圆月 → 十字架扎下 → 像素交换转成白底纸页
  d4: {
    title: 'Observation Log',
    bloomAt: 50,                 // 同化值 ≥ 50：纸上长满银莲花
    gameOver: 'Game over.',
    toChurch: '前往教堂',
    // < 50：维西娅的调查报告（手写英文，停 1.5 秒变中文）。英文名 Vicia Karu（用户确认）
    report: {
      en: {
        date: 'Day 4 of the Great Hymn',
        head: ['Seravia Investigation Bureau', 'Case File 0110 · The Choir of Sacred Offering'],
        to: 'To the Chief Justiciar,',
        body: 'On the fourth day the Choir held its scheduled hymn rehearsal without incident. Visitor attendance has declined; two members of the tour no longer speak unless addressed. The candle stock in the east corridor exceeds the number of registered residents. The anemone fields are harvested daily, yet show no sign of thinning. I have not been invited into the inner ring. The investigation continues, and I remain of clear mind.',
        close: 'Respectfully submitted,',
        sign: 'Officer Vicia Karu',
        code: '0110',
      },
      zh: {
        date: '大颂礼 · 第四日',
        head: ['塞拉维亚调查局', '档案 0110 · 圣献唱诗院'],
        to: '致审判长：',
        body: '第四日，唱诗院按计划进行颂歌排练，未见异常。游客出勤人数下降，团中两人除被问话外已不再开口。东侧走廊的香烛存量多于登记在册的住院人数。银莲花田每日都有采摘，却丝毫不见稀疏。我尚未受邀进入内围。调查继续，本人神志清醒。',
        close: '谨呈',
        sign: '警员 维西娅·卡鲁',
        code: '0110',
      },
    },
    done: '本次述职结束',
    // 聊天：黑色在右边（莱恩），克莱因蓝在左边（维西娅）。点一条出下一条
    chat: [
      { who: 'ryan', text: '消息.zip' },
      { who: 'wei',  text: '庆祝你“升职”。' },
      { who: 'ryan', text: 'humm…那请你静候佳音？' },
      { who: 'wei',  text: '(=。=)' },
    ],
    back: '回望穹顶',
  },

  // 教堂（方案 5，docs/specs/5.教堂界面.pdf）
  // ♢（DAY4 同化值 ≥ 50 时从 Game over 进来）：神像从右边渗进来 →「前往神国」→ 结局 1（谢幕页）
  // 非 ♢：红色天穹降临 → 字幕一句句 →「前往明天？」→ 回首页（首页变成「祂的食戮日」）
  church: {
    welcome: 'Welcome',
    join: '参加大颂礼',
    holyText: '你的意识踏入神国，祂的面容愈发清晰。',
    holyGo: '前往神国',
    auto: 4600,                  // 字幕不点也会自动下一句（毫秒）
    lines: [
      { zh: '主教砸碎了神像…', en: 'The bishop shattered the idol…' },
      { zh: '其他主教们失去了安宁，疯狂撕扯这被红光沐浴的白发主教……', en: 'The other bishops lost their peace, and tore at the white-haired bishop bathed in red light……' },
      { zh: '啊，新的主降临了。', en: 'Ah — a new Lord has come.', recolor: true },
      { zh: '所有人陷入了极乐！包括我！', en: 'Everyone has fallen into bliss! Even me!' },
      { zh: '「还会有失踪吗？」「也许吧。」', en: '“Will anyone else go missing?” “Perhaps.”' },
    ],
    last: { zh: '前往明天？', en: 'Onward to tomorrow?' },   // 只能点，不会自动跳
  },

  // 结局谢幕（结局 1：永归宁国）。全英文，像电影片尾一样往上滚；图片署名也放在这里
  ending: {
    lines: [
      ['title', 'THE CHOIR OF SACRED OFFERING'],
      ['sub', 'Ending I · Home, Forever, in the Kingdom of Peace'],
      ['gap'],
      ['role', 'Investigation Officer 0110', 'Vicia Karu'],
      ['role', 'The Believer', 'Ryan'],
      ['role', 'The Investigator', 'Anka'],
      ['role', 'The Visitors', 'A · B · C · D'],
      ['role', 'The Choir', 'Twenty-Four Voices'],
      ['role', 'The Twin Moons', 'Themselves'],
      ['gap'],
      ['role', 'Story, World & Design', 'liminous'],
      ['gap'],
      ['head', 'Recorded at'],
      ['line', 'The Choir of Sacred Offering'],
      ['line', 'A sub-world of the Creation Domain'],
      ['line', 'Eight days of the Great Hymn'],
      ['gap'],
      ['head', 'Images'],
      ['line', 'Revolver photograph — Gordon Gartrell, CC BY-SA 2.0, via Wikimedia Commons'],
      ['line', 'Chapel wall photograph — Jyuemim (Xiaohongshu)'],
      ['line', 'Black sun artwork — 無山 Wushan (Xiaohongshu)'],
      ['gap'],
      ['line', 'No visitor was harmed. Every visitor was kept.'],
      ['gap'],
      ['end', 'THE END'],
    ],
    // 明晰值 ≥ clarityAt 时多一行
    clarityAt: 35,
    thanks: 'Thank you for your due contribution to the ecology of the Mirror World.',
  },

  // 结局 2 之后的首页：唱片和银莲花变成黑日，左边变成「祂的食戮日」，待久了会融化
  bliss: {
    zh: '祂的食戮日',
    en: 'The Day of His Devouring',
    sunCredit: '图 · 小红书 @無山',
    meltAfter: 12000,            // 停留多久开始融化（毫秒）
  },

  // 4. 证物柜（方案 3）：白底，只有一只打开的手提箱。物件点一下拿出来，下方是文案和选项。
  // 选项只能选一次，同化值 / 明晰暗中计数，不给浏览者看。
  // 高低两档：同化值 ≥ highAt 用 hi，否则用 lo。
  evidence: {
    highAt: 20,
    putBack: '放回',
    items: {
      candle: { name: '白色香烛',
        text: '今日的你状态如何？',
        choices: [
          { id: 'light', label: '点燃', assim: 12 },
          { id: 'back',  label: '放回', assim: -5, clarity: 8 },
        ],
      },
      anemone: { name: '银莲花',
        text: '每个人来到此地都会获得一朵……花田还没薅秃吗？',
        assim: 1,                                // 第一次拿起来 +1
      },
      hymn: { name: '颂歌谱子',
        text: '灵魂升华之道。',
        textEn: 'The Way of the Soul’s Ascension.',
        choices: [
          { id: 'sing', label: '颂唱', assim: 12 },
          { id: 'fold', label: '折叠', assim: -5, clarity: 8 },
        ],
      },
      rules: { name: '游客守则' },
      missing: { name: '失踪档案' },
      gun:   { name: '银色左轮', hi: '做为主的眷属。',       lo: '神国之道，亦在其中。' },
      card:  { name: '调查局证件', hi: '我属于这里……吗？',     lo: '我将查明真相。' },
      pen:   { name: '蘸水笔', hi: '书写您的诗篇。',         lo: '创造我道的一切。' },   // 低：这支笔是她的伴生道具
      clue:  { name: '线索便签' },
      kraft: { name: '半张牛皮纸' },
      // 居室「游荡」捡到之后才出现在手提箱里；两半可以拼回去（同化值 +5，暗中）
      forever: { name: '另外半张牛皮纸', label: { en: 'TORN KRAFT PAPER', zh: '另外半张牛皮纸' }, ink: 'Forever' },
      merge: { label: '拼合', assim: 5 },
    },
  },

  // 颂歌谱子：英文细长花体；停留 1.5 秒闪成中文手写，字像蜡油一样融化扭曲；移开慢慢变回英文
  hymn: {
    title: 'Canticum Lunae',
    en: 'The Twin Moons are my shepherd; I shall not want. They make me to lie down in fields of anemone; they lead me beside the still waters. They restore my soul; they lead me in the paths of righteousness for their name’s sake. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy candle and thy word, they lead me unto the Kingdom.',
    zh: '双月是我的牧者，我必不致缺乏。祂使我躺卧在银莲花田地上，领我在可安歇的水边。祂使我的灵魂苏醒，为自己的名引导我走义路。我虽然行过死荫的幽谷，也不怕遭害，因为你与我同在；你的烛火，你的引言，都引导我前往神国。',
  },

  // 5. 游客守则（方案 3）：写在笔记本左页，手写英文；停留 1.5 秒换成中文，移开恢复
  rules: {
    title: 'Visitor Rules',
    titleZh: '游客守则',
    items: [
      { en: 'Wear your choir robe at all times during your stay.', zh: '在院期间请全程穿着唱诗袍。' },
      { en: 'Do not leave the Choir.', zh: '请勿离开唱诗院。' },
      { en: 'Return to your room by nine each night, and light the candle.', zh: '请于每晚九点回到房间，并点燃香烛。' },
      { en: 'Do not pick the anemones.', zh: '请勿采摘银莲花。' },
      { en: 'Do not look upon the Twin Moons. Until you have entered the Kingdom, it is a desecration.', zh: '请勿直视双月，未前往神国时，此为亵渎之具。' },
      { en: 'Do not  ~~~~~~  the  ~~~~~~~~  after  ~~~~~', zh: '请勿 ～～～ 在 ～～～～ 之后 ～～～', blur: true },
    ],
  },

  // 6. 失踪档案（方案 3）：牛皮纸袋，点一下抽出一张旧纸
  missing: {
    head: '塞拉维亚人员失踪档案',
    meta: [
      ['档案编号', 'SL-0110-3141'],
      ['立案单位', '塞拉维亚调查局 · 失踪人口科'],
      ['立案日期', '', 'blur'],
    ],
    // 竖着排
    people: [
      { name: '艾莉·沃斯',   sex: '女', age: '24', job: '邮局分拣员',   when: '大颂礼第 2 日 · 晚祷后', where: '圣献唱诗院 · 居室' },
      { name: '奥伦·赫克',   sex: '男', age: '51', job: '钟表匠',       when: '大颂礼第 4 日 · 清晨',   where: '圣献唱诗院 · 钟楼' },
      { name: '玛蒂尔德',     sex: '女', age: '9',  job: '无',           when: '大颂礼第 5 日 · 不详',   where: '圣献唱诗院 · 银莲花田' },
      { name: '诺亚·贝尔',   sex: '男', age: '33', job: '中学音乐教师', when: '大颂礼第 7 日 · 圣乐聆演', where: '圣献唱诗院 · 圣堂' },
    ],
    labels: { name: '姓名', sex: '性别', age: '年龄', job: '职位', when: '失踪时间', where: '失踪地点' },
    hint: '点击纸袋，抽出一张',
    choices: [
      { id: 'read',   label: '浏览', assim: -5, clarity: 8 },
      { id: 'forget', label: '忘却', assim: 10 },
    ],
    forceAt: 20,          // 同化值 ≥ 20 时只能忘却
  },

  // 同化文字替换词典（[原词, 替换为]；原词可以写正则）
  replacements: [
    ['调查', '祷告'],
    ['失踪', '归主'],
    ['证据', '圣物'],
    ['离开', '留下'],
    ['痛', '安宁'],
    ['蓝', '白'],
    ['枪', '烛'],
    ['积分', '恩典'],
    ['记住', '忘记'],
    ['害怕', '平静'],
    ['名字', '——'],
    ['我(?!们)', '我们'],
  ],

};
